export interface Message {
	match(message: string): boolean;
	process(): void;
}
