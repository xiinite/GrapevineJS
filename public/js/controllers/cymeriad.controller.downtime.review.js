"use strict";
app.controller('cymeriad.controller.downtime.review', ['$scope', '$http', 'loading', '$q', function ($scope, $http, loading, $q) {
    $scope.downtime = {};
    $scope.character = {};
    $scope.period = {};

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

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
            $http.get("/downtime/find/" + id).then(function (response) {
                root.downtime = response.data[0];

            })
        ]).then(function(){
            $q.all([
                $http.get("/character/find/" + root.downtime.characterid).then(function (response) {
                    root.character = response.data;
                }),
                $http.get("/downtime/findPeriod/" + root.downtime.downtimePeriod).then(function (response) {
                    root.period = response.data[0];
                })
            ]).then(function(){
                loading.hide();
            });
        });
    };
}]);