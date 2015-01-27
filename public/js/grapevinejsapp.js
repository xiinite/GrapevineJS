angular.module('grapevinejs.JSON', ['ngResource'])
    .factory("resources", function($resource) {
        return {
            abilities: $resource('/resource/METRevised/Abilities.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            backgrounds: $resource('/resource/METRevised/Backgrounds.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            clans: $resource('/resource/METRevised/Clans.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            disciplines: $resource('/resource/METRevised/Disciplines.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            flaws: $resource('/resource/METRevised/Flaws.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            influences: $resource('/resource/METRevised/Influences.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            mental: $resource('/resource/METRevised/mental.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            merits: $resource('/resource/METRevised/Merits.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            negativemental: $resource('/resource/METRevised/NegativeMental.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            negativephysical: $resource('/resource/METRevised/NegativePhysical.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            negativesocial: $resource('/resource/METRevised/NegativeSocial.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            paths: $resource('/resource/METRevised/Paths.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            physical: $resource('/resource/METRevised/Physical.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            rituals: $resource('/resource/METRevised/Rituals.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            sects: $resource('/resource/METRevised/Sects.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            social: $resource('/resource/METRevised/social.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            })
        };
    });

angular.module('grapevinejs.services', [])
    .service('loading', function () {
    this.show = function () {
        $('#veil').show();
        $('#feedloading').show();
    };
    this.hide = function () {
        $('#veil').fadeOut(500);
        $('#feedloading').fadeOut(500);
    };
});

var app = angular.module('grapevinejs', ['grapevinejs.services', 'grapevinejs.JSON']);