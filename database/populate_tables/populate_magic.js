const MagicItem = require('../magic_item');

const db = require('../connection');

async function add_items(item_set) {
    for (const item of item_set) {
        const property = item.desc[0];
        const description = item.desc.slice(1);

        console.log(item.name);

        const magic_item = new MagicItem({
            name: item.name.toLowerCase(),
            properties: property,
            desc: description,
            cost: item.cost
        });

        await magic_item.save();
    }
}

add_items(require('../../DND_Docs/magic_items_better.json'))
    .then(console.log("Added normal magic items"))
    .catch("Error adding normal magic items");

add_items(require('../../DND_Docs/magic_items_xge.json'))
    .then(console.log("Added XGE magic items"))
    .catch("Error adding XGE magic items");