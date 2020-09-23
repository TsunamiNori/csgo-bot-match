import SocketIO from "socket.io";
import dgram from "dgram";
import {AddressInfo} from "net";
import {Message, MsgEvent} from "../socket/constant";
import {Logger} from "../common/logger";
import winston from "winston";

export class SocketServer {
	public static io: SocketIO.Server;
	public static udpServer: dgram.Socket;
	private static logger: winston.Logger;

	constructor(httpServer: any) {
		SocketServer.logger = (new Logger(`Socket Server`, "green")).log;
		SocketServer.io = SocketIO(httpServer);
		SocketServer.udpServer = dgram.createSocket('udp4');
		SocketServer.udpServer.bind(12600, '0.0.0.0');
		this.socketWorker();
		this.udpWorker();
	}

	private udpWorker(): void {
		const udpSvr = SocketServer.udpServer;
		const ioServer = SocketServer.io;
		udpSvr.on('listening', function () {
			const address: AddressInfo = udpSvr.address() as AddressInfo;
			SocketServer.logger.info('UDP Server listening on ' + address.address + ":" + address.port);
		});

		udpSvr.on('message', function (message, remote) {
			let messageObject = JSON.parse(message.toString());
			let body = messageObject.data;
			let data = {
				id: 0,
				message: ``
			};
			try {
				data = JSON.parse(body);
				if (data.message == "ping") {
					return;
				}
			} catch (e) {

			}
			if (messageObject.scope == "alive") {
				ioServer.sockets.in('alive').emit('aliveHandler', {data: body});
				ioServer.sockets.in('relay').emit('relay', {channel: 'alive', 'method': 'aliveHandler', content: body});
			} else if (messageObject.scope == "rcon") {
				ioServer.sockets.in('rcon-' + data.id).emit('rconHandler', body);
			} else if (messageObject.scope == "logger") {
				ioServer.sockets.in('logger-' + data.id).emit('loggerHandler', body);
				ioServer.sockets.in('loggersGlobal').emit('loggerGlobalHandler', body);
			} else if (messageObject.scope == "match") {
				ioServer.sockets.in('matchs').emit('matchsHandler', body);
				ioServer.sockets.in('relay').emit('relay', {channel: 'matchs', 'method': 'matchsHandler', content: body});
			} else if (messageObject.scope == "livemap") {
				ioServer.sockets.in('livemap-' + data.id).emit('livemapHandler', body);
				ioServer.sockets.in('relay').emit('relay', {
					channel: 'livemap-' + data.id,
					'method': 'livemapHandler',
					content: body
				});
			}
		});
	}

	private socketWorker(): void {
		SocketServer.io.on(MsgEvent.CONNECT, (socket: any) => {
			SocketServer.logger.info(`Client connected`);

			socket.on(MsgEvent.DISCONNECT, () => {
				SocketServer.logger.info('Client disconnected');
			});
		});
	}
}
