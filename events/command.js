module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        if (interaction.isCommand()) {
            interaction.client.logger.info(`Running Command: ${interaction.commandName}`);

            const command = interaction.client.commands.get(interaction.commandName);
        
            if (!command) return;
        
            try {
                await command.execute(interaction);
            } catch (error) {
                interaction.client.logger.error(error);
                await interaction.reply({ 
                    content: 'There was an error while executing this command!', ephemeral: true });
            }    
        } else if (interaction.isSelectMenu()) {
            interaction.client.logger.info(`Runninng select handler: ${interaction.customId}` +
                                           `Select value: ${interaction.values}`);

            const command = interaction.client.commands.get(interaction.customId);

            if (!command) return;

            try {
                await command.select_handler(interaction);
            } catch (error) {
                interaction.client.logger.error(error);
                await interaction.reply({ 
                    content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else return;
    }
}
