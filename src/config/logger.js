const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  transports: [
    new transports.File({
      filename: "./node/logs/info.log",
      level: "info",
      format: format.combine(format.timestamp(), format.simple()),
    }),
    new transports.Console({
      level: "info",
      format: format.combine(format.timestamp(), format.simple()),
    }),
  ],
});

module.exports = logger;
