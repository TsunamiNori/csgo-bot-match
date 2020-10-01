"use strict";
import {Logger} from "../../common/logger";
import winston from "winston";


export default class Matches {
	private static logger: winston.Logger;
	private readonly matchId: number;
	private readonly matchStatus: number;
	private readonly matchInfo: any;

	constructor(matchId: number) {
		Matches.logger = (new Logger("blue")).create();
		this.matchStatus = Math.random() * 100;
		this.matchId = matchId;
		this.matchInfo = {
			server_info: {
				ip: "127.0.0.1",
				port: 27017,
				rcon_password: "",
				team_1: {
					id: 0,
					name: "Team A",
					flag: "VN",
				},
				team_2: {
					id: 0,
					name: "Team B",
					flag: "VN"
				},
				status: this.matchStatus,
				configs: {
					map: "de_dust2",
					overtime: true,
					max_round: 15,
					rules: "esl5on5",
					ot_money: 10000,
					ot_max_round: 3,
					ot_enabled: true,
					password: "vikings",
					auto_start: false
				}
			}
		};
		Matches.logger.info(`Match ${matchId} created with status ${this.matchStatus}`)
	}

	public checkMatches() {
		Matches.logger.info(`Checking matches ${this.matchId} - ${this.matchStatus}`);
		setTimeout(() => {
			this.checkMatches();
		}, 3000);
	}

	public engageMap() {

	}
}
