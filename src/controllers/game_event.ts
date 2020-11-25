import {Body, Controller, Get, Post, Req, Res} from "routing-controllers";
import {BaseController} from "./base";
import {GameEventRepo} from "../repositories/game_event";

@Controller("/api/gameEvent")
export class GameEventController extends BaseController {
	private gameEventRepo: GameEventRepo;

	public constructor() {
		super();
		this.gameEventRepo = new GameEventRepo();
	}

	@Get()
	public async CreateGameEvent(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			this.gameEventRepo.createGameEvent(data);
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
