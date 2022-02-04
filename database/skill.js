const mongoose = require('mongoose');

const Skill = new mongoose.Schema({
    name:           String,
    desc:           String,
});

module.exports = mongoose.model('skills', Skill);