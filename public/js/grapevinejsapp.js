angular.module('grapevinejs.JSON', ['ngResource', 'ngRoute', 'ngTouch', 'ngSanitize', 'ui.select', 'ngAnimate'])
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
            })
        };
    });

angular.module('grapevinejs.services', [])
    .service('loading', function () {
    this.show = function () {
        $('#veil').show();
    };
    this.hide = function () {
        $('#veil').fadeOut(200);
    };
});

angular.module('grapevinejs.directives', []).directive('ngConfirmClick', [
    function(){
        return {
            priority: -1,
            restrict: 'A',
            link: function(scope, element, attrs){
                element.bind('click', function(e){
                    var message = attrs.ngConfirmClick;
                    if(message && !confirm(message)){
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }
        }
    }
]);

var app = angular.module('grapevinejs', ['grapevinejs.services', 'grapevinejs.JSON', 'grapevinejs.directives']);


app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if(angular.isArray(item[prop])){
            item[prop].forEach(function ShowResults(value, index, ar) {
                if (value.value.toString().toLowerCase().indexOf(text) !== -1) {
                    itemMatches = true;
              }
            });
          }else{
              if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
              }
          }
          
          if(itemMatches === true){
                break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});