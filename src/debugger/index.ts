// Is Node.js reporting warning messages like this?:
//
//  "Warning: Possible EventEmitter memory leak detected. 11 wakeup listeners added. Use emitter.setMaxListeners() to increase limit"
//
// The following code will intercept calls to addListener() and on() and print the type of event and generate an Error exception
// With a stack trace to help you find the cause

// Original: https://gist.github.com/vlasky/2ea30ce9923bd06c2ee100f2924991cc

let EventEmitter = require("events").EventEmitter;

const originalAddListener = EventEmitter.prototype.addListener;

const addListener = function(this: any, type: any) {
	originalAddListener.apply(this, arguments);

	const numListeners = this.listeners(type).length;
	const max = typeof this._maxListeners === "number" ? this._maxListeners : 10;

	if (max !== 0 && numListeners > max) {
		const error = new Error("Too many listeners of type \"" + type + "\" added to EventEmitter. Max is " + max + " and we've added " + numListeners + ".");
		console.error(error);
		throw error;
	}

	return this;
};

EventEmitter.prototype.addListener = addListener;
EventEmitter.prototype.on = addListener;
