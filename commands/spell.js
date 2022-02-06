const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// const { titleCase, select_format, format_extract, ItemType, Page, PageType } = require('../util')

const { Text, SelectMenu, ItemType } = require('../utils');

const Spell = require('../database/spell');


async function get_spells(name) {
    let spells = await Spell.find({
        name: new RegExp((name ? name.toLowerCase() : ''))
    })
    .sort({'name': 'asc'})
    .lean();

    spells.forEach((spell) => spell.item_type = ItemType.spell);

    return spells;
}

function create_spell_embed(spell) {
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(Text.titleCase(spell.name))
        .setDescription(spell.desc)
        .addFields(
            { name: 'Casting Time', value: spell.casting_time},
            { name: 'Components',   value: spell.components},
            { name: 'Duration',     value: spell.duration},
            { name: 'Level',        value: String(spell.level)},
            { name: 'Range',        value: spell.range},
            { name: 'School',       value: spell.school},
            { name: 'Classes',      value: spell.classes}
        );

    return embed;
}


module.exports = {
    data: new SlashCommandBuilder()
    .setName('spell')
    .setDescription('Get spell stats')
    .addStringOption(option => {
            option = option.setName('spell_name')
            .setDescription('Name of spell')
            .setRequired(true);
            return option;
        }
    ),
    async execute(interaction) {
        const spell_name = interaction.options.getString('spell_name');

        const spells = await get_spells(spell_name);

        if (spells.length == 1) {
            return interaction.reply({
                embeds: [create_spell_embed(spells[0])],
                ephemeral: false
            });
        }

        if (spells.length == 0) {
            return interaction.reply({
                content: `Failed to find spells with: ${spell_name}`,
                ephemeral: true
            });
        }

        const select_menu = SelectMenu.create(this.data.name, spells, 0, spell_name);

        return interaction.reply({ 
            content: 'Multiple spells found!', 
            components: [select_menu]
        });
    },
    async select_handler(interaction) {
        const [item_type, item_id, opt] = SelectMenu.extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.spell:
                return interaction.update({ 
                    embeds: [create_spell_embed(await Spell.findById(item_id).lean())], 
                    content:"Spell found", 
                    ephemeral: false 
                });

            case ItemType.page:
                const spells = await get_spells(opt);

                const select_menu = SelectMenu.create(this.data.name, spells, parseInt(item_id), opt);

                return interaction.update({ 
                    content: 'Multiple spells found!', 
                    components: [select_menu] 
                });

            default:
                return interaction.update({content: "Malformed selection", components: [], ephemeral: true });
        }
    }
};