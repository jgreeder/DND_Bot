const ItemType = {
    weapon: "weapon",
    magic: "magic",
    next_page: "page",
    condition: "condition"
}


function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
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

module.exports.titleCase = titleCase;
module.exports.select_format = format;
module.exports.format_extract = extract;
module.exports.ItemType = ItemType;