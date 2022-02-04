module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        if (! interaction.isCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        
        interaction.client.logger.info(`Running Command: ${interaction.commandName}`);

        try {
            await command.execute(interaction);
        } catch (error) {
            interaction.client.logger.error(error);
            await interaction.reply({ 
                content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}
