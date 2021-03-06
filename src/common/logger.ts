import winston, {format, createLogger, transports} from "winston";
import chalk from "chalk";
import DailyRotateFile = require("winston-daily-rotate-file");

export class Logger {
	public log: winston.Logger;
	public color: string;
	private ignoreLevel: boolean;

	constructor(
		color: ("black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey" | "blackBright"
			| "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright") = "white",
		ignoreLevel: boolean = false) {
		this.log = createLogger({
			format: format.combine(
				format.timestamp(),
				format.json(),
			),
			level: "info",
			transports: [
				new DailyRotateFile({
					dirname: "logs",
					filename: "error-%DATE%.log",
					level: "error",
					maxFiles: 60,
					maxSize: 5000000,
				}),
				new DailyRotateFile({
					dirname: "logs",
					filename: "info-%DATE%.log",
					level: "info",
					maxFiles: 60,
					maxSize: 5000000,
				}),
			],
			exceptionHandlers: [
				new transports.Console(),
				new transports.File({filename: "combined.log"})
			]
		});
		this.color = color;
		this.ignoreLevel = ignoreLevel;
	}

	create() {
		const formFormat = format.printf(({level, message, timestamp}) => {
			level = level.toUpperCase();
			switch (level) {
				case "INFO":
					level = chalk.white(`[${level}]`);
					break;
				case "ERROR":
					level = chalk.red(`[${level}]`);
					break;
				case "DEBUG":
					level = chalk.blueBright(`[${level}]`);
					break;
				case "WARN":
					level = chalk.yellow(`[${level}]`);
					break;
				default:
					level = chalk.white(`[${level}]`);
					break;
			}
			switch (this.color) {
				case "cyan":
					message = chalk.cyan(`${message}`);
					break;
				case "yellow":
					message = chalk.yellow(`${message}`);
					break;
				case "red":
					message = chalk.red(`${message}`);
					break;
				case "green":
					message = chalk.green(`${message}`);
					break;
				case "blue":
					message = chalk.blue(`${message}`);
					break;
				case "white":
					message = chalk.white(`${message}`);
					break;
				default:
					message = `${message}`;
					break;
			}
			return `${this.ignoreLevel ? "" : `${level}`} ${message}`;
		});

		const timestampFormat = format.timestamp({format: "MM-DD HH:mm:ss.SSSZZ"});
		const errorStackTracerFormat = format(info => {
			if (info.meta && info.meta instanceof Error) {
				info.message = `${info.message} ${info.meta.stack}`;
			}
			return info;
		});
		this.log.add(
			new transports.Console({
				format: format.combine(format.splat(), // Necessary to produce the 'meta' property
					errorStackTracerFormat(), timestampFormat, formFormat),
			}),
		);
		return this.log;
	}
}
