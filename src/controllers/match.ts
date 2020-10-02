import {Body, Controller, Get, Post, Req, Res} from "routing-controllers";
import {BaseController} from "./base";
import {MatchRepo} from "../repositories/matchRepo";

@Controller("/api/match")
export class MatchController extends BaseController {
	private matchRepo: MatchRepo;

	public constructor() {
		super();
		this.matchRepo = new MatchRepo();
	}

	@Get()
	public async CreateMatch(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			this.matchRepo.createMatch(data);
			return this.Ok(res, {
				data: [],
				message: ``,
				status: 200,
				errorCode: 0,
				error: false,
			});
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

}
