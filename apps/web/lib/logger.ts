/**
 * Structured logging utility for production use.
 * Automatically strips debug logs in production builds.
 */

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
	[LogLevel.DEBUG]: "DEBUG",
	[LogLevel.INFO]: "INFO",
	[LogLevel.WARN]: "WARN",
	[LogLevel.ERROR]: "ERROR",
};

// Only enable debug logs in development
const MIN_LOG_LEVEL =
	process.env.NODE_ENV === "development"
		? LogLevel.DEBUG
		: LogLevel.WARN;

interface LogEntry {
	timestamp: string;
	level: string;
	module?: string;
	message: string;
	data?: unknown;
}

function formatLogEntry(
	level: LogLevel,
	module: string | undefined,
	message: string,
	data?: unknown,
): LogEntry {
	return {
		timestamp: new Date().toISOString(),
		level: LOG_LEVEL_NAMES[level],
		module,
		message,
		data,
	};
}

function shouldLog(level: LogLevel): boolean {
	return level >= MIN_LOG_LEVEL;
}

function log(
	level: LogLevel,
	module: string | undefined,
	message: string,
	...data: unknown[]
): void {
	if (!shouldLog(level)) return;

	const entry = formatLogEntry(level, module, message, data[0]);

	switch (level) {
		case LogLevel.DEBUG:
			console.debug(`[${entry.level}]${module ? ` [${module}]` : ""} ${message}`, ...data);
			break;
		case LogLevel.INFO:
			console.info(`[${entry.level}]${module ? ` [${module}]` : ""} ${message}`, ...data);
			break;
		case LogLevel.WARN:
			console.warn(`[${entry.level}]${module ? ` [${module}]` : ""} ${message}`, ...data);
			break;
		case LogLevel.ERROR:
			console.error(`[${entry.level}]${module ? ` [${module}]` : ""} ${message}`, ...data);
			break;
	}
}

// Public API
export const logger = {
	debug: (message: string, module?: string, ...data: unknown[]) =>
		log(LogLevel.DEBUG, module, message, ...data),

	info: (message: string, module?: string, ...data: unknown[]) =>
		log(LogLevel.INFO, module, message, ...data),

	warn: (message: string, module?: string, ...data: unknown[]) =>
		log(LogLevel.WARN, module, message, ...data),

	error: (message: string, module?: string, ...data: unknown[]) =>
		log(LogLevel.ERROR, module, message, ...data),

	// For API request/response logging
	api: {
		request: (method: string, url: string, module = "API", data?: unknown) =>
			log(LogLevel.DEBUG, module, `${method} ${url}`, data),

		response: (
			method: string,
			url: string,
			status: number,
			module = "API",
			data?: unknown,
		) =>
			log(LogLevel.DEBUG, module, `${method} ${url} - ${status}`, data),
	},
};

export default logger;
