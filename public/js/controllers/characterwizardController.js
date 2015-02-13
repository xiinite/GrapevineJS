app.controller('CharacterWizardController', ['$scope', '$http', 'loading', 'resources', '$filter', function ($scope, $http, loading, resources, $filter) {
    $scope.log = function (event) {
        console.log(event);
    };
    var orderBy = $filter('orderBy');

    $scope.conscienceTypes = ["Conscience", "Conviction"];
    $scope.selfcontrolTypes = ["Self-Control", "Instinct"];
    $scope.bloodbondlevels = ["1", "2", "3"];
    $scope.resourcesLoaded = false;
    $scope.abilities = [];
    $scope.sability = {};
    $scope.backgrounds = [];
    $scope.sbackground = {};
    $scope.clans = [];
    $scope.disciplines = [];
    $scope.sdiscipline = {};
    $scope.derangements = [];
    $scope.sderangement = {};
    $scope.flaws = [];
    $scope.sflaw = {};
    $scope.influences = [];
    $scope.sinfluences = {};
    $scope.mental = [];
    $scope.smental = {};
    $scope.merits = [];
    $scope.smerit = {};
    $scope.natures = {};
    $scope.negativemental = [];
    $scope.snegativemental = {};
    $scope.negativephysical = [];
    $scope.snegativephysical = {};
    $scope.negativesocial = [];
    $scope.snegativesocial = {};
    $scope.paths = [];
    $scope.physical = [];
    $scope.sphysical = {};
    $scope.rituals = [];
    $scope.sritual = {};
    $scope.sects = [];
    $scope.social = [];
    $scope.ssocial = {};

    $scope.sbloodbond = {};

    $scope.sstatus = "";
    $scope.sstatustype = "";

    $scope.character = {};
    $scope.chronicle = {};

    $scope.resourcesLoaded = false;

    $scope.attributes = [];

    $scope.primary = undefined;
    $scope.sprimary = "";
    $scope.secondary = undefined;
    $scope.ssecondary = "";
    $scope.tertiary = undefined;
    $scope.stertiary = "";

    $scope.calctotal = function (list) {
        if (list === undefined) return "";
        var count = 0;
        $.each(list, function (index, item) {
            count += item.val;
        });
        return count;
    };

    $scope.addTrait = function (value, list) {
        if (value.length === undefined) return;
        if (value.length == 0) return;
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            list.push({name: value, val: 1});
            list = orderBy(list, 'name', false);
        } else {
            result[0].val++;
        }
    };

    $scope.removeTrait = function (value, list) {
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        var attr = result[0];

        if (attr.val == 1) {
            list.splice($.inArray(attr, list), 1);
        } else {
            attr.val--;
        }
    };

    $scope.clear = function (list, list2) {
        while (list.length > 0) {
            list.pop();
        }
    };
    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        if (!$scope.resourcesLoaded) {
            $scope.resourcesLoaded = true;
            resources.abilities.get(function (data) {
                root.abilities = data;
            });
            resources.abilities.get(function (data) {
                root.abilities = data;
            });
            resources.backgrounds.get(function (data) {
                root.backgrounds = data;
            });
            resources.clans.get(function (data) {
                root.clans = data;
            });
            resources.derangements.get(function (data) {
                root.derangements = data;
            });
            resources.disciplines.get(function (data) {
                root.disciplines = data;
            });
            resources.flaws.get(function (data) {
                root.flaws = data;
            });
            resources.influences.get(function (data) {
                root.influences = data;
            });
            resources.mental.get(function (data) {
                root.mental = data;
                root.attributes.push({key: 'mental', val: data});
            });
            resources.merits.get(function (data) {
                root.merits = data;
            });
            resources.natures.get(function (data) {
                root.natures = data;
            });
            resources.negativemental.get(function (data) {
                root.negativemental = data;
            });
            resources.negativephysical.get(function (data) {
                root.negativephysical = data;
            });
            resources.negativesocial.get(function (data) {
                root.negativesocial = data;
            });
            resources.paths.get(function (data) {
                root.paths = data;
            });
            resources.physical.get(function (data) {
                root.physical = data;
                root.attributes.push({key: 'physical', val: data});
            });
            resources.rituals.get(function (data) {
                root.rituals = data;
            });
            resources.sects.get(function (data) {
                root.sects = data;
            });
            resources.social.get(function (data) {
                root.social = data;
                root.attributes.push({key: 'social', val: data});
            });

        }
        $http.get("/character/find/" + id).then(function (response) {
            root.character = response.data;
            root.character.experience.unspent = parseInt(root.character.experience.unspent);
            root.character.experience.total = parseInt(root.character.experience.total);
            if (root.chronicle === null) {
                root.chronicle = root.character.chronicle;
            }
            else {
                loading.hide();
            }
        });
    };
    $scope.setFormScope = function (scope) {
        if ($scope.formscope === undefined) {
            $scope.formscope = [];
        }
        $scope.formscope.push(scope);
    }

    $scope.currentIndex = 0;
    $scope.isStepValid = function () {
        switch ($scope.currentIndex) {
            case 1:
                return $scope.calctotal($scope.character.attributes.physical)
                    + $scope.calctotal($scope.character.attributes.social)
                    + $scope.calctotal($scope.character.attributes.mental) == (7 + 5 + 3);
        }
        return $scope.formscope[$scope.currentIndex].stepform.$valid;
    }
}]);

