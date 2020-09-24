import {BaseRepo} from "./baseRepo";
import {Server} from "socket.io";
import {SocketServer} from "../config/SocketServer";
import {Socket} from "dgram";

export class GameRepo extends BaseRepo {
	private socketServer: Server;
	private udpServer: Socket;

	constructor() {
		super();
		this.socketServer = SocketServer.io;
		this.udpServer = SocketServer.udpServer;
	}

	public processMessage(data: any) {
		if (data.message === "ping") {
			return;
		}
	}

	public uploadDemo(data: any) {

	}
}
