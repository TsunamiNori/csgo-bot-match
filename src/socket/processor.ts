import {GameCommand, MessageType, MessageTypeRegex} from "../common/constants";
import winston from "winston";
import {Logger} from "../common/logger";

const MAGIC = {
	header: Buffer.alloc(4, 255),
	bytePassword: 0x53,
	byteNoPassword: 0x52,
	strHeaderEnd: "L "
};

export interface RconRemoteAddress {
	address: string;
	family: string;
	port: number;
	size: number;
}

export interface MessageProcessResult {
	type: string;
	data: any;
	isCommand: boolean;
	command: string;
}

export class MessageProcessor {
	public static logger: winston.Logger = (new Logger("redBright")).create();
	private processor: ProcessMessage;
	private readonly ignoreMessage = [
		"server_cvar",
		"\"sv_",
		"\"cl_",
		"\"r_",
		"-----------------------------------------",
		"Unknown command"
	];

	constructor() {
		console.log(`Processor pwned`);
		this.processor = new ProcessMessage();
	}


	public static async messageToType(message: string): Promise<MessageProcessResult> {
		let data: MessageProcessResult = {
			type: MessageType.UNKNOWN,
			data: {},
			isCommand: false,
			command: "",
		};
		data = await (new Promise((resolve, reject) => {
			const listType = Object.keys(MessageTypeRegex);
			for (const type of listType) {
				const regexStr = MessageTypeRegex[type as keyof typeof MessageTypeRegex];
				const regex = new RegExp(regexStr);
				const testResult = regex.exec(message);
				if (testResult !== null && testResult.length > 0) {
					try {
						data.type = type;
						data.data = testResult.groups ?? null;
						if (type === MessageType.SAY && testResult.groups) {
							if (typeof testResult.groups.text === "string"
								&& testResult.groups.text.length > 0
								&& (testResult.groups.text.startsWith("!", 0) || testResult.groups.text.startsWith(".", 0))) {
								const command = testResult.groups.text.replace("!", "").replace(".", "");
								for (const commandName of Object.keys(GameCommand)) {
									if (command.toLowerCase() === commandName.toLowerCase()) {
										data.isCommand = true;
										data.command = command.toString();
									}
								}
							}
						}
					} catch (err) {
						console.log(58, `Failed to assign regex groups. ${err.message}`);
					}
					resolve(data);
					break;
				}
			}
		}));
		return data;
	}

	public async process(message: any, remote: RconRemoteAddress): Promise<MessageProcessResult | null> {
		try {
			const start = message.indexOf(MAGIC.strHeaderEnd);

			if (start < 0) {
				return null;
			}
			const processedMsg = message.slice(start + MAGIC.strHeaderEnd.length, message.length - 2).toString("utf-8");

			if (new RegExp(this.ignoreMessage.join("|")).test(message)) {
				return null;
			}
			return await MessageProcessor.messageToType(processedMsg);
		} catch (e) {
			console.log(e);
			return null;
		}
	}

}

class ProcessMessage {
	public roundScore(message: string) {

	}
}
