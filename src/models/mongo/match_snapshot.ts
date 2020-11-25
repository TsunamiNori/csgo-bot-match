import {Document, Model, model, Schema} from "mongoose";

export interface MatchSnapshot extends Document {
	match_id: Schema.Types.ObjectId;
	map: string;
	round_num: number;
}

export const matchSnapshotSchema: Schema = new Schema({
	match_id: Schema.Types.ObjectId,
	map: String,
	round_num: Number
}, {
	timestamps: true
});

matchSnapshotSchema.pre<MatchSnapshot>("save", function save(next) {
	// Pre-save process work
	// const team = this;
	next();
});


export const MatchSnapshot: Model<MatchSnapshot> = model<MatchSnapshot>("MatchSnapshot", matchSnapshotSchema);
