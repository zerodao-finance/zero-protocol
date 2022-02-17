'use strict';

exports = module.exports = function () {};

exports.isSelectedDeployment = (filename) =>
	!process.env.DEPLOYMENT_NUMBER ||
	(() => {
		const match = filename.match(/(?:\d+)/g);
		if (!match) return false;
		return match[0] === process.env.DEPLOYMENT_NUMBER;
	})();
