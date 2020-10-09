import {BaseRepo} from "./baseRepo";
import {Server} from "socket.io";
import {SocketServer} from "../config/SocketServer";
import {Socket} from "dgram";
import {MongoDB} from "../database/MongoDB";
import {Match, matchSchema} from "../models/mongo/match";
import {Model} from "mongoose";

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
		await this.matchDb.create({
			ip: "127.0.0.1",
			port: 27017,
			rcon_password: "",
			team_1: {
				id: 0,
				name: "Team A",
				flag: "VN",
				score: 0,
			},
			team_2: {
				id: 0,
				name: "Team B",
				flag: "VN",
				score: 0,
			},
			status: 0, // 0: Newly created
			configs: {
				map: "de_dust2",
				overtime: true,
				max_round: 15,
				rules: "esl5on5",
				ot_money: 10000,
				ot_max_round: 3,
				ot_enabled: true,
				password: "vikings",
				auto_start: false,
				knife: true,
			}
		});
	}

	public uploadDemo(data: any) {

	}
}
