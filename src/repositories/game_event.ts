import {GameEvent, eventSchema} from "../models/mongo/event";
import {MongoDB} from "../database/MongoDB";
import {Model} from "mongoose";
import {BaseRepo} from "./base";

export class GameEventRepo extends BaseRepo {
	private eventDb: Model<GameEvent>;

	constructor() {
		super();
		this.eventDb = MongoDB.mongooseConnection.model<GameEvent>(
			"events",
			eventSchema
		);
	}

	async createGameEvent(data: any) {
		await this.eventDb.create({
			name: "GameEvent Liquid",
			start_date: Date.now(),
			end_date: Date.now(),
			banner_img: "",
			description: "Event",
			type: "",
		});
	}
}
