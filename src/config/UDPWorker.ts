import {AddressInfo} from "net";
import {MessageProcessor} from "../socket/processor";
import dgram from "dgram";
import winston from "winston";
import {Logger} from "../common/logger";
import SocketClient from "socket.io-client";
import Rcon from "../rcon";

class UDPWorker {
	private readonly io: SocketIOClient.Socket;
	private readonly udpServer = dgram.createSocket("udp4");
	private readonly address: string;
	private readonly port: number;
	private logger: winston.Logger;
	private busyStatus: boolean;
	private rcon: any;

	constructor(matchId: string, address: string, port: number, socketAddress: string, socketPort: number) {
		this.logger = (new Logger("yellow")).create();
		this.udpServer = dgram.createSocket("udp4");
		this.address = address;
		this.port = port;
		this.io = SocketClient.connect(`http://${socketAddress}:${socketPort}`, {
			secure: false,
			reconnection: true,
		});
		this.busyStatus = true;

	}

	public isBusy(): boolean {
		return this.busyStatus;
	}

	public start(rconAddress: string, rconPassword: string): void {
		const udpSvr = this.udpServer;
		udpSvr.on("listening", () => {
			const address: AddressInfo = udpSvr.address() as AddressInfo;
			this.logger.info("UDP Server listening on " + address.address + ":" + address.port);
		});

		udpSvr.on("message", (new MessageProcessor()).process);

		this.udpServer.bind({
			address: this.address,
			port: this.port,
			exclusive: true,
		});

		// Connecting to RCON

		// Working RCON
		this.rcon = new Rcon(
			{
				address: rconAddress,
				password: rconPassword
			}
		);
		this.rcon.connect().then(() => {
			this.rcon.command("echo vBOT");
		}).catch((err: Error) => {
			this.logger.error(`Failed to connect to CSGO Server. ${err.message}`);
		});
		this.io.on("test", (message: any) => {
			this.rcon.command("echo vBOT");
			this.rcon.command("logaddress_add ");
		});
	}

}

export default UDPWorker;