app.directive('wizard', function ($timeout) {

    return {
        restrict: 'E',
        transclude: true,

        scope: {
            onBeforeStepChange: '&',
            onStepChanging: '&',
            onAfterStepChange: '&'
        },

        templateUrl: 'wizard.html',

        replace: true,

        link: function (scope) {
            scope.currentStepIndex = 0;
            scope.steps[scope.currentStepIndex].currentStep = true;
        },

        controller: function ($scope) {
            $scope.steps = [];

            this.registerStep = function (step) {
                $scope.steps.push(step);
            };

            var toggleSteps = function (showIndex) {
                var event = {event: {fromStep: $scope.currentStepIndex, toStep: showIndex}};

                if ($scope.onBeforeStepChange) {
                    $scope.onBeforeStepChange(event);
                }
                $scope.steps[$scope.currentStepIndex].currentStep = false;

                if ($scope.onStepChanging) {
                    $scope.onStepChanging(event);
                }
                $timeout(function () {
                    $scope.currentStepIndex = showIndex;
                    $scope.steps[$scope.currentStepIndex].currentStep = true;

                    if ($scope.onAfterStepChange) {
                        $scope.onAfterStepChange(event);
                    }
                }, 250);

            };

            $scope.showNextStep = function () {
                var parent = $scope.$parent;
                if (parent.isStepValid($scope.currentStepIndex)) {
                    parent.currentIndex = $scope.currentStepIndex + 1;
                    toggleSteps($scope.currentStepIndex + 1);
                }
            };

            $scope.showPreviousStep = function () {
                var parent = $scope.$parent;
                parent.currentIndex = $scope.currentStepIndex - 1;
                toggleSteps($scope.currentStepIndex - 1);
            };

            $scope.hasNext = function () {
                return $scope.currentStepIndex < ($scope.steps.length - 1);
            };

            $scope.hasPrevious = function () {
                return $scope.currentStepIndex > 0;
            }

        }
    };

});

app.directive('step', function () {

    return {
        require: "^wizard",
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@',
            fields: '@'
        },
        template: '<div class="step panel panel-default slide-right" ng-class="animation" ng-show="currentStep"><div class="panel-heading"><h3>{{title}}</h3></div> <div class="panel-body" ng-transclude></div> </div></div></div>',
        replace: true,

        link: function (scope, element, attrs, wizardController) {
            wizardController.registerStep(scope);
        }
    };

});

app.filter('exclude', function () {

    return function (items, filter) {

        var arrayToReturn = [];
        for (var i = 0; i < items.length; i++) {
            if (filter === undefined) {
                arrayToReturn.push(items[i]);
            } else {
                var keys = filter.map(function (k) {
                    if (k === undefined) return;
                    return k.key;
                });

                if (keys.indexOf(items[i].key) == -1) {
                    arrayToReturn.push(items[i]);
                }
            }
        }

        return arrayToReturn;
    };
});