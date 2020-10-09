import {MessageProcessor, MessageProcessResult, RconRemoteAddress} from "../socket/processor";
import dgram from "dgram";
import winston from "winston";
import {Logger} from "../common/logger";
import SocketClient from "socket.io-client";
import Rcon from "../rcon";
import {Match} from "../models/mongo/match";
import {MatchState, MessageType} from "../common/constants";

class UDPWorker {
	private io: SocketIOClient.Socket | undefined;
	private readonly socketAddress: string;
	private readonly socketPort: number;
	private readonly udpServer: dgram.Socket;
	private readonly address: string;
	private readonly port: number;
	private readonly publicAddress: string;
	private successBindUDP = false;
	private successConnectSRCDS = false;
	private logger: winston.Logger;
	private busyStatus: boolean;
	private rcon: any;
	private currentMatchStatus: MatchState = MatchState.CREATED;
	private isPaused = false;
	private matchInfo: Match;
	private RCONLogProcessor: MessageProcessor;
	private delayStartSeconds = 5;
	private processingKnife = false;

	constructor(matchInfo: Match, address: string, port: number, socketAddress: string, socketPort: number) {
		this.logger = (new Logger("yellow")).create();
		this.udpServer = dgram.createSocket("udp4");
		this.address = address;
		this.port = port;
		this.publicAddress = process.env.PUBLIC_ADDRESS || "117.6.134.7";
		this.busyStatus = true;
		this.socketAddress = socketAddress;
		this.socketPort = socketPort;
		this.matchInfo = matchInfo;
		this.RCONLogProcessor = new MessageProcessor();
	}

	public isBusy(): boolean {
		return this.busyStatus;
	}

	public start(): void {
		this.currentMatchStatus = this.matchInfo.status;
		// this.logger.info(`UDP Server@${this.address}:${this.port} is connecting to http://${this.socketAddress}:${this.socketPort}`);
		this.io = SocketClient.connect(`http://${this.socketAddress}:${this.socketPort}`, {
			secure: false,
			reconnection: true,
		});
		this.io.on("connection", (socket: any) => {
			this.registerSocketEvent();
			socket.join(this.matchInfo._id.toString());
		});

		const udpSvr = this.udpServer;
		udpSvr.on("listening", () => {
			this.successBindUDP = true;
		});
		udpSvr.on("message", (msg, remote) => {
			this.processMatchMessage(this.RCONLogProcessor, msg, remote);
		});

		// Working RCON
		this.rcon = new Rcon(
			{
				address: `${this.matchInfo.ip}:${this.matchInfo.port}`,
				password: this.matchInfo.rcon_password
			}
		);
		this.logger.info(`Connecting to CSGO Server: ${this.matchInfo.ip}:${this.matchInfo.port}`);
		this.rcon.connect().then(() => {
			try {
				this.udpServer.bind({
					address: this.address,
					port: this.port,
					exclusive: true,
				});
				this.successConnectSRCDS = true;
				// this.rcon.command(`status`).then((status: any) => console.log(`got status ${status}`)).catch((err: Error) => this.logger.error(err));

				this.rcon.command("echo vBOT").then(() => {
					this.rcon.command(`logaddress_del ${this.publicAddress}:${this.port}`).then().catch((err: Error) => this.logger.error(err));
					this.rcon.command(`logaddress_add ${this.publicAddress}:${this.port}`).then().catch((err: Error) => this.logger.error(err));
					// Starting up server for match
					this.initMatch();
				}).catch((err: Error) => {
					this.logger.error(`Rcon first init failed`);
					this.logger.error(err);
				});
			} catch (e) {
				this.logger.error(e);
			}
		}).catch((err: Error) => {
			this.logger.error(`Failed to connect to CSGO Server. ${err}`);
			process.exit();
		});
	}

	registerSocketEvent() {
		if (typeof this.io !== "undefined") {
			this.io.on("test", (message: any) => {
				// this.rcon.command("echo vBOT").then((data: any) => {
				// 	// this.logger.info(`-- ${typeof data === "string" ? data : JSON.stringify(data)} --`);
				// }).catch((error: Error) => {
				// 	this.logger.info(`RCON Command failed: ${error.message}`);
				// 	this.logger.info(error);
				// });
			});
		}
	}

	initMatch() {
		if (!this.successConnectSRCDS) {
			return;
		}
		switch (this.currentMatchStatus) {
			case MatchState.CANCELLED:
				this.rcon.command(`mp_restartgame 1`);
				break;
			case MatchState.CREATED:
				this.logger.info(`Initializing match ${this.matchInfo._id.toString()}...`);
				this.rcon.command(`changelevel ${this.matchInfo.configs.map}`).then().catch((err: Error) => console.log(126, err));
				this.currentMatchStatus = MatchState.WAITING_START;
				break;
			case MatchState.END_KNIFE:
				break;
			case MatchState.FINISHED:
				break;
			case MatchState.FIRST_SIDE:
				break;
			case MatchState.KNIFE:
				break;
			case MatchState.OT_FIRST_SIDE:
				break;
			case MatchState.OT_SECOND_SIDE:
				break;
			case MatchState.PAUSED:
				break;
			case MatchState.PLAYING:
				break;
			case MatchState.SECOND_SIDE:
				break;
			case MatchState.STARTING:
				break;
			case MatchState.WAITING_START:
				// Check if map is loaded
				// Processing to warmup state
				this.rcon.command(`mp_warmuptime 3600; mp_warmup_pausetimer 1; mp_maxmoney 60000; mp_startmoney 60000; mp_free_armor 1; mp_warmup_start`);
				this.currentMatchStatus = MatchState.WARMUP;
				break;
			case MatchState.WARMUP:
				break;
			default:

		}
	}

