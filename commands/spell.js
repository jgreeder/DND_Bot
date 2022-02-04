const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

const { titleCase, select_format, format_extract, ItemType, Page, PageType } = require('../util')

const Spell = require('../database/spell');


async function get_spells(name) {
    const spells = await Spell.find({
        name: new RegExp((name ? name.toLowerCase() : ''))
    })
    .sort({'name': 'asc'})
    .lean();

    return spells;
}

function create_spell_embed(spell) {
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(titleCase(spell.name))
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

        let options = spells.map((spell) => {
            return { label: titleCase(spell.name), description: null, value: select_format(ItemType.spell, spell._id.toHexString())}
        });

        if (options.length > 25) {
            options = options.slice(0, 24);
            options.push(new Page(PageType.next, 1, spell_name));
        }

        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(this.data.name)
                .setPlaceholder('Nothing selected')
                .addOptions(options)
        );


        return interaction.reply({ 
            content: 'Multiple spells found!', 
            components: [row] 
        });
    },
    async select_handler(interaction) {
        const [item_type, item_id, opt] = format_extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.spell:
                return interaction.update({ 
                    embeds: [create_spell_embed(await Spell.findById(item_id).lean())], 
                    content:"Spell found", 
                    ephemeral: false 
                });

            case ItemType.page:
                const spells = await get_spells(opt);
                let options = spells.map((spell) => {
                    return { label: titleCase(spell.name), description: null, value: select_format(ItemType.spell, spell._id.toHexString())}
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
                    content: 'Multiple spells found!', 
                    components: [row] 
                });

            default:
                return interaction.update({content: "Malformed selection", components: [], ephemeral: true });
        }
    }
};