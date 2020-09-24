export default class Helper {
		public static getObjectKey(objectData: any, searchValue: any): any {
				const regex = new RegExp(`"([^{},]+)":${typeof searchValue === "number" ? searchValue : `"${searchValue}"`}`);
				const m = regex.exec(JSON.stringify(objectData));
				if (typeof m !== "undefined" && m !== null && m.length >= 1) {
						return m[1];
				}
				return m;
		}
}
