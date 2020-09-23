import {Model} from "mongoose";
import {JWT_SECRET, SALT_SECRET} from "../common/constants";
import * as bcrypt from "bcrypt-nodejs";
import {MongoDB} from "../database/MongoDB";
import {User, userSchema} from "../models/mongo/user";
import {ResponseResult, UserInput} from "../models/request/data";
import {BaseRepo} from "./baseRepo";
// import {getRepository, Repository} from "typeorm";
// import {Users} from "../models/mssql/user";
import {isEmpty, isUndefined} from "lodash";
import ErrorCodes from "../common/error-codes";
import {Snowflake} from "../common/flakegen";

export class UserRepo extends BaseRepo {

	private db: Model<User>;
	private readonly JWT_SECRET: string;
	// private mssqlDb: Repository<Users>;
	private selectedFields = ["u.id", "u.username", "u.email", "u.fullname", "u.phone", "u.address", "u.uid", "u.dob", "u.avatar", "u.enable"];

	public constructor() {
		super();
		this.db = MongoDB.mongooseConnection.model<User>(
			"user",
			userSchema,
		);
		// this.mssqlDb = getRepository(Users);
		this.JWT_SECRET = JWT_SECRET;
	}

	public async GetUser(email: string): Promise<ResponseResult> {
		try {
			const user = await this.db.findOne({email}, {
				avatar: 1,
				email: 1,
				fullname: 1,
				roles: 1,
				scope: 1,
				uid: 1,
				username: 1,
			});
			if (!user) {
				return this.Failure(ErrorCodes.User.EMAIL_NOT_EXISTS);
			} else {
				const fakeData = {
					address: {
						addressLine: "L-12-20 Vertex, Cybersquare",
						city: "San Francisco",
						postCode: "45000",
					},
					avatar: "./assets/media/users/300_25.jpg",
					email: user.email,
					fullname: user.fullname,
					phone: user.phone,
					roles: user.roles,
					socialNetworks: {
						facebook: "https://facebook.com/admin",
						instagram: "https://instagram.com/admin",
						linkedIn: "https://linkedin.com/admin",
						twitter: "https://twitter.com/admin",
					},
					uid: user.uid,
					username: user.username,
				};
				return this.Result(fakeData);
			}
		} catch (e) {
			throw e;
		}
	}

	// public async GetUserMSSQL(email: string): Promise<ResponseResult> {
	// 	const user = await this.mssqlDb.findOne({
	// 		where: {email}
	// 	});
	// 	if (!user) {
	// 		return this.Failure(ErrorCodes.User.EMAIL_NOT_EXISTS);
	// 	}
	// 	const fakeData = {
	// 		...user,
	// 		address: {
	// 			addressLine: "L-12-20 Vertex, Cybersquare",
	// 			city: "San Francisco",
	// 			postCode: "45000",
	// 		},
	// 		avatar: "./assets/media/users/300_25.jpg",
	// 		socialNetworks: {
	// 			facebook: "https://facebook.com/admin",
	// 			instagram: "https://instagram.com/admin",
	// 			linkedIn: "https://linkedin.com/admin",
	// 			twitter: "https://twitter.com/admin",
	// 		},
	// 	};
	// 	return this.Result(fakeData);
	// }

	public async CreateNewUser(data: UserInput): Promise<ResponseResult> {
		const userData = Object.assign(new User(), data);

		const snowFlake = new Snowflake({
			mid: 42,
			offset: (2019 - 1970) * 31536000 * 1000,
		});
		const uuid = snowFlake.generate();
		if (uuid === null) {
			return this.Failure(ErrorCodes.System.FAILED_GENERATE_IDENTITY);
		}
		userData.uid = uuid;

		const result = await this.db.create(userData);
		return this.Success(result);
	}

	public async GetAllUser(queries: any): Promise<ResponseResult> {

		let searchTxt = "";
		let enableStatus = -1;

		const page = !isEmpty(queries.page) && !isUndefined(queries.page) ? queries.page : 1;
		const limit = !isEmpty(queries.limit) && !isUndefined(queries.limit) ? parseInt(queries.limit, 0) : 25;

		const skip = (page - 1) * limit;

		if (!isEmpty(queries.search) && !isUndefined(queries.search)) {
			searchTxt = decodeURI(queries.search).replace("'", "");
		}

		if (!isNaN(queries.enable) && !isUndefined(queries.enable)) {
			enableStatus = parseInt(queries.enable, 0);
		}

		const filter: { username?: any, enable?: any } = {};


		if ("" !== searchTxt) {
			filter.username = {
				$regex: `.*${searchTxt}.*`,
				$options: "i"
			};
		}
		if (enableStatus !== -1 && [0, 1].indexOf(enableStatus) !== -1) {
			filter.enable = {
				$eq: 1
			};
		}

		const total = await this.db.countDocuments(filter);

		const items = await this.db.find(filter, {
			roles: 1,
			scopes: 1,
			scope: 1,
			email: 1,
			fullname: 1,
			uid: 1,
			username: 1,
		}).skip(skip).limit(limit).lean().exec();
		return this.Success({
			items,
			total,
			maxPage: Math.round(total / limit) + 1,
			limit,
		});
	}

