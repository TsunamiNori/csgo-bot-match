import Mongoose from "mongoose";
import {Logger} from "../common/logger";
import winston from "winston";

Mongoose.Promise = global.Promise;

class MongoDB {
	public static mongooseInstance: any;
	public static mongooseConnection: Mongoose.Connection;

	public static authInfo: string;
	public static connectionUrl: string;
	public static dbName: string;
	public static authDb: string;
	public static sslEnable: string;
	public static logger: winston.Logger = (new Logger("yellow")).create();

	public static connect(): Mongoose.Connection {
		if (this.mongooseInstance) {
			return this.mongooseInstance;
		}
		let connectionString: string;
		if ((process.env.MONGODB_USE_CONNECTIONSTRING as string) === "true") {
			connectionString = process.env.MONGODB_CONNECTIONSTRING as string;
		} else {
			this.authInfo =
				(process.env.MONGODB_AUTH as string) === "true"
					? `${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}`
					: "";
			this.connectionUrl = `${process.env.MONGODB_HOST || "localhost"}:${process
				.env.MONGODB_PORT || 27017}`;
			this.dbName = `${process.env.MONGODB_NAME || "test"}`;
			this.authDb = `?authSource=${process.env.MONGODB_AUTHDB || "admin"}`;
			this.sslEnable = `&ssl=${process.env.MONGODB_SSL || "false"}`;

			connectionString = `mongodb://${this.authInfo}@${
				this.connectionUrl
			}/${this.dbName}${this.authDb}${this.sslEnable}`;
		}
		this.mongooseConnection = Mongoose.connection;

		this.mongooseConnection.once("open", () => {
			MongoDB.logger.info("Connect to mongodb is opened.");
		});

		this.mongooseInstance = Mongoose.connect(connectionString, {
			useCreateIndex: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		this.mongooseConnection.on("connected", () => {
			MongoDB.logger.info("Mongoose connection opened");
		});

		// If the connection throws an error
		this.mongooseConnection.on("error", (msg) => {
			MongoDB.logger.info("Mongoose error message:", msg);
		});

		// When the connection is disconnected
		this.mongooseConnection.on("disconnected", () => {
			setTimeout(() => {
				this.mongooseInstance = Mongoose.connect(connectionString);
			}, 10000);
			MongoDB.logger.info("Mongoose disconnected.");
		});

		// When the connection is reconnected
		this.mongooseConnection.on("reconnected", () => {
			MongoDB.logger.info("Mongoose reconnected.");
		});

		// If the Node process ends, close the Mongoose connection
		process.on("SIGINT", () => {
			this.mongooseConnection.close(() => {
				MongoDB.logger.info(
					"Mongoose disconnected through app termination.",
				);
				process.exit(0);
			});
		});

		return this.mongooseInstance;
	}
}

export {MongoDB};
