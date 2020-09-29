"use strict";
import {Logger} from "../../common/logger";
import winston from "winston";


export default class Matches {
	private static logger: winston.Logger;

	constructor() {
		Matches.logger = (new Logger("blue")).create();
	}

	public checkMatches() {
		Matches.logger.info("Checking matches");
		setTimeout(() => {
			this.checkMatches();
		}, 3000);
	}
}
