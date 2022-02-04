const mongoose = require('mongoose');

const MagicItem = new mongoose.Schema({
    name:           String,
    cost:           String,
    properties:     String,
    desc:           [String]
});

module.exports = mongoose.model('magicItems', MagicItem);