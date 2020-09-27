import * as bodyParser from "body-parser";
import express, {Request, Response} from "express";
import * as path from "path";
import {useContainer, useExpressServer} from "routing-controllers";
import {Container} from "typedi";
import {Logger} from "../common/logger";
import HttpStatusCode from "../common/http-status";
import winston from "winston";

/* tslint:disable */

export class ExpressConfig {
	public app: express.Application;
	private static logger: winston.Logger;

	public constructor() {
		ExpressConfig.logger = (new Logger("green")).create();
		this.app = express();
		this.app.use(bodyParser.urlencoded({extended: false}));
		this.app.use(bodyParser.json());
		this.setUpControllers();
		this.app.use(ExpressConfig.logRequestStart);
		this.app.use(ExpressConfig.ignoreFavicon);
		this.app.use(ExpressConfig.clientErrorHandler);
		this.app.use(ExpressConfig.notFoundHandler);

	}

	public static ignoreFavicon(req: Request, res: Response, next: any): any {
		if (req.originalUrl === "/favicon.ico") {
			if (res.headersSent) {
				res.end();
			} else {
				res.sendStatus(204).end();
			}
		}
		return next();
	}

	public static notFoundHandler(
		req: Request,
		res: Response,
		next: any): void {
		if (res.headersSent) {
			return next();
		}
		res.status(HttpStatusCode.NOT_FOUND);
		res.send({
			message: "NOT_FOUND",
			status: HttpStatusCode.NOT_FOUND,
		});
		res.end();
	}

	public static clientErrorHandler(
		err: any,
		req: Request,
		res: Response,
		next: any,
	): void {
		this.logger.info(err);
		if (err.hasOwnProperty("thrown")) {
			res.send({
				error: err.message,
				message: "BAD_REQUEST",
				status: HttpStatusCode.BAD_REQUEST,
			});
		}
		if (res.headersSent) {
		} else {
			//res.status(HttpStatusCode.BAD_REQUEST);
		}
		res.end();
		return next(err);
	}

	public static logRequestStart(req: Request, res: Response, next: any): void {
		this.logger.info(`[Express] ${(new Date())} | ` +
			`${req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress}` +
			` - ${req.method} - ${req.originalUrl} - ${JSON.stringify(req.body)} - ${req.headers["user-agent"]}`);

		const cleanup = (): void => {
			res.removeListener("finish", logFn);
			res.removeListener("close", abortFn);
			res.removeListener("error", errorFn);
		};

		const logFn = (): void => {
			cleanup();
			this.logger.info(`[Express] ${(new Date())} | ` +
				`${req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress}` +
				` - ${req.method} ${req.originalUrl} ${res.statusMessage}; ${res.get("Content-Length") || 0}b sent`);
		};

		const abortFn = (): void => {
			cleanup();
			this.logger.warn("[Express] Request aborted by the client");
		};

		const errorFn = (err: any): void => {
			cleanup();
			this.logger.error(`Request pipeline error: ${err}`);
		};

		res.on("finish", logFn); // successful pipeline (regardless of its response)
		res.on("close", abortFn); // aborted pipeline
		res.on("error", errorFn); // pipeline internal error

		next();
	}

	private setUpControllers(): void {
		const controllersPath = path.resolve("dist", "controllers");
		useContainer(Container);
		useExpressServer(this.app, {
			controllers: [`${controllersPath}/*.js`],
			cors: true,
		});
	}


}
