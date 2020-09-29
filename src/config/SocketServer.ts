import SocketIO, {Socket} from "socket.io";
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
		SocketServer.logger = (new Logger("red")).create();
		this.socketPort = appPort;
		this.socketAddress = process.env.HOST as string || "0.0.0.0"; // 0.0.0.0 means all interface
		SocketServer.io = SocketIO(httpServer);
		this.socketWorker();
	}

	private socketWorker(): void {
		SocketServer.io.on(MsgEvent.CONNECT, (socket: Socket) => {
			// SocketServer.logger.info(`Client connected ${socket.client.id}`);
			socket.on("test", (data: any) => {
				SocketServer.logger.info(`Test data received from ${socket.client.id}`);
			});
			socket.on(MsgEvent.DISCONNECT, () => {
				// SocketServer.logger.info(`Client disconnected ${socket.client.id}`);
			});
			setInterval(() => {
				// SocketServer.logger.info(`Processing to send test event to client`);
				socket.emit("test", {data: "test"});
			}, 5000);
		});
	}
}
