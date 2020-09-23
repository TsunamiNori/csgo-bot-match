import {Controller} from "routing-controllers";
import {AuthRepo} from "../repositories/oauth";
import {BaseController} from "./base";

@Controller("/api/novel")
export class NovelController extends BaseController {
	private authRepo: AuthRepo;

	public constructor() {
		super();
		this.authRepo = new AuthRepo();
	}
}
