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
    languages:      String,
    condition_immunities: String,
    senses:         String,
    challenge_rating: String
});

module.exports = mongoose.model('monsters', Monster);