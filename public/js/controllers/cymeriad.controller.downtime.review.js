"use strict";
app.controller('cymeriad.controller.downtime.review', ['$scope', '$http', 'loading', '$q', function ($scope, $http, loading, $q) {
    $scope.downtime = {};
    $scope.character = {};

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
            $http.get("/downtime/find/" + id).then(function (response) {
                root.downtime = response.data[0];
            })
        ]).then(function(){
            $http.get("/character/find/" + root.downtime.characterid).then(function (response) {
                root.character = response.data[0];
                loading.hide();
            }).then(function(){
                loading.hide();
            });
        });
    };
}]);