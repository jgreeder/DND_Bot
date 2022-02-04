const db = require('../connection')
const Weapon = require('../weapon');


let weapon_list = require('../../DND_Docs/weapons.json');

for (let c in weapon_list) {
    let t = weapon_list[c];

    let ra = "Normal Range: " + t.range.normal + " ft";
    if (t.range.long){
        ra += "\n" + "Long Range: " + t.range.long + " ft";
    }

    if (t.throw_range) {
        ra += "\n" + "Thrown Range: " + t.throw_range.normal + " ft";
    }

    let cost = t.cost.quantity.toString() + " " + t.cost.unit;

    let prop = "";
    if (t.properties.length > 0)
        t.properties.forEach(p => prop += p.name + ', ');

    prop = prop.substr(0, prop.length-2);

    console.log(prop);

    let speci = null;
    if (t.special) {
        speci = "Special: " + t.special;
    }
    let hand2 = null;
    if (t["2h_damage"]){
        hand2 = "Damage Dice: " + t["2h_damage"].damage_dice + '\n';
        hand2 += "Damage Type: " + t["2h_damage"].damage_type;
    }

    data = { "name" : t.name.toLowerCase(),
             "category" : t.weapon_category,
             "weapon_range":   t.weapon_range,
             "cost":           cost,
             "damage_dice":    t.damage_dice,
             "damage_type":    t.damage_type,
             "range":          ra,
             "weight":         t.weight,
            }

    if (speci)
        data["special"] = speci;
    if (prop)
        data["properties"] = prop;
    if (hand2)
        data["hand_2"] = hand2;

    let weapon = new Weapon(data);

    weapon.save(function (err, weapon) {
        if (err) return console.error(err);
    });
}