	public async GetUserById(id: string): Promise<ResponseResult> {
		const user = await this.db.find({
			uid: id
		}, {
			roles: 1,
			scopes: 1,
			scope: 1,
			email: 1,
			fullname: 1,
			uid: 1,
			username: 1,
		}).lean().exec();
		if (user != null && user.length > 0) {
			return this.Success(user);
		}
		return this.Failure(ErrorCodes.User.ACCOUNT_NOT_EXISTS);
	}

	public async UpdateUserById(id: string, newData: any): Promise<ResponseResult> {
		const result = await this.db.findOneAndUpdate({
			uid: id
		}, {
			$set: newData
		});
		if (result != null) {
			return this.Success(result);
		}
		return this.Failure(ErrorCodes.User.ACCOUNT_NOT_EXISTS);
	}

	public async RemoveUserById(id: string): Promise<ResponseResult> {
		const result = await this.db.findOneAndUpdate({
			uid: id
		}, {
			$set: {
				del_flag: 1,
			}
		});
		if (result != null) {
			return this.Success(result);
		}
		return this.Failure(ErrorCodes.User.ACCOUNT_NOT_EXISTS);
	}


	private async HashPassword(password: string): Promise<string> {
		const promise = new Promise((resolve, reject): any => {
			bcrypt.genSalt(SALT_SECRET, async (err: Error, salt: string): Promise<any> => {
				if (err) {
					reject(err);
				}
				bcrypt.hash(password, salt, null, (error: Error, hash): any => {
					if (error) {
						reject(err);
					}
					resolve(hash);
				});
			});
		});
		const check = await promise;
		return check as string;
	}

	//
	// public async GetAllUserMSSQL(queries: any): Promise<ResponseResult> {
	//
	// 	let searchTxt = "";
	// 	let enableStatus = -1;
	//
	// 	const page = !isEmpty(queries.page) && !isUndefined(queries.page) ? queries.page : 1;
	// 	const limit = !isEmpty(queries.limit) && !isUndefined(queries.limit) ? parseInt(queries.limit, 0) : 25;
	//
	// 	const skip = (page - 1) * limit;
	//
	// 	if (!isEmpty(queries.search) && !isUndefined(queries.search)) {
	// 		searchTxt = decodeURI(queries.search).replace("'", "");
	// 	}
	//
	// 	if (!isNaN(queries.enable) && !isUndefined(queries.enable)) {
	// 		enableStatus = parseInt(queries.enable, 0);
	// 	}
	//
	// 	let query = this.mssqlDb.createQueryBuilder("u");
	//
	// 	query = query.where("1=1");
	// 	if ("" !== searchTxt) {
	// 		query = query.andWhere("(u.username LIKE :searchText OR u.email LIKE :searchText OR u.fullname LIKE :searchText)",
	// 			{searchText: "%" + searchTxt + "%"});
	// 	}
	// 	if (enableStatus !== -1 && [0, 1].indexOf(enableStatus) !== -1) {
	// 		query = query.andWhere("u.enable = :enable", {enable: enableStatus});
	// 	}
	// 	// const qr = await query.skip(skip).take(limit).select(this.selectedFields).getSql();
	// 	// console.log(qr);
	// 	const [items, total] = await query.skip(skip).take(limit).select(this.selectedFields).getManyAndCount();
	//
	// 	return this.Result({
	// 		items,
	// 		total,
	// 		maxPage: Math.round(total / limit),
	// 		limit,
	// 	});
	// }
	//
	// public async CreateUserMSSQL(data: User): Promise<ResponseResult> {
	// 	// TODO: Validate input
	// 	const result = await this.mssqlDb.insert(data);
	//
	// 	return this.Result(result);
	// }
	//
	// public async UpdateUserMSSQL(data: User): Promise<ResponseResult> {
	// 	const checkExist = this.mssqlDb.findOne(data.id);
	// 	if (!checkExist) {
	// 		return this.Failure(ErrorCodes.User.EMAIL_NOT_EXISTS);
	// 	}
	// 	const result = this.mssqlDb.save(data);
	// 	return this.Result(result);
	// }
	//
	// public async DeleteUserMSSQL(id: number): Promise<ResponseResult> {
	// 	return this.Result({id});
	// }
}
