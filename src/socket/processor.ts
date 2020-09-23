import SocketIO from "socket.io";
import {SocketServer} from "../config/SocketServer";
import dgram from "dgram";
import {Logger} from "../common/logger";
import winston from "winston";

const MAGIC = {
	header: Buffer.alloc(4, 255),
	bytePassword: 0x53,
	byteNoPassword: 0x52,
	strHeaderEnd: "L "
};

export class MessageProcessor {
	constructor() {
	}

	public process(message: any, remote: any) {
		try {

			const start = message.indexOf(MAGIC.strHeaderEnd);

			if (start < 0) {
				return undefined;
			}
			const processedMsg = message.slice(start + MAGIC.strHeaderEnd.length, message.length - 2).toString();
			console.log(processedMsg);
			// Example:
			// 09/23/2020 - 23:33:59: "Don<5><BOT><TERRORIST>" left buyzone with [ weapon_knife_t weapon_glock weapon_galilar kevlar(100) helmet ]


			// const messageObject = JSON.parse(processedMsg);
			// const body = messageObject.data;
			// let data = {
			// 	id: 0,
			// 	message: ``
			// };
			// data = JSON.parse(body);
			// if (data.message === "ping") {
			// 	return;
			// }
		} catch (e) {
			console.log(e);
		}
	}
}
