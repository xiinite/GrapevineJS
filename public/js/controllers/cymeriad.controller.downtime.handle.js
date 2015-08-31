"use strict";
app.controller('cymeriad.controller.downtime.handle', ['$scope', '$http', 'loading', '$q', 'ngToast', function ($scope, $http, loading, $q, ngToast) {
    $scope.downtimes = [];
    $scope.characters = {};
    $scope.period = {};
    $scope.active;

    $scope.findCharacter = function(id){
        var i = $scope.characters.length;
        while(i--){
            if($scope.characters[i].id == id){
                return $scope.characters[i];
            }
        }
    };

    $scope.findAssists = function(downtime, bg){
        var i = $scope.downtimes.length;
        var character = $scope.findCharacter(downtime.characterid);
        if(character === undefined) return false;
        var ac = downtime.actions[bg];
        var assists = [];
        while(i--){
            var dt = $scope.downtimes[i];
            for(var a in dt.actions){
                var action = dt.actions[a];
                if(action.targetBackground === ac.name && action.target !== undefined && action.targetBackground !== undefined){
                    if( action.target === character.name){
                        var assister = $scope.findCharacter(dt.characterid);
                        action.assister = assister.name;
                        action.characterid = dt.characterid;
                        assists.push(action)
                    }
                }
            }
        }
        if(assists.length > 0){
            return assists;
        }
    };

    $scope.findBackgroundValue = function(character, name){
        if(character === undefined) return 0;
        var retainer = false;
        if(name === 'ally') name = 'Allies';
        if(name === 'contact') name = 'Contacts';
        if(name === 'resource') name = 'Resources';
        if(name.indexOf('retainer') > -1) retainer = true;
        var result = [];
        if(retainer) {
            var index = parseInt(name.replace('retainer', ''));
            var all = $.grep(character.backgrounds, function(e){ return e.name == 'Retainers' });
            if(all[index].note){
                return all[index].note + ': ' + all[index].rating;
            }else{
                return all[index].rating;
            }
        }else{
            result = $.grep(character.backgrounds, function(e){ return e.name == name });
        }
        if(result.length > 0){

            return result[0].rating;
        }
        return 0;
    };

    $scope.findInfluenceValue = function(character, name){
        if(character === undefined) return 0;
        var result = $.grep(character.influences, function(e){ return e.name == name });
        if(result.length > 0){
            return result[0].rating;
        }
        return 0;
    };

    $scope.isActive = function(downtime){
        return downtime.id === $scope.active;
    };

    $scope.next = function(){
        $scope.direction = 'right';
        var i = $scope.findIndex($scope.active);
        if(i + 1 == $scope.downtimes.length) return;
        $scope.active = $scope.downtimes[i + 1].id;
    };

    $scope.previous = function(){

        $scope.direction = 'left';
        var i = $scope.findIndex($scope.active);
        if(i == 0) return;
        $scope.active = $scope.downtimes[i - 1].id;
    };

    $scope.findIndex = function(id){
        var i = $scope.downtimes.length;
        while(i--){
            if($scope.downtimes[i].id === id) return i;
        }
    };

    $scope.getDirection = function(){
        if($scope.direction == 'left'){
            return "slide-left"
        }
        else{
            return "slide-right";
        }
    };

    $scope.save = function(){
        var saving = ngToast.create({
            className: 'info',
            content: 'Saving...',
            timeout: 2000
        });
        $http.post("/downtime/updatesubmission", {downtimes: $scope.downtimes}).then(function(response){
            ngToast.dismiss(saving);
            ngToast.create({
                className: 'success',
                content: 'Saved!',
                timeout: 2000
            });
        });
    };

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
            $http.get("/character/all/full").then(function (response) {
                root.characters = response.data;
            }),
            $http.get("/downtime/listbyperiod/" + id).then(function (response) {
                root.downtimes = response.data;
                root.active = root.downtimes[0].id
            }),
            $http.get("/downtime/findPeriod/" + id).then(function (response) {
                root.period = response.data[0];
            })
        ]).then(function(){
            loading.hide();
        });
    };
}]);