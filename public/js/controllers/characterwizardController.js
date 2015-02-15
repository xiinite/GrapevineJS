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
    $scope.clandisciplines = [];
    $scope.sstatus = '';
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

    $scope.clanAdvChoiceMade = false;
    $scope.clanAdvChoice1Made = false;
    $scope.clanAdvChoice2Made = false;
    $scope.clanAdvDialog = ["Brujah", "Malkavian", "Toreador", "Ventrue", "Lasombra", "Followers of Set",
        "Giovanni", "Ravnos", "Daughters of Cacophony", "Baali", "Nagaraja", "True Brujah"];
    $scope.addClanAdvDialog = function(){
        $("#clanAdvantageModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    };

    $scope.GiovanniChoice = function(ghoul){
        if(ghoul){
            $scope.addAdvantage("Retainer", $scope.character.backgrounds);
            $scope.clanAdvChoiceMade = true;
            $scope.clanAdvChoice2Made = true;
        }else{
            $scope.clanAdvChoice2Made = true;
        }
    };

    $scope.addClanAdvDaughters = function (value, complete) {
        if (value.length === undefined) return;
        if (value.length == 0) return;

        if(value == "High Society"){
            var result = $.grep($scope.character.influences, function (e) {
                return e.name == value;
            });
            if (result.length === 0) {
                $scope.character.influences.push({name: value, note: "", rating: 1});
                $scope.character.influences = orderBy($scope.character.influences, 'name', false);
            } else {
                result[0].rating++;
            }
        }else{
            var result = $.grep($scope.character.abilities, function (e) {
                return e.name == value;
            });
            if (result.length === 0) {
                $scope.character.abilities.push({name: value, note: "", rating: 1});
                $scope.character.abilities = orderBy($scope.character.abilities, 'name', false);
            } else {
                result[0].rating++;
            }
        }

        if($scope.clanAdvChoice1Made == false) $scope.clanAdvChoice1Made = !complete;
        $scope.clanAdvChoiceMade = complete;
    };

    $scope.addClanDerangement = function(value, list){
        if (value.length === undefined) return;
        if (value.length == 0) return;
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            list.push({name: value, note: "", rating: 1});
            list = orderBy(list, 'name', false);
            $scope.clanAdvChoiceMade = true;
        }
    };

    $scope.addClanAbility = function (value, complete) {
        if (value.length === undefined) return;
        if (value.length == 0) return;

        var result = $.grep($scope.character.abilities, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            $scope.character.abilities.push({name: value, note: "", rating: 1});
            $scope.character.abilities = orderBy($scope.character.abilities, 'name', false);
        } else {
            result[0].rating++;
        }
        if($scope.clanAdvChoice1Made == false) $scope.clanAdvChoice1Made = !complete;
        $scope.clanAdvChoiceMade = complete;

    };

    $scope.addClanInfluence = function (value, complete) {
        if (value.length === undefined) return;
        if (value.length == 0) return;

        var result = $.grep($scope.character.influences, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            $scope.character.influences.push({name: value, note: "", rating: 1});
            $scope.character.influences = orderBy($scope.character.influences, 'name', false);
        } else {
            result[0].rating++;
        }

        if($scope.clanAdvChoice1Made == false) $scope.clanAdvChoice1Made = !complete;
        $scope.clanAdvChoiceMade = complete;
    };

    $scope.addClanStatus = function (value, complete) {
        if (value.length === undefined) return;
        if (value.length == 0) return;

        var result = $.grep($scope.character.status, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            $scope.character.status.push({name: value, statustype: "fleeting", rating: 1});
            $scope.character.status = orderBy($scope.character.status, 'name', false);
        } else {
            result[0].rating++;
        }

        if($scope.clanAdvChoice1Made == false) $scope.clanAdvChoice1Made = !complete;
        $scope.clanAdvChoiceMade = complete;
    };

    $scope.addClanInfluenceAbility = function (value, complete) {
        if (value.length === undefined) return;
        if (value.length == 0) return;

        var result = $.grep($scope.character.abilities, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            $scope.character.abilities.push({name: value, note: "", rating: 1});
            $scope.character.abilities = orderBy($scope.character.abilities, 'name', false);
        } else {
            result[0].rating++;
        }
        if(value == 'Politics') value = 'Political';
        result = $.grep($scope.character.influences, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            $scope.character.influences.push({name: value, note: "", rating: 1});
            $scope.character.influences = orderBy($scope.character.influences, 'name', false);
        } else {
            result[0].rating++;
        }

        if($scope.clanAdvChoice1Made == false) $scope.clanAdvChoice1Made = !complete;
        $scope.clanAdvChoiceMade = complete;

    };

    $scope.calctotal = function (list) {
        if (list === undefined) return "";
        var count = 0;
        $.each(list, function (index, item) {
            if(item.val !== undefined){
                count += item.val;
            }else if(item.rating !== undefined){
                count += item.rating;
            }
        });
        return count;
    };
    $scope.calctotalcost = function (list) {
        if (list === undefined) return "";
        var count = 0;
        $.each(list, function (index, item) {
            count += item.cost;
        });
        return count;
    };

    $scope.onselectedpath = function(){
        for(var i = 0; i<$scope.paths.length; i++){
            if($scope.paths[i].name == $scope.character.path.name){
                $scope.character.conscience.name =$scope.paths[i].conscience;
                $scope.character.selfcontrol.name =$scope.paths[i].selfcontrol;
                $scope.character.courage.name = "Courage";
            }
        }
    }

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

    $scope.addAdvantage = function (value, list) {
        if (value.length === undefined) return;
        if (value.length == 0) return;
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            list.push({name: value, note: "", rating: 1});
            list = orderBy(list, 'name', false);
        } else {
            result[0].rating++;
        }
    };

    $scope.removeAdvantage = function (value, list) {
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        var attr = result[0];

        if (attr.rating == 1) {
            list.splice($.inArray(attr, list), 1);
        } else {
            attr.rating--;
        }
    };

    $scope.addDiscipline = function(item, list){
        if(item.name !== undefined){
            var result = $.grep(list, function (e) {
                return e.name == item.name && e.path == item.path;
            });
            if(result.length == 0){
                list.push(item);
            }
        }
    };

    $scope.removeDiscipline = function(item, list){
        if(item.name !== undefined){
            var result = $.grep(list, function (e) {
                return e.name == item.name && e.path == item.path;
            });
            if(result.length == 1){
                list.splice($.inArray(result[0], list), 1);
            }
        }
    };

    $scope.addVirtue = function(virtue){
        virtue.rating++;
        if(virtue.rating > 5) virtue.rating = 5;
    };
    $scope.removeVirtue = function(virtue){
        virtue.rating--;
        if(virtue.rating < 1) virtue.rating = 1;
    };
    $scope.showAddVirtue = function(){
        if($scope.character.conscience === undefined || $scope.character.selfcontrol === undefined || $scope.character.courage === undefined) return false;
        var total = $scope.character.conscience.rating + $scope.character.selfcontrol.rating + $scope.character.courage.rating;
        var max = 7 + 1;
        if($scope.character.conscience.name === "Conscience") max++;
        if($scope.character.selfcontrol.name === "Self-Control") max++;

        return total < max;
    };

    $scope.addFlaw = function(item, list){
        if(item.name !== undefined){
            var result = $.grep(list, function (e) {
                return e.name == item.name;
            });
            var clist = [];
            angular.copy(list, clist);
            clist.push(item);
            if(result.length == 0 && ($scope.calctotalcost(clist) < 8)){
                list.push(item);
            }
        }
    };
    $scope.removeFlaw = function(item, list){
        if(item.name !== undefined){
            var result = $.grep(list, function (e) {
                return e.name == item.name;
            });
            if(result.length == 1){
                list.splice($.inArray(result[0], list), 1);
            }
        }
    };
    $scope.showFlaws = function(){
        var total = $scope.calctotalcost($scope.character.flaws);
        var max = 7;

        return total < max;
    };

    $scope.showNegativeTraits = function(){
        if($scope.character.attributes === undefined) return false;
        var total = $scope.calctotal($scope.character.attributes.negativephysical) + $scope.calctotal($scope.character.attributes.negativemental) + $scope.calctotal($scope.character.attributes.negativesocial);
        var max = 5;
        return total < max;
    };

    $scope.addDerangement = function(value, list){
        if (value.length === undefined) return;
        if (value.length == 0) return;
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            list.push({name: value, note: "", rating: 1});
            list = orderBy(list, 'name', false);
        } else {
            result[0].rating++;
        }
    };
    $scope.removeDerangement = function(value, list){
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        var attr = result[0];

        if (attr.rating == 1) {
            list.splice($.inArray(attr, list), 1);
        } else {
            attr.rating--;
        }
    }
    $scope.noteItem;
    $scope.selectedList;
    $scope.previousNoteValue = {};
    $scope.addNoteDialog = function(adv, list)
    {
        angular.copy(adv, $scope.previousNoteValue);
        $scope.noteItem = adv;
        $scope.selectedList = list;
        $("#advNoteModal").modal();
    };

    $scope.revertNoteItem = function(){
        angular.copy($scope.previousNoteValue, $scope.noteItem);
        $scope.noteItem = {};
        $scope.selectedList = {};
    };

    $scope.saveNoteItem = function(){
        $scope.noteItem = {};
        $scope.selectedList = {};
    };

    $scope.showSecondary = false;
    $scope.showTertiary = false
    $scope.showSecondaryList = false;
    $scope.showTertiaryList = false
    $scope.clear = function (list, list2) {
        while (list.length > 0) {
            list.pop();
        }

        if(list2.length == 2){
            $scope.showSecondary = false;
            $scope.showTertiary = false;
            $scope.showSecondaryList = true;
            $scope.showTertiaryList = false
        }else if(list2.length == 1){
            $scope.showSecondary = true;
            $scope.showTertiary = false;
            $scope.showTertiaryList = true
        }else{
            $scope.showSecondary = true;
            $scope.showTertiary = true;
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
            resources.clandisciplines.get(function (data) {
                root.clandisciplines = data;
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

            root.character.conscience.rating = 1;
            root.character.selfcontrol.rating = 1;
            root.character.courage.rating = 1;

            if (root.chronicle === null) {
                root.chronicle = root.character.chronicle;
            }
            else {
                loading.hide();
            }
        });
    };

    $scope.submitDraft = function(){
        loading.show();
        var root = $scope;
        $http.post("/character/submitdraft", {character: root.character}).then(function(){
            location = '/character/assignfreebies/' + root.character.id;
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
        return true;
        switch ($scope.currentIndex) {
            case 1:
                return $scope.calctotal($scope.character.attributes.physical)
                    + $scope.calctotal($scope.character.attributes.social)
                    + $scope.calctotal($scope.character.attributes.mental) == (7 + 5 + 3);
            case 2:
                return ($scope.calctotal($scope.character.abilities) == 5
                && ($scope.calctotal($scope.character.backgrounds) + $scope.calctotal($scope.character.influences)) == 5
                && $scope.character.disciplines.length == 3);
            case 3:
                return $scope.showAddVirtue() == false;
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

app.filter('isClanDiscipline', function () {

    return function (items, filter) {
        var contains = function(a, obj) {
            var i = a.length;
            while (i--) {
                if (a[i].path === obj.path && a[i].name === obj.name) {
                    return true;
                }
            }
            return false;
        };
        var containspath = function(a, obj) {
            var i = a.length;
            while (i--) {
                if(a[i].path === undefined){
                    if (a[i] === obj.path) {
                        return true;
                    }
                }else{
                    if (a[i].path === obj.path) {
                        return true;
                    }
                }
            }
            return false;
        };

        var clan;
        var clandisciplines;
        var currentdisciplines;
        if(filter !== undefined){
            clan = filter[0];
            clandisciplines = filter[1];
            currentdisciplines = filter[2];
        }
        var clanDiscs = [];
        var clanFound = false;
        for (var i = 0; i < clandisciplines.length; i++) {
            if(clandisciplines[i].clan == clan){
                clanFound = true;
                for(var j = 0; j< clandisciplines[i].disciplines.length; j++){
                    clanDiscs.push(clandisciplines[i].disciplines[j]);
                }
            }
        }
        var arrayToReturn = [];
        for (var i = 0; i < items.length; i++) {
            if (clanFound == false) {
                if(items[i].level == 'basic'){
                    arrayToReturn.push(items[i]);
                }
            } else{
                if(items[i].level == 'basic' && containspath(clanDiscs, items[i]) && !contains(currentdisciplines, items[i]) && !containspath(arrayToReturn, items[i])){
                    //
                    arrayToReturn.push(items[i]);
                }
            }
        }

        return arrayToReturn;
    };
});