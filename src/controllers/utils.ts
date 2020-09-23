import {Controller, Get, Res} from "routing-controllers";
import {BaseController} from "./base";

@Controller()
export class UtilsController extends BaseController {
	@Get("/ping")
	public async Ping(
		@Res() res: any): Promise<any> {
		return this.OkNoData(res);
	}
}
