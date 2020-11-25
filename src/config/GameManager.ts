import {MessageProcessor, MessageProcessResult, RconRemoteAddress} from "../socket/processor";
import dgram from "dgram";
import winston from "winston";
import {Logger} from "../common/logger";
import SocketClient from "socket.io-client";
import Rcon from "../rcon";
import {Match} from "../models/mongo/match";
import {GameCommand, MatchState, MessageType} from "../common/constants";

export interface GameState {
	knifeFinished: boolean;
	knifeWinner: string;
	knifeDecide: string;
	ct: any;
	t: any;
}

class GameManager {
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
	private delayStartSeconds = 3;
	private OTNum = 0;
	private processingKnife = false;
	private pauseNext = false;
	private teamSwitching = false;
	private reconnectCount = 0;
	private botName = "Gambit";
	private gameState: GameState = {
		knifeFinished: false,
		knifeWinner: "",
		knifeDecide: "",
		ct: {
			totalReady: 0,
			needPause: false,
			confirmUnpause: false,
			pauseCount: 0,
		},
		t: {
			totalReady: 0,
			needPause: false,
			confirmUnpause: false,
			pauseCount: 0,
		},
	};

	constructor(matchInfo: Match, address: string, port: number, socketAddress: string, socketPort: number) {
		this.logger = (new Logger("yellow")).create();
		this.udpServer = dgram.createSocket("udp4");
		this.address = address;
		this.port = port;
		this.publicAddress = process.env.PUBLIC_ADDRESS || "127.0.0.1";
		this.busyStatus = true;
		this.socketAddress = socketAddress;
		this.socketPort = socketPort;
		this.matchInfo = matchInfo;
		this.RCONLogProcessor = new MessageProcessor();
		this.reconnectCount = 0;
		this.OTNum = 0;
		this.botName = process.env.BOT_NAME || "Gambit";
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
				address: `${this.matchInfo.configs.server.ip}:${this.matchInfo.configs.server.port}`,
				password: this.matchInfo.configs.server.rcon_password
			}
		);
		this.logger.info(`Connecting to CSGO Server: ${this.matchInfo.configs.server.ip}:${this.matchInfo.configs.server.port}`);
		this.rcon.connect().then(() => {
			try {
				this.udpServer.bind({
					address: this.address,
					port: this.port,
					exclusive: true,
				});
				this.successConnectSRCDS = true;
				// this.rcon.command(`status`).then((status: any) => console.log(`got status ${status}`)).catch((err: Error) => this.logger.error(err));

				this.rcon.command(`echo ${this.botName}`).then(() => {
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
				// this.rcon.command(`echo ${this.botName).then((data: any) => {
				// 	// this.logger.info(`-- ${typeof data === "string" ? data : JSON.stringify(data)} --`);
				// }).catch((error: Error) => {
				// 	this.logger.info(`RCON Command failed: ${error.message}`);
				// 	this.logger.info(error);
				// });
			});
			this.io.on("startMatch", () => {
				this.startMatch();
			});
			this.io.on("stopMatch", () => {
				this.stopMatch();
			});
			this.io.on("pauseMatch", () => {
				this.pauseMatch();
			});
			this.io.on("unpauseMatch", () => {
				this.unpauseMatch();
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
				this.initStartMatch();
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
				this.rcon.command(`mp_teamname_1 ${this.matchInfo.team_1.name}; mp_teamname_2 ${this.matchInfo.team_2.name}; mp_teamflag_1 ${this.matchInfo.team_1.flag}; mp_teamflag_2 ${this.matchInfo.team_2.flag}`)
					.then(() => {
						// console.log(167, `Team name and flag set up`);
						this.logger.info(`Team name and flag set up`);
					});
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

			this.processCommand(result);

			let team1Score = 0;
			let team2Score = 0;
			let otRounds = 0;
			switch (this.currentMatchStatus) {
				case MatchState.CANCELLED:
					break;
				case MatchState.CREATED:
					this.logger.info(`Match created! Processing to warm up ....`);
					this.currentMatchStatus = MatchState.WAITING_START;
					break;
				case MatchState.KNIFE:
					// Start knife round
					if (result.type === MessageType.ROUND_END) {
						this.logger.info("KNIFE ROUND ENDED!!! Waiting for side choose");
						this.pauseMatch();
					}
					if (result.type === MessageType.ROUND_END_TRIGGERED) {
						this.logger.info("KNIFE ROUND SCORED!!! ");
						this.pauseMatch();
						this.gameState.knifeFinished = true;
						// TODO: Update to DB
					}
					if (result.type === MessageType.TEAM_SCORED) {
						if (result.data.score === "1") {
							this.gameState.knifeWinner = result.data.team;
						}
					}
					if (this.gameState.knifeFinished && this.gameState.knifeWinner.length > 0) {
						this.currentMatchStatus = MatchState.END_KNIFE;
					}
					break;
				case MatchState.END_KNIFE:
					if (this.gameState.knifeFinished) {
						if (this.gameState.knifeDecide === GameCommand.STAY) {
							this.rcon.command(`say TEAM ${result.data.team} wanna stay`);
						}
						if (this.gameState.knifeDecide === GameCommand.SWITCH) {
							this.teamSwitching = true;
							this.rcon.command(`say TEAM ${result.data.team} wanna switch`);
							this.rcon.command("mp_swapteams");
							const _tmp = this.matchInfo.team_1;
							this.matchInfo.team_1 = this.matchInfo.team_2;
							this.matchInfo.team_1 = _tmp;
						}

						this.rcon.command(`say Game commencing in 3 seconds; mp_unpause_match;`);
						this.delayStartSeconds = 3;
						const counter = setInterval(() => {
							this.delayStartSeconds += -1;
							if (this.delayStartSeconds === 0) {
								clearInterval(counter);
								this.startMatch();
								this.currentMatchStatus = MatchState.FIRST_SIDE;
								this.logger.info(`First Side started for ${this.matchInfo._id.toString()}`);
								return;
							}
							this.rcon.command("say LIVE ON " + this.delayStartSeconds + "!;  mp_restartgame 1; mp_warmup_end;");
						}, 1000);
					}
					break;
				case MatchState.FINISHED:
					this.logger.info(`Match finished! Finishing update result to database...`);
					// TODO: Update to DB
					break;
				case MatchState.MATCH_PAUSED:
					// TODO: Update to DB
					break;
				case MatchState.FIRST_SIDE:
					this.matchInfo.status = MatchState.FIRST_SIDE;
					if (result.type === MessageType.MATCH_PAUSED) {
						this.logger.info(`Match paused!`);
					}
					if (result.type === MessageType.MATCH_UNPAUSED) {
						this.logger.info(`Match unpaused`);
					}
					if (result.type === MessageType.ROUND_END_TRIGGERED) {
						team1Score = parseInt(result.data.team_one_score, 0);
						team2Score = parseInt(result.data.team_two_score, 0);
						this.logger.info(`Team ${result.data.team === "CT" ? this.matchInfo.team_1.name : this.matchInfo.team_2.name} won the round. First-Half Score (${this.matchInfo.team_1.name}) ${team1Score} - ${team2Score} (${this.matchInfo.team_2.name})`);
						this.matchInfo.team_1.score = team1Score;
						this.matchInfo.team_2.score = team2Score;

						// TODO: Update to DB

						if (team1Score + team2Score === 15) {
							// Switch side
							this.matchInfo.status = MatchState.SECOND_SIDE;
							this.currentMatchStatus = MatchState.SECOND_SIDE;
						}
						if (this.pauseNext) {
							this.pauseMatch();
						}
					}
					break;
				case MatchState.SECOND_SIDE:
					this.matchInfo.status = MatchState.SECOND_SIDE;
					if (result.type === MessageType.MATCH_PAUSED) {
						this.logger.info(`Match paused!`);
					}
					if (result.type === MessageType.MATCH_UNPAUSED) {
						this.logger.info(`Match unpaused`);
					}
					if (result.type === MessageType.ROUND_END_TRIGGERED) {
						team1Score = parseInt(result.data.team_one_score, 0);
						team2Score = parseInt(result.data.team_two_score, 0);
						this.logger.info(`Team ${result.data.team === "CT" ? this.matchInfo.team_1.name : this.matchInfo.team_2.name} won the round. Second-Half Score (${this.matchInfo.team_1.name}) ${team1Score} - ${team2Score} (${this.matchInfo.team_2.name})`);
						this.matchInfo.team_1.score = team1Score;
						this.matchInfo.team_2.score = team2Score;

						// TODO: Update to DB

						if (team1Score + team2Score === 30) {
							if (team1Score === team2Score) {
								this.matchInfo.status = MatchState.OT_FIRST_SIDE;
								this.currentMatchStatus = MatchState.OT_FIRST_SIDE;
								this.OTNum = 1;
							} else {
								this.matchInfo.status = MatchState.FINISHED;
								this.currentMatchStatus = MatchState.FINISHED;
							}
						}
						if (this.pauseNext) {
							this.pauseMatch();
						}
					}
					if (result.type === MessageType.MATCH_ENDED) {
						this.logger.info(`Final Game Score (${result.data.map_name}) [${this.matchInfo.team_1.name}] ${result.data.score_1} - ${result.data.score_2} [${this.matchInfo.team_2.name}] after ${result.data.match_time}`);
					}
					break;
				case MatchState.OT_FIRST_SIDE:
					this.matchInfo.status = MatchState.OT_FIRST_SIDE;
					if (result.type === MessageType.ROUND_END_TRIGGERED) {
						team1Score = parseInt(result.data.team_one_score, 0);
						team2Score = parseInt(result.data.team_two_score, 0);
						otRounds = (team2Score + team1Score) - 30;
						this.logger.info(`Team ${result.data.team} won the round. OT(${this.OTNum}) First-Half Score (${result.data.team_one}) ${result.data.team_one_score} - ${result.data.team_two_score} (${result.data.team_two})`);
						this.matchInfo.team_1.score = team1Score;
						this.matchInfo.team_2.score = team2Score;

						// TODO: Update to DB

						if (otRounds % this.matchInfo.configs.ot_max_round === Math.floor(this.matchInfo.configs.ot_max_round / 2)) {
							this.matchInfo.status = MatchState.OT_SECOND_SIDE;
							this.currentMatchStatus = MatchState.OT_SECOND_SIDE;
						}
					}
					break;
				case MatchState.OT_SECOND_SIDE:
					if (result.type === MessageType.ROUND_END_TRIGGERED) {
						team1Score = parseInt(result.data.team_one_score, 0);
						team2Score = parseInt(result.data.team_two_score, 0);
						otRounds = (team2Score + team1Score) - 30;
						this.logger.info(`Team ${result.data.team} won the round. OT(${this.OTNum}) Second-Half Score (${result.data.team_one}) ${result.data.team_one_score} - ${result.data.team_two_score} (${result.data.team_two})`);
						this.matchInfo.team_1.score = team1Score;
						this.matchInfo.team_2.score = team2Score;

						// TODO: Update to DB
						if (otRounds % this.matchInfo.configs.ot_max_round === 0) {
							this.matchInfo.status = MatchState.OT_FIRST_SIDE;
							this.currentMatchStatus = MatchState.OT_FIRST_SIDE;
							this.OTNum++;
						}
					}
					break;
				case MatchState.PAUSED:
					break;
				case MatchState.PLAYING:
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

					if (this.matchInfo.configs.knife && this.processingKnife) {
						setTimeout(() => {
							this.commandEndWarmup();
							this.processingKnife = false;
							const counter = setInterval(() => {
								this.say(`KNIFE ON ${this.delayStartSeconds}!`);
								this.rcon.command(`mp_restartgame 1; mp_warmup_end;`);
								this.delayStartSeconds += -1;
								if (this.delayStartSeconds <= 0) {
									clearInterval(counter);
									this.startKnife();
									this.currentMatchStatus = MatchState.KNIFE;
									this.logger.info(`Knife round started for ${this.matchInfo._id.toString()}`);
									return;
								}
							}, 1000);
						}, 3000);
					}
					break;
				default:
			}
		});
	}

	processCommand(message: any) {
		if (!message.isCommand) {
			return;
		}
		const team = message.data.user_team;
		const userSteamId = message.data.steam_id;
		// Check if all players are ready, then we process to knife round or not
		if (message.command === GameCommand.READY) {
			if (team === "CT") {
				if (this.gameState.ct[userSteamId]) {

				} else {
					this.gameState.ct[userSteamId] = true;
					this.gameState.ct.totalReady++;
				}
			} else if (team === "TERRORIST") {
				if (this.gameState.t[userSteamId]) {

				} else {
					this.gameState.t[userSteamId] = true;
					this.gameState.t.totalReady++;
				}
			}
			if (this.gameState.t.totalReady + this.gameState.ct.totalReady === 1) {
				this.processingKnife = true;
				this.say(`Both teams are ready now, processing to knife round... "`);
			} else {
				this.say(`Player ${message.data.user_name} is ready! Only ${10 - (this.gameState.t.totalReady + this.gameState.ct.totalReady)} remaning players "`);
			}

		}

		if (message.command === GameCommand.UNREADY) {
			if (team === "CT") {
				if (this.gameState.ct[userSteamId]) {
					this.gameState.ct[userSteamId] = false;
					this.gameState.ct.totalReady--;
				} else {
				}
			} else if (team === "T") {
				if (this.gameState.t[userSteamId]) {
					this.gameState.t[userSteamId] = false;
					this.gameState.t.totalReady--;
				} else {
				}
			}
			if (this.gameState.t.totalReady + this.gameState.ct.totalReady === 10) {
				this.processingKnife = true;
			}
		}
		if (message.command === GameCommand.PAUSE) {
			this.pauseNext = true;
			if (team === "CT") {
				this.gameState.ct.needPause = true;
				this.gameState.ct.confirmUnpause = false;
				this.gameState.ct.pauseCount++;
			} else if (team === "T") {
				this.gameState.t.needPause = true;
				this.gameState.t.confirmUnpause = false;
				this.gameState.t.pauseCount++;
			}
		}
		if (message.command === GameCommand.UNPAUSE) {
			this.say(`Team ${team === "CT" ? this.matchInfo.team_1.name : this.matchInfo.team_2.name} want to continue the match! Please say !unpause to confirm ..."`).then();
			if (team === "CT" && !this.gameState.ct.confirmUnpause) {
				this.gameState.ct.confirmUnpause = true;
			} else if (team === "T") {
				this.gameState.t.confirmUnpause = true;
			}

			if (this.isPaused && this.gameState.ct.confirmUnpause && this.gameState.t.confirmUnpause) {
				this.unpauseMatch();
			}
		}
		if (message.command === GameCommand.STAY || message.command === GameCommand.SWITCH) {
			this.gameState.knifeDecide = message.command;
		}
	}

	processRecordMatch() {
		const recordName = `${this.matchInfo.team_1.name}_${this.matchInfo.team_2.name}_${this.matchInfo.configs.map[0]}`;
		// Force stop recording current
		this.rcon.command(`tv_autorecord 0; tv_stoprecord; tv_record ${recordName}`);

	}

	startKnife() {
		this.rcon.command("mp_halftime_duration 1; mp_roundtime 60; mp_roundtime_defuse 60; mp_roundtime_hostage 60; mp_ct_default_secondary ''; mp_t_default_secondary ''; mp_free_armor 1; mp_give_player_c4 0;mp_startmoney 800; mp_maxmoney 0;")
			.then(() => {
				this.rcon.command(" mp_warmup_end; mp_unpause_match;");
			});
	}

	commandEndWarmup() {
		return this.rcon.command("mp_warmuptime 30; mp_warmup_pausetimer 0; mp_maxmoney 16000; mp_startmoney 0; mp_free_armor 0; mp_warmup_end; mp_restartgame 1;");
	}

	commandStartWarmup() {
		this.rcon.command(`mp_teamname_1 ${this.matchInfo.team_1.name}; mp_teamname_2 ${this.matchInfo.team_2.name}; mp_teamflag_1 ${this.matchInfo.team_1.flag}; mp_teamflag_2 ${this.matchInfo.team_2.flag}`)
			.then(() => {
			});
		this.rcon.command(`mp_backup_round_file vb_${this.matchInfo._id.toString()}_ ; mp_warmuptime 3600; mp_warmup_pausetimer 1; mp_maxmoney 60000; mp_startmoney 60000; mp_free_armor 1; mp_warmup_start;`);
		if (this.matchInfo.configs.ot_enabled) {
			this.rcon.command(`mp_overtime_enable 1;mp_overtime_maxrounds ${this.matchInfo.configs.ot_max_round}; mp_overtime_startmoney ${this.matchInfo.configs.ot_money};`);
		} else {
			this.rcon.command(`mp_overtime_enable 0`);
		}
	}

	initStartMatch() {
		this.rcon.command(`changelevel ${this.matchInfo.configs.map}`).then().catch((err: Error) => console.log(126, err));
		this.currentMatchStatus = MatchState.STARTING;
	}

	startMatch() {
		// Command and config for start match
		this.rcon.command("mp_unpause_match; mp_halftime_duration 60; mp_roundtime 1.92; mp_roundtime_defuse 1.92; mp_roundtime_hostage 0; mp_ct_default_secondary \"weapon_hkp2000\"; mp_t_default_secondary \"weapon_glock\"; mp_free_armor 0; mp_give_player_c4 1; mp_startmoney 800; mp_maxmoney 16000;")
			.then(() => {
				this.rcon.command(" mp_warmup_end");
			});
	}

	stopMatch() {
		// Command and config for stop match
		this.rcon.command("mp_restartgame 1").then(() => {
			this.commandStartWarmup();
			this.currentMatchStatus = MatchState.CANCELLED;
		});
	}

	pauseMatch() {
		if (!this.isPaused) {
			this.isPaused = true;
			this.currentMatchStatus = MatchState.MATCH_PAUSED;
			return this.rcon.command("mp_pause_match;");
		}
	}

	unpauseMatch() {
		if (this.isPaused) {
			this.isPaused = false;
			this.currentMatchStatus = MatchState.MATCH_UNPAUSED;
			return this.rcon.command("mp_unpause_match;");
		}
	}

	resetMatch() {
		this.rcon.command("mp_restartgame 1;");
	}

	checkAlive() {
		this.rcon.command("echo vBot").then(() => {
			this.io?.emit("_live");
			setTimeout(this.checkAlive, 10000);
		}).catch(() => {
			this.logger.error("Failed to send command to CSGO Server. Match state will not be updated.");
			process.exit(0);
		});
	}

	say(message: string) {
		return this.rcon.command(`say ${message}`);
	}

	reconnectSRCDS() {
		this.reconnectCount++;
		this.rcon.connect().then(() => {
			try {
				this.successConnectSRCDS = true;
				// this.rcon.command(`status`).then((status: any) => console.log(`got status ${status}`)).catch((err: Error) => this.logger.error(err));

				this.rcon.command(`echo ${this.botName}`).then(() => {
					this.rcon.command(`logaddress_del ${this.publicAddress}:${this.port}`).then().catch((err: Error) => this.logger.error(err));
					this.rcon.command(`logaddress_add ${this.publicAddress}:${this.port}`).then().catch((err: Error) => this.logger.error(err));

					// Not init match here, need to do something else
				}).catch((err: Error) => {
					this.logger.error(`Rcon command failed`);
					this.logger.error(err);
				});
			} catch (e) {
				this.logger.error(e);
			}
		}).catch((err: Error) => {
			this.logger.error(`Failed to connect to CSGO Server. Trying to reconnect. ${err}`);
			if (this.reconnectCount === 5) {
				process.exit();
			}
			this.reconnectSRCDS();
		});
	}
}

export default GameManager;
