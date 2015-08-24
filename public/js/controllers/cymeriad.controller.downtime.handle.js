"use strict";
app.controller('cymeriad.controller.downtime.handle', ['$scope', '$http', 'loading', '$q', function ($scope, $http, loading, $q) {
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

    $scope.findBackgroundValue = function(character, name){
        if(character === undefined) return 0;
        if(name === 'ally') name = 'Allies';
        if(name === 'contact') name = 'Contacts';
        if(name === 'resource') name = 'Resources';
        var result = $.grep(character.backgrounds, function(e){ return e.name == name });
        if(result.length > 0){
            if(name === "Retainers")
            {
                return result.length;
            }
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
    }

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
            $http.get("/downtime/listbyperiod/" + id).then(function (response) {
                root.downtimes = response.data;
                root.active = root.downtimes[0].id
            })
        ]).then(function(){
            $q.all([
                $http.get("/character/all/full").then(function (response) {
                    root.characters = response.data;
                }),
                $http.get("/downtime/findPeriod/" + id).then(function (response) {
                    root.period = response.data[0];
                })
            ]).then(function(){
                loading.hide();
            });
        });
    };
}]);