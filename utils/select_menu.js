const { ItemType } = require('./item_types');
const { titleCase } = require('./text');

const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');


const PageType = {
    next: "next",
    prev: "previous"
}

class Page {
    constructor(page_type, page_num, opt) {
        this.label = `${titleCase(page_type)} page.`;
        this.description = `Continue to ${page_type}`;
        this.value = format(ItemType.page, page_num, opt);
    }
}

// Select box format for retriving data
// ItemType # ItemId [# PageNum]
function format(item_type, item_id, opt=null) {
    if (opt) {
        return `${item_type}#${Math.max(parseInt(item_id), 0)}#${opt}`;
    }
    return `${item_type}#${item_id}`;
}

// Follows format above
function extract(form) {
    const s = form.split("#");
    if (s.length == 2) {
        return [s[0], s[1], null];
    }
    return s;
}


function create_select_options(items, page, query) {
    let options = items.map((item) => {
        return { label: titleCase(item.name), description: null, value: format(item.item_type, item._id.toHexString())}
    }).slice(page*25);

    if (options.length >= 25) {
        if (page > 0) {
            options.unshift(new Page(PageType.prev, page-1, query));
        }

        options = options.slice(0, 24);
        options.push(new Page(PageType.next, page+1, query));
    }
    return options;
}

function create_select_menu(name, items, page, query) {
    const options = create_select_options(items, page, query);
    const select_menu = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(name)
                .setPlaceholder('Nothing selected')
                .addOptions(options)
        );
    return select_menu;
}

function create_encounter_options(encounters, page) {
    let options = encounters.map((encounter) => {
        return { label: titleCase(encounter.name), description: null, value: format(ItemType.encounter, encounter.id)}
    }).slice(page*25);

    // if (options.length >= 25) {
    //     if (page > 0) {
    //         options.unshift(new Page(PageType.prev, page-1, ''));
    //     }

    // }
    return options;
}

function create_encounter_menu(name, encounters, page) {
    const options = create_encounter_options(encounters, page);
    const select_menu = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(name)
                .setPlaceholder('Nothing selected')
                .addOptions(options)
        );
    return select_menu;
}

module.exports.create = create_select_menu;
module.exports.encounters = create_encounter_menu;
module.exports.extract = extract;