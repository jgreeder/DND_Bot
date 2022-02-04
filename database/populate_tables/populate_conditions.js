const mongoose = require('mongoose');

const { database_ip, db_username, db_password } = require('../../config.json');

const Condition = require('../condition.js');

mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(database_ip, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user:db_username,
    pass:db_password,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});


let condition_list = require('../../DND_Docs/conditions.json');

for (let c in condition_list) {
    let t = condition_list[c];

    let condition = new Condition({
        name: t.name.toLowerCase(),
        desc: t.desc.join('\n')
    });

    condition.save(function (err, condition) {
        if (err) return console.error(err);
    });
}
