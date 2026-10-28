import { gzipSync } from "node:zlib";

interface ManifestChunk {
	file: string;
	isEntry?: boolean;
	imports?: string[];
}
type Manifest = Record<string, ManifestChunk>;
const BUILD_DIRECTORY = "dist/apps/client";
const MAX_CHUNK_BYTES = 500_000;
const MAX_INITIAL_GZIP_BYTES = 90_000;
const MAX_TOTAL_GZIP_BYTES = 360_000;
interface BundleSize {
	initialBytes: number;
	totalBytes: number;
}

const manifestChunk = (manifest: Manifest, key: string): ManifestChunk => {
	const chunk = manifest[key];
	if (chunk === undefined) {
		throw new Error(`Missing manifest entry: ${key}`);
	}
	return chunk;
};

const compressedChunkSize = async (file: string): Promise<number> => {
	const bytes = await Bun.file(`${BUILD_DIRECTORY}/${file}`).arrayBuffer();
	if (bytes.byteLength > MAX_CHUNK_BYTES) {
		throw new Error(`${file} exceeds ${MAX_CHUNK_BYTES} bytes`);
	}
	return gzipSync(bytes).byteLength;
};

/** Follows static imports only; deferred engine and SDK chunks must not delay the shell. */
const initialFiles = (
	manifest: Manifest,
	key: string,
	files: Set<string>,
): void => {
	const chunk = manifestChunk(manifest, key);
	if (files.has(chunk.file)) {
		return;
	}
	if (chunk.file.includes("phaser-")) {
		throw new Error("Phaser leaked into the initial import graph");
	}
	files.add(chunk.file);
	const dependencies = chunk.imports ?? [];
	for (const dependency of dependencies) {
		initialFiles(manifest, dependency, files);
	}
};

/** Locates every static entry dependency recorded by Vite. */
const readInitialFiles = async (): Promise<Set<string>> => {
	const manifest: Manifest = await Bun.file(
		`${BUILD_DIRECTORY}/.vite/manifest.json`,
	).json();
	const initial = new Set<string>();
	const entries = Object.entries(manifest).filter(
		([, chunk]) => chunk.isEntry === true,
	);
	if (entries.length === 0) {
		throw new Error("The client manifest has no entry points");
	}
	for (const [key] of entries) {
		initialFiles(manifest, key, initial);
	}
	return initial;
};

/** Includes all lazy chunks, so splitting alone cannot pass the total download budget. */
const measureJavaScript = async (initial: Set<string>): Promise<BundleSize> => {
	let totalBytes = 0;
	let initialBytes = 0;
	const files = new Bun.Glob("**/*.js").scan(BUILD_DIRECTORY);
	for await (const file of files) {
		const gzipBytes = await compressedChunkSize(file);
		totalBytes += gzipBytes;
		if (initial.has(file)) {
			initialBytes += gzipBytes;
		}
	}
	return { initialBytes, totalBytes };
};

const { initialBytes, totalBytes }: BundleSize = await measureJavaScript(
	await readInitialFiles(),
);
if (totalBytes === 0) {
	throw new Error("The client build contains no JavaScript");
}
if (initialBytes > MAX_INITIAL_GZIP_BYTES) {
	throw new Error(
		`Initial JavaScript exceeds budget: ${initialBytes} gzip bytes`,
	);
}
if (totalBytes > MAX_TOTAL_GZIP_BYTES) {
	throw new Error(`Total JavaScript exceeds budget: ${totalBytes} gzip bytes`);
}
await Bun.write(
	Bun.stdout,
	`Client JavaScript: ${initialBytes} initial gzip bytes; ${totalBytes} total gzip bytes.\n`,
);
