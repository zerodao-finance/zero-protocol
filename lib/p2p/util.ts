'use strict';

function bufferToString(buf: Uint8Array): string {
	return new TextDecoder().decode(buf);
}

function stringToBuffer(text: string): Uint8Array {
	return new TextEncoder().encode(text);
}

function fromBufferToJSON(buf: Uint8Array): any {
	const stringified = bufferToString(buf);
	return JSON.parse(stringified);
}

function fromJSONtoBuffer(obj: any): Uint8Array {
	const stringified = JSON.stringify(obj);
	return stringToBuffer(stringified);
}

export { bufferToString, stringToBuffer, fromBufferToJSON, fromJSONtoBuffer };
