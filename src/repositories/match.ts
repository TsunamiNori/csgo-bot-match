import {BaseRepo} from "./base";
import {Server} from "socket.io";
import {SocketServer} from "../config/SocketServer";
import {Socket} from "dgram";
import {MongoDB} from "../database/MongoDB";
import {Match, matchSchema} from "../models/mongo/match";
import {Model, Schema} from "mongoose";

export class MatchRepo extends BaseRepo {
	private socketServer: Server;
	private udpServer: Socket;
	private matchDb: Model<Match>;


	constructor() {
		super();
		this.socketServer = SocketServer.io;
		this.udpServer = SocketServer.udpServer;

		this.matchDb = MongoDB.mongooseConnection.model<Match>(
			"matches",
			matchSchema,
		);
	}

	public async createMatch(data: any) {
		const result = await this.matchDb.create(data);
		return this.Success(result._id.toString());
	}

	public uploadDemo(data: any) {

	}
}
