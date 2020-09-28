"use strict";

import Connection from "./lib/connection";
const packet = require("./lib/packet");
const util = require("./lib/util");

class Rcon {
	private address: string;
	private password: string;
	private _connection: any;
	private nextPacketId: any;

	constructor(params: any) {
		this.address = params.address;
		this.password = params.password;
	}

	connect() {
		const connection = new Connection(this.address);
		return connection.create().then(() => this._auth(connection));
	}

	disconnect() {
		let thisConnection = this._connection;
		return thisConnection.destroy().then(() => {
			thisConnection = undefined;
		});
	}
	_auth(connection: any) {
		const buf = packet.request({
			id: 1,
			type: packet.SERVERDATA_AUTH,
			body: this.password
		});
		connection.send(buf);
		return Promise.race([
			util.promiseTimeout(3000).then(() => {
				const err = new Error("Auth timeout");
				return Promise.reject(err);
			}),
			connection.getData(false)
		]).then(data => {
			// TODO: data as a single type, not string/object
			const res = packet.response(data);
			if (res.id === -1) {
				const err = new Error("Wrong rcon password");
				return Promise.reject(err);
			}

			if (res.type === packet.SERVERDATA_RESPONSE_VALUE && !res.payload.length) {
				// Auth successful, but continue after receiving packet index
				return connection.getData(false).then(() => {
					this._init(connection);
				});
			} else {
				return this._init(connection);
			}
		});

	}

	_init(connection: any) {
		this._connection = connection;
		this.nextPacketId = 1;
	}

	_getNextPacketId() {
		return this.nextPacketId += 1;
	}

	command(text: string, timeout: number = 1000) {
		return Promise.race([
			new Promise((resolve, reject) => {
				if (!this._connection) {
					reject(new Error("not connected"));
				}

				let unexpectedPackets: any;

				let responseData = Buffer.alloc(0);
				const reqId = this._getNextPacketId();
				const req = packet.request({
					id: reqId,
					type: packet.SERVERDATA_EXECCOMMAND,
					body: text
				});
				const ackId = this._getNextPacketId();
				const ack = packet.request({
					id: ackId,
					type: packet.SERVERDATA_EXECCOMMAND,
					body: ""
				});
				this._connection.send(req);
				this._connection.send(ack);
				this._connection.getData(dataHandler).then(done);

				function dataHandler(data: any) {
					const res = packet.response(data);
					if (res.id === ackId) {
						return false;
					} else if (res.id === reqId) {
						// More data to come
						responseData = Buffer.concat([responseData, res.payload], responseData.length + res.payload.length);
						return true;
					} else {
						return handleUnexpectedData(res.id);
					}
				}

				function done() {
					const responseText = packet.convertPayload(responseData);
					resolve(responseText);
				}

				function handleUnexpectedData(id: number) {
					// Unexpected res.id, possibly from other commands
					if (reqId > id) {
						// Do nothing and keep listening, packets from older
						// commands are still coming in
						return true;
					}
					if ("undefined" === typeof unexpectedPackets) {
						unexpectedPackets = new Map();
					}
					if (!unexpectedPackets.has(id)) {
						if (unexpectedPackets.size >= 2) {
							const err = new Error(`Command lost. Request ID: ${reqId}. ${responseData.length > 0 ?
								`Request Payload: ${packet.convertPayload(responseData)}` : ""}`);
							// err.details = {
							// 	reqId: reqId
							// };
							// if (responseData.length > 0) {
							// 	err.details.partialResponse = packet.convertPayload(responseData);
							// }
							reject(err);
							return false;
						}
						unexpectedPackets.set(id, 1);
						return true;
					}
					unexpectedPackets.set(id, unexpectedPackets.get(id) + 1);
					return true;
				}
			}),
			new Promise((resolve, reject) => {
				return util.promiseTimeout(timeout).then(() => {
					const err = new Error(`Command timeout (${timeout})`);
					// err.details = {
					// 	timeout: timeout
					// };
					reject(err);
				}).catch((err: Error) => reject(err));
			})
		]);
	}
}

export default Rcon;

