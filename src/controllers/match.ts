import {Body, Controller, Get, Post, Req, Res} from "routing-controllers";
import {BaseController} from "./base";
import {MatchRepo} from "../repositories/match";

@Controller("/api/match")
export class MatchController extends BaseController {
	private matchRepo: MatchRepo;

	public constructor() {
		super();
		this.matchRepo = new MatchRepo();
	}

	@Post()
	public async CreateMatch(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			const result = await this.matchRepo.createMatch(data);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

}
