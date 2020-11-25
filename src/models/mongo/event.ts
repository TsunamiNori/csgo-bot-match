import {Document, Model, model, Schema} from "mongoose";

export interface GameEvent extends Document {
	name: string;
	start_date: Date;
	end_date: Date;
	banner_img: string;
	description: string;
	type: string;
}

export const eventSchema: Schema = new Schema({
	name: String,
	start_date: Date,
	end_date: Date,
	banner_img: String,
	description: String,
	type: String,
}, {
	timestamps: true
});

eventSchema.pre<GameEvent>("save", function save(next) {
	// Pre-save process work
	// const team = this;
	next();
});


export const GameEvent: Model<GameEvent> = model<GameEvent>("GameEvent", eventSchema);
