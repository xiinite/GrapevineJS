var uuid = require('node-uuid');

module.exports = {
    calculateBloodpool: function (generation) {
        switch(generation){
            case 15: return 10;
            case 14: return 10;
            case 13: return 10;
            case 12: return 11;
            case 11: return 12;
            case 10: return 13;
            case 9: return 14;
            case 8: return 15;
            case 7: return 20;
            case 6: return 30;
            case 5: return 40;
            case 4: return 50;
            case 3: return 50;
        }
    },
    calculateWillpower: function (generation) {
        switch(generation){
            case 15: return 6;
            case 14: return 6;
            case 13: return 6;
            case 12: return 8;
            case 11: return 8;
            case 10: return 10;
            case 9: return 10;
            case 8: return 12;
            case 7: return 14;
            case 6: return 16;
            case 5: return 18;
            case 4: return 20;
            case 3: return 20;
        }
    },
    startingWillpower: function (generation) {
        switch(generation){
            case 15: return 2;
            case 14: return 2;
            case 13: return 2;
            case 12: return 2;
            case 11: return 4;
            case 10: return 4;
            case 9: return 6;
            case 8: return 6;
            case 7: return 7;
            case 6: return 8;
            case 5: return 9;
            case 4: return 10;
            case 3: return 10;
        }
    },
    emptyCharacter: function(chronicleid){
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
                    healthlevels: {}

                };
    }
}