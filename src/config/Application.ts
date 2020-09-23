import * as uuid from "uuid";
import {Logger} from "../common/logger";
import {MySQL} from "../database/MySQL";
import {ExpressConfig} from "./Express";
// import {MSSQL} from "../database/MSSQL";
import {MongoDB} from "../database/MongoDB";
import {SocketServer} from "./SocketServer";
import winston from "winston";
// import RegisterOptions = Consul.Agent.Service.RegisterOptions;
// import RegisterCheck = Consul.Agent.Service.RegisterCheck;

export class Application {

	public server: any;
	public express: ExpressConfig;
	public socket: SocketServer;
	private logger: winston.Logger;
	// public consulHost: string;
	// public consulPort: string;
	//
	public constructor() {
		this.express = new ExpressConfig();
		this.logger = (new Logger(`Express`, `cyan`)).log;
		if ((process.env.MYSQL_ENABLE as string) === "true") {
			this.logger.info(`MySQL enabled`);
			MySQL.connect().then();
		}
		// if ((process.env.MSSQL_ENABLE as string) === "true") {
		// 	this.logger.info("MSSQL enabled");
		// 	MSSQL.connect().then();
		// }
		if ((process.env.MONGODB_ENABLE as string) === "true") {
			this.logger.info(`MongoDB enabled`);
			MongoDB.connect();
		}

		// this.consulHost = process.env.CONSUL_HOST || "localhost";
		// this.consulPort = process.env.CONSUL_PORT || "8500";

		const appPort: number = parseInt(process.env.PORT as string, 0) || 3000;

		const newUuid = uuid.v4();
		const appHost = process.env.HOST || "127.0.0.1";

		this.server = this.express.app.listen(appPort, () => {
			this.logger.info(`CSGO Bot started listening on ${appPort}`);
		});
		this.socket = new SocketServer(this.server);

		// Deperacated: Consul Service
		// const appConsulID = `example-${appHost}-${appPort}-${newUuid}`;
		// const serviceName = process.env.CONSUL_SERVICE_NAME || newUuid;
		// Ignored consul, since we dont need it yet
		// this.registerConsul(appHost, appPort, appConsulID, serviceName);

		process.on("uncaughtException", (e: any) => {
			this.logger.error(e);
			process.exit(1);
		});
		process.on("unhandledRejection", (e: any) => {
			this.logger.error(e);
			process.exit(1);
		});
	}
}
