import * as winston from "winston";
import chalk from "chalk";
import DailyRotateFile = require("winston-daily-rotate-file");

export class Logger {
	public log: winston.Logger;

	constructor(module_name: string = "Application", color: ("cyan" | "yellow" | "red" | "green" | "blue" | "white") = 'white', ignore_level: boolean = false) {

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
					module_name = chalk.cyan(`[${module_name}]`);
					break;
				case "yellow":
					module_name = chalk.yellow(`[${module_name}]`);
					break;
				case "red":
					module_name = chalk.red(`[${module_name}]`);
					break;
				case "green":
					module_name = chalk.green(`[${module_name}]`);
					break;
				case "blue":
					module_name = chalk.blue(`[${module_name}]`);
					break;
				case "white":
					module_name = chalk.white(`[${module_name}]`);
					break;
				default:
					module_name = `[${module_name}]`;
					break;
			}
			return `${module_name} ${ignore_level ? '' : `[${level}]`} ${message}`;
		});

		const timestampFormat = winston.format.timestamp({format: "MM-DD HH:mm:ss.SSSZZ"});

		this.log.add(
			new winston.transports.Console({
				format: winston.format.combine(timestampFormat, formFormat),
			}),
		);
	}
}
