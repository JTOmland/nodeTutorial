var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
        level: 'debug',
        filename: 'bin/logs/winnodelog.log',
        handleExceptions: true,
        json: false,
        maxsize: 5242880, //5MB
        maxFiles: 5,
        colorize: false,
        timestamp:true
    }),
    new winston.transports.Console({
        timestamp :true,
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
    })
],
exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};
