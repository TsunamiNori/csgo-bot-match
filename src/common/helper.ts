export default class Helper {
		public static getObjectKey(objectData: any, searchValue: any): any {
				// console.log(objectData,  searchValue);
				// return Object.keys(objectData).find((key: any): any => objectData[key] === searchValue);
				const regex = new RegExp(`"([^{},]+)":${typeof searchValue === "number" ? searchValue : `"${searchValue}"`}`);
				// const out = JSON.stringify(objectData).match(/"([^{}]+)":""/)[1];
				const m = regex.exec(JSON.stringify(objectData));
				if (typeof m !== "undefined" && m !== null && m.length >= 1) {
						return m[1];
				}
				return m;
		}
}
