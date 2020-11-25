import {Document, Model, model, Schema} from "mongoose";
import {Server} from "./server";
import {Team} from "./team";

export interface Match extends Document {
	series_id: string | null;
	team_1: {
		id?: Schema.Types.ObjectId | null,
		name: string,
		flag: string,
		score: number,
	};
	team_2: {
		id?: Schema.Types.ObjectId | null,
		name: string,
		flag: string,
		score: number,
	};
	status: number; // 0: Newly created
	configs: {
		map: [string],
		game_no: number,
		best_of: number,
		overtime: boolean,
		max_round: number,
		rules: string,
		ot_money: number,
		ot_max_round: number,
		ot_enabled: boolean,
		password: string,
		auto_start: boolean,
		knife: boolean,
		server: {
			server_id?: Schema.Types.ObjectId | null,
			ip: string,
			port: number,
			rcon_password: string,
		}
	};
}

export const matchSchema: Schema = new Schema({
	series_id: {type: String, default : null},
	team_1: {
		id: {type: Schema.Types.ObjectId, ref: Team},
		name: String,
		flag: String,
		score: Number,
	},
	team_2: {
		id: {type: Schema.Types.ObjectId, ref: Team},
		name: String,
		flag: String,
		score: Number,
	},
	status: Number, // 0: Newly created
	configs: {
		map: [String],
		game_no: Number,
		best_of: Number,
		overtime: Boolean,
		max_round: Number,
		rules: String,
		ot_money: Number,
		ot_max_round: Number,
		ot_enabled: Boolean,
		password: String,
		auto_start: Boolean,
		knife: Boolean,
		server: {
			server_id: {type: Schema.Types.ObjectId, ref: Server},
			ip: {type: String, default: ""},
			port: {type: Number, default: 0},
			rcon_password: {type: String, default: ""},
		}
	}
}, {
	timestamps: true
});

matchSchema.pre<Match>("save", function save(next) {
	// Pre-save process work
	next();
});


export const Match: Model<Match> = model<Match>("Match", matchSchema);
