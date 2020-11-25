import {BaseRepo} from "./base";
import {Server, serverSchema} from "../models/mongo/server";
import {MongoDB} from "../database/MongoDB";
import {Model} from "mongoose";

export class ServerRepo extends BaseRepo {
	private serverDb: Model<Server>;

	constructor() {
		super();
		this.serverDb = MongoDB.mongooseConnection.model<Server>(
			"servers",
			serverSchema
		);
	}

	async createServer(data: any) {
		await this.serverDb.create({
			name: "Local Server",
			ip: "127.0.0.1",
			port: 27017,
			tv_port: 28017,
			rcon_password: "vikings@123"
		});
	}
}
