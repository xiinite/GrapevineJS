var model = require('../models/Character.js');
var cmodel = require('../models/Chronicle.js');
var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var dt = require('../bin/datetime.js');
var importer = require('../bin/importlogic.js');
var exporter = require('../bin/exportlogic.js');
var vl = require('../bin/vampirelogic.js');
var sec = require('../bin/securityhandler.js');
var mail = require('../bin/emailhandler.js');

var ViewTemplatePath = 'character';
var tmpDir = 'tmp';

var findByDate = function (collection, _date, cb) {
    var coll = collection.slice(0); // create a clone

    (function _loop(data) {
        var date;
        if (typeof data.date == 'string' || data.date instanceof String) {
            date = new Date(data.date);
        } else {
            date = data.date;
        }
        if (date.toUTCString() === _date) {
            cb.apply(null, [data]);
        }
        else if (coll.length) {
            setTimeout(_loop.bind(null, coll.shift()), 25);
        }
    }(coll.shift()));
};
var findByState = function (collection, _state, cb) {
    var coll = collection.slice(0); // create a clone
    var i = coll.length;
    while (i--) {
        var data = coll[i];
        var state = "";
        if(data.previousVersion !== null){
            state = data.previousVersion.state;
        }
        if (state === _state) {
            cb.apply(null, [data]);
            return;
        }
    }
    cb.apply(new Error("Not found"), null);
};
module.exports = {
    'index': function (req, res, next) {
        if (!req.user.isSuperAdmin && !req.user.isAdmin) {
            if (err) return next(new Error("forbidden"));
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
                if (err) return next(new Error(err));
                res.json(result);
            })
        }
        else {
            model.list({}, function (err, result) {
                if (err) return next(new Error(err));
                res.json(result);
            });
        }
    },
    'show': function (req, res, next) {
        if (req.params.id) {
            model.find({
                "id": req.params.id
            }, function (err, result) {
                if (err) return next(new Error(err));
                var character = result[0];

                var out = {
                    user: req.user,
                    character: character
                };
                if (["Rejected", "Concept"].indexOf(character.state) > -1) {
                    res.render(ViewTemplatePath + "/viewconcept", out);
                } else if (["Draft", "Background Approved"].indexOf(character.state) > -1) {
                    out = {
                        user: req.user,
                        characterid: character.id
                    };
                    res.render(ViewTemplatePath + "/assignfreebies", out);
                } else {
                    res.render(ViewTemplatePath + "/show", out);
                }
            });
        }
    },
    'lores': function (req, res, next) {
        if (req.params.id) {
            model.find({
                "id": req.params.id
            }, function (err, result) {
                if (err) return next(new Error(err));
                var character = result[0];

                var lores = [];

                character.abilities.forEach(function (ab) {
                    if (ab.name.indexOf("Lore: ") > -1) {

                        var lore = {
                            name: ab.name.replace("Lore: ", ""),
                            tabname: ab.name.replace("Lore: ", "").replace(":", "_").replace(" ", "_"),
                            html: ""
                        };
                        for (var ratingcount = 1; ratingcount <= ab.rating; ratingcount++) {
                            var filename = ab.name.replace("Lore: ", "").replace("Clan: ", "") + " " + ratingcount + ".html";
                            if (fs.existsSync("server-resources/METRevised/lores/" + filename)) {
                                var data = fs.readFileSync("server-resources/METRevised/lores/" + filename, {});
                                lore.html += data.toString("binary") + "\n";

                            }

                        }
                        lores.push(lore);
                    }
                });
                var out = {
                    user: req.user,
                    character: character,
                    lores: lores
                };
                res.render(ViewTemplatePath + "/lores", out);
            });
        }
    },
    'approve': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/approve", out);
    },
    'approvelist': function (req, res, next) {
        model.find({
            state: {$in: ["Approval Pending", "Background Submitted", "Final Approval Pending"]}, chronicle: {
                $in: req.user.chronicles.map(function (c) {
                    return c.id;
                })
            }
        }, function (err, result) {
            if (err) return next(new Error(err));
            res.json(result);
        });
    },
    'approveconcept': function (req, res, next) {
        model.find({id: req.body.id}, function (err, result) {
            if (!sec.checkAdmin(req, next, result[0].chronicle.id)) {
                return;
            }

            model.update(req.body.id, {state: req.body.state}, function (err) {
                if (err) return next(new Error(err));
                if (result[0].player.emails.length > 0) {
                    if (req.body.state == "Approved") {
                        mail.sendmail(result[0].player.emails[0].value, "Concept approved: " + result[0].name, "Your concept has been approved by storyteller " + req.user.displayName + ": "
                        + "\nName:" + result[0].name
                        + "\nClan: " + result[0].clan
                        + "\n" + result[0].concept);
                    } else if (req.body.state == "Rejected") {
                        var reason = "";
                        if (req.body.reason !== undefined) {
                            reason = "\nReason: " + req.body.reason.toString();
                        }
                        mail.sendmail(result[0].player.emails[0].value, "Concept rejected: " + result[0].name, "Your concept has been rejected by storyteller " + req.user.displayName.toString() + ": "
                        + reason.toString() + +"\nName:" + result[0].name.toString()
                        + "\nClan: " + result[0].clan.toString()
                        + "\n" + result[0].concept.toString());
                    }
                }
                return res.json("ok");

            });
        });
    },
    'concept': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/concept", out);
    },
    'submitconcept': function (req, res, next) {
        var char = vl.emptyCharacter(req.body.chronicle);
        char.googleId = req.user.googleId;
        char.name = req.body.name;
        char.clan = req.body.clan;
        char.sect = req.body.sect;
        char.concept = req.body.concept;
        char.state = "Concept";
        char.modificationhistory = [];
        char.modificationhistory.push({
            fields: "Created Concept",
            date: new Date(),
            user: {googleId: req.user.googleId, name: req.user.displayName},
            previousVersion: null
        });
        model.insert(char, function (err) {
            if (err) return next(new Error(err));
            res.json({id: char.id});
        });
    },
    'submitdraft': function (req, res, next) {
        var char = req.body.character;
        if (char.googleId == req.user.googleId && char.state == 'Concept') {
            delete char._id;
            delete char.__v;
            delete char.prototype;
            char.state = "Draft";
            char.player = null;
            char.chronicle = char.chronicle.id;

            char = vl.calculateClanAdvantage(char);
            char = vl.calculateChronicleAdvantage(char);
            char = vl.calculateStep4(char);
            char = vl.calculateFreeTraits(char);

            //Set a return point
            var previousversion = JSON.parse(JSON.stringify(char));
            previousversion.modificationhistory = null;
            char.modified = new Date();
            char.modificationhistory.push({
                fields: "Draft created",
                date: new Date(),
                user: {googleId: req.user.googleId, name: req.user.displayName},
                previousVersion: previousversion
            });
            model.update(char.id, char, function (err) {
                if (err) return next(new Error(err));
                res.json("ok");
            });
        } else if (char.googleId == req.user.googleId && char.state == "Draft") {
            delete char._id;
            delete char.__v;
            delete char.prototype;
            char.state = "Approval Pending";
            char.player = null;
            char.chronicle = char.chronicle.id;

            char = vl.calculateFinalDraft(char);

            //Set a return point
            var previousversion = JSON.parse(JSON.stringify(char));
            previousversion.modificationhistory = null;
            char.modified = new Date();
            char.modificationhistory.push({
                fields: "Draft created",
                date: new Date(),
                user: {googleId: req.user.googleId, name: req.user.displayName},
                previousVersion: previousversion
            });
            model.update(char.id, char, function (err) {
                if (err) return next(new Error(err));
                res.json("ok");


                if (req.user.emails.length > 0) {
                    mail.sendmail(req.user.emails[0].value, "Concept submitted: " + char.name, "Your concept has been submitted for approval: "
                    + "\nName:" + char.name
                    + "\nClan: " + char.clan
                    + "\n" + char.concept);
                }
                cmodel.find({id: char.chronicle}, function (err, result) {
                    if (err) return next(new Error(err));
                    var c = result[0];
                    if (c.email.length > 0) {
                        mail.sendmail(c.email, "Concept submitted: " + char.name, "A new concept is waiting for your approval: " +
                        "\nName:" + char.name
                        + "\nClan: " + char.clan
                        + "\nUser: " + req.user.displayName
                        + "\n" + char.concept);
                    }
                });
            });
        } else if (char.googleId == req.user.googleId && char.state == "Background Approved") {
            delete char._id;
            delete char.__v;
            delete char.prototype;
            char.state = "Final Approval Pending";
            char.player = null;
            char.chronicle = char.chronicle.id;
            char = vl.calculateFinalDraft(char);

            //Set a return point
            var previousversion = JSON.parse(JSON.stringify(char));
            previousversion.modificationhistory = null;
            char.modified = new Date();
            char.modificationhistory.push({
                fields: "Final version submitted",
                date: new Date(),
                user: {googleId: req.user.googleId, name: req.user.displayName},
                previousVersion: previousversion
            });
            model.update(char.id, char, function (err) {
                if (err) return next(new Error(err));
                res.json("ok");


                if (req.user.emails.length > 0) {
                    mail.sendmail(req.user.emails[0].value, "Character submitted for final approval: " + char.name, "Your finalized character has been submitted for approval: "
                    + "\nName:" + char.name
                    + "\nClan: " + char.clan
                    + "\n" + char.concept);
                }
                cmodel.find({id: char.chronicle}, function (err, result) {
                    if (err) return next(new Error(err));
                    var c = result[0];
                    if (c.email.length > 0) {
                        mail.sendmail(c.email, "Final approval: " + char.name, "A character is waiting for final approval: " +
                        "\nName:" + char.name
                        + "\nClan: " + char.clan
                        + "\nUser: " + req.user.displayName
                        + "\n" + char.concept);
                    }
                });
            });
        } else {
            next(new Error("forbidden"));
        }
    },
    'assignfreebies': function (req, res) {
        var out = {user: req.user, characterid: req.params.id};
        res.render(ViewTemplatePath + "/assignfreebies", out);
    },
    'submitbackground': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                if (err) return next(new Error(err));

                if (!sec.checkOwnership(req, next, result[0])) {
                    return;
                }
                var fields = {background: req.body.background};
                if(["Background Rejected", "Approved"].indexOf(result[0].state) > -1){
                    fields.state = "Background Submitted";
                };
                var previousversion = JSON.parse(JSON.stringify(result[0]));

                delete previousversion._id;
                delete previousversion.__v;
                delete previousversion.prototype;
                previousversion.player = null;
                previousversion.chronicle = previousversion.chronicle.id;
                previousversion.modificationhistory = [];
                var modHistory = [];
                for (var i = 0; i < result[0].modificationhistory.length; i++) {
                    modHistory.push(result[0].modificationhistory[i]);
                }
                modHistory.push({
                    fields: JSON.parse(JSON.stringify(fields)),
                    date: new Date(),
                    user: {googleId: req.user.googleId, name: req.user.displayName},
                    previousVersion: previousversion
                });
                fields.modificationhistory = modHistory;
                fields.modified = new Date();

                model.update(req.body.id, fields, function (err) {
                    if (err) return next(new Error(err));
                    res.json("ok");
                });
            });
        }
    },
    'approvebackground': function (req, res, next) {
        model.find({id: req.body.id}, function (err, result) {
            if (!sec.checkAdmin(req, next, result[0].chronicle.id)) {
                return;
            }
            var fields = {state: req.body.state};
            if(req.body.state == "Background Approved"){
                fields.freetraits = parseInt(result[0].freetraits) + parseInt(req.body.freebees);
            }

            var previousversion = JSON.parse(JSON.stringify(result[0]));
            delete previousversion._id;
            delete previousversion.__v;
            delete previousversion.prototype;
            previousversion.state = req.body.state;
            previousversion.player = null;
            previousversion.chronicle = result[0].chronicle.id;
            previousversion.modificationhistory = null;

            fields.modified = new Date();
            fields.modificationhistory = result[0].modificationhistory;
            fields.modificationhistory.push({
                fields: req.body.state,
                date: new Date(),
                user: {googleId: req.user.googleId, name: req.user.displayName},
                previousVersion: previousversion
            });
            model.update(req.body.id, fields, function (err) {
                if (err) return next(new Error(err));
                if (result[0].player.emails.length > 0) {
                    if (req.body.state == "Background Approved") {
                        mail.sendmail(result[0].player.emails[0].value, "Background approved: " + result[0].name, "Your background has been approved by storyteller " + req.user.displayName + ": "
                        + "\nName:" + result[0].name
                        + "\nClan: " + result[0].clan
                        + "\n" + result[0].concept);
                    } else if (req.body.state == "Background Rejected") {
                        var reason = "";
                        if (req.body.reason !== undefined) {
                            reason = "\nReason: " + req.body.reason.toString();
                        }
                        mail.sendmail(result[0].player.emails[0].value, "Background rejected: " + result[0].name, "Your background has been rejected by storyteller " + req.user.displayName.toString() + ": "
                        + reason.toString() + +"\nName:" + result[0].name.toString()
                        + "\nClan: " + result[0].clan.toString()
                        + "\n" + result[0].concept.toString());
                    }
                }
                return res.json("ok");

            });
        });
    },
    'approvefinal': function(req, res, next){
        model.find({id: req.body.id}, function (err, result) {
            if (!sec.checkAdmin(req, next, result[0].chronicle.id)) {
                return;
            }
            if (req.body.state == "Active") {
                var fields = {state: req.body.state};

                model.update(req.body.id, fields, function (err) {
                    if (err) return next(new Error(err));
                    if (result[0].player.emails.length > 0) {
                        if (req.body.state == "Active") {
                            mail.sendmail(result[0].player.emails[0].value, "Character approved: " + result[0].name, "Your character has been approved by storyteller and is not active in play!"
                            + req.user.displayName + ": "
                            + "\nName:" + result[0].name
                            + "\nClan: " + result[0].clan);
                        }
                    }
                    return res.json("ok");
                });
            } else {
                findByState(result[0].modificationhistory, "Background Approved", function (data) {
                    if (result.length == 0) return next(new Error("Cannot revert to Background Approved state"));
                    var currentversion = JSON.parse(JSON.stringify(result[0]));
                    delete currentversion._id;
                    delete currentversion.__v;
                    delete currentversion.prototype;
                    currentversion.player = null;
                    if (currentversion.chronicle.id !== undefined) currentversion.chronicle = currentversion.chronicle.id;
                    var oldVersion = JSON.parse(JSON.stringify(data.previousVersion));
                    oldVersion.modificationhistory = result[0].modificationhistory;
                    currentversion.modificationhistory = [];
                    if (oldVersion.chronicle.id !== undefined) oldVersion.chronicle = oldVersion.chronicle.id;
                    ;
                    oldVersion.modificationhistory.push({
                        fields: {
                            reversiondate: req.body.date
                        },
                        date: new Date(),
                        user: {
                            googleId: req.user.googleId, name: req.user.displayName
                        }
                        ,
                        previousVersion: currentversion
                    });
                    delete oldVersion._id;

                    model.update(req.body.id, oldVersion, function (err) {
                        if (err) return next(new Error(err));
                        if (result[0].player.emails.length > 0) {
                            if (req.body.state == "Active") {
                                mail.sendmail(result[0].player.emails[0].value, "Character rejected: " + result[0].name, "Your character has been rejected and reverted to Background Approved. Please reassing your freebies."
                                + req.user.displayName + ": "
                                + "\nName:" + result[0].name
                                + "\nClan: " + result[0].clan);
                            }
                        }
                        res.json("ok");
                    });
                });
            }
        });
    },
    'trash': function (req, res, next) {
        model.find({id: req.params.id}, function (err, result) {
            if (err) return next(new Error(err));
            if (result[0].player.googleId == req.user.googleId) {
                var character = result[0];
                var previousversion = JSON.parse(JSON.stringify(character));
                delete previousversion._id;
                delete previousversion.__v;
                delete previousversion.prototype;
                previousversion.player = null;
                previousversion.previousversion = char.chronicle.id;
                character.modificationhistory.push({
                    fields: "Trashed",
                    date: new Date(),
                    user: {googleId: req.user.googleId, name: req.user.displayName},
                    previousVersion: previousversion
                });
                model.update(character.id, {
                    state: "Trashed",
                    googleId: "",
                    modificationhistory: character.modificationhistory,
                    modified: new Date()
                }, function (err) {
                    if (err) return next(new Error(err));
                    res.json("ok");
                });
            } else {
                next(new Error("forbidden"));
            }
        });
    },
    'background': function (req, res, next) {
        if (req.params.id) {
            var out = {
                user: req.user,
                characterid: req.params.id
            };
            res.render(ViewTemplatePath + "/background", out);
        } else {
            next(new Error("forbidden"));
        }
    },
    'new': function (req, res, next) {
        if (req.params.id) {
            if (!sec.checkAdmin(req, next, req.params.id)) {
                return;
            }
            var char = vl.emptyCharacter(req.params.id);
            char.state = "Draft";
            model.insert(char, function (err) {
                if (err) return next(new Error(err));
                var out = {
                    user: req.user,
                    characterid: char.id
                };
                res.render(ViewTemplatePath + "/edit", out);
            });
        }
    },
    'delete': function (req, res, next) {
        if (!sec.checkAdmin(req, next, req.body.chronicleid)) {
            return;
        }
        if (req.body.ids) {
            model.remove({id: {$in: req.body.ids}}, function (err) {
                if (err) return next(new Error(err));
                res.json("ok");

            });
        }
    },
    'edit': function (req, res) {
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
                if (err) return next(new Error(err));
                if (!sec.checkAdmin(req, next, result[0].chronicle.id)) {
                    return;
                }
                var previousversion = JSON.parse(JSON.stringify(result[0]));
                delete previousversion._id;
                delete previousversion.__v;
                delete previousversion.prototype;
                previousversion.player = null;
                previousversion.chronicle = previousversion.chronicle.id;
                previousversion.modificationhistory = [];
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

                model.update(req.body.id, fields, function (err) {
                    if (err) return next(new Error(err));
                    res.json("ok");
                });
            });
        }
    },
    'find': function (req, res, next) {
        if (req.params.id) {
            model.find({
                "id": req.params.id
            }, function (err, result) {
                if (err) return next(new Error(err));
                if (result.length > 0) {
                    if (!sec.checkOwnership(req, next, result[0])) {
                        return;
                    }
                    res.json(result[0]);
                }
                else {
                    return next(new Error("No result"))
                }
            });
        }
    },
    'revert': function (req, res, next) {
        if (req.body.id && req.body.date) {
            model.find({"id": req.body.id}, function (err, result) {
                if (err) return next(new Error(err));
                if (!sec.checkAdmin(req, next, result[0].chronicle.id)) {
                    return;
                }
                findByDate(result[0].modificationhistory, new Date(req.body.date).toUTCString(), function (data) {
                        var currentversion = JSON.parse(JSON.stringify(result[0]));
                        delete currentversion._id;
                        delete currentversion.__v;
                        delete currentversion.prototype;
                        currentversion.player = null;
                        if(currentversion.chronicle.id !== undefined) currentversion.chronicle = currentversion.chronicle.id;
                        var oldVersion = JSON.parse(JSON.stringify(data.previousVersion));
                        oldVersion.modificationhistory = result[0].modificationhistory;
                        currentversion.modificationhistory = [];
                        if(oldVersion.chronicle.id !== undefined){
                            oldVersion.chronicle = oldVersion.chronicle.id;
                        };
                        oldVersion.modificationhistory.push({
                            fields: {
                                reversiondate: req.body.date
                            },
                            date: new Date(),
                            user: {
                                googleId: req.user.googleId, name: req.user.displayName
                            }
                            ,
                            previousVersion: currentversion
                        });
                        delete oldVersion._id;
                        model.update(req.body.id, oldVersion, function (err) {
                            if (err) return next(new Error(err));
                            res.json("ok");
                        });
                    }
                );
            });
        }
    },
    'clear': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.clear(function () {
            res.json('ok');
        });
    },
    'import': function (req, res, next) {
        if (!sec.checkAdmin(req, next, req.params.chronicleid)) {
            return;
        }

        if (req.params.chronicleId && req.files['files[]']) {
            var file = req.files['files[]'];
            var parser = new xml2js.Parser();

            parser.addListener('end', function (result) {
                importer.importgrapevine(result, req.params.chronicleId, function (err) {
                    if (err) {
                        res.json(err);
                        fs.unlink(tmpDir + '/' + file.name, function (err) {
                            if (err) return next(new Error(err));
                        });
                    } else {
                        fs.unlink(tmpDir + '/' + file.name, function (err) {
                            if (err) return next(new Error(err));
                        });
                    }

                });
            });

            fs.readFile(tmpDir + '/' + file.name, function (err, data) {
                if (path.extname(file.name) === ".gv3") parser.parseString(data.toString("binary"));
                if (path.extname(file.name) === ".json") {
                    importer.importjson(JSON.parse(data.toString("binary")), req.params.chronicleId, function (err, result) {
                        if (err) {
                            next(err);
                            fs.unlink(tmpDir + '/' + file.name, function (err) {
                                if (err) return next(new Error(err));
                            });
                        }
                        else {
                            fs.unlink(tmpDir + '/' + file.name, function (err) {
                                if (err) return next(new Error(err));
                                res.json(result);
                            });
                        }
                    });
                }
            });
        }
    },
    'wizard': function (req, res) {
        var out = {user: req.user, characterid: req.params.id};
        res.render(ViewTemplatePath + "/wizard", out);
    },
    'export': function (req, res, next) {
        if (!sec.checkAdmin(req, next, req.params.chronicleid)) {
            return;
        }

        if (req.params.exporttype === "gv3") {
            exporter.exportgv3(res, next, req.params.chronicleid);
        } else if (req.params.exporttype === "json") {
            exporter.exportjson(res, next, req.params.chronicleid);
        }
    },
    'populate': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.clear(function (err) {
            if (err) return next(new Error(err));
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
                created: new Date(2013, 3, 21),
                modified: new Date(2014, 1, 25),
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
                }],
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
                    date: new Date(2013, 6, 29),
                    change: 5,
                    reason: "Attendance"
                }, {
                    date: new Date(2013, 8, 23),
                    change: -1,
                    reason: "Purchase: Linguistics"
                }]
            }, function (err) {
                if (err) return next(new Error(err));
                model.all(function (err, result) {
                    if (err) return next(new Error(err));
                    res.json(result);
                });
            });
        });
    }
};
