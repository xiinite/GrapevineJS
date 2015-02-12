var model = require('../models/Chronicle.js');
var uuid = require('node-uuid');
var sec = require('../bin/securityhandler.js');

var ViewTemplatePath = 'chronicle';
module.exports = {
    'index': function (req, res) {
        var out = {user: req.user};
        res.render(ViewTemplatePath + "/index", out);
    },
    'all': function (req, res) {
        var where = {};
        if (!req.user.isSuperAdmin) {
            var userId = req.user.googleId;
            where =
            {
                admins: {$in: [userId]}
            };
            model.find(where, function (err, result) {
                res.json(result);
            })
        }
        else {
            model.all(function (err, result) {
                res.json(result);
            });
        }
    },
    'list': function (req, res) {
        var where = {};
        if (!req.user.isSuperAdmin) {
            var userId = req.user.googleId;
            where =
            {
                admins: {$in: [userId]}
            };
            model.find(where, function (err, result) {
                res.json(result);
            })
        } else {
            model.listAll(function (err, result) {
                res.json(result);
            });
        }
    },
    'listByPlayer': function(req, res){
        model.list({players: req.user.googleId}, function (err, result) {
            res.json(result);
        });
    },
    'find': function (req, res, next) {
        if (req.params.id) {
            model.find({"id": req.params.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                res.json(result[0]);
            });
        }
    },
    'show': function (req, res, next) {
        if (req.params.id) {
            model.find({"id": req.params.id}, function (err, result) {
                var user = req.user || {displayName: "Anonymous"};
                var out = {user: user, chronicle: result[0]};
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                res.render(ViewTemplatePath + "/show", out);
            });
        }
    },
    'update': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                var field = req.body.field;
                var data = req.body.data;
                var updateValues = {};
                updateValues[field] = data;
                model.update(req.body.id, updateValues, function (err) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json("ok");
                });
            });
        }
    },
    'addadmin': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                if (result[0].admins.indexOf(req.body.userId) == -1) {
                    result[0].admins.push(req.body.userId);
                }
                model.update(req.body.id, {'admins': result[0].admins}, function (err) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json("ok");
                });
            });
        }
    },
    'removeadmin': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                if (result[0].admins.indexOf(req.body.userId) > -1) {
                    result[0].admins.splice(result[0].admins.indexOf(req.body.userId), 1);
                }
                model.update(req.body.id, {'admins': result[0].admins}, function (err) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json("ok");
                });
            });
        }
    },
    'addplayer': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                if (result[0].players.indexOf(req.body.userId) == -1) {
                    result[0].players.push(req.body.userId);
                }
                model.update(req.body.id, {'players': result[0].players}, function (err) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json("ok");
                });
            });
        }
    },
    'removeplayer': function (req, res, next) {
        if (req.body.id) {
            model.find({"id": req.body.id}, function (err, result) {
                if (!sec.checkAdmin(req, next, result[0].id)) {
                    return;
                }
                if (result[0].players.indexOf(req.body.userId) > -1) {
                    result[0].players.splice(result[0].players.indexOf(req.body.userId), 1);
                }
                model.update(req.body.id, {'players': result[0].players}, function (err) {
                    if (err) {
                        res.json(err);
                        return;
                    }
                    res.json("ok");
                });
            });
        }
    },
    'clear': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        model.clear(function () {
            res.json('ok')
        });
    },
    'insert': function (req, res, next) {
        var chronicle = {
            id: uuid.v4(),
            name: req.body.name,
            description: req.body.description,
            admins: [req.user.googleId],
            administrators: [],
            characters: []
        };
        model.insert(chronicle, function (err) {
            if (err) {
                res.json(err);
                return;
            }
            res.json("ok");
        })
    },
    'populate': function (req, res, next) {
        if (!sec.checkSU(req, next)) {
            return;
        }
        var c1 = {
            id: "67abf1a1-d331-4e18-8739-93895c7a639d",
            name: 'Nachtkronieken',
            admins: ["114799359163510443499", "110802985198495285759"]
        };
        var c2 = {id: uuid.v4(), name: 'Demo 1', admins: ["114799359163510443499", "12687"]};
        var c3 = {id: uuid.v4(), name: 'Demo 2', admins: ["123546"]};
        var c4 = {id: uuid.v4(), name: 'Mechelen by Night', admins: ["9158"]};
        var c5 = {id: uuid.v4(), name: 'Gent bij Nachte', admins: ["114799359163510443499"]};
        model.insert([c1, c2, c3, c4, c5], function (err, result) {
            if (err) {
                res.json(err);
                return;
            }
            if (!err)res.json(result);
        });
    }
};