"use strict";
import {Logger} from "../../common/logger";
import winston from "winston";
import {Model} from "mongoose";
import {Match, matchSchema} from "../../models/mongo/match";
import {MongoDB} from "../../database/MongoDB";
import cluster from "cluster";
import {MatchState} from "../../common/constants";

export default class MatchManager {
	private static logger: winston.Logger;
	private readonly matchStatus: number;
	private readonly matchInfo: any;
	private matchDb: Model<Match>;
	private processingMatches = new Map();

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
			status: MatchState.CREATED,
		}).exec();

		if (matches.length > 0) {
			// MatchManager.logger.info(`Found ${matches.length} new matches. Processing`);
			matches.forEach((match) => {
				if (this.processingMatches.get(match._id.toString())) {
					return;
				}
				this.processingMatches.set(match._id.toString(), match);
				cluster.fork({MATCH_DATA: JSON.stringify(match)});
			});
		} else {
			MatchManager.logger.info(`No new match.`);
		}

		setTimeout(() => {
			this.checkMatches();
		}, 3000);
	}

	private async monitorMatch() {

	}
}
