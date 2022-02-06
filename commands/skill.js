const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const { Text, SelectMenu, ItemType } = require('../utils');

const Skill = require('../database/skill');

async function get_skills(name) {
    let skills = await Skill.find({
        name: new RegExp((name ? name.toLowerCase() : ''))
    })
    .sort({'name': 'asc'})
    .lean();

    skills.forEach((skill) => skill.item_type = ItemType.skill);

    return skills;
}

function create_skill_embed(skill) {
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(Text.titleCase(skill.name))
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
            .setRequired(false);
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

        const select_menu = SelectMenu.create(this.data.name, skills, 0, skill_name);

        return interaction.reply({ 
            content: 'Multiple skills found!', 
            components: [select_menu] 
        });
    },
    async select_handler(interaction) {

        const [item_type, item_id, opt] = SelectMenu.extract(interaction.values[0]);

        switch(item_type) {
            case ItemType.skill:
                return interaction.update({ 
                    embeds: [create_skill_embed(await Skill.findById(item_id).lean())], 
                    content:"Skill found", 
                    ephemeral: false 
                });
            
            case ItemType.page:
                const skills = await get_skills(opt);
                
                const select_menu = SelectMenu.create(this.data.name, skills, parseInt(item_id), opt);

                return interaction.update({ 
                    content: 'Multiple skills found!', 
                    components: [select_menu] 
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