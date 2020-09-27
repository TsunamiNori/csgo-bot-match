import * as winston from "winston";
import chalk from "chalk";
import DailyRotateFile = require("winston-daily-rotate-file");

export class Logger {
	public log: winston.Logger;
	public color: string;
	private ignoreLevel: boolean;

	constructor(
							color: ("cyan" | "yellow" | "red" | "green" | "blue" | "white") = "white",
							ignoreLevel: boolean = false) {
		this.log = winston.createLogger({
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
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
		});
		this.color = color;
		this.ignoreLevel = ignoreLevel;
	}

	create() {
		const formFormat = winston.format.printf(({level, message, timestamp}) => {
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

		const timestampFormat = winston.format.timestamp({format: "MM-DD HH:mm:ss.SSSZZ"});

		this.log.add(
			new winston.transports.Console({
				format: winston.format.combine(timestampFormat, formFormat),
			}),
		);
		return this.log;
	}
}
