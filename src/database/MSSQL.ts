import {getConnectionManager} from "typeorm";
import {Logger} from "../common/logger";
import winston from "winston";

class MSSQL {
	public static MSSQLInstance: any;
	public static logger: winston.Logger;

	public constructor() {
		// MSSQL.connect();
		MSSQL.logger = (new Logger(`Database`, "yellow")).log;
	}

	public static async connect() {
		if (this.MSSQLInstance) {
			return this.MSSQLInstance;
		}
		const defaultHost: string = process.env.MSSQL_HOST || "127.0.0.1";
		const defaultPort: number = parseInt(process.env.MSSQL_PORT as string, 0) || 1433;
		const defaultUser: string = process.env.MSSQL_USER || "sa";
		const defaultPassword: string = process.env.MSSQL_PASS || "";
		const defaultDB: string = process.env.MSSQL_DB || "";

		const connectionManager = getConnectionManager();
		const connection = connectionManager.create({
			database: defaultDB,
			entities: ["dist/models/mssql/*.js"],
			host: defaultHost,
			password: defaultPassword,
			port: defaultPort,
			type: "mssql",
			username: defaultUser,
		});

		this.MSSQLInstance = connection.connect().then((con) => con).catch((err) => {
			MSSQL.logger.error(`[Database] MSSQL Connection error: ${err}`);
		}); // performs connection createConnection();
		return this.MSSQLInstance;
	}
}

// MSSQL.connect();
export {MSSQL};
