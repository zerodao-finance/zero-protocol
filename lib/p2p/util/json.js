'use strict';

const { Buffer } = require('safe-buffer');

const tryParse = (str) => {
  try {
    return JSON.parse(str);
  } catch(e) {
    return str;
  }
};

const tryStringify = data => typeof data == 'string' ? data : JSON.stringify(data);

const jsonBuffer = (data) => Buffer.from(tryStringify(data));

Object.assign(module.exports, {
  tryParse,
  tryStringify,
  jsonBuffer
});
