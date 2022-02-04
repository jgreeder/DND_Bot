const db = require('../connection')
const Spell = require('../spell');

const spell_list = require('../../DND_Docs/spells_full.json');

for (const spell of spell_list) {
    let desc = spell.desc.join(', ');
    if (spell.higher_level){
        desc += '\n\n' + spell.higher_level.join(' ');
    }

    let components = spell.components.join(', ');
    if (spell.material){
        components += ' (' + spell.material + ')';
    }
    let duration = spell.duration;
    if (spell.concentration){
        duration = 'Concentration, ' + duration;
    }

    const classes = spell.classes.map((cl) => {
        return cl.name;
    }).join('\n');

    const new_spell = new Spell({
        name:           spell.name.toLowerCase(),
        casting_time:   spell.casting_time,
        components:     components,
        desc:           desc,
        duration:       duration,
        level:          spell.level,
        range:          spell.range,
        school:         spell.school.name,
        classes:        classes
    })

    new_spell.save(function (err, spell) {
        if (err) return console.error(err);
    });
}