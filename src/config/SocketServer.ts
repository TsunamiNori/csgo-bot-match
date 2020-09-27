import SocketIO from "socket.io";
import dgram from "dgram";
import {AddressInfo} from "net";
import {MsgEvent} from "../common/constants";
import {Logger} from "../common/logger";
import winston from "winston";
import {MessageProcessor} from "../socket/processor";
import {Server} from "http";

export class SocketServer {
	public static io: SocketIO.Server;
	public static udpServer: dgram.Socket;
	public static logger: winston.Logger;
	private readonly socketPort: number;
	private readonly socketAddress: string;

	constructor(httpServer: Server, appPort: number) {
		SocketServer.logger = (new Logger("green")).create();
		SocketServer.io = SocketIO(httpServer);
		this.socketPort = appPort;
		this.socketAddress = "0.0.0.0"; // 0.0.0.0 means all interface
		this.socketWorker();
	}
	private socketWorker(): void {
		SocketServer.io.on(MsgEvent.CONNECT, (socket: any) => {
			SocketServer.logger.info(`Client connected`);

			socket.on("identify", (data: any) => {
				console.info(data);
			});
			socket.on(MsgEvent.DISCONNECT, () => {
				SocketServer.logger.info("Client disconnected");
			});
		});
	}
}
