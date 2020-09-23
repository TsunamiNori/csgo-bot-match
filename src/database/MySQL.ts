import {Connection, getConnectionManager} from "typeorm";
import {Logger} from "../common/logger";
import winston from "winston";

class MySQL {
	public static MySQLInstance: Connection;
	private static logger: winston.Logger;

	public constructor() {
		MySQL.logger = (new Logger(`Database`, "yellow")).log;
		MySQL.connect().then((con): Connection => {
			return con;
		});
	}

	public static async connect(): Promise<Connection> {
		if (this.MySQLInstance) {
			return this.MySQLInstance;
		}
		const defaultHost: string = process.env.MYSQL_HOST || "127.0.0.1";
		const defaultPort: number = parseInt(process.env.MYSQL_PORT as string, 0) || 3306;
		const defaultUser: string = process.env.MYSQL_USER || "root";
		const defaultPassword: string = process.env.MYSQL_PASS || "";
		const defaultDB: string = process.env.MYSQL_DB || "";

		const connectionManager = getConnectionManager();
		const connection = connectionManager.create({
			database: defaultDB,
			entities: ["dist/models/mysql/*.js", "models/mysql/*.js", "models/mysql/*.ts"],
			host: defaultHost,
			password: defaultPassword,
			port: defaultPort,
			type: "mysql",
			username: defaultUser,
		});

		try {
			this.MySQLInstance = await connection.connect();
			MySQL.logger.info(`[Database] MySQL connected!`);
		} catch (err) {
			MySQL.logger.error(`[Database] MySQL Connection error: ${err.toString()}`);
			process.exit();
		}
		return this.MySQLInstance;
	}
}

export {MySQL};
