const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

const { titleCase, select_format, format_extract, ItemType } = require('../util')

const Weapon = require('../database/weapon');
const MagicItem = require('../database/magic_item');

const COLORS = {
    "common":   "#000000",
    "uncommon": "#7CFC00",
    "rare":     "#0099ff",
    "very rare":"#FF00FF",
    "legendary":"#FF8C00"
}

function create_magic_embed(magic_item) {
    let color = "#FF8C00";
    let rarities = Object.keys(COLORS)
    for (let rarity of rarities){
        if (magic_item.properties.includes(rarity)){
            color = COLORS[rarity];
        }
    }

    const embed = new MessageEmbed()
        .setColor(color)
        .setTitle(titleCase(magic_item.name))
        .setDescription(`Cost: ${magic_item.cost}`)
        .addFields(
            { name: 'Properties', value: magic_item.properties},
        );
    for (let i in magic_item.desc) {
        embed.addField('\u200B', magic_item.desc[i]);
    }
    return embed;
}

function create_weapon_embed(weapon) {
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(titleCase(weapon.name))
        .setDescription(`Cost: ${weapon.cost}`)
        .addFields(
            { name: 'Category',         value: weapon.category, inline:true},
            { name: 'Range',            value: weapon.weapon_range, inline:true},
            { name: '\u200B',           value: '\u200B' },
            { name: 'Damage Dice',      value: weapon.damage_dice, inline:true},
            { name: 'Damage Type',      value: weapon.damage_type, inline:true},
            { name: 'Range',            value: weapon.range},
            { name: 'Weight',           value: String(weapon.weight)},
            { name: 'Properties',       value: weapon.properties}
        );
    return embed;
}

async function get_all(name) {
    let weapons = await Weapon.find({'name': new RegExp(name.toLowerCase())})
    .sort({'name':'asc'})
    .lean()
    
    weapons.forEach(weap => weap["item_type"] = ItemType.weapon);

    let magic_items = await MagicItem.find({'name': new RegExp(name.toLowerCase())})
            .sort({'name': 'asc'})
            .lean()
    magic_items.forEach(mi => mi["item_type"] = ItemType.magic);

    return weapons.concat(magic_items);
}



module.exports = {
    data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Get description of a condition')
    .addStringOption(option => 
        option = option.setName('item_name')
        .setDescription('name of item')
        .setRequired(true)
    ),
    async execute(interaction) {
        const opt = interaction.options.getString('item_name');

        const items = await get_all(opt);        

        if (items.length == 1) {
            return interaction.reply({
                embeds: [((items[0].item_type === ItemType.magic ? create_magic_embed(items[0]) : create_weapon_embed(items[0])))],
                ephemeral: false
            });
        } 
        if (items.length == 0) {
            return interaction.reply({
                content: `Failed to find item: ${opt}`,
                ephemeral: true
            });
        }

        let options = items.map((item) => {
            return { label: titleCase(item.name), description: null, value: select_format(item.item_type, item._id.toHexString())}
        });

        if (options.length > 25) {
            options = options.slice(0, 24);
            options.push({label: "Next page", description: "Continue to next page", value: select_format(ItemType.next_page, 1, opt)})
        }

        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(this.data.name)
					.setPlaceholder('Nothing selected')
					.addOptions(options)
			);

        return interaction.reply({ content: 'Multiple items found!', components: [row] });
    },
    
    async select_handler(interaction) {

        const [item_type, item_id, opt] = format_extract(interaction.values[0])

        // const selection = .split('#');
        // const item_type = selection[0];
        // const item_id = selection[1];

        let embed = null
        switch(item_type) {
            case ItemType.weapon:
                embed = create_weapon_embed(await Weapon.findById(item_id).lean());
                break;

            case ItemType.magic:
                embed = create_magic_embed(await MagicItem.findById(item_id).lean());
                break;

            case ItemType.next_page:
                // const opt = selection[2];
                const items = await get_all(opt);

                let options = items.map((item) => {
                    return { label: titleCase(item.name), description: null, value: select_format(item.item_type, item._id.toHexString()) }
                }).slice(parseInt(item_id)*24);

                if (options.length > 25) {
                    if (parseInt(item_id) > 0)
                        options.unshift({label: "Previous page", description: "Continue to previous page", value: select_format(ItemType.next_page, parseInt(item_id)-1, opt)});
                        options = options.slice(0, 24);
                    options.push({label: "Next page", description: "Continue to next page", value: select_format(ItemType.next_page, parseInt(item_id)+1, opt)});
                }

                const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(this.data.name)
                        .setPlaceholder('Nothing selected')
                        .addOptions(options)
                );
                return interaction.update({ content: 'Multiple items found!', components: [row] });


            default:
                return interaction.update({content: "Malformed selection", components: [], ephemeral: true });
        }

        return interaction.update({ embeds: [embed], content:" ", ephemeral: false });
    }
}