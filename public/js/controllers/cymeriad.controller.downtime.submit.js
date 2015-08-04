"use strict";
app.controller('cymeriad.controller.downtime.submit', ['$scope', '$http', 'loading', '$q', 'resources', function ($scope, $http, loading, $q, resources) {
    $scope.period = {};
    $scope.downtime = {};
    $scope.characters = [];
    $scope.allcharacters = [];
    $scope.submittedperiods = [];
    $scope.scharacter = undefined;
    $scope.character = undefined;
    $scope.actions = {};

    $scope.allyActions = [];
    $scope.contactActions = [];
    $scope.influenceActions = [];
    $scope.playerActions = [];
    $scope.resourceActions = [];
    $scope.retainerActions = [];
    $scope.locations = [];
    $scope.bloodgrounds = [];
    $scope.influences = { "wealth": [], "dominion": [], "public": []};

    $scope.$watch(function(scope) { return scope.scharacter },
        function(selected) {
            if(selected === undefined) return;
            var root = $scope;
            $http.get("/character/find/" + selected.id).then(function (response) {
                root.character = response.data;
                root.character.experience.unspent = parseInt(root.character.experience.unspent);
                root.character.experience.total = parseInt(root.character.experience.total);
            });
        }
    );

    $scope.clearAction = function(action){
        var act = $scope.actions[action].action;
        $scope.actions[action] = {};
        $scope.actions[action].name = action;
        $scope.actions[action].action = act;
        $scope.actions[action].target = undefined;
    };

    $scope.isDescriptionRequired = function(action){
        if(action === undefined) return false;
        switch(action.action){
            case "No action":
            case "Relax (no action)":
            case "Grow":
            case "Defend":
            case "Block":
                return false;
        }
        return true;
    };
    $scope.isLocationRequired = function(action){
        if(action === undefined) return false;
        switch(action.action){
            case "Patrol":
                return true;
        }
        return false;
    };
    $scope.isBloodgroundRequired = function(action){
        if(action === undefined) return false;
        switch(action.action){
            case "Feed":
                return true;
        }
        return false;
    };
    $scope.showTest = function(action){
        if(action === undefined) return false;
        switch(action.action){
            case "Assist a background":
            case "No action":
            case "Relax (no action)":
            case "Spend XP":
            case "Meet other character":
                return false;
        }
        return true;
    };
    $scope.isTestRequired = function(action){
        if(action === undefined) return false;

        switch(action.action){
            case "Assist a background":
            case "No action":
            case "Relax (no action)":
            case "Spend XP":
            case "Meet other character":
                return false;
        }
        if(action.test) return false;
        return true;
    };

    $scope.showCharacter = function(action){
        if(action === undefined) return false;
        switch(action.action){
            case "Meet other character":
            case "Assist":
            case "Destroy":
                return true;
        }
        return false;
    };
    $scope.isCharacterRequired = function(action){
        if(action === undefined) return false;
        switch(action.action){
            case "Meet other character":
            case "Assist":
            case "Destroy":
                return true;
        }
        return false;
    };

    $scope.getChar = function(val) {
        if(val.length > 3){
            return $http.get('/character/findbyname/' + val + "/" + $scope.character.chronicle.id, {}).then(function(response){
                return response.data.map(function(item){
                    return item.name;
                });
            });
        }
    };

    $scope.findBackgroundValue = function(name){
        if($scope.character === undefined) return 0;
        var result = $.grep($scope.character.backgrounds, function(e){ return e.name == name });
        if(result.length > 0){
            if(name === "Retainers")
            {
                return result.length;
            }
            return result[0].rating;
        }
        return 0;
    };

    $scope.findInfluenceValue = function(name){
        if($scope.character === undefined) return 0;
        var result = $.grep($scope.character.influences, function(e){ return e.name == name });
        if(result.length > 0){
            return result[0].rating;
        }
        return 0;
    };

    $scope.getRetainers = function(){
        if($scope.character === undefined) return null;
        var result = $.grep($scope.character.backgrounds, function(e){ return e.name == 'Retainers' });
        return result;
    };

    $scope.findCharacter = function(id){
        var i = $scope.allcharacters.length;
        while(i > -1){
            i--;
            var el = $scope.allcharacters[i];
            if(el !== undefined){
                if(el.id == id){
                    return el.name;
                }
            }
        }
        return "";
    };

    $scope.submit = function(){

        loading.show();
        $scope.downtime = {
            downtimePeriod: $scope.period.id,
            characterid: $scope.scharacter.id,
            actions: $scope.actions,
            response: {}
        };
        $http.post("/downtime/savesubmission", {downtime: $scope.downtime}).then(function(response){
            location = "/downtime/";
        });
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

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
                resources.allyActions.get(function(data){
                    root.allyActions = data;
                }),
                resources.contactActions.get(function(data){
                    root.contactActions = data;
                }),
                resources.influenceActions.get(function(data){
                    root.influenceActions = data;
                }),
                resources.playerActions.get(function(data){
                    root.playerActions = data;
                }),
                resources.resourceActions.get(function(data){
                    root.resourceActions = data;
                }),
                resources.retainerActions.get(function(data){
                    root.retainerActions = data;
                }),
                resources.locations.get(function(data){
                    root.locations = data;
                }),
                resources.bloodgrounds.get(function(data){
                    root.bloodgrounds = data;
                }),
                resources.influenceSpheres.get(function(data){
                    root.influences = data;
                }),
                $http.get("/downtime/findPeriod/" + id).then(function (response) {
                    root.period = response.data[0];
                    root.period.openFrom = new Date(root.period.openFrom);
                    root.period.openTo = new Date(root.period.openTo);
                }),
                $http.get("/character/allByPlayer/").then(function (response) {
                    root.characters = response.data;
                    root.allcharacters = angular.copy(root.characters);
                }),
                $http.get("/downtime/submittedCharacters/" + id).then(function (response) {
                    root.submittedperiods = response.data
                })]
        ).then(function(){
                for(var i = root.submittedperiods.length; i--;)
                {
                    var result = $.grep(root.characters, function(e){
                        return e.id == root.submittedperiods[i].characterid;
                    });
                    if(result.length > 0){
                        root.characters.splice($.inArray(result[0], root.characters),1);
                    }
                }
                loading.hide()
            });
    };
}]);