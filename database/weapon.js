const mongoose = require('mongoose');

const Weapon = new mongoose.Schema({
    name:           String,
    category:       String,
    weapon_range:   String,
    cost:           String,
    damage_dice:    String,
    damage_type:    String,
    range:          String,
    weight:         Number,
    properties:     String,
    special:        String,
    hand_2:         String
});

module.exports = mongoose.model('weapons', Weapon);