"use strict";

import net from "net";
import winston, {add} from "winston";

class Connection {
	private connection: any;
	private address: string;
	private logger: winston.Logger;

	constructor(address: string, logger: winston.Logger) {
		this.address = address;
		this.logger = logger;
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
				connection.on("error", (err: Error) => {
					this.logger.error(err);
				});
				resolve(connection);
			});

			connection.on("error", errorHandler);

			function errorHandler(err: Error) {
				connection.removeListener("error", errorHandler);
				console.log(47, `SRCDS server connection corrupted`, err);
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

	_disconnectHandler() {
		this.connection = undefined;
	}

	getData(cbSync: any) {
		const thisConnection = this.connection;
		return new Promise((resolve, reject) => {
			this.connection.removeListener("error", errorHandler);
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
			}
		});
	}

	send(buffer: Buffer) {
		this.connection.write(buffer);
	}
}

export default Connection;
