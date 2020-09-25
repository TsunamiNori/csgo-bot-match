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

export enum MessageTypeRegex {
	ATTACKED = '^"(?<attackerName>.*)[<](?<attackerUserId>\d+)[>][<](?<attackerSteamId>.*)[>][<](?<attackerTeam>CT|TERRORIST|Unassigned|Spectator)[>]" \[(?<attackerPosX>[\-]?[0-9]+) (?<attackerPosY>[\-]?[0-9]+) (?<attackerPosZ>[\-]?[0-9]+)\] attacked "(?<victimName>.*)[<](?<victimUserId>\d+)[>][<](?<victimSteamId>.*)[>][<](?<victimTeam>CT|TERRORIST|Unassigned|Spectator)[>]" \[(?<victimPosX>[\-]?[0-9]+) (?<victimPosY>[\-]?[0-9]+) (?<victimPosZ>[\-]?[0-9]+)\] with "(?<attackerWeapon>[a-zA-Z0-9_]+)" \(damage "(?<attackerDamage>[0-9]+)"\) \(damage_armor "(?<attackerDamageArmor>[0-9]+)"\) \(health "(?<victimHealth>[0-9]+)"\) \(armor "(?<victimArmor>[0-9]+)"\) \(hitgroup "(?<attackerHitGroup>.*)"\)',
	BOMB_DEFUSING = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" triggered "(Begin_Bomb_Defuse_With_Kit|Begin_Bomb_Defuse_Without_Kit)"/',
	BOMB_PLANTING = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" triggered "Planted_The_Bomb"/',
	MAP_CHANGE = '/^(Started map|Loading map) "(?<maps>.*)"/',
	PLAYER_NAME_CHANGE = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" changed name to "(?<new_name>.*)"/',
	PLAYER_CONNECTED = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<][>]" connected, address "(?<address>.*)"/',
	PLAYER_DISCONNECTED = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" disconnected/',
	PLAYER_JOINED = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<][>]" entered the game/',
	PLAYER_GOT_BOMB = '/triggered \"Got\_The\_Bomb\"/',
	PLAYER_JOINED_TEAM = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" joined team "(?<join_team>CT|TERRORIST|Unassigned|Spectator)"/',
	KILL = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" \[(?<killer_x>[\-]?[0-9]+) (?<killer_y>[\-]?[0-9]+) (?<killer_z>[\-]?[0-9]+)\] killed "(?<killed_user_name>.+)[<](?<killed_user_id>\d+)[>][<](?<killed_steam_id>.*)[>][<](?<killed_user_team>CT|TERRORIST|Unassigned|Spectator)[>]" \[(?<killed_x>[\-]?[0-9]+) (?<killed_y>[\-]?[0-9]+) (?<killed_z>[\-]?[0-9]+)\] with "(?<weapon>[a-zA-Z0-9_]+)"(?<headshot>.*)/',
	KILL_ASSIST = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" assisted killing "(?<killed_user_name>.+)[<](?<killed_user_id>\d+)[>][<](?<killed_steam_id>.*)[>][<](?<killed_user_team>CT|TERRORIST|Unassigned|Spectator)[>]"/',
	PURCHASED = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" purchased "(?<object>.*)"/',
	ROUND_END = '/^World triggered "Round_End"/',
	ROUND_RESTART = '!World triggered "Restart_Round_\((\d+)_(second|seconds)\)"!',
	ROUND_SCORED = '/^Team "(?<team>.*)" triggered "SFUI_Notice_(?<team_win>Terrorists_Win|CTs_Win|Target_Bombed|Target_Saved|Bomb_Defused)/',
	ROUND_START = '/^World triggered "Round_Start"/',
	SAY = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" say "(?<text>.*)"/',
	SAY_TEAM = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" say_team "(?<text>.*)"/',
	TEAM_SWITCH = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>]" switched from team [<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>] to [<](?<new_team>CT|TERRORIST|Unassigned|Spectator)[>]/',
	TEAM_SCORED = '/^Team "(?<team>CT|TERRORIST)" scored "(?<score>\d+)" with "(?<players>\d+)" players/',
	THREW_ITEM = '/^"(?<user_name>.+)[<](?<user_id>\d+)[>][<](?<steam_id>.*)[>][<](?<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" threw (?<stuff>hegrenade|flashbang|smokegrenade|decoy|molotov) \[(?<pos_x>[\-]?[0-9]+) (?<pos_y>[\-]?[0-9]+) (?<pos_z>[\-]?[0-9]+)\]/',

}
