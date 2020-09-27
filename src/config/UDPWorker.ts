import {AddressInfo} from "net";
import {MessageProcessor} from "../socket/processor";
import dgram from "dgram";
import winston from "winston";
import {Logger} from "../common/logger";

class UDPWorker {
	private readonly udpServer = dgram.createSocket("udp4");
	private readonly address: string;
	private readonly port: number;
	private logger: winston.Logger;

	constructor(matchId: string, address: string, port: number) {
		this.logger = (new Logger("yellow")).create();
		this.udpServer = dgram.createSocket("udp4");
		this.address = address;
		this.port = port;
	}

	private udpWorker(): void {
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
	}

}

export default UDPWorker;
