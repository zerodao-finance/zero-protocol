'use strict';

const { createNode } = require('./core');
const wrtc = require('wrtc');

Object.assign(module.exports, {
  createNode: (options) => createNode(options, wrtc)
});
