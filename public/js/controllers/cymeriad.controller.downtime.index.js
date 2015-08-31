"use strict";
app.controller('cymeriad.controller.downtime.index', ['$scope', '$http', 'loading', '$q', function ($scope, $http, loading, $q) {
    $scope.downtimeperiods = [];
    $scope.openperiods = [];
    $scope.submittedperiods = [];
    $scope.chronicles = [];
    $scope.isAdmin = false;

    $scope.findChronicleName = function(id){
        var i = $scope.chronicles.length;
        while(i > -1){
            i--;
            var el = $scope.chronicles[i];
            if(el !== undefined){
                if(el.id == id){
                    return el.name;
                }
            }
        }
        return "";
    };
    $scope.delete = function(id){
        loading.show();
        $http.post("/downtime/delete", {period: id}).then(function(response){
            $scope.init($scope.isAdmin);
        });
    };
    $scope.init = function (isAdmin) {
        $scope.isAdmin = isAdmin;
        loading.show();
        var root = $scope;
        if(isAdmin){
            $q.all(
                $http.get("/downtime/allPeriods/").then(function (response) {
                    root.downtimeperiods = response.data;
                })
            );
        }

        $q.all([
            $http.get("/chronicle/list").then(function (response) {
                root.chronicles = response.data;
            }),
            $http.get("/downtime/openPeriods/").then(function(response){
                root.openperiods = response.data;
            }),
            $http.get("/downtime/submittedPeriods/").then(function(response){
                root.submittedperiods = response.data;
            })]
        ).then(function(){

                $http.get("/chronicle/listByPlayer").then(function (response) {
                    root.chronicles = root.chronicles.concat(response.data);
                }).then(function(){

                    loading.hide();
                });
            });

    }
}]);