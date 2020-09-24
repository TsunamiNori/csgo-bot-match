import {Body, Controller, Post, Req, Res,} from "routing-controllers";
import {BaseController} from "./base";
import {GameRepo} from "../repositories/gameRepo";

@Controller("/")
export class AuthController extends BaseController {
	private gameRepo: GameRepo;

	public constructor() {
		super();
		this.gameRepo = new GameRepo();
	}

	@Post()
	public async messageReceiver(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any): Promise<any> {
		try {
			this.gameRepo.processMessage(data);
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

	@Post("/demo")
	public async UploadDemo(
		@Body() data: any,
		@Req() req: any,
		@Res() res: any) {
		try {
			this.gameRepo.processMessage(data);
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
