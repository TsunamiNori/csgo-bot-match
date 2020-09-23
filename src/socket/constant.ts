
export enum MsgEvent {
	CONNECT = "connect",
	DISCONNECT = "disconnect",
	MESSAGE = "message",
	IDENTITY = "identity",
	RCON = "rconSend",
	MATCHCMD = "matchCommand"
}

export interface Message {
	author: string;
	message: string;
}
