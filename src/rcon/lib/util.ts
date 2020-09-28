"use strict";

module.exports = Object.freeze({
	promiseTimeout: (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout))
});
