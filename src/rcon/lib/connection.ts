'use strict';

let net = require('net');

module.exports = (address: string) => {
	let connection: any;

	return Object.freeze({
		create: create,
		send: send,
		getData: getData,
		destroy: destroy
	});

	function create() {
		return _createConnection().then(newConnection => {
			connection = newConnection;

			connection.on('close', _disconnectHandler);
		});
	}

	function destroy() {
		return _destroyConnection();
	}

	function _createConnection() {
		return new Promise((resolve, reject) => {
			let host = address.split(':')[0];
			let port = Number(address.split(':')[1]) || 27015;
			let connection = net.createConnection({
				host: host,
				port: port
			}, () => {
				connection.removeListener('error', errorHandler);
				connection.on('error', _errorHandler);
				resolve(connection);
			});

			connection.on('error', errorHandler);

			function errorHandler(err: Error) {
				connection.removeListener('error', errorHandler);
				reject(err);
			}
		});
	}

	function _destroyConnection() {
		return new Promise((resolve, reject) => {
			if (connection) {
				//end would not ever "End..."
				connection.destroy();

				connection.on('close', resolve);
			} else {
				resolve();
			}
		});
	}

	function _errorHandler(err: Error) {
		console.error(err);
	}

	function _disconnectHandler() {
		connection = undefined;
	}

	function getData(cbSync: any) {
		return new Promise((resolve, reject) => {
			connection.removeListener('error', _errorHandler);
			connection.on('error', errorHandler);
			connection.on('data', dataHandler);

			function dataHandler(data: any) {
				if (cbSync === false) {
					resetListeners();
					resolve(data);
				} else if (!cbSync(data)) {
					resetListeners();
					resolve(data);
				}
			}

			function errorHandler(err: Error) {
				resetListeners();
				reject(err);
			}

			function resetListeners() {
				connection.removeListener('error', errorHandler);
				connection.removeListener('data', dataHandler);
				connection.on('error', _errorHandler);
			}
		});
	}

	function send(buffer: Buffer) {
		connection.write(buffer);
	}
};
