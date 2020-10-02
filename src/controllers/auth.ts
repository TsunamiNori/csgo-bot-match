import {Body, Controller, Post, Req, Res,} from "routing-controllers";
import {LoginInput, RegisterInput, ResponseResult} from "../models/request/data";
import {AuthRepo} from "../repositories/auth";
import {BaseController} from "./base";

@Controller("/api/auth")
export class AuthController extends BaseController {
	private authRepo: AuthRepo;

	public constructor() {
		super();
		this.authRepo = new AuthRepo();
	}

	@Post("/register")
	public async register(
		@Body() data: RegisterInput,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			const result = await this.authRepo.Register(data);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

	@Post("/login")
	public async oauth(
		@Body() data: LoginInput,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			const result: ResponseResult = await this.authRepo.Login(data);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

}
