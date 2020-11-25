import {Body, Controller, Get, Post, Req, Res} from "routing-controllers";
import {BaseController} from "./base";
import {TournamentRepo} from "../repositories/tournament";

@Controller("/api/tournament")
export class TournamentController extends BaseController {
	private tournamentRepo: TournamentRepo;

	public constructor() {
		super();
		this.tournamentRepo = new TournamentRepo();
	}

	@Get()
	public async CreateTournament(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			this.tournamentRepo.createTournament(data);
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
