var uuid = require('node-uuid');

var calcBloodpool = function (generation) {
    switch (generation) {
        case 15:
            return 10;
        case 14:
            return 10;
        case 13:
            return 10;
        case 12:
            return 11;
        case 11:
            return 12;
        case 10:
            return 13;
        case 9:
            return 14;
        case 8:
            return 15;
        case 7:
            return 20;
        case 6:
            return 30;
        case 5:
            return 40;
        case 4:
            return 50;
        case 3:
            return 50;
    }
};
var calcWillpower = function (generation) {
    switch (generation) {
        case 15:
            return 6;
        case 14:
            return 6;
        case 13:
            return 6;
        case 12:
            return 8;
        case 11:
            return 8;
        case 10:
            return 10;
        case 9:
            return 10;
        case 8:
            return 12;
        case 7:
            return 14;
        case 6:
            return 16;
        case 5:
            return 18;
        case 4:
            return 20;
        case 3:
            return 20;
    }
};
var startWillpower = function (generation) {
    switch (generation) {
        case 15:
            return 2;
        case 14:
            return 2;
        case 13:
            return 2;
        case 12:
            return 2;
        case 11:
            return 4;
        case 10:
            return 4;
        case 9:
            return 6;
        case 8:
            return 6;
        case 7:
            return 7;
        case 6:
            return 8;
        case 5:
            return 9;
        case 4:
            return 10;
        case 3:
            return 10;
    }
};
var calctotal = function (list) {
    if (list === undefined) return "";
    var count = 0;
    list.forEach(function (item) {
        if(item.val !== undefined){
            count += item.val;
        }else if(item.rating !== undefined){
            count += item.rating;
        }
    });
    return count;
};
var calctotalcost = function (list) {
    if (list === undefined) return "";
    var count = 0;
    list.forEach(function (item) {
        count += item.cost;
    });
    return count;
};

