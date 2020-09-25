import {MessageTypeRegex} from "../common/constants";

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
			const msgType = this.messageToType(processedMsg);
		} catch (e) {
			console.log(e);
		}
	}

	private messageToType(message: string) {
		Object.keys(MessageTypeRegex).map(x => console.info(x));
		return message;
	}
}
