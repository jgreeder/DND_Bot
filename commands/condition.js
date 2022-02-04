const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

const { titleCase, select_format, format_extract, ItemType } = require('../util')

const Condition = require('../database/condition');

async function get_all(name) {
    const conditions = await Condition.find({'name': new RegExp((name ? name.toLowerCase() : ''))})
                                      .sort({'name': 'asc'})
                                      .lean();

    return conditions;
}

function create_condition_embed(condition) {
    const embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(titleCase(condition.name))
                    .setDescription(condition.desc);
    return embed;
}


module.exports = {
    data: new SlashCommandBuilder()
    .setName('condition')
    .setDescription('Get description of a condition')
    .addStringOption(option => {
            option = option.setName('condition_name')
            .setDescription('name of condition, or none for list of conditions')
            .setRequired(false);
            return option;
        }
    ),
    async execute(interaction) {
        const opt = interaction.options.getString('condition_name');

        const conditions = await get_all(opt);

        if (conditions.length == 1) {
            return interaction.reply({
                embeds: [create_condition_embed(conditions[0])],
                ephemeral: false
            });
        }

        if (conditions.length == 0) {
            return interaction.reply({
                content: `Failed to find conditions with: ${opt}`,
                ephemeral: true
            });
        }

        const options = conditions.map((condition) => {
            return { label: titleCase(condition.name), description: null, value: select_format(ItemType.condition, condition._id.toHexString())}
        });


        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(this.data.name)
					.setPlaceholder('Nothing selected')
					.addOptions(options)
			);

        return interaction.reply({ content: 'Multiple conditions found!', components: [row] });
    },
    async select_handler(interaction) {

        const [item_type, item_id, opt] = format_extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.condition:
                const embed = create_condition_embed(await Condition.findById(item_id).lean());
                return interaction.update({ embeds: [embed], content:" ", ephemeral: false });
            default:
                return interaction.update({content: "Malformed selection", components: [], ephemeral: true });
        }
    }
};