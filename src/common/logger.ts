import * as winston from "winston";
import chalk from "chalk";
import DailyRotateFile = require("winston-daily-rotate-file");

export class Logger {
	public log: winston.Logger;

	constructor(moduleName: string = "Application",
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

		const formFormat = winston.format.printf(({level, message, timestamp}) => {
			level = level.toUpperCase();

			switch (color) {
				case "cyan":
					moduleName = chalk.cyan(`[${moduleName}]`);
					break;
				case "yellow":
					moduleName = chalk.yellow(`[${moduleName}]`);
					break;
				case "red":
					moduleName = chalk.red(`[${moduleName}]`);
					break;
				case "green":
					moduleName = chalk.green(`[${moduleName}]`);
					break;
				case "blue":
					moduleName = chalk.blue(`[${moduleName}]`);
					break;
				case "white":
					moduleName = chalk.white(`[${moduleName}]`);
					break;
				default:
					moduleName = `[${moduleName}]`;
					break;
			}
			return `${moduleName} ${ignoreLevel ? "" : `[${level}]`} ${message}`;
		});

		const timestampFormat = winston.format.timestamp({format: "MM-DD HH:mm:ss.SSSZZ"});

		this.log.add(
			new winston.transports.Console({
				format: winston.format.combine(timestampFormat, formFormat),
			}),
		);
	}
}
