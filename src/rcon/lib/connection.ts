"use strict";

import net from "net";
import {add} from "winston";

class Connection {
	private connection: any;
	private address: string;

	constructor(address: string) {
		this.address = address;
	}

	create() {
		return this._createConnection().then(newConnection => {
			this.connection = newConnection;

			this.connection.on("close", this._disconnectHandler);
		});
	}

	destroy() {
		return this._destroyConnection();
	}

	_createConnection() {
		return new Promise((resolve, reject) => {
			const host = this.address.split(":")[0];
			const port = Number(this.address.split(":")[1]) || 27015;
			const connection = net.createConnection({
				host,
				port
			}, () => {
				connection.removeListener("error", errorHandler);
				connection.on("error", this._errorHandler);
				resolve(connection);
			});

			connection.on("error", errorHandler);

			function errorHandler(err: Error) {
				connection.removeListener("error", errorHandler);
				reject(err);
			}
		});
	}

	_destroyConnection() {
		return new Promise((resolve, reject) => {
			if (this.connection) {
				// end would not ever "End..."
				this.connection.destroy();

				this.connection.on("close", resolve);
			} else {
				resolve();
			}
		});
	}

	_errorHandler(err: Error) {
		console.error(err);
	}

	_disconnectHandler() {
		this.connection = undefined;
	}

	getData(cbSync: any) {
		const thisConnection = this.connection;
		return new Promise((resolve, reject) => {
			this.connection.removeListener("error", this._errorHandler);
			this.connection.on("error", errorHandler);
			this.connection.on("data", dataHandler);

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
				thisConnection.removeListener("error", errorHandler);
				thisConnection.removeListener("data", dataHandler);
				thisConnection.on("error", (err: Error) => {
					console.log(err);
				});
			}
		});
	}

	send(buffer: Buffer) {
		this.connection.write(buffer);
	}
}

export default Connection;
