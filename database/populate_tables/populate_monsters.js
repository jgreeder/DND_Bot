const Monster = require('../monster');

const db = require('../connection');

const monster_list = require('../../DND_Docs/monsters.json');

const props = [    
    "name",        
    "size",        
    "type",        
    "subtype",     
    "alignment",   
    "armor_class", 
    "hit_points",  
    "hit_dice",    
    "speed",       
    "strength",    
    "dexterity",   
    "constitution",
    "intelligence",
    "wisdom",      
    "charisma",
    "languages",
    "condition_immunities",
    "senses",
    "challenge_rating"
    // "constitution_save",
    // "intelligence_save",
]

for (const monster of monster_list) {
    // for (const prop of props) {
    //     if (!(prop in monster)){
    //         console.log(`${monster.name} has no: ${prop}`);
    //     }
    // }

    const new_monster = new Monster({
        name:           monster.name.toLowerCase(),
        size:           monster.size,
        type:           monster.type,
        subtype:        monster.subtype,
        alignment:      monster.alignment,
        armor_class:    monster.armor_class,
        hit_points:     monster.hit_points,
        hit_dice:       monster.hit_dice,
        speed:          monster.speed,
        strength:       monster.strength,
        dexterity:      monster.dexterity,
        constitution:   monster.constitution,
        intelligence:   monster.intelligence,
        wisdom:         monster.wisdom,
        charisma:       monster.charisma,
        languages:      monster.languages,
        condition_immunities: monster.condition_immunities,
        senses:         monster.senses,
        challenge_rating: monster.challenge_rating
    });

    new_monster.save(function (err, monster) {
        if (err) return console.error(err);
    });
}