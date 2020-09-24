export const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";
export const SALT_SECRET = parseInt(process.env.SALT_SECRET as string, 0) || 10;

export enum MsgEvent {
	CONNECT = "connect",
	DISCONNECT = "disconnect",
	MESSAGE = "message",
	IDENTITY = "identity",
	RCON = "rconSend",
	MATCHCMD = "matchCommand"
}
