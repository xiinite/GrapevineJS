var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = mongoose.Schema.Types.Mixed;

var attr = new Schema({name: String, val: Number});

var discipline = new Schema({path: String, name: String, level: String, number: Number});
var ritual = new Schema({path: String, name: String, level: String});

var ability = new Schema({name: String, note: String, rating: Number});
var background = new Schema({name: String, note: String, rating: Number});
var equipment = new Schema({name: String, note: String, rating: Number});
var misc = new Schema({name: String, note: String, rating: Number});
var derangement = new Schema({name: String, note: String, rating: Number});

var bloodbond = new Schema({level: String, character: String, note: String});

var merit = new Schema({name: String, cost: Number});
var flaw = new Schema({name: String, cost: Number});

var xphistory = new Schema({date: Date, change: Number, reason: String});
var note = new Schema({note: String});
var status = new Schema({name: String, statustype: String, rating: Number});

module.exports = {
    'Character': mongoose.model('character', {
        id: {unique: true, type: String},
        charactertype: {type: String},
        name: {type: String},
        googleId: {type: String},
        player: {type: Mixed},
        chronicle: {type: Mixed},
        concept: {type: String},
        background: {type: String},
        exotic: {type: Number},
        state: {type: String},
        experience: {
            unspent: String,
            total: String
        },
        started: {type: Date},
        created: {type: Date},
        modified: {type: Date},
        clan: {type: String},
        sect: {type: String},
        coterie: {type: String},
        generation: {type: Number},
        title: {type: String},
        sire: {type: String},
        nature: {type: String},
        demeanor: {type: String},
        bloodpool: {
            max: Number,
            current: Number
        },
        willpower: {
            max: Number,
            current: Number
        },
        path: {
            name: String,
            rating: Number
        },
        conscience: {
            name: String,
            rating: Number
        },
        selfcontrol: {
            name: String,
            rating: Number
        },
        courage: {
            name: String,
            rating: Number
        },
        aura: {type: Number},
        attributes: {
            physical: [attr],
            tphysical: Number,
            social: [attr],
            tsocial: Number,
            mental: [attr],
            tmental: Number,
            negativephysical: [attr],
            tnegativephysical: Number,
            negativesocial: [attr],
            tnegativesocial: Number,
            negativemental: [attr],
            tnegativemental: Number
        },
        abilities: {type: [ability]},
        disciplines: {type: [discipline]},
        rituals: {type: [ritual]},
        status: {type: [status]},
        backgrounds: {type: [background]},
        influences: {type: [background]},
        misc: {type: [misc]},
        derangements: {type: [derangement]},
        bloodbonds: {type: [bloodbond]},
        merits: {type: [merit]},
        flaws: {type: [flaw]},
        healthlevels: {type: Mixed},
        equipment: {type: [equipment]},
        notes: {type: [note]},
        experiencehistory: {type: [xphistory]},
        modificationhistory: {type: Array},
        freetraits: {type: Number}
    }),
    'Chronicle': mongoose.model('chronicle', {
        id: {type: String},
        name: {type: String},
        description: {type: String},
        admins: {type: Array},
        players: {type: Array},
        playerDocs: {type: Array},
        administrators: {type: Array},
        characters: {type: Array},
        email: {type: String}
    }),
    'User': mongoose.model('user', {
        provider: {type: String},
        displayName: {type: String},
        name: {type: JSON},
        emails: {type: Array},
        _raw: {type: String},
        _json: {type: JSON},
        googleId: {type: String},
        isSuperAdmin: {type: Boolean},
        isAdmin: {type: Boolean},
        chronicles: {type: Array},
        stylesheet: {type: String}
    }),
    'DowntimePeriod': mongoose.model('downtimeperiod', {
        openTo: {type: Date},
        chronicleId: {type: String},
        id: {unique: true, type: String},
        openFrom: {type: Date}
    }),
    'Downtime': mongoose.model('downtime', {
        id: {unique: true, type: String},
        downtimePeriod: {type: String},
        characterid: {type: String},
        actions: {type: Mixed},
        response: {type: Mixed}
    }),
    'Event': mongoose.model('event', {
        id: {unique: true, type: String},
        chronicleid: {type: String},
        venue: {type: String},
        date: {type: Date},
        players: {type: Array},
        characters: {type: Array},
        xpawarded: {type: Boolean}
    }),
    'Gametype': mongoose.model('gametype',
        {
            id: {unique: true, type: String},
            parentid: {type: String},
            parent: {type: Mixed},
            name: {type: String},
            description: {type: String},
            code: {type: String}
        })
};