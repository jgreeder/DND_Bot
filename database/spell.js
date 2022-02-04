const mongoose = require('mongoose');

const Spell = new mongoose.Schema({
    name:           String,
    casting_time:   String,
    components:     String,
    desc:           String,
    duration:       String,
    level:          Number,
    range:          String,
    school:         String,
    classes:        String
});

module.exports = mongoose.model('spells', Spell);