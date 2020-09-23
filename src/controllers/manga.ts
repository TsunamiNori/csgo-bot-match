import {Controller} from "routing-controllers";
import {AuthRepo} from "../repositories/oauth";
import {BaseController} from "./base";

@Controller("/api/manga")
export class MangaController extends BaseController {
	private authRepo: AuthRepo;

	public constructor() {
		super();
		this.authRepo = new AuthRepo();
	}
}
