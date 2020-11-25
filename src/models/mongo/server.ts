import {Document, Model, model, Schema} from "mongoose";

export interface Server extends Document {
	name: string;
	ip: string;
	port: number;
	rcon_password: string;
	tv_port: number;
}

export const serverSchema: Schema = new Schema({
	name: String,
	ip: String,
	port: Number,
	rcon_password: String,
	tv_port: Number,
}, {
	timestamps: true
});

serverSchema.pre<Server>("save", function save(next) {
	// Pre-save process work
	// const team = this;
	next();
});


export const Server: Model<Server> = model<Server>("Server", serverSchema);