// module.exports = (params: any) => {
// 	const address = params.address;
// 	const password = params.password;
// 	let _connection: any;
// 	let nextPacketId: any;
//
// 	return Object.freeze({
// 		connect,
// 		command,
// 		disconnect
// 	});
//
// 	function connect() {
// 		const connection = Connection(address);
// 		return connection.create().then(() => _auth(connection));
// 	}
//
// 	function disconnect() {
// 		return _connection.destroy().then(() => {
// 			_connection = undefined;
// 		});
// 	}
//
// 	function _auth(connection: any) {
// 		const buf = packet.request({
// 			id: 1,
// 			type: packet.SERVERDATA_AUTH,
// 			body: password
// 		});
// 		connection.send(buf);
// 		return Promise.race([
// 			util.promiseTimeout(3000).then(() => {
// 				const err = new Error("Auth timeout");
// 				return Promise.reject(err);
// 			}),
// 			connection.getData(false)
// 		]).then(data => {
// 			// TODO: data as a single type, not string/object
// 			const res = packet.response(data);
// 			if (res.id === -1) {
// 				const err = new Error("Wrong rcon password");
// 				return Promise.reject(err);
// 			}
//
// 			if (res.type === packet.SERVERDATA_RESPONSE_VALUE && !res.payload.length) {
// 				// Auth successful, but continue after receiving packet index
// 				return connection.getData(false).then(() => {
// 					_init(connection);
// 				});
// 			} else {
// 				return _init(connection);
// 			}
// 		});
//
// 	}
//
// 	function _init(connection: any) {
// 		_connection = connection;
// 		nextPacketId = 1;
// 	}
//
// 	function _getNextPacketId() {
// 		return nextPacketId += 1;
// 	}
//
// 	function command(text: string, timeout: number = 1000) {
// 		return Promise.race([
// 			new Promise((resolve, reject) => {
// 				if (!_connection) {
// 					reject(new Error("not connected"));
// 				}
//
// 				let unexpectedPackets: any;
//
// 				let responseData = Buffer.alloc(0);
// 				const reqId = _getNextPacketId();
// 				const req = packet.request({
// 					id: reqId,
// 					type: packet.SERVERDATA_EXECCOMMAND,
// 					body: text
// 				});
// 				const ackId = _getNextPacketId();
// 				const ack = packet.request({
// 					id: ackId,
// 					type: packet.SERVERDATA_EXECCOMMAND,
// 					body: ""
// 				});
// 				_connection.send(req);
// 				_connection.send(ack);
// 				_connection.getData(dataHandler).then(done);
//
// 				function dataHandler(data: any) {
// 					const res = packet.response(data);
// 					if (res.id === ackId) {
// 						return false;
// 					} else if (res.id === reqId) {
// 						// More data to come
// 						responseData = Buffer.concat([responseData, res.payload], responseData.length + res.payload.length);
// 						return true;
// 					} else {
// 						return handleUnexpectedData(res.id);
// 					}
// 				}
//
// 				function done() {
// 					const responseText = packet.convertPayload(responseData);
// 					resolve(responseText);
// 				}
//
// 				function handleUnexpectedData(id: number) {
// 					// Unexpected res.id, possibly from other commands
// 					if (reqId > id) {
// 						// Do nothing and keep listening, packets from older
// 						// commands are still coming in
// 						return true;
// 					}
// 					if ("undefined" === typeof unexpectedPackets) {
// 						unexpectedPackets = new Map();
// 					}
// 					if (!unexpectedPackets.has(id)) {
// 						if (unexpectedPackets.size >= 2) {
// 							const err = new Error(`Command lost. Request ID: ${reqId}. ${responseData.length > 0 ?
// 								`Request Payload: ${packet.convertPayload(responseData)}` : ""}`);
// 							// err.details = {
// 							// 	reqId: reqId
// 							// };
// 							// if (responseData.length > 0) {
// 							// 	err.details.partialResponse = packet.convertPayload(responseData);
// 							// }
// 							reject(err);
// 							return false;
// 						}
// 						unexpectedPackets.set(id, 1);
// 						return true;
// 					}
// 					unexpectedPackets.set(id, unexpectedPackets.get(id) + 1);
// 					return true;
// 				}
// 			}),
// 			new Promise((resolve, reject) => {
// 				return util.promiseTimeout(timeout).then(() => {
// 					const err = new Error(`Command timeout (${timeout})`);
// 					// err.details = {
// 					// 	timeout: timeout
// 					// };
// 					reject(err);
// 				}).catch((err: Error) => reject(err));
// 			})
// 		]);
// 	}
// };
