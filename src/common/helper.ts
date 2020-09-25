export default class Helper {
	public static getObjectKey(objectData: any, searchValue: any): any {
		const regex = new RegExp(`"([^{},]+)":${typeof searchValue === "number" ? searchValue : `"${searchValue}"`}`);
		const m = regex.exec(JSON.stringify(objectData));
		if (typeof m !== "undefined" && m !== null && m.length >= 1) {
			return m[1];
		}
		return m;
	}

	public static getAllSubclasses(baseClass: any) {
		const globalObject = Function('return this')();
		const allVars = Object.keys(globalObject);
		return allVars.filter(function (key) {
			try {
				const obj = globalObject[key];
				return obj.prototype instanceof baseClass;
			} catch (e) {
				return false;
			}
		});
	}
}
