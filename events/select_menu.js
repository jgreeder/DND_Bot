module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        if (!interaction.isSelectMenu) return;

        const command = interaction.client.commands.get(interaction.customId);

        if (!command) {
            return;
        }
    
        interaction.client.logger.info(`Runninng select handler: ${interaction.customId} ` +
                                        `Select value: ${interaction.values}`);

        try {
            await command.select_handler(interaction);
        } catch (error) {
            interaction.client.logger.error(error);
            await interaction.reply({ 
                content: 'There was an error while executing this select handler!', ephemeral: true });
        }
    }
}