module.exports = {
    calculateBloodpool: calcBloodpool,
    calculateWillpower: calcWillpower,
    startingWillpower: startWillpower,
    emptyCharacter: function (chronicleid) {
        return {
            id: uuid.v4(),
            name: "",
            charactertype: 'vampire',
            googleId: '',
            chronicle: chronicleid,
            concept: "",
            background: "",
            state: "",
            created: new Date(),
            modified: new Date(),
            clan: "",
            sect: "",
            coterie: "",
            generation: 13,
            title: "",
            sire: "",
            nature: "",
            demeanor: "",
            bloodpool: {
                max: 0,
                current: 0
            },
            path: {
                name: "",
                rating: 1
            },
            conscience: {
                name: "Conscience",
                rating: 1
            },
            selfcontrol: {
                name: 'Self-Control',
                rating: 1
            },
            courage: {
                name: "Courage",
                rating: 1
            },
            aura: 0,
            willpower: {
                max: 0,
                current: 0
            },
            experience: {
                unspent: 0,
                total: 0
            },
            attributes: {
                physical: [],
                tphysical: 0,
                social: [],
                tsocial: 0,
                mental: [],
                tmental: 0,
                negativephysical: [],
                tnegativephysical: 0,
                negativesocial: [],
                tnegativesocial: 0,
                negativemental: [],
                tnegativemental: 0
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
            healthlevels: {},
            freetraits: 0

        };
    },
    calculateClanAdvantage: function (character) {
        var findAdvantage = function (a, obj) {
            if (a.length == 0) return undefined;
            var i = a.length;
            while (i--) {
                if (a[i].name === obj) {
                    return a[i];
                }
            }
            return undefined;
        };
        var addFreeAbility = function (name) {
            var ability = findAdvantage(character.abilities, name);
            if (ability !== undefined) {
                ability.rating++;
                if (ability.rating > 5) ability.rating == 5;
            } else {
                character.abilities.push({name: name, note: "", rating: 1});
            }
        };
        var addInfluence = function (name) {
            var influence = findAdvantage(character.influences, name);
            if (influence !== undefined) {
                influence.rating++;
                if (influence.rating > 5) influence.rating == 5;
            } else {
                character.influence.push({name: name, note: "", rating: 1});
            }
        };
        var addBackground = function (name) {
            var background = findAdvantage(character.backgrounds, name);
            if (background !== undefined) {
                background.rating++;
                if (background.rating > 5) background.rating == 5;
            } else {
                character.backgrounds.push({name: name, note: "", rating: 1});
            }
        };
        var addStatus = function(status) {
            character.status.push({name: status, statustype: "abiding", rating: 1});
        };
        switch(character.sect){
            case "Camarilla":
                if([].indexOf(character.clan) < -1){
                    addStatus("Tolerated");
                }else{
                    addStatus("Acknowledged");
                }
                break;
            case "Independant":
                if([].indexOf(character.clan) < -1){
                    addStatus("Tolerated");
                }
                break;
        };
        switch (character.clan) {
            case "Brujah":
                //requires choice
                break;
            case "Malkavian":
                addFreeAbility("Awareness");
                break;
            case "Nosferatu":
                addFreeAbility("Stealth");
                addFreeAbility("Survival");
                break;
            case "Toreador":
                //requires choice
                break;
            case "Tremere":
                addFreeAbility("Occult");
                addInfluence("Occult");
                break;
            case "Ventrue":
                addBackground("Resources");
                //requires choice
                break;
            case "Lasombra":
                //requires choice
                break;
            case "Tzimisce":
                addFreeAbility("Occult");
                break;
            case "Assamite":
                addFreeAbility("Melee");
                addFreeAbility("Brawl");
                break;
            case "Followers of Set":
                addFreeAbility("Streetwise");
                //requires choice
                break;
            case "Gangrel":
                addFreeAbility("Animal Ken");
                addFreeAbility("Survival");
                break;
            case "Giovanni":
                //requires choice
                break;
            case "Ravnos":
                addFreeAbility("Streetwise");
                //requires choice
                break;
            case "Daughters of Cacophony":
                addFreeAbility("Performance");
                //requires choice
                break;
            case "Salubri":
                addBackground("Generation");
                addBackground("Generation");
                break;
            case "Samedi":
                //Can learn Necromancy
                break;
            case "Baali":
                addFreeAbility("Occult");
                //requires choice
                break;
            case "Nagaraja":
                addFreeAbility("Subterfuge");
                //requires choice
                break;
            case "True Brujah":
                addFreeAbility("Academics");
                //requires choice
                break;
        }

        return character;
    },
    calculateChronicleAdvantage: function (character) {
        var findAdvantage = function (a, obj) {
            if (a.length == 0) return undefined;
            var i = a.length;
            while (i--) {
                if (a[i].name === obj) {
                    return a[i];
                }
            }
            return undefined;
        };
        var addFreeAbility = function (name) {
            var ability = findAdvantage(character.abilities, name);
            if (ability !== undefined) {
                ability.rating++;
                if (ability.rating > 5) ability.rating == 5;
            } else {
                character.abilities.push({name: name, note: "", rating: 1});
            }
        };


        //Free linguistics trait
        addFreeAbility("Linguistics");

        //Free lores
        addFreeAbility("Lore: Kindred");
        addFreeAbility("Lore: Camarilla");
        addFreeAbility("Lore: Clan: " + character.clan);
        return character;
    },
    calculateStep4: function (character) {
        var findBackground = function (a, obj) {
            if (a.length == 0) return undefined;
            var i = a.length;
            while (i--) {
                if (a[i].name === obj) {
                    return a[i];
                }
            }
            return undefined;
        };
        var findFlaw = function (a, obj) {
            if (a.length == 0) return undefined;
            var i = a.length;
            while (i--) {
                if (a[i].name === obj) {
                    return a[i];
                }
            }
            return undefined;
        };

        //Calculate generation
        var genBackground = findBackground(character.backgrounds, "Generation");
        var flawFourteenth = findFlaw(character.flaws, "Fourteenth generation");
        if(flawFourteenth !== undefined){
            character.generation = 14;
        }else if (genBackground !== undefined) {
            character.generation = 13 - genBackground.rating;
        } else {
            character.generation = 13;
        }

        //calculate bloodpool and willpower
        character.path.rating = Math.ceil((character.selfcontrol.rating + character.conscience.rating) / 2);
        character.bloodpool.max = calcBloodpool(character.generation);
        character.bloodpool.current = character.bloodpool.max;
        character.willpower.max = calcWillpower(character.generation);
        character.willpower.current = startWillpower(character.generation);
        return character;
    },
    calculateFinalDraft: function(character){
        var findBackground = function (a, obj) {
        if (a.length == 0) return undefined;
        var i = a.length;
        while (i--) {
            if (a[i].name === obj) {
                return a[i];
            }
        }
        return undefined;
        };
        var findFlaw = function (a, obj) {
            if (a.length == 0) return undefined;
            var i = a.length;
            while (i--) {
                if (a[i].name === obj) {
                    return a[i];
                }
            }
            return undefined;
        };
        //Calculate generation
        var genBackground = findBackground(character.backgrounds, "Generation");
        var flawFourteenth = findFlaw(character.flaws, "Fourteenth generation");
        if(flawFourteenth !== undefined){
            character.generation = 14;
        }else if (genBackground !== undefined) {
            character.generation = 13 - genBackground.rating;
        } else {
            character.generation = 13;
        }

        character.bloodpool.max = calcBloodpool(character.generation);
        character.bloodpool.current = character.bloodpool.max;
        character.willpower.max = calcWillpower(character.generation);

        return character;
    },
    calculateFreeTraits: function(character){
        var total = 5;

        total += parseInt(calctotal(character.attributes.negativephysical));
        total += parseInt(calctotal(character.attributes.negativesocial));
        total += parseInt(calctotal(character.attributes.negativemental));

        total += parseInt(calctotalcost(character.flaws));

        if(character.clan == "Malkavian"){
            if(character.derangements.length == 2) total += 2;
        }else{
            if(character.derangements.length == 1) total += 2;
        }

        character.freetraits = total;
        return character;
    }
};