	processMatchMessage(processor: MessageProcessor, message: any, remote: RconRemoteAddress) {
		processor.process(message, remote).then((result: MessageProcessResult | null) => {
			if (result === null) {
				return;
			}
			// if (result.type !== MessageType.UNKNOWN) {
			// 	console.log(161, result);
			// }
			switch (this.currentMatchStatus) {
				case MatchState.CANCELLED:
					break;
				case MatchState.CREATED:
					break;
				case MatchState.END_KNIFE:
					break;
				case MatchState.FINISHED:
					break;
				case MatchState.FIRST_SIDE:
					break;
				case MatchState.KNIFE:
					// Start knife round
					if (result.type === MessageType.ROUND_END) {
						this.logger.info("KNIFE ROUND ENDED!!! Waiting for side choose");
						this.pauseMatch();
					}
					if (result.type === MessageType.ROUND_SCORED) {
						this.logger.info("KNIFE ROUND SCORED!!! ");
						this.pauseMatch();
					}
					if (result.type === MessageType.TEAM_SCORED) {
						if (result.data.score === "1") {
							this.logger.info(`Team ${result.data.team} won the knife round!`);
							this.matchInfo.team_1.score = result.data.score;
						}
					}
					break;
				case MatchState.OT_FIRST_SIDE:
					break;
				case MatchState.OT_SECOND_SIDE:
					break;
				case MatchState.PAUSED:
					break;
				case MatchState.PLAYING:
					break;
				case MatchState.SECOND_SIDE:
					break;
				case MatchState.STARTING:
					if (result.type === MessageType.MAP_CHANGING) {
						this.logger.info(`Changing map to ${this.matchInfo.configs.map} for ${this.matchInfo._id.toString()}...`);
					}
					break;
				case MatchState.WAITING_START:
					if (result.type === MessageType.MAP_CHANGED) {
						this.logger.info(`Loaded ${this.matchInfo.configs.map} for ${this.matchInfo._id.toString()}...`);
						this.logger.info(`Starting Warm-Up for ${this.matchInfo._id.toString()}...`);

						this.commandStartWarmup();
						this.currentMatchStatus = MatchState.WARMUP;
					}
					break;
				case MatchState.WARMUP:
					// Check if all players are ready, then we process to knife round or not
					if (this.matchInfo.configs.knife && !this.processingKnife) {
						this.commandEndWarmup();
						this.processingKnife = true;
						const counter = setInterval(() => {
							this.delayStartSeconds += -1;
							if (this.delayStartSeconds <= 0) {
								clearInterval(counter);
								this.rcon.command("mp_halftime_duration 1; mp_roundtime 60; mp_roundtime_defuse 60; mp_roundtime_hostage 60; mp_ct_default_secondary ''; mp_t_default_secondary ''; mp_free_armor 1; mp_give_player_c4 0; mp_maxmoney 0; bot_quota 10;")
									.then(() => {
										this.rcon.command(" mp_warmup_end");
									});
								this.currentMatchStatus = MatchState.KNIFE;
								this.logger.info(`Knife round started for ${this.matchInfo._id.toString()}`);
								return;
							}
							this.rcon.command("say KNIFE ON " + this.delayStartSeconds + "!;  mp_restartgame 1; mp_warmup_end;");
						}, 1000);
					}
					break;
				default:
			}
		});
	}

	commandEndWarmup() {
		return this.rcon.command("mp_warmuptime 30; mp_warmup_pausetimer 0; mp_maxmoney 16000; mp_startmoney 0; mp_free_armor 0; mp_warmup_end; mp_restartgame 1;");
	}

	commandStartWarmup() {
		return this.rcon.command(`mp_backup_round_file vb_${this.matchInfo._id.toString()}_ ; mp_warmuptime 3600; mp_warmup_pausetimer 1; mp_maxmoney 60000; mp_startmoney 60000; mp_free_armor 1; mp_warmup_start;`);
	}

	startMatch() {
		// Command and config for start match
	}

	stopMatch() {
		// Command and config for stop match
	}

	pauseMatch() {
		if (!this.isPaused) {
			this.isPaused = true;
			return this.rcon.command("mp_pause_match");
		}
	}

	unpauseMatch() {
		if (this.isPaused) {
			this.isPaused = false;
			return this.rcon.command("mp_unpause_match");
		}
	}
}

export default UDPWorker;
