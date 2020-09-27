import * as express from "express";
import * as _ from "lodash";
import {Logger} from "../common/logger";
import HttpStatusCode from "../common/http-status";
import {ResponseResult} from "../models/request/data";
import winston from "winston";

export class BaseController {
	private logger: winston.Logger;

	constructor() {
		this.logger = (new Logger("yellow")).create();
	}

	public OkNoData(res: express.Response): any {
		res.json({
			message: "SUCCESS",
			status: HttpStatusCode.OK,
		});
		res.status(HttpStatusCode.OK);
		res.end();
		return res;
	}

	public Ok(res: express.Response, data: ResponseResult): any {
		res.json({
			code: data.error ? data.errorCode : 0,
			data: data.data,
			message: !_.isEmpty(data.message) ? data.message : "SUCCESS",
			status: data.status,
		});
		res.status(HttpStatusCode.OK);
		res.end();
		return res;
	}

	public NotFound(res: express.Response, data: object = [], message?: string): any {
		res.json({
			message: message ? message : "NOT_FOUND",
			status: HttpStatusCode.NOT_FOUND,
		});
		res.status(HttpStatusCode.NOT_FOUND);
		res.end();
		return res;
	}

	public BadRequest(res: express.Response, e?: any): any {
		if (e) {
			console.log(e);
			this.logger.error(`Bad request: (${typeof e}) ${typeof e === "object" ? JSON.stringify(e) : e}`);
		}
		res.json({
			message: "BAD_REQUEST",
			status: HttpStatusCode.BAD_REQUEST,
		});
		res.status(HttpStatusCode.BAD_REQUEST);
		res.end();
		return res;
	}
}
