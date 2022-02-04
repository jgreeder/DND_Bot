const mongoose = require('mongoose');

const Ability = new mongoose.Schema({
    name:           String,
    desc:           String,
    abilityScore:   String
});

module.exports = mongoose.model('abilites', Ability);