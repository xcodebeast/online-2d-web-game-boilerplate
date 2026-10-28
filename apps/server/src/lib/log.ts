const colorMap = {
	gray: "\x1b[1;30;47m",
	blue: "\x1b[1;34;47m",
	yellow: "\x1b[1;33;47m",
	red: "\x1b[1;31;47m",
	clear: "\x1b[0m",
} as const;
const Colors = {
	gray: "gray",
	blue: "blue",
	yellow: "yellow",
	red: "red",
	clear: "clear",
} as const;
type Color = (typeof Colors)[keyof typeof Colors];
const colorByType = {
	debug: "gray",
	info: "blue",
	warn: "yellow",
	error: "red",
} as const;
type LogType = keyof typeof colorByType;
const colorize = (message: string | number, color: Color): string =>
	`${colorMap[color]}${message}${colorMap.clear}`;
const log = (message: string, type: LogType = "debug"): void => {
	const text = colorize(`[${type}] ${message}`, colorByType[type]);
	Bun.stdout.write(`${text}\n`);
};

export { Colors, colorize, log };
