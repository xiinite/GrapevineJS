"use strict";
app.controller('cymeriad.controller.downtime.review', ['$scope', '$http', 'loading', '$q', function ($scope, $http, loading, $q) {
    $scope.downtime = {};
    $scope.character = {};
    $scope.period = {};

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