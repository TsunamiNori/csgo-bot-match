import {Document, Model, model, Schema} from "mongoose";

export interface Match extends Document {
	ip: string;
	port: number;
	rcon_password: string;
	team_1: {
		id: number,
		name: string,
		flag: string,
		score: number,
	};
	team_2: {
		id: number,
		name: string,
		flag: string,
		score: number,
	};
	status: number; // 0: Newly created
	configs: {
		map: string,
		overtime: boolean,
		max_round: number,
		rules: string,
		ot_money: number,
		ot_max_round: number,
		ot_enabled: boolean,
		password: string,
		auto_start: boolean,
		knife: boolean,
	};
}

export const matchSchema: Schema = new Schema({
	ip: String,
	port: Number,
	rcon_password: String,
	team_1: {
		id: Number,
		name: String,
		flag: String,
		score: Number,
	},
	team_2: {
		id: Number,
		name: String,
		flag: String,
		score: Number,
	},
	status: Number, // 0: Newly created
	configs: {
		map: String,
		overtime: Boolean,
		max_round: Number,
		rules: String,
		ot_money: Number,
		ot_max_round: Number,
		ot_enabled: Boolean,
		password: String,
		auto_start: Boolean,
		knife: Boolean,
	}
});

matchSchema.pre<Match>("save", function save(next) {
	// Pre-save process work
	next();
});


export const Match: Model<Match> = model<Match>("Match", matchSchema);
