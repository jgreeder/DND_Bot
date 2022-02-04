const winston = require('winston');

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        client.logger.info(`Ready! Logged in as ${client.user.tag}`);
    }
}
