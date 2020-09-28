"use strict";

module.exports = {
	request: (options: any) => {
		const id = options.id;
		const type = options.type;
		const body = options.body;

		const bodySize = Buffer.byteLength(body);
		// Add 4 to the size (body + 10) for the null char
		const buffer = Buffer.alloc(bodySize + 14);
		// Substract 4 because the packet size field is not included when
		// determining the size of the packet
		buffer.writeInt32LE(buffer.length - 4, 0);
		buffer.writeInt32LE(id, 4);
		buffer.writeInt32LE(type, 8);
		buffer.write(body, 12, buffer.length - 2, "ascii");
		buffer.writeInt16LE(0x00, buffer.length - 2);

		return buffer;
	},
	response: (buffer: Buffer) => {
		const size = buffer.readInt32LE(0);
		const id = buffer.readInt32LE(4);
		const type = buffer.readInt32LE(8);
		// let body = buffer.toString('ascii', 12, buffer.length - 2);
		const payload = buffer.slice(12, buffer.length - 2);

		return {
			size,
			id,
			type,
			// body: body,
			payload
		};
	},
	convertPayload: (buffer: Buffer) => {
		return buffer.toString("ascii");
	},
	SERVERDATA_AUTH: 0x03,
	SERVERDATA_AUTH_RESPONSE: 0x02,
	SERVERDATA_EXECCOMMAND: 0x02,
	SERVERDATA_RESPONSE_VALUE: 0x00,
};
