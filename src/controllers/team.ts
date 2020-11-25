import {Body, Controller, Get, Post, QueryParams, Req, Res} from "routing-controllers";
import {BaseController} from "./base";
import {TeamRepo} from "../repositories/team";

@Controller("/api/team")
export class TeamController extends BaseController {
	private teamRepo: TeamRepo;

	public constructor() {
		super();
		this.teamRepo = new TeamRepo();
	}

	@Post()
	public async CreateTeam(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			const result = await this.teamRepo.createTeam(data);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}
	@Get()
	public async GetTeams(
		@Req() req: any,
		@Res() res: any,
		@QueryParams() queries: any): Promise<any> {
		try {
			const result = await this.teamRepo.getTeams(queries);
			return this.Ok(res, result);
		} catch (e) {
			return this.BadRequest(res, e);
		}
	}

}
