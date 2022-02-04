const db = require('../connection')
const Skill = require('../skill');

const skill_list = require('../../DND_Docs/skills.json');


for (let skill of skill_list) {
    let new_skill = new Skill({
        name: skill.name.toLowerCase(),
        desc: skill.desc.join('\n')
    });

    new_skill.save(function (err, skill) {
        if (err) return console.error(err);
    });
}