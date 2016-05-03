"use strict";
angular.module('cymeriad.resources', ['ngResource', 'ngRoute', 'ngTouch', 'ngSanitize', 'ui.select', 'ngAnimate', 'textAngular'])
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
            clandisciplines: $resource('/resource/METRevised/ClanDisciplines.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            derangements: $resource('/resource/METRevised/Derangements.json', {}, {
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
            mental: $resource('/resource/METRevised/Mental.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            merits: $resource('/resource/METRevised/Merits.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            natures: $resource('/resource/METRevised/Nature.json', {}, {
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
            social: $resource('/resource/METRevised/Social.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            allyActions: $resource('/resource/Nachtkronieken/AllyActions.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            contactActions: $resource('/resource/Nachtkronieken/ContactActions.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            influenceActions: $resource('/resource/Nachtkronieken/InfluenceActions.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            playerActions: $resource('/resource/Nachtkronieken/PlayerActions.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            resourceActions: $resource('/resource/Nachtkronieken/ResourceActions.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            retainerActions: $resource('/resource/Nachtkronieken/RetainerActions.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            locations: $resource('/resource/Nachtkronieken/Locations.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            bloodgrounds: $resource('/resource/Nachtkronieken/Bloodgrounds.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            }),
            influenceSpheres: $resource('/resource/Nachtkronieken/influences.json', {}, {
                get: {method: 'GET', params: {}, isArray: false}
            }),
            feedingtypes: $resource('/resource/Nachtkronieken/FeedingTypes.json', {}, {
                get: {method: 'GET', params: {}, isArray: true}
            })
        }
    });
