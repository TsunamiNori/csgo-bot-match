import {Logger} from "./logger";

export const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";
export const JWT_LIFE = process.env.JWT_LIFE as string || "7 days"; // Default expired for JWT is 7 days
export const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";
export const REFRESH_LIFE = process.env.REFRESH_LIFE as string || 86400; // 1 day
export const SALT_SECRET = parseInt(process.env.SALT_SECRET as string, 0) || 10;

if (!JWT_SECRET) {
	(new Logger("Application", "cyan")).log.error("No JWT secret string. Set JWT_SECRET environment variable.");
	process.exit(1);
}
