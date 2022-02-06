const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const {ItemType, SelectMenu, Text} = require('../utils');


const Monster = require('../database/monster');

async function get_monsters(name) {
    let monsters = await Monster.find({
        name: new RegExp((name ? name.toLowerCase() : ''))
    })
    .sort({'name': 'asc'})
    .lean();

    monsters.forEach((monster) => monster.item_type = ItemType.monster);

    return monsters;
}

function create_monster_embed(monster) {

    let fields = [];
    for (const [key, value] of Object.entries(monster)) {
        if (key.startsWith('_')) continue;
        if (key === 'name' || key === 'type' || value === '') continue

        fields.push({name: Text.titleCase(key.split('_').join(' ')), value: String(value)});
    }

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(Text.titleCase(monster.name))
        .setDescription(Text.titleCase(monster.type))
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

        const row = SelectMenu.create(this.data.name, monsters, 0, monster_name);

        return interaction.reply({ 
            content: 'Multiple monsters found!', 
            components: [row] 
        });
    },
    async select_handler(interaction) {

        const [item_type, item_id, opt] = SelectMenu.extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.monster:
                return interaction.update({ 
                    embeds: [create_monster_embed(await Monster.findById(item_id).lean())], 
                    content:"Monster found", 
                    ephemeral: false 
                });
            
            case ItemType.page:
                const monsters = await get_monsters(opt);
        
                let row = SelectMenu.create(this.data.name, monsters, parseInt(item_id), opt);

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