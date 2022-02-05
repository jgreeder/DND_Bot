const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

const { titleCase, select_format, format_extract, ItemType, Page, PageType } = require('../util')

const Monster = require('../database/monster');

async function get_monsters(name) {
    const monsters = await Monster.find({
        name: new RegExp((name ? name.toLowerCase() : ''))
    })
    .sort({'name': 'asc'})
    .lean();

    return monsters;
}

function create_monster_embed(monster) {

    let fields = [];
    for (const [key, value] of Object.entries(monster)) {
        if (key.startsWith('_')) continue;
        if (key === 'name' || key === 'type' || value === '') continue

        fields.push({name: titleCase(key.split('_').join(' ')), value: String(value)});
    }

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(titleCase(monster.name))
        .setDescription(titleCase(monster.type))
        .addFields(fields);
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('monster')
    .setDescription('Get monster stats')
    .addStringOption(option => {
            option = option.setName('monster_name')
            .setDescription('Name of monster')
            .setRequired(false);
            return option;
        }
    ),
    async execute(interaction) {
        const monster_name = interaction.options.getString('monster_name');

        const monsters = await get_monsters(monster_name);

        if (monsters.length == 1) {
            return interaction.reply({
                embeds: [create_monster_embed(monsters[0])],
                ephemeral: false
            });
        }

        if (monsters.length == 0) {
            return interaction.reply({
                content: `Failed to find monster with: ${monster_name}`,
                ephemeral: true
            });
        }

        let options = monsters.map((monster) => {
            return { label: titleCase(monster.name), description: null, value: select_format(ItemType.monster, monster._id.toHexString())}
        });

        if (options.length > 25) {
            options = options.slice(0, 24);
            options.push(new Page(PageType.next, 1, monster_name));
        }

        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(this.data.name)
                .setPlaceholder('Nothing selected')
                .addOptions(options)
        );

        return interaction.reply({ 
            content: 'Multiple monsters found!', 
            components: [row] 
        });
    },
    async select_handler(interaction) {

        const [item_type, item_id, opt] = format_extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.monster:
                return interaction.update({ 
                    embeds: [create_monster_embed(await Monster.findById(item_id).lean())], 
                    content:"Monster found", 
                    ephemeral: false 
                });
            
            case ItemType.page:
                const monsters = await get_monsters(opt);
                let options = monsters.map((monster) => {
                    return { label: titleCase(monster.name), description: null, value: select_format(ItemType.monster, monster._id.toHexString())}
                }).slice(parseInt(item_id)*24);
        
                if (options.length > 25) {
                    if (parseInt(item_id) > 0) {
                        options.unshift(new Page(PageType.prev, parseInt(item_id)-1, opt));
                    }

                    options = options.slice(0, 24);
                    options.push(new Page(PageType.next, parseInt(item_id)+1, opt));
                }

                const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(this.data.name)
                        .setPlaceholder('Nothing selected')
                        .addOptions(options)
                );

                return interaction.update({ 
                    content: 'Multiple monsters found!', 
                    components: [row] 
                });

            default:
                return interaction.update({
                    content: "Malformed selection", 
                    components: [], 
                    ephemeral: true 
                });
        }
    }
};