'use strict';
exports.__esModule = true;
exports.fromJSONtoBuffer = exports.fromBufferToJSON = exports.stringToBuffer = exports.bufferToString = void 0;
function bufferToString(buf) {
    return new TextDecoder().decode(buf);
}
exports.bufferToString = bufferToString;
function stringToBuffer(text) {
    return new TextEncoder().encode(text);
}
exports.stringToBuffer = stringToBuffer;
function fromBufferToJSON(buf) {
    var stringified = bufferToString(buf);
    return JSON.parse(stringified);
}
exports.fromBufferToJSON = fromBufferToJSON;
function fromJSONtoBuffer(obj) {
    var stringified = JSON.stringify(obj);
    return stringToBuffer(stringified);
}
exports.fromJSONtoBuffer = fromJSONtoBuffer;
