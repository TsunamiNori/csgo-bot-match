import SocketIO from "socket.io";
import dgram from "dgram";
import {AddressInfo} from "net";
import {MsgEvent} from "../common/constants";
import {Logger} from "../common/logger";
import winston from "winston";
import {MessageProcessor} from "../socket/processor";

export class SocketServer {
	public static io: SocketIO.Server;
	public static udpServer: dgram.Socket;
	public static logger: winston.Logger;
	private readonly socketPort: number;
	private socketAddress: string;

	constructor(httpServer: any) {
		SocketServer.logger = (new Logger(`Socket Server`, "green")).log;
		SocketServer.io = SocketIO(httpServer);
		SocketServer.udpServer = dgram.createSocket("udp4");
		this.socketPort = 12600;
		this.socketAddress = "0.0.0.0"; // 0.0.0.0 means all interface
		this.socketWorker();
		this.udpWorker();
	}

	private udpWorker(): void {
		const udpSvr = SocketServer.udpServer;
		const ioServer = SocketServer.io;
		udpSvr.on("listening", () => {
			const address: AddressInfo = udpSvr.address() as AddressInfo;
			SocketServer.logger.info("UDP Server listening on " + address.address + ":" + address.port);
		});

		udpSvr.on("message", (new MessageProcessor()).process);

		SocketServer.udpServer.bind({
			address: this.socketAddress,
			port: this.socketPort,
			exclusive: true,
		});
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
