"use strict";
app.controller('cymeriad.controller.event.index', ['$scope', '$http', function ($scope, $http) {
    $scope.loadData = function(callback){
        $http.post("/event/find", {filters: {}}).then(function (response) {
            callback(response);
        });
    }
}]);