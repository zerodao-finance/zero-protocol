'use strict';

const globalObject = require('the-global-object');

const mod = globalObject.window = Object.create({});

let _Gun;

Object.defineProperty(mod, 'Gun', {
  get() {
    return _Gun;
  },
  set(v) {
    _Gun = v;
    let _once = v.log.once;
    v.log.once = function () {
      v.log.once = _once;
    };
  }
});

require('gun');
delete globalObject.window;
