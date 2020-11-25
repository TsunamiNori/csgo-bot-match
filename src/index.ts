"use strict";
// require("./debugger"); // Uncomment this line to enable debugger for eventListener warning
// reflect-metadata shim is required, requirement of routing-controllers module.
import "reflect-metadata";
import {Application} from "./config/Application";
import cluster from "cluster";
import {cpus} from "os";
import GameManager from "./config/GameManager";
import {Logger} from "./common/logger";
import {Match} from "./models/mongo/match";

const logger = (new Logger()).create();
const startMode = process.env.START_MODE || "both";

const workerMode = () => {
	// TODO
};

const clusterMode = () => {
	if (cluster.isMaster) {
		const app = new Application();
		app.start();
		require("./runner");
		// for (let i = 0, coreCount = (cpus().length / 2); i < 1; i++) {
		// 	cluster.fork();
		// }

		cluster.on("exit", (worker, code, signal) => {
			logger.warn(`Game Manager ID ${worker.process.pid} died`);
		});
	}

	if (cluster.isWorker) {
		const workerId = cluster.worker.id;
		if (typeof process.env.MATCH_DATA === "undefined" || (process.env.MATCH_DATA as string).length < 20) {
			logger.error(`Invalid match data, please double-check: ${process.env.MATCH_DATA}`);
			process.exit();
		}
		const matchInfo: Match = JSON.parse(process.env.MATCH_DATA as string);
		const host = process.env.HOST || "0.0.0.0";
		const socketHost = process.env.SOCKET_HOST || "127.0.0.1";
		const socketPort = parseInt(process.env.SOCKET_PORT || "3000", 0);
		const managerStartPort = parseInt(process.env.WORKER_START_PORT as string || "12600", 0) + workerId;
		const manager = new GameManager(matchInfo, host, managerStartPort, socketHost, socketPort);
		manager.start();
	}
};

switch (startMode) {
	case "server":
		const app = new Application();
		break;
	case "client":
		workerMode();
		break;
	default:
		clusterMode();
		break;
}

