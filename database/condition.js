const mongoose = require('mongoose');

const Condition = new mongoose.Schema({
    name:           String,
    desc:           String
});

module.exports = mongoose.model('conditions', Condition);