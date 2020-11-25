import bcrypt from "bcrypt-nodejs";
import * as jwt from "jsonwebtoken";
import * as _ from "lodash";
import {Error, Model} from "mongoose";
import {JWT_SECRET} from "../common/constants";
import {Snowflake} from "../common/flakegen";
import {MongoDB} from "../database/MongoDB";
import {User, userSchema} from "../models/mongo/user";
import {LoginInput, RegisterInput, ResponseResult} from "../models/request/data";
import {BaseRepo} from "./base";
import ErrorCodes from "../common/error-codes";

export class AuthRepo extends BaseRepo {

	private userDb: Model<User>;
	private readonly JWT_SECRET: string;

	public constructor() {
		super();
		this.userDb = MongoDB.mongooseConnection.model<User>(
			"user",
			userSchema,
		);

		this.JWT_SECRET = JWT_SECRET;
	}

	public async Register(data: RegisterInput): Promise<ResponseResult> {
		try {
			const validateResult = await this.validateInput(data);
			if (validateResult !== true) {
				return validateResult;
			}
			const snowFlake = new Snowflake({
				mid: 42,
				offset: (2019 - 1970) * 31536000 * 1000,
			});
			const uuid = snowFlake.generate();
			if (uuid === null) {
				return this.Failure(ErrorCodes.System.FAILED_GENERATE_IDENTITY);
			}
			await this.userDb.create({
				email: data.email,
				fullname: data.fullname,
				password: data.password,
				roles: ["Regular User"],
				scopes: ["basic"],
				avatar: "default.png",
				uid: uuid,
				username: data.username,
			});

			const token = jwt.sign({username: data.username, scope: ["*"]}, this.JWT_SECRET);
			return this.Success({token});
		} catch (e) {
			// tslint:disable-next-line:no-console
			console.log(e);
			throw e;
		}
	}

	public async Login(data: LoginInput): Promise<ResponseResult> {
		try {
			const user = await this.userDb.findOne({email: data.email});
			return this.processUser(user, data);
		} catch (e) {
			throw e;
		}
	}

	private async processUser(user: any, data: LoginInput): Promise<any> {
		if (!user) {
			return this.Failure(ErrorCodes.User.EMAIL_NOT_EXISTS);
		} else {
			const promise = new Promise((resolve, reject): void => {
				bcrypt.compare(data.password, user.password, (err: Error, isMatch: boolean) => {
					if (err) {
						reject(err);
					}
					resolve(isMatch);
				});
			});
			const passwordValid = await promise;
			if (!passwordValid) {
				return this.Failure(ErrorCodes.User.INVALID_CREDENTIALS);
			}
			const token = jwt.sign({
				email: user.email,
				fullname: user.fullname,
				id: user.uid,
				username: user.username,
			}, this.JWT_SECRET, {
				algorithm: "HS256",
				expiresIn: "7 days",
				issuer: "TsunamiNori",
			});
			return this.Result({token});
		}
	}

	private async validateInput(data: RegisterInput): Promise<any> {
		if (_.isEmpty(data.fullname) || data.fullname.length < 6) {
			return this.Failure(ErrorCodes.Validate.FULL_NAME_MUST_LONGER_THAN_SIX);
		}
		if (_.isEmpty(data.username) || data.username.length < 6) {
			return this.Failure(ErrorCodes.Validate.USERNAME_MUST_LONGER_THAN_SIX);
		}
		if (_.isEmpty(data.password) || data.password.length < 8) {
			return this.Failure(ErrorCodes.Validate.PASSWORD_MUST_LONGER_THAN_EIGHT);
		}
		if (_.isEmpty(data.email) || data.email.length < 8) {
			return this.Failure(ErrorCodes.Validate.EMAIL_MUST_LONGER_THAN_EIGHT);
		}
		const emailExist = await this.userDb.findOne({email: data.email});
		if (emailExist) {
			return this.Failure(ErrorCodes.Validate.EMAIL_EXIST);
		}
		const usernameExist = await this.userDb.findOne({username: data.username});
		if (usernameExist) {
			return this.Failure(ErrorCodes.Validate.USERNAME_EXIST);
		}
		return true;
	}
}
