export interface Attacker {
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
