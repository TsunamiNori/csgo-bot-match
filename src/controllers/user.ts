import {Body, Controller, Delete, Get, Param, Post, Put, QueryParams, Req, Res, UseBefore} from "routing-controllers";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {UserRepo} from "../repositories/user";
import {BaseController} from "./base";
import {UserInput} from "../models/request/data";

@Controller("/api/users")
export class UserController extends BaseController {
	private userRepo: UserRepo;

	public constructor() {
		super();
		this.userRepo = new UserRepo();
	}

	@UseBefore(AuthMiddleware)
	@Get("/me")
	public async GetMe(
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			const userFromToken = req.user;
			const result = await this.userRepo.GetUser(userFromToken.email);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}

	}

	// @Get("/me-mssql")
	// public async GetMeMSSQL(
	// 	@Req() req: any,
	// 	@Res() res: any): Promise<any> {
	// 	try {
	// 		const userFromToken = req.user;
	// 		const result = await this.userRepo.GetUserMSSQL(userFromToken.email);
	// 		return this.Ok(res, result);
	// 	} catch (e) {
	// 		return this.BadRequest(res, e);
	// 	}
	// }


	@Get("/info/:id")
	public async GetUserById(
		@Req() req: any,
		@Res() res: any,
		@Param("id") id: string): Promise<any> {
		try {
			const result = await this.userRepo.GetUserById(id);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}

	}

	@Get("/list")
	public async GetAllUsers(
		@Req() req: any,
		@Res() res: any,
		@QueryParams() queries: any): Promise<any> {
		try {
			const result = await this.userRepo.GetAllUser(queries);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

	@Post("/create")
	public async CreateNewUser(
		@Req() req: any,
		@Res() res: any,
		@Body() data: UserInput): Promise<any> {
		try {
			const result = await this.userRepo.CreateNewUser(data);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

	@Put("/update/:id")
	public async UpdateUser(
		@Req() req: any,
		@Res() res: any,
		@Param("id") id: string,
		@Body() data: any): Promise<any> {
		try {
			const result = await this.userRepo.UpdateUserById(id, data);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

	@Delete("/delete/:id")
	public async DeleteUserMSSQL(
		@Req() req: any,
		@Res() res: any,
		@Param("id") id: string): Promise<any> {
		try {
			const result = await this.userRepo.RemoveUserById(id);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

	// @Get("/list-mssql")
	// public async GetAllUsersMSSQL(
	// 	@Req() req: any,
	// 	@Res() res: any,
	// 	@QueryParams() queries: any): Promise<any> {
	// 	try {
	// 		const result = await this.userRepo.GetAllUserMSSQL(queries);
	// 		return this.Ok(res, result);
	// 	} catch (e) {
	// 		return this.BadRequest(res, e);
	// 	}
	// }
	//
	// @Post("/create")
	// public async CreateUserMSSQL(
	// 	@Req() req: any,
	// 	@Res() res: any,
	// 	@Body() data: any): Promise<any> {
	// 	try {
	// 		const result = await this.userRepo.CreateUserMSSQL(data);
	// 		return this.Ok(res, result);
	// 	} catch (e) {
	// 		return this.BadRequest(res, e);
	// 	}
	// }
	//
	// @Put("/update")
	// public async UpdateUserMSSQL(
	// 	@Req() req: any,
	// 	@Res() res: any,
	// 	@Body() data: any): Promise<any> {
	// 	try {
	// 		const result = await this.userRepo.UpdateUserMSSQL(data);
	// 		return this.Ok(res, result);
	// 	} catch (e) {
	// 		return this.BadRequest(res, e);
	// 	}
	// }
	//
	// @Delete("/delete")
	// public async DeleteUserMSSQL(
	// 	@Req() req: any,
	// 	@Res() res: any,
	// 	@Param("id") id: number): Promise<any> {
	// 	try {
	// 		const result = await this.userRepo.DeleteUserMSSQL(id);
	// 		return this.Ok(res, result);
	// 	} catch (e) {
	// 		return this.BadRequest(res, e);
	// 	}
	// }
}
