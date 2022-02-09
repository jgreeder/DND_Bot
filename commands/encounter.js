const { redis_name } = require('../config.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { SelectMenu } = require('../utils');
const { ItemType } = require('../utils/item_types');

const Encounter = {
    start: "start",
    end: "end",
    create: "create",
    select: "select",
    add_user: "add_user",
    add_monster: "add_monster",
    next: "next",
    dead: "dead"
}

async function end(client) {

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encounter')
        .setDescription('Encounter command')
        .addSubcommand(subcommand => subcommand.setName(Encounter.create)
            .setDescription('Create the encounter and sets as active')
            .addStringOption(option =>
                option
                    .setName('name')
                    .setDescription('Encounter name')
                    .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand.setName(Encounter.start)
            .setDescription('Start the encounter')
        )
        .addSubcommand(subcommand => subcommand.setName(Encounter.select)
            .setDescription('Encounter selector')
        )
        .addSubcommand(subcommand => subcommand.setName(Encounter.end)
                .setDescription('End the encounter')
        )
        .addSubcommand(subcommand => subcommand.setName(Encounter.add_user)
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
        .addSubcommand(subcommand => subcommand.setName(Encounter.add_monster)
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
        )
        .addSubcommand(subcommand => subcommand.setName(Encounter.next)
            .setDescription("Advance to next (or supplied) combatant.")
            .addIntegerOption(option => 
                option 
                    .setName('position')
                    .setDescription('Position to advance to.')
                    .setRequired(false)
            )
        )
        .addSubcommand(subcommand => subcommand.setName(Encounter.dead)
            .setDescription("Set combatant to dead.")
            .addIntegerOption(option =>
                option
                    .setName('position')
                    .setDescription('Position to set dead.')
                    .setRequired(true)
            )
        ),
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case Encounter.create:
                const encounter_name = interaction.options.getString('name');
                const num_encounters = await interaction.client.redis.json.arrLen(redis_name, '.encounters');

                await interaction.client.redis.json.arrAppend(redis_name, '.encounters', {
                    name: encounter_name, 
                    id: num_encounters,
                    combatants: []
                });
                await interaction.client.redis.json.set(redis_name, '.current', {id: num_encounters});

                await interaction.reply({
                    content: `There are now ${num_encounters+1} encounters.`,
                    ephemeral: true
                });
                break;

            case Encounter.select:
                const encounters = (await interaction.client.redis.json.get(redis_name, {path: '.encounters'}));
                interaction.client.logger.info(encounters);

                if (!encounters.length) {
                    await interaction.reply({
                        content: "No encounters",
                        ephemeral: true
                    });
                    break;
                }

                const select_menu = SelectMenu.encounters(this.data.name, encounters, 0);

                await interaction.reply({
                    content: "Selecting encounter",
                    ephemeral: false,
                    components: [select_menu]
                });

                break;

            case Encounter.start:
                await (async () => {
                    const {id} = await interaction.client.redis.json.get(redis_name, {path: '.current'});
                    const current_encounter = await interaction.client.redis.json.get(redis_name, {path: `.encounters[${id}]`});
                    interaction.client.logger.info(current_encounter);

                    await interaction.reply({
                        content: `Starting encounter: ${current_encounter.name}`,
                        ephemeral: false
                    });
                })();
                break;

            case Encounter.end:
                await (async () => {
                    const {id} = await interaction.client.redis.json.get(redis_name, {path: '.current'});
                    await interaction.client.redis.json.arrPop(redis_name, '.encounters', id);
                
                    await interaction.reply({
                        content: "Ending encounter",
                        ephemeral: true
                    });
                })();
                break;

            case Encounter.add_monster:
                await (async () => {
                    const monster = interaction.options.getString('monster');
                    const initiative = interaction.options.getInteger('initiative');

                    await interaction.reply({
                        content: `Adding monster: *${monster}*, initiative: ${initiative}`,
                        ephemeral: true
                    });
                })();
                break;

            case Encounter.add_user:
                await (async () => {
                    const user = interaction.options.getString('user');
                    const initiative = interaction.options.getInteger('initiative');

                    await interaction.reply({
                        content: `Adding user: *${user}* , initiative: ${initiative}`,
                        ephemeral: true
                    });
                })();
                break;

            case Encounter.next:
                await (async () => {
                    const position = interaction.options.getInteger('position');

                    await interaction.reply({
                        content: `Advancing to user: *${position}*`,
                        ephemeral: false
                    });
                })();

                break;

            case Encounter.dead:
                await (async () => {
                    const position = interaction.options.getInteger('position');

                    await interaction.reply({
                        content: `Killing user: *${position}* , initiative: ${position}`,
                        ephemeral: false
                    });
                })();

                break;

            default:
                return interaction.reply({
                    content: "Malformed selection", 
                    ephemeral: true 
                });
        }
    },
    async select_handler(interaction) {
        const [item_type, item_id, opt] = SelectMenu.extract(interaction.values[0])

        switch (item_type) {
            // Set the active encounter
            case ItemType.encounter:
                await interaction.client.redis.json.set(redis_name, '.current', {id: item_id});
                const current_encounter = await interaction.client.redis.json.get(redis_name, {path: `.encounters[${item_id}]`});

                return interaction.update({ 
                    content: `Current active encounter set to: *${current_encounter.name}*`, 
                    components: [] 
                });

            default:
                await interaction.update({
                    content: "Malformed selection", 
                    components: [], 
                    ephemeral: true 
                });
                break;
        }
    }
};