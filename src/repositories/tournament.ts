import {Tournament, tournamentSchema} from "../models/mongo/tournament";
import {MongoDB} from "../database/MongoDB";
import {Model, Schema} from "mongoose";
import {BaseRepo} from "./base";

export class TournamentRepo extends BaseRepo {
	private tournamentDb: Model<Tournament>;

	constructor() {
		super();
		this.tournamentDb = MongoDB.mongooseConnection.model<Tournament>(
			"tournaments",
			tournamentSchema
		);
	}

	async createTournament(data: any) {
		await this.tournamentDb.create({
			name: "string",
			start_date: Date.now(),
			end_date: Date.now(),
			prize_pool: {
				total: 1000000,
				breakdown: []
			},
			banner_img: "string",
			max_teams: 128,
			type: "string",
			event_id: null,
		});
	}
}
