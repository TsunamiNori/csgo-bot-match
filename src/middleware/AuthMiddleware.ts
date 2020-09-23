import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as _ from "lodash";
import {ExpressMiddlewareInterface} from "routing-controllers";
import {JWT_SECRET} from "../common/constants";
import {Logger} from "../common/logger";
import HttpStatusCode from "../common/http-status";

export class AuthMiddleware implements ExpressMiddlewareInterface {
	// interface implementation is optional

	public constructor() {
		//logger.info(`Middleware called!`);
	}

	public use(req: any, res: express.Response, next?: (err?: any) => any): any {
		const tokenHeader: any = req.headers.authorization;
		if (_.isEmpty(tokenHeader)) {
			res.json({
				message: "INVALID_TOKEN",
				status: HttpStatusCode.UNAUTHORIZED,
			});
			res.end();
			return res;
		}
		let token = "";
		if (/\s/g.test(tokenHeader)) {
			token = tokenHeader.split(" ")[1];
		} else {
			token = tokenHeader;
		}
		try {
			req.user = jwt.verify(token, JWT_SECRET, {algorithms: ["HS256"]});
			if (next) {
				next();
			}
		} catch (ex) {
			res.json({
				message: "INVALID_TOKEN",
				status: HttpStatusCode.UNAUTHORIZED,
			});
			res.end();
			return res;
		}
	}
}
