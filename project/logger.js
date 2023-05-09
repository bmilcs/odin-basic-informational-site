const EventEmitter = require("events");

const myLogger = new EventEmitter();

myLogger.on("log", (message) => {
  console.log(`> ${message}`);
});

myLogger.on("error", (message) => {
  console.error(`! ${message}`);
});

module.exports = myLogger;
