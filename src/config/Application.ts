import * as uuid from "uuid";
import {Logger} from "../common/logger";
import {ExpressConfig} from "./Express";
import {MongoDB} from "../database/MongoDB";
import {SocketServer} from "./SocketServer";
import winston from "winston";
import Helper from "../common/helper";
import MessageType from "../models/message_type";
import {MessageTypeRegex} from "../common/constants";
import {Server} from "http";


export class Application {

	public server: Server;
	public express: ExpressConfig;
	public socket: SocketServer;
	private logger: winston.Logger;

	public constructor() {
		this.express = new ExpressConfig();
		this.logger = (new Logger(`cyan`)).create();
		// this.logger = Logger.log;

		if ((process.env.MONGODB_ENABLE as string) === "true") {
			this.logger.info(`MongoDB enabled`);
			MongoDB.connect();
		}

		const appPort: number = parseInt(process.env.PORT as string, 0) || 3000;

		const newUuid = uuid.v4();
		const appHost = process.env.HOST || "127.0.0.1";

		this.server = this.express.app.listen(appPort, () => {
			this.logger.info(`CSGO Bot started listening on ${appPort}`);
		});
		this.socket = new SocketServer(this.server, appPort);

		process.on("uncaughtException", (e: any) => {
			console.log(e);
			this.logger.error(e);
			process.exit(1);
		});
		process.on("unhandledRejection", (e: any) => {
			console.log(e);
			this.logger.error(e);
			process.exit(1);
		});

		Object.keys(MessageTypeRegex).forEach(x => {
			const regex = MessageTypeRegex[x as keyof typeof MessageTypeRegex];
		});
	}

	public start() {
		// Empty function
	}
}
