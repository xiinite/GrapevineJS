var uuid = require('node-uuid');
var async = require('async');
var dt = require('../bin/datetime.js');
var vl = require('../bin/vampireLogic.js');
var model = require('../models/Character.js');

module.exports = {
    importgrapevine: function(json, chronicleId, callback){
        try{
            var characterList = [];
            for (var index in json.grapevine.vampire) {
                var vampire = json.grapevine.vampire[index];
                //var startDate = var split = enddate.split('/');
                var sParts = vampire.$.startdate.split(' ')[0].split('/');
                var lParts = vampire.$.lastmodified.split(' ')[0].split('/');
                var character = {
                    id: uuid.v4(),
                    name: vampire.$.name.toString("utf8"),
                    googleId: '',
                    chronicle: chronicleId,
                    state: vampire.$.status,
                    created: new Date(sParts[2], sParts[1], sParts[0]),
                    modified: new Date(lParts[2], lParts[1], lParts[0]),
                    clan: vampire.$.clan || "",
                    sect: vampire.$.sect || "",
                    coterie: vampire.$.coterie || "",
                    generation: parseInt(vampire.$.generation),
                    title: vampire.$.title || "",
                    sire: vampire.$.sire || "",
                    nature: vampire.$.nature || "",
                    demeanor: vampire.$.demeanor || "",
                    bloodpool: {
                        total: vl.calculateBloodpool(vampire.$.generation),
                        current: vampire.$.blood
                    },
                    path: {
                        type: vampire.$.path,
                        rating: vampire.$.pathtraits
                    },
                    conscience: {
                        type: "Conscience",
                        rating: vampire.$.conscience
                    },
                    selfcontrol: {
                        type: 'Self-Control',
                        rating: vampire.$.selfcontrol
                    },
                    courage: {
                        type: "Courage",
                        rating: vampire.$.courage
                    },
                    aura: 0,
                    willpower: {
                        total: vampire.$.willpower,
                        current: vampire.$.willpower
                    },
                    experience: {},
                    attributes: {
                        physical: [],
                        social: [],
                        mental: [],
                        negativephysical: [],
                        negativesocial: [],
                        negativemental: []
                    },
                    abilities: [],
                    disciplines: [],
                    rituals: [],
                    status: [],
                    backgrounds: [],
                    influences: [],
                    misc: [],
                    derangements: [],
                    bloodbonds: [],
                    boons: [],
                    merits: [],
                    flaws: [],
                    equipment: [],
                    notes: [],
                    experiencehistory: [],
                    healthlevels: {}

                };

                var vExp = vampire.experience[0];
                character.experience.total = vExp.$.earned;
                character.experience.unspent = vExp.$.unspent;
                for (var i in vExp.entry) {
                    var entry = vExp.entry[i];
                    var dateparts = entry.$.date.split(' ')[0].split("/");
                    character.experiencehistory.push({
                        date: new Date(dateparts[2], dateparts[1], dateparts[0]),
                        change: entry.$.change,
                        reason: entry.$.reason
                    });
                }

                for (var i in vampire.traitlist) {
                    var tl = vampire.traitlist[i];
                    switch (tl.$.name) {
                        case 'Physical':
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                character.attributes.physical.push(t.$.name);
                            }
                            break;
                        case 'Social':
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                character.attributes.social.push(t.$.name);
                            }
                            break;
                        case 'Mental':
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                character.attributes.mental.push(t.$.name);
                            }
                            break;
                        case "Negative Physical":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                character.attributes.negativephysical.push(t.$.name);
                            }
                            break;
                        case "Negative Social":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                character.attributes.negativesocial.push(t.$.name);
                            }
                            break;
                        case "Negative Mental":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                character.attributes.negativemental.push(t.$.name);
                            }
                            break;
                        case "Abilities":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                character.abilities.push({name: t.$.name, note: _note, rating: _rating});
                            }
                            break;
                        case "Influences":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                character.influences.push({name: t.$.name, note: _note, rating: _rating});
                            }
                            break;
                        case "Backgrounds":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                character.backgrounds.push({name: t.$.name, note: _note, rating: _rating});
                            }
                            break;
                        case "Miscellaneous":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                character.misc.push({name: t.$.name, note: _note, rating: _rating});
                            }
                            break;
                        case "Derangements":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                character.derangements.push({name: t.$.name, note: _note, rating: _rating});
                            }
                            break;
                        case "Disciplines":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                var path = t.$.name.split(':').slice()[0];
                                var name = t.$.name.split(':').slice(1).join(':').replace(/^\s+|\s+$/g, '');
                                character.disciplines.push({path: path, name: name, level: _note, number: 0});
                            }
                            break;
                        case "Status":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var name = t.$.name;
                                character.status.push({name: name});
                            }
                            break;
                        case "Rituals":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var level = t.$.name.split(':').slice()[0].toLowerCase();
                                var name = t.$.name.split(':').slice(1).join(':').replace(/^\s+|\s+$/g, '');
                                character.rituals.push({name: name, level: level})
                            }
                            break;
                        case "Merits":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _rating = 1;
                                if (t.$.val) _rating = t.$.val;
                                character.merits.push({name: t.$.name, cost: _rating});
                            }
                            break;
                        case "Flaws":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                if (t.$.val) _rating = t.$.val;
                                character.flaws.push({name: t.$.name, cost: _rating});
                            }
                            break;
                        case "Equipment":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                var _note = '';
                                var _rating = 1;
                                if (t.$.note) _note = t.$.note;
                                if (t.$.val) _rating = t.$.val;
                                character.equipment.push({name: t.$.name, note: _note, rating: _rating});
                            }
                            break;
                        case "Health Levels":
                            for (var y in tl.trait) {
                                var t = tl.trait[y];
                                if (t.$.val) _rating = t.$.val;
                                character.healthlevels[t.$.name.toLowerCase()] = _rating;
                            }
                            break;

                    }
                }

                characterList.push(character);
            }
            var toBeInsert = [];


            var calls = [];

            characterList.forEach(function (char, i) {
                calls.push(function (callback) {
                    model.find({name: char.name, chronicle: char.chronicle}, function (err, result) {
                        if (!err && result.length > 0) {
                            char.id = result[0].id;
                            model.update(result[0].id, char, function (err) {
                                if (err) {
                                    res.json(err);
                                }
                            })
                        }
                        else {
                            toBeInsert.push(char);
                        }
                        callback();
                    });
                })
            });
            async.parallel(calls, function () {
                model.insert(toBeInsert, function (err) {
                    if (err) {
                        callback(err);
                    }
                    model.all(callback);
                });
            });
        }catch (e)
        {
            throw e;
        }
    }
}