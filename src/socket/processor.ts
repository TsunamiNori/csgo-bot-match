import {MessageTypeRegex} from "../common/constants";
import winston from "winston";
import {Logger} from "../common/logger";

const MAGIC = {
	header: Buffer.alloc(4, 255),
	bytePassword: 0x53,
	byteNoPassword: 0x52,
	strHeaderEnd: "L "
};

interface RconRemoteAddress {
	address: string;
	family: string;
	port: number;
	size: number;
}

export class MessageProcessor {
	public static logger: winston.Logger = (new Logger("yellow")).create();
	private processor: ProcessMessage;

	constructor() {
		this.processor = new ProcessMessage();
	}

	public static messageToType(message: string) {
		const msgType = Object.keys(MessageTypeRegex).filter(x => {
			const regexStr = MessageTypeRegex[x as keyof typeof MessageTypeRegex];
			const regex = new RegExp(regexStr);
			const testResult = regex.test(message);
			return testResult;
		});
		if (msgType.length === 0) {
			MessageProcessor.logger.info(`Unknown message type to process ${message}`);
			return;
		}
		// MessageProcessor.logger.info(`[${msgType}]: ${message}`);
		return msgType[0];
	}

	public process(message: any, remote: RconRemoteAddress) {
		try {
			const start = message.indexOf(MAGIC.strHeaderEnd);

			if (start < 0) {
				return undefined;
			}
			const processedMsg = message.slice(start + MAGIC.strHeaderEnd.length, message.length - 2).toString();
			const msgType = MessageProcessor.messageToType(processedMsg);
			switch (msgType) {
				case MessageTypeRegex.ATTACKED:
					break;
				case MessageTypeRegex.ROUND_SCORED:
					this.processor.roundScore(message);
					break;
				default:
					return;
			}
		} catch (e) {
			console.log(e);
		}
	}

}

class ProcessMessage {
	public roundScore(message: string) {

	}
}
