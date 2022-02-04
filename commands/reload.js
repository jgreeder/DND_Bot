const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('reload commands'),
    async execute(interaction) {
        for (let command of interaction.client.commands.values()) {
            delete require.cache[require.resolve(`./${command.data.name}.js`)];
            command = require(`./${command.data.name}.js`);
            interaction.client.commands.set(command.data.name, command);
            interaction.client.logger.info(`Added command: ${command.data.name}`)
        }

        return interaction.reply({ content: 'Commands reloaded', ephemeral: true});
    },
    async select_handler(interaction) {
    }
};