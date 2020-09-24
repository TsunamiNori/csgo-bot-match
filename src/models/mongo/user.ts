import bcrypt from "bcrypt-nodejs";
import {Document, Error, Model, model, Schema} from "mongoose";
import {SALT_SECRET} from "../../common/constants";

export interface User extends Document {
	avatar: string;
	email: string;
	fullname: string;
	password: string;
	roles: [string];
	scopes: [string];
	username: string;
	uid: string;
}

export const userSchema: Schema = new Schema({
	avatar: String,
	email: String,
	fullname: String,
	password: String,
	phone: String,
	roles: [String],
	scopes: [String],
	uid: String,
	username: String,
});

userSchema.pre<User>("save", function save(next) {
	const user = this;

	bcrypt.genSalt(SALT_SECRET, (err, salt) => {
		if (err) {
			return next(err);
		}
		bcrypt.hash(this.password, salt, null, (error: Error, hash) => {
			if (error) {
				return next(error);
			}
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = (candidatePassword: string, callback: any): any => {
	// @ts-ignore
	bcrypt.compare(candidatePassword, this.password, (err: Error, isMatch: boolean) => {
		callback(err, isMatch);
	});
};

export const User: Model<User> = model<User>("User", userSchema);
