const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

const { titleCase, select_format, format_extract, ItemType } = require('../util')

const Skill = require('../database/skill');
const skill = require('../database/skill');

async function get_skills(name) {
    const skills = await Skill.find({
        name: new RegExp((name ? name.toLowerCase() : ''))
    })
    .sort({'name': 'asc'})
    .lean();

    return skills;
}

function create_skill_embed(skill) {
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(titleCase(skill.name))
        .setDescription(skill.desc);
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('skill')
    .setDescription('Get skill stats')
    .addStringOption(option => {
            option = option.setName('skill_name')
            .setDescription('Name of skill')
            .setRequired(true);
            return option;
        }
    ),
    async execute(interaction) {
        const skill_name = interaction.options.getString('skill_name');

        const skills = await get_skills(skill_name);

        if (skills.length == 1) {
            return interaction.reply({
                embeds: [create_skill_embed(skills[0])],
                ephemeral: false
            });
        }

        if (skills.length == 0) {
            return interaction.reply({
                content: `Failed to find skill with: ${skill_name}`,
                ephemeral: true
            });
        }

        let options = skills.map((skill) => {
            return { label: titleCase(skill.name), description: null, value: select_format(ItemType.skill, skill._id.toHexString())}
        });

        if (options.length > 25) {
            options = options.slice(0, 24);
            options.push(new Page(PageType.next, 1, skill_name));
        }

        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(this.data.name)
                .setPlaceholder('Nothing selected')
                .addOptions(options)
        );


        return interaction.reply({ 
            content: 'Multiple skills found!', 
            components: [row] 
        });
    },
    async select_handler(interaction) {

        const [item_type, item_id, opt] = format_extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.skill:
                return interaction.update({ 
                    embeds: [create_skill_embed(await Skill.findById(item_id).lean())], 
                    content:"Skill found", 
                    ephemeral: false 
                });
            
            case ItemType.page:
                const skills = await get_skills(opt);
                let options = skills.map((skill) => {
                    return { label: titleCase(skill.name), description: null, value: select_format(ItemType.skill, skill._id.toHexString())}
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
                    content: 'Multiple skills found!', 
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