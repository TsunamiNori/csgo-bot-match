import {BaseRepo} from "./base";
import {Team, teamSchema} from "../models/mongo/team";
import {Model} from "mongoose";
import {MongoDB} from "../database/MongoDB";

export class TeamRepo extends BaseRepo {
	private teamDb: Model<Team>;

	constructor() {
		super();
		this.teamDb = MongoDB.mongooseConnection.model<Team>(
			"teams",
			teamSchema
		);
	}

	async createTeam(data: any) {
		await this.teamDb.create(data);
		return this.Success();
	}

	async getTeams(filter: any) {
		const teams = this.teamDb.find(filter);
		return this.Success(teams);
	}
}
