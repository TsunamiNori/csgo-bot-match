'use strict';

let Connection = require('./lib/connection');
let packet = require('./lib/packet');
let util = require('./lib/util');

module.exports = (params: any) => {
	let address = params.address;
	let password = params.password;
	let _connection: any;
	let nextPacketId: any;

	return Object.freeze({
		connect: connect,
		command: command,
		disconnect: disconnect
	});

	function connect() {
		let connection = Connection(address);
		return connection.create().then(() => _auth(connection));
	}

	function disconnect() {
		return _connection.destroy().then(() => {
			_connection = undefined;
		});
	}

	function _auth(connection: any) {
		let buf = packet.request({
			id: 1,
			type: packet.SERVERDATA_AUTH,
			body: password
		});
		connection.send(buf);
		return Promise.race([
			util.promiseTimeout(3000).then(() => {
				let err = new Error('Auth timeout');
				return Promise.reject(err);
			}),
			connection.getData(false)
		]).then(data => {
			// TODO: data as a single type, not string/object
			let res = packet.response(data);
			if (res.id === -1) {
				let err = new Error('Wrong rcon password');
				return Promise.reject(err);
			}

			if (res.type === packet.SERVERDATA_RESPONSE_VALUE && !res.payload.length) {
				// Auth successful, but continue after receiving packet index
				return connection.getData(false).then(() => {
					_init(connection);
				});
			} else {
				return _init(connection);
			}
		});

	}

	function _init(connection: any) {
		_connection = connection;
		nextPacketId = 1;
	}

	function _getNextPacketId() {
		return nextPacketId += 1;
	}

	function command(text: string, timeout: number) {
		return Promise.race([
			new Promise((resolve, reject) => {
				if (!_connection) {
					reject(new Error('not connected'));
				}

				let unexpectedPackets: any;

				let responseData = new Buffer(0);
				let reqId = _getNextPacketId();
				let req = packet.request({
					id: reqId,
					type: packet.SERVERDATA_EXECCOMMAND,
					body: text
				});
				let ackId = _getNextPacketId();
				let ack = packet.request({
					id: ackId,
					type: packet.SERVERDATA_EXECCOMMAND,
					body: ''
				});
				_connection.send(req);
				_connection.send(ack);
				_connection.getData(dataHandler).then(done);

				function dataHandler(data: any) {
					let res = packet.response(data);
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
					let text = packet.convertPayload(responseData);
					resolve(text);
				}

				function handleUnexpectedData(id: number) {
					// Unexpected res.id, possibly from other commands
					if (reqId > id) {
						// Do nothing and keep listening, packets from older
						// commands are still coming in
						return true;
					}
					if ('undefined' === typeof unexpectedPackets) {
						unexpectedPackets = new Map();
					}
					if (!unexpectedPackets.has(id)) {
						if (unexpectedPackets.size >= 2) {
							let err = new Error(`Command lost. Request ID: ${reqId}. ${responseData.length > 0 ?
								`Request Payload: ${packet.convertPayload(responseData)}` : ''}`);
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
					let err = new Error(`Command timeout (${timeout})`);
					// err.details = {
					// 	timeout: timeout
					// };
					reject(err);
				});
			})
		]);
	}
};
