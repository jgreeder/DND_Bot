const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping of bot!'),
    async execute(interaction) {
        return interaction.reply({content: `Websocket heartbeat: ${interaction.client.ws.ping}ms`, ephemeral: true});
    },
    async select_handler(interaction) {
        return interaction.update({ content: 'Something was selected!', components: [] });
    }
};