import {Document, Model, model, Schema} from "mongoose";
import {GameEvent} from "./event";

export interface Tournament extends Document {
	name: string;
	start_date: Date;
	end_date: Date;
	prize_pool: {
		total: number;
		breakdown: []
	};
	banner_img: string;
	max_teams: number;
	type: string;
	event_id: Schema.Types.ObjectId | null;
}

export const tournamentSchema: Schema = new Schema({
	name: String,
	start_date: Date,
	end_date: Date,
	prize_pool: {
		total: Number,
		breakdown: []
	},
	banner_img: String,
	max_teams: Number,
	type: String,
	event_id: { type: Schema.Types.ObjectId, ref: GameEvent, default: null }
}, {
	timestamps: true
});

tournamentSchema.pre<Tournament>("save", function save(next) {
	// Pre-save process work
	// const team = this;
	next();
});


export const Tournament: Model<Tournament> = model<Tournament>("Tournament", tournamentSchema);
