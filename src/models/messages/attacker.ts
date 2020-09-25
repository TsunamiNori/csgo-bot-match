import MessageType from "../message_type";

export interface Attacked {
	attackerName: string;
	attackerUserId: string;
	attackerSteamId: string;
	attackerTeam: string;
	attackerPosX: number;
	attackerPosY: number;
	attackerPosZ: number;
	attackerWeapon: string;
	attackerDamage: number;
	attackerDamageArmor: number;
	attackerHitGroup: string;
	victimName: string;
	victimUserId: string;
	victimSteamId: string;
	victimTeam: string;
	victimPosX: number;
	victimPosY: number;
	victimPosZ: number;
	victimHealth: number;
	victimArmor: number;
}

export class Attacked extends MessageType {
	constructor() {
		super();
		this.name = this.constructor.name;
		this.regex = /^"(?<attackerName>.*)[<](?<attackerUserId>\d+)[>][<](?<attackerSteamId>.*)[>][<](?<attackerTeam>CT|TERRORIST|Unassigned|Spectator)[>]" \[(?<attackerPosX>[\-]?[0-9]+) (?<attackerPosY>[\-]?[0-9]+) (?<attackerPosZ>[\-]?[0-9]+)\] attacked "(?<victimName>.*)[<](?<victimUserId>\d+)[>][<](?<victimSteamId>.*)[>][<](?<victimTeam>CT|TERRORIST|Unassigned|Spectator)[>]" \[(?<victimPosX>[\-]?[0-9]+) (?<victimPosY>[\-]?[0-9]+) (?<victimPosZ>[\-]?[0-9]+)\] with "(?<attackerWeapon>[a-zA-Z0-9_]+)" \(damage "(?<attackerDamage>[0-9]+)"\) \(damage_armor "(?<attackerDamageArmor>[0-9]+)"\) \(health "(?<victimHealth>[0-9]+)"\) \(armor "(?<victimArmor>[0-9]+)"\) \(hitgroup "(?<attackerHitGroup>.*)"\)/
	}
}
