'use strict';
function bufferToString(buf) {
    return new TextDecoder().decode(buf);
}
function stringToBuffer(text) {
    return new TextEncoder().encode(text);
}
function fromBufferToJSON(buf) {
    const stringified = bufferToString(buf);
    return JSON.parse(stringified);
}
function fromJSONtoBuffer(obj) {
    const stringified = JSON.stringify(obj);
    return stringToBuffer(stringified);
}
export { bufferToString, stringToBuffer, fromBufferToJSON, fromJSONtoBuffer };
//# sourceMappingURL=util.js.map