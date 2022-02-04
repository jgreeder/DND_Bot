const winston = require('winston');
const fs = require('fs');

const config = require('./config.json');
const db = require('./database/connection');

const {
    Client,
    Collection,
    Intents
} = require('discord.js');

const botLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
                    winston.format.errors({ stack: true }),
                    // winston.format.timestamp(),
                    winston.format.json()
        ),
    transports: [new winston.transports.Console({colorize: true})]
});

winston.loggers.add('botLogger', botLogger);

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();
client.logger = botLogger;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for ( const file of commandFiles ) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    client.logger.info(`Added command: ${command.data.name}`)
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for ( const file of eventFiles ) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }

    client.logger.info(`Added event handler: ${file.split('.')[0]}`);
}

client.login(config.token);
