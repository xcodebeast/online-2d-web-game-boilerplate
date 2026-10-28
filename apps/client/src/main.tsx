// biome-ignore lint/correctness/noUnresolvedImports: React exports StrictMode through its CommonJS entry point; TypeScript verifies this import.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app.tsx";

const container = document.querySelector("#root");
if (!container) {
	throw new Error("Missing root element");
}
createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
