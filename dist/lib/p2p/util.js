'use strict';
function bufferToString(buf) {
    return new TextDecoder().decode(buf);
}
function stringToBuffer(text) {
    return new TextEncoder().encode(text);
}
function fromBufferToJSON(buf) {
    var stringified = bufferToString(buf);
    return JSON.parse(stringified);
}
function fromJSONtoBuffer(obj) {
    var stringified = JSON.stringify(obj);
    return stringToBuffer(stringified);
}
export { bufferToString, stringToBuffer, fromBufferToJSON, fromJSONtoBuffer };
