'use strict';
const globalObject = require('the-global-object');
const { MODULE } = globalObject;
const mod = globalObject.MODULE = Object.create({});
let _Gun;
Object.defineProperty(mod, 'exports', {
    get() {
        return _Gun;
    },
    set(v) {
        console.log(v);
        _Gun = v;
        let _once = v.log.once;
        v.log.once = function () {
            v.log.once = _once;
        };
        (MODULE || {}).Gun = v;
    }
});
require('gun');
globalObject.MODULE = MODULE;
