'use strict';
exports = module.exports = function () { };
exports.isSelectedDeployment = function (filename) {
    return !process.env.DEPLOYMENT_NUMBER ||
        (function () {
            var match = filename.match(/(?:\d+)/g);
            if (!match)
                return false;
            return match[0] === process.env.DEPLOYMENT_NUMBER;
        })();
};
