"use strict";
import {Logger} from "../../common/logger";
import winston from "winston";
import {Model} from "mongoose";
import {Match, matchSchema} from "../../models/mongo/match";
import {MongoDB} from "../../database/MongoDB";
import cluster from "cluster";

export default class MatchManager {
	private static logger: winston.Logger;
	private readonly matchStatus: number;
	private readonly matchInfo: any;
	private matchDb: Model<Match>;
	private processingMatches: String[] = [];

	constructor(matchInfo: any) {
		MatchManager.logger = (new Logger("blue")).create();

		this.matchDb = MongoDB.mongooseConnection.model<Match>(
			"matches",
			matchSchema,
		);
		this.matchStatus = Math.random() * 100;
		this.matchInfo = matchInfo;
	}

	public async checkMatches() {
		const matches = await this.matchDb.find({
			status: 0,
		}).exec();

		if (matches.length > 0) {
			MatchManager.logger.info(`Found ${matches.length} new matches. Processing`);
			matches.forEach((match) => {
				if (this.processingMatches.indexOf(match._id.toString()) !== -1) {
					return;
				}
				console.info(typeof match._id);
				this.processingMatches.push(match._id.toString());
				cluster.fork({MATCH_DATA: JSON.stringify(match)});
			})
		}

		setTimeout(() => {
			this.checkMatches();
		}, 3000);
	}

	public engageMap() {

	}
}
