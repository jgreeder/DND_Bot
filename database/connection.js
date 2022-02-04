const winston = require('winston');
const mongoose = require('mongoose');

const { database_ip, db_username, db_password } = require('../config.json');

const dbLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [new winston.transports.Console({colorize: true})]
});

winston.loggers.add('dbLogger', dbLogger);


mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(database_ip, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user:db_username,
    pass:db_password,
}, (err) => {
    if (!err) {
        dbLogger.info('Mongoose connection succeeded...')
    } else {
        dbLogger.error('Error in Mongoose connection: ' + err)
    }
});

process.once('SIGINT', () => {
    mongoose.disconnect().then(dbLogger.info("Mongoose connection disconnected"));
    process.exit(0);
})