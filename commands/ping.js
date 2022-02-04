const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .addStringOption(option => 
        option.setName('test')
        .setDescription('Options test')
        .setRequired(false)),
    async execute(interaction) {
        const opt = interaction.options.getString('test');

        if (!opt) {
            return interaction.reply('Pong!');
        } else {
            return interaction.reply(`Pong: ${opt}`);
        }
    },
    async select_handler(interaction) {
        return interaction.update({ content: 'Something was selected!', components: [] });
    }
};