const mongoose = require('mongoose');

const Monster = new mongoose.Schema({
    name:           String,
    size:           String,
    type:           String,
    subtype:        String,
    alignment:      String,
    armor_class:    Number,
    hit_points:     Number,
    hit_dice:       String,
    speed:          String,
    strength:       Number,
    dexterity:      Number,
    constitution:   Number,
    intelligence:   Number,
    wisdom:         Number,
    charisma:       Number,
    con_save:       Number,
    int_save:       Number
});

module.exports = mongoose.model('monsters', Monster);