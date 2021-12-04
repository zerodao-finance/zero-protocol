"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assembleCloneCode = (from, implementation) => {
    return ('0x3d3d606380380380913d393d73' +
        from.substr(2) +
        '5af4602a57600080fd5b602d8060366000396000f3363d3d373d3d3d363d73' +
        implementation.substr(2) +
        '5af43d82803e903d91602b57fd5bf352e831dd00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000');
};
exports.default = assembleCloneCode;
