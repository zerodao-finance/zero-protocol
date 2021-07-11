'use strict';
const { joinSignature, splitSignature } = require('@ethersproject/bytes');

const fixSignature = (signature) => joinSignature(splitSignature(signature));

function bufferToString(buf) {
  return new TextDecoder().decode(buf);
}

function stringToBuffer(text) {
  return new TextEncoder().encode(text);
}

function fromBufferToJSON(buf) {
  const stringified = bufferToString(buf)
  return JSON.parse(stringified)
}

function fromJSONtoBuffer(obj) {
  const stringified = JSON.stringify(obj)
  return stringToBuffer(stringified)
}

module.exports = {
  bufferToString, 
  stringToBuffer,
  fromBufferToJSON,
  fromJSONtoBuffer,
}
