const { redis_name } = require('../config.json');

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        client.logger.info(`Ready! Logged in as ${client.user.tag}`);
        client.redis.on('error', (err) => console.log('Redis Client Error', err));

        client.redis.connect()
            .then(client.logger.info("Connected to redis"))
            .catch((err) => client.logger.error("Failed to connect to redis", err));
        client.redis.del(redis_name)
            .then(client.logger.info("Deleted redis cache"))
            .catch((err) => client.logger.error("Failed to delete redis", err));
        client.redis.json.set(redis_name, '$', {encounters: []})
            .then(client.logger.info("Reset redis cache"))
            .catch((err) => client.logger.error("Failed to reset redis cache", err));
    }
}
