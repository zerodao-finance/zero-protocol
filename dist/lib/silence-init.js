'use strict';
var globalObject = require('the-global-object');
var mod = globalObject.document ? globalObject : (globalObject.window = Object.create({}));
var _Gun;
if (!globalObject.document)
    Object.defineProperty(mod, 'Gun', {
        get: function () {
            return _Gun;
        },
        set: function (v) {
            _Gun = v;
            var _once = v.log.once;
            v.log.once = function () {
                v.log.once = _once;
            };
        }
    });
require('gun');
