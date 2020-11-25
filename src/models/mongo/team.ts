import {Document, Model, model, Schema} from "mongoose";

export interface Team extends Document {
	name: string;
	flag: string;
	tag: string;
}

export const teamSchema: Schema = new Schema({
	name: String,
	flag: String,
	tag: String
}, {
	timestamps: true
});

teamSchema.pre<Team>("save", function save(next) {
	// Pre-save process work
	// const team = this;
	next();
});


export const Team: Model<Team> = model<Team>("Team", teamSchema);
