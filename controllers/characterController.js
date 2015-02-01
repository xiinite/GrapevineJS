var model = require('../models/Character.js');
var uuid = require('node-uuid');
var fs = require('fs');
var xml2js = require('xml2js');
var dt = require('../bin/datetime.js');
var importer = require('../bin/importlogic.js');

var ViewTemplatePath = 'character';
var tmpDir = 'tmp';

var findByDate = function(collection, _date, cb){
    var coll = collection.slice( 0 ); // create a clone

    (function _loop( data ) {
        var date;
        if (typeof data.date == 'string' || data.date instanceof String){
            date = new Date(data.date);
        }else
        {
            date = data.date;
        }
        if( date.toUTCString() === _date ) {
            cb.apply( null, [ data ] );
        }
        else if( coll.length ) {
            setTimeout( _loop.bind( null, coll.shift() ), 25 );
        }
    }( coll.shift() ));
};
function CleanJSONQuotesOnKeys(json) {
    return json.replace(/"(\w+)"\s*:/g, '$1:');
}
module.exports = {
    'index': function (req, res, next) {
        if (!req.user.isSuperAdmin && !req.user.isAdmin) {
            res.json("forbidden");
            return;
        }
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'all': function (req, res, next) {
        var where = {};
        if (!req.user.isSuperAdmin) {
            var chronicleIds = [];
            for (var i = 0; i < req.user.chronicles.length; i++) {
                chronicleIds.push(req.user.chronicles[i].id)
            }
            where =
            {
                chronicle: {"$in": chronicleIds}
            };
            model.list(where, function (err, result) {
                res.json(result);
            })
        }
        else {
            model.list({}, function (err, result) {
                res.json(result);
            });
        }
        /*if (!req.user.isSuperAdmin) {
         res.json("forbidden");
         return;
         }
         model.all(function (err, result) {
         res.json(result);
         });*/
    },
    'show': function (req, res, next) {
        if (req.params.id) {
            model.find({
                "id": req.params.id
            }, function (err, result) {
                var character = result[0];

                var out = {
                    user: req.user,
                    character: character
                };
                res.render(ViewTemplatePath + "/show", out);
            });
        }
    },
    'edit': function (req, res, next) {
        if (req.params.id) {
            var out = {
                user: req.user,
                characterid: req.params.id
            };
            res.render(ViewTemplatePath + "/edit", out);
        }
    },
    'update': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                var char = result[0];
                var user = req.user || {displayName: "Anonymous"};
                if (req.user.isSuperAdmin || result[0].chronicle.admins.indexOf(user.googleId) > -1) {
                    var previousversion = JSON.parse(JSON.stringify(result[0]));
                    var modHistory = [];
                    for (var i = 0; i < result[0].modificationhistory.length; i++) {
                        modHistory.push(result[0].modificationhistory[i]);
                    }
                    var fields = req.body.fields;
                    var clone = JSON.stringify(fields);
                    modHistory.push({
                        fields: clone,
                        date: new Date(),
                        user: {googleId: req.user.googleId, name: req.user.displayName},
                        previousVersion: previousversion
                    });
                    fields.modificationhistory = modHistory;
                    fields.modified = new Date();
                    /*for(var key in fields)
                    {
                        char[key] = fields[key];
                        console.log(key + ": " + char[key]);
                        char.markModified(key);
                    }
                    char.save(function(err)
                    {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            res.json("ok");
                        }                        
                    });*/
                    
                    model.update(req.body.id, fields, function (err) {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            res.json("ok");
                        }
                    });
                }
                else {
                    res.json("forbidden");
                }
            });
        }
    },
    'find': function (req, res, next) {
        if (req.params.id) {
            model.find({
                "id": req.params.id
            }, function (err, result) {

                if (req.user.isSuperAdmin || result[0].chronicle.admins.indexOf(user.googleId) > -1) {

                    var character = result[0];

                    res.json(character);
                }
                else {
                    res.json("forbidden");
                }
            });
        }
    },
    'revert': function (req, res, next){
        if (req.body.id && req.body.date) {
            model.find({"id": req.body.id}, function (err, result) {
                findByDate(result[0].modificationhistory, new Date(req.body.date).toUTCString(), function( data ) {
                    var oldVersion = JSON.parse(JSON.stringify(data.previousVersion));
                    delete oldVersion._id;
                    model.update(req.body.id, oldVersion, function (err) {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            res.json("ok");
                        }
                    });
                });
            });
        };
    },
    'clear': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        model.clear(function () {
            res.json('ok');
        });
    },
    'import': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        if (req.params.chronicleId && req.files['files[]']) {
            var file = req.files['files[]'];
            var parser = new xml2js.Parser();

            parser.addListener('end', function (result) {
                importer.importgrapevine(result, req.params.chronicleId, function (err, result) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    if (!err) res.json(result);
                });
            });

            fs.readFile(tmpDir + '/' + file.name, function (err, data) {
                parser.parseString(data.toString("binary"));
            });
        }
    },
    'wizard': function (req, res, next) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/wizard", out);
    },
    'export': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        model.all(function (err, result) {
            if (err) {
                res.json(err);
                return;
            }

            var xml = '<?xml version="1.0"?>\n';
            xml += '<grapevine version="3" chronicle="Exported" randomtraits="7,5,3,5,5,5,5" menupath="Grapevine Menus.gvm" size="224">\n';
            xml += '    <usualplace>\n';
            xml += '    </usualplace>\n';
            xml += '    <description>\n';
            xml += '    </description>\n';
            xml += '    <calendar lastmodified="01/01/2014 00:00:00">\n';
            xml += '    </calendar>\n';

            xml += '            <award use="XP" name="Attendance" type="0" change="1" reason="Attendance"/>\n';
            xml += '            <award use="PP" name="Bookkeeping" type="0" change="1" reason="Bookkeeping"/>\n';
            xml += '            <award use="XP" name="Costuming" type="0" change="1" reason="Costuming"/>\n';
            xml += '            <award use="XP" name="Downtime Activities" type="0" change="1" reason="Downtime Activities"/>\n';
            xml += '            <award use="XP" name="First Night" type="0" change="1" reason="First Night"/>\n';
            xml += '            <award use="XP" name="Good Roleplaying" type="0" change="1" reason="Good Roleplaying"/>\n';
            xml += '            <award use="XP" name="Leadership" type="0" change="1" reason="Leadership"/>\n';
            xml += '            <award use="PP" name="Narrating" type="0" change="1" reason="Narrating"/>\n';
            xml += '            <award use="PP" name="Setup/Cleanup" type="0" change="1" reason="Setup/Cleanup"/>\n';
            xml += '            <award use="PP" name="Storytelling" type="0" change="1" reason="Storytelling"/>\n';
            xml += '            <template name="Action and Rumor Report" text="Templates\\Text\\Action and Rumor Report.txt" rtf="D:\\Ce\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Action and Rumor Report.rtf" html="Templates\\HTML\\Action and Rumor Report.html"/>\n';
            xml += '            <template name="Changeling Character Sheet" sheet="yes" text="Templates\\Text\\Changeling.txt" rtf="Templates\\RTF\\Changeling.rtf" html="Templates\\HTML\\Changeling.html"/>\n';
            xml += '            <template name="Character Equipment" text="Templates\\Text\\Character Equipment.txt" rtf="Templates\\RTF\\Character Equipment.rtf" html="Templates\\HTML\\Character Equipment.html"/>\n';
            xml += '            <template name="Character Roster" text="Templates\\Text\\Character Roster.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Character Roster.rtf" html="Templates\\HTML\\Character Roster.html"/>\n';
            xml += '            <template name="Demon Character Sheet" sheet="yes" text="Templates\\Text\\Demon.txt" rtf="Templates\\RTF\\Demon.rtf" html="Templates\\HTML\\Demon.html"/>\n';
            xml += '            <template name="Experience History" text="Templates\\Text\\Experience History.txt" rtf="Templates\\RTF\\Vampire.rtf" html="Templates\\HTML\\Experience History.html"/>\n';
            xml += '            <template name="Fera Character Sheet" sheet="yes" text="Templates\\Text\\Fera.txt" rtf="Templates\\RTF\\Fera.rtf" html="Templates\\HTML\\Fera.html"/>\n';
            xml += '            <template name="Game Calendar" text="Templates\\Text\\Game Calendar.txt" rtf="Templates\\RTF\\Game Calendar.rtf" html="Templates\\HTML\\Game Calendar.html"/>\n';
            xml += '            <template name="Hunter Character Sheet" sheet="yes" text="Templates\\Text\\Hunter.txt" rtf="Templates\\RTF\\Hunter.rtf" html="Templates\\HTML\\Hunter.html"/>\n';
            xml += '            <template name="Influence Report" text="Templates\\Text\\Influence Report.txt" html="Templates\\HTML\\Influence Report.html"/>\n';
            xml += '            <template name="Item Cards" text="Templates\\Text\\Item Cards.txt" rtf="Templates\\RTF\\Item Cards.rtf" html="Templates\\HTML\\Item Cards.html"/>\n';
            xml += '            <template name="Kuei-Jin Character Sheet" sheet="yes" text="Templates\\Text\\Kuei-Jin.txt" rtf="Templates\\RTF\\Kuei-Jin.rtf" html="Templates\\HTML\\Kuei-Jin.html"/>\n';
            xml += '            <template name="Location Cards" text="Templates\\Text\\Location Cards.txt" rtf="Templates\\RTF\\Location Cards.rtf" html="Templates\\HTML\\Location Cards.html"/>\n';
            xml += '            <template name="Mage Character Sheet" sheet="yes" text="Templates\\Text\\Mage.txt" rtf="Templates\\RTF\\Mage.rtf" html="Templates\\HTML\\Mage.html"/>\n';
            xml += '            <template name="Master Action Report" text="Templates\\Text\\Master Action Report.txt" rtf="Templates\\RTF\\Master Action Report.rtf" html="Templates\\HTML\\Master Action Report.html"/>\n';
            xml += '            <template name="Master Rumor Report" text="Templates\\Text\\Master Rumor Report.txt" rtf="Templates\\RTF\\Master Rumor Report.rtf" html="Templates\\HTML\\Master Rumor Report.html"/>\n';
            xml += '            <template name="Merits and Flaws Report" text="Templates\\Text\\Merits and Flaws Report.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Merits and Flaws Report.rtf" html="Templates\\HTML\\Merits and Flaws Report.html"/>\n';
            xml += '            <template name="Mortal Character Sheet" sheet="yes" text="Templates\\Text\\Mortal.txt" rtf="Templates\\RTF\\Mortal.rtf" html="Templates\\HTML\\Mortal.html"/>\n';
            xml += '            <template name="Mummy Character Sheet" sheet="yes" text="Templates\\Text\\Mummy.txt" rtf="Templates\\RTF\\Mummy.rtf" html="Templates\\HTML\\Mummy.html"/>\n';
            xml += '            <template name="Player Point History" text="Templates\\Text\\Player Point History.txt" rtf="Templates\\RTF\\Player Point History.rtf" html="Templates\\HTML\\Player Point History.html"/>\n';
            xml += '            <template name="Player Roster" text="Templates\\Text\\Player Roster.txt" rtf="Templates\\RTF\\Player Roster.rtf" html="Templates\\HTML\\Player Roster.html"/>\n';
            xml += '            <template name="Plot Report" text="Templates\\Text\\Plot Report.txt" rtf="Templates\\RTF\\Plot Report.rtf" html="Templates\\HTML\\Plot Report.html"/>\n';
            xml += '            <template name="Rote Cards" text="Templates\\Text\\Rote Cards.txt" rtf="Templates\\RTF\\Rote Cards.rtf" html="Templates\\HTML\\Rote Cards.html"/>\n';
            xml += '            <template name="Search Report" text="Templates\\Text\\Search Report.txt" rtf="Templates\\RTF\\Search Report.rtf" html="Templates\\HTML\\Search Report.html"/>\n';
            xml += '            <template name="Sign-In Sheet" text="Templates\\Text\\Sign-In Sheet.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Sign-In Sheet.rtf" html="Templates\\HTML\\Sign-In Sheet.html"/>\n';
            xml += '            <template name="Statistics Report" text="Templates\\Text\\Statistics Report.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Statistics Report.rtf" html="Templates\\HTML\\Statistics Report.html"/>\n';
            xml += '            <template name="Vampire Character Sheet" sheet="yes" text="Templates\\Text\\Vampire.txt" rtf="Templates\\RTF\\Vampire.rtf" html="Templates\\HTML\\Vampire.html"/>\n';
            xml += '            <template name="Vampire Status Report" text="Templates\\Text\\Vampire Status Report.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Vampire Status Report.rtf" html="Templates\\HTML\\Vampire Status Report.html"/>\n';
            xml += '            <template name="Various Character Sheet" sheet="yes" text="Templates\\Text\\Various.txt" rtf="Templates\\RTF\\Various.rtf" html="Templates\\HTML\\Various.html"/>\n';
            xml += '            <template name="Werewolf Character Sheet" sheet="yes" text="Templates\\Text\\Werewolf.txt" rtf="Templates\\RTF\\Werewolf.rtf" html="Templates\\HTML\\Werewolf.html"/>\n';
            xml += '            <template name="Wraith Character Sheet" sheet="yes" text="Templates\\Text\\Wraith.txt" rtf="Templates\\RTF\\Wraith.rtf" html="Templates\\HTML\\Wraith.html"/>\n';
            xml += '            <aprsettings personalactions="4" publicrumors="yes" influencerumors="yes" previousrumors="yes">\n';
            xml += '            <traitlist name="Actions" abc="no" display="0">\n';
            xml += '            <trait name="1"/>\n';
            xml += '            <trait name="2" val="3"/>\n';
            xml += '            <trait name="3" val="6"/>\n';
            xml += '            <trait name="4" val="10"/>\n';
            xml += '            <trait name="5" val="15"/>\n';
            xml += '            <trait name="6" val="21"/>\n';
            xml += '            <trait name="7" val="28"/>\n';
            xml += '            <trait name="8" val="36"/>\n';
            xml += '            <trait name="9" val="45"/>\n';
            xml += '            <trait name="10" val="55"/>\n';
            xml += '            </traitlist>\n';
            xml += '            <traitlist name="Backgrounds" abc="no" display="0">\n';
            xml += '            <trait name="Allies"/>\n';
            xml += '            <trait name="Contacts"/>\n';
            xml += '            <trait name="Retainers"/>\n';
            xml += '            </traitlist>\n';
            xml += '            </aprsettings>\n';

            result.forEach(function (char, i) {
                xml += '               <vampire name="' + char.name + '" nature="' + char.nature + '" demeanor="' + char.demeanor + '" clan="' + char.clan + '" sect="' + char.sect + '" sire="' + char.sire
                xml += '" generation="' + char.generation + '" blood="' + char.bloodpool.total + '" willpower="' + char.willpower.total + '" conscience="' + char.conscience + '" selfcontrol="' + char.selfcontrol
                xml += '" courage="' + char.courage + '" path="' + char.path.type + '" pathtraits="' + char.rating + '" physicalmax="12" player="" status="' + char.state + '" startdate="26/07/2014 19:03:37" npc="yes" lastmodified="23/10/2014 20:47:10">\n';
                xml += '                <experience unspent="' + char.experience.unspent + '" earned="' + char.experience.total + '">\n';

                char.experiencehistory.forEach(function (entry, j) {
                    xml += '                <entry date="01/01/2014" change="' + entry.change + '" type="0" reason="' + entry.reason + '" earned="1" unspent="1"/>\n';
                });

                xml += '                </experience>\n';


                xml += '               </vampire>\n';

            });

            xml += '</grapevine>'
            fs.writeFile('.\\tmp\\export.gv3', xml, {encoding: 'binary'}, function (err) {
                if (err) throw res.json(err);

                res.download('.\\tmp\\export.gv3');
            });
        });
    },
    'populate': function (req, res, next) {
        if (!req.user.isSuperAdmin) {
            res.json("forbidden");
            return;
        }
        model.clear(function (err) {
            model.insert({
                id: uuid.v4(),
                name: "Jozef van Gelderland",
                googleId: "114799359163510443499",
                chronicle: "67abf1a1-d331-4e18-8739-93895c7a639d",
                state: "Active",
                experience: {
                    total: 11,
                    unspent: 3
                },
                created: new Date(2013, 03, 21),
                modified: new Date(2014, 01, 25),
                clan: "Tremere",
                sect: "Camarilla",
                coterie: "",
                generation: 11,
                title: "Keeper of Elysium",
                sire: "",
                nature: "Monster",
                demeanor: "Survivor",
                bloodpool: {
                    total: 12,
                    current: 8
                },
                willpower: {
                    total: 4,
                    current: 3
                },
                path: {
                    type: "Humanity",
                    rating: 3
                },
                conscience: {
                    type: "Conscience",
                    rating: 2
                },
                selfcontrol: {
                    type: 'Self-Control',
                    rating: 4
                },
                courage: {
                    type: "Courage",
                    rating: 4
                },
                aura: 0,
                attributes: {
                    physical: ["Brutal", "Quick", "Resilient", "Rugged", "Though"],
                    social: ["Empathic", "Intimidating", "Persuasive"],
                    mental: ["Dedicated", "Disciplined", "Insightful", "Knowledgeable", "Observant", "Patient", "Rational", "Rational", "Vigilant"],
                    negativephysical: [],
                    negativesocial: [],
                    negativemental: []
                },
                abilities: [{
                    name: "Dodge",
                    rating: 1,
                    note: ""
                }, {
                    name: "Linguistics",
                    rating: 2,
                    note: "Duits, Engels"
                }, {
                    name: "Lore: Camarilla",
                    rating: 3,
                    note: ""
                }, {
                    name: "Lore: City",
                    rating: 1,
                    note: ""
                }, {
                    name: "Lore: Kindred",
                    rating: 1,
                    note: ""
                }, {
                    name: "Occult",
                    rating: 4,
                    note: ""
                }, {
                    name: "Survival",
                    rating: 1,
                    note: ""
                }

                ],
                disciplines: [{
                    path: "Protean",
                    name: "Eyes of the beast",
                    level: "basic",
                    number: 1
                }, {
                    path: "Thaumaturgy: Path of Blood",
                    name: "Taste for Blood",
                    level: "basic",
                    number: 1
                }, {
                    path: "Thaumaturgy: Path of Blood",
                    name: "Blood Rage",
                    level: "basic",
                    number: 2
                }, {
                    path: "Thaumaturgy: Lure of Flames",
                    name: "Hand of Flame",
                    level: "basic",
                    number: 1
                }, {
                    path: "Thaumaturgy: Lure of Flames",
                    name: "Flame Bolt",
                    level: "basic",
                    number: 2
                }, {
                    path: "Thaumaturgy: Lure of Flames",
                    name: "Wall of Fire",
                    level: "intermediate",
                    number: 3
                }, {
                    path: "Thaumaturgy: Lure of Flames",
                    name: "Engulf",
                    level: "intermediate",
                    number: 4
                }],
                rituals: [{
                    name: "Communicate with Kindred Sire",
                    level: "basic"
                }, {
                    name: "Defence of the Sacred Haven",
                    level: "basic"
                }, {
                    name: "Deflection of Wooden Doom",
                    level: "basic"
                }, {
                    name: "The Open Passage",
                    level: "basic"
                }, {
                    name: "Incorporeal Passage",
                    level: "intermediate"
                },],
                status: [{
                    name: "Honored"
                }],
                backgrounds: [{
                    name: "Generation",
                    rating: 2
                }, {
                    name: "Herd",
                    rating: 2
                }, {
                    name: "Resources",
                    rating: 3
                }],
                influences: [{
                    name: "Health",
                    rating: 1
                }, {
                    name: "Occult",
                    rating: 3
                }],
                misc: [{
                    name: "NPC",
                    rating: 1
                }],
                derangements: [],
                bloodbonds: [],
                boons: [],
                merits: [{
                    name: "Common Sense",
                    cost: 1
                }, {
                    name: "Magic Resistance",
                    cost: 2
                }],
                flaws: [{
                    name: "Bad Sight",
                    cost: 1
                }, {
                    name: "Cast No Reflection",
                    cost: 1
                }, {
                    name: "Repulsed by Garlic",
                    cost: 1
                }],
                healthlevels: {
                    healthy: 2,
                    bruised: 3,
                    wounded: 2,
                    incapacitated: 1,
                    torpor: 1,
                    spent: 0
                },
                equipment: [],
                notes: [{
                    value: "Storytelling NPC"
                }],
                experiencehistory: [{
                    date: new Date(2013, 06, 29),
                    change: 5,
                    reason: "Attendance"
                }, {
                    date: new Date(2013, 08, 23),
                    change: -1,
                    reason: "Purchase: Linguistics"
                }]
            }, function (err) {
                model.all(function (err, result) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    if (!err) res.json(result);
                });
            });
        });
    }
};
