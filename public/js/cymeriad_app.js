angular.module('cymeriad.JSON', ['ngResource', 'ngRoute', 'ngTouch', 'ngSanitize', 'ui.select', 'ngAnimate', 'textAngular'])
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
            })
        };
    });

angular.module('cymeriad.services', [])
    .service('loading', function () {
    this.show = function () {
        $('#veil').show();
    };
    this.hide = function () {
        $('#veil').fadeOut(200);
    };
});

angular.module('cymeriad.directives', []).directive('ngConfirmClick', [
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

var app = angular.module('cymeriad', ['cymeriad.services', 'cymeriad.JSON', 'cymeriad.directives']);


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
              item[prop].forEach(function ShowResults(value) {
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

app.directive('readMore', function() {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            text: '=ngModel'
        },
        template:  "<p> {{text | readMoreFilter:[text, countingWords, textLength] }}" +
        "<a ng-show='showLinks' ng-click='changeLength()' class='color3'>" +
        "<strong class='clickable' ng-show='isExpanded'><br />  ^Less</strong>" +
        "<strong class='clickable' ng-show='!isExpanded'>  More...</strong>" +
        "</a>" +
        "</p>",
        controller: ['$scope', '$attrs', '$element',
            function($scope, $attrs) {
                $scope.textLength = $attrs.length;
                $scope.isExpanded = false; // initialise extended status
                $scope.countingWords = $attrs.words !== undefined ? ($attrs.words === 'true') : true; //if this attr is not defined the we are counting words not characters

                if (!$scope.countingWords && $scope.text.length > $attrs.length) {
                    $scope.showLinks = true;
                } else if ($scope.countingWords && $scope.text.split(" ").length > $attrs.length) {
                    $scope.showLinks = true;
                } else {
                    $scope.showLinks = false;
                }

                $scope.changeLength = function (card) {
                    $scope.isExpanded = !$scope.isExpanded;
                    $scope.textLength = $scope.textLength !== $attrs.length ?  $attrs.length : $scope.text.length;
                };
            }]
    };
});
app.filter('readMoreFilter', function() {
    return function(str, args) {
        var strToReturn = str,
            length = str.length,
            foundWords = [],
            countingWords = (!!args[1]);

        if (!str || str === null) {
            // If no string is defined return the entire string and warn user of error
            console.log("Warning: Truncating text was not performed as no text was specified");
        }

        // Check length attribute
        if (!args[2] || args[2] === null) {
            // If no length is defined return the entire string and warn user of error
            console.log("Warning: Truncating text was not performed as no length was specified");
        } else if (typeof args[2] !== "number") { // if parameter is a string then cast it to a number
            length = Number(args[2]);
        }

        if (length <= 0) {
            return "";
        }


        if (str) {
            if (countingWords) { // Count words

                foundWords = str.split(/\s+/);

                if (foundWords.length > length) {
                    strToReturn = foundWords.slice(0, length).join(' ') + '...';
                }

            } else {  // Count characters

                if (str.length > length) {
                    strToReturn = str.slice(0, length) + '...';
                }

            }
        }

        return strToReturn;
    };
});