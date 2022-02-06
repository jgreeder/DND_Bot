const { SlashCommandBuilder } = require('@discordjs/builders');

const Encounter = {
    start: "start",
    end: "end",
    create: "create",
    add_user: "add_user",
    add_monster: "add_monster"
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('encounter')
    .setDescription('Encounter command')
    .addSubcommand(subcommand =>
        subcommand
            .setName(Encounter.create)
            .setDescription('Create the encounter'))
    .addSubcommand(subcommand =>
        subcommand
            .setName(Encounter.start)
            .setDescription('Start the encounter'))
    .addSubcommand(subcommand =>
        subcommand
            .setName(Encounter.end)
            .setDescription('End the encounter'))
    .addSubcommand(subcommand =>
        subcommand
            .setName(Encounter.add_user)
            .setDescription('Add user to encounter list')
            .addStringOption(option => 
                option
                    .setName('user')
                    .setDescription('Name of user')
                    .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName('initiative')
                    .setDescription('Initiative value')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName(Encounter.add_monster)
            .setDescription('Add monster to encounter list')
            .addStringOption(option => 
                option = option.setName('monster')
                .setDescription('Name of monster')
                .setRequired(true)
            )
            .addIntegerOption(option => 
                option
                    .setName('initiative')
                    .setDescription('Initiative value')
                    .setRequired(true)
            )
    ),
    async execute(interaction) {
        let initiative;
        switch (interaction.options.getSubcommand()) {
            case Encounter.create:
                await interaction.reply({
                    content: "Creating encounter",
                    ephemeral: true
                });
                break;

            case Encounter.start:
                await interaction.reply({
                    content: "Starting encounter",
                    ephemeral: false
                });
                break;

            case Encounter.end:
                await interaction.reply({
                    content: "Ending encounter",
                    ephemeral: true
                });
                break;

            case Encounter.add_monster:
                const monster = interaction.options.getString('monster');
                initiative = interaction.options.getInteger('initiative');

                await interaction.reply({
                    content: `Adding monster: *${monster}*, initiative: ${initiative}`,
                    ephemeral: true
                });
                break;
            
            case Encounter.add_user:
                const user = interaction.options.getString('user');
                initiative = interaction.options.getInteger('initiative');

                await interaction.reply({
                    content: `Adding user: *${user}* , initiative: ${initiative}`,
                    ephemeral: true
                });
                break;

            default:
                return interaction.reply({
                    content: "Malformed selection", 
                    ephemeral: true 
                });
        }
    },
    async select_handler(interaction) {
    }
};