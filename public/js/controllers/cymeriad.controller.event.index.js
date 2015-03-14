app.controller('cymeriad.controller.event.index', ['$scope', '$http', function ($scope, $http) {
    $scope.loadData = function(callback){
        console.log("myController.testFunc: ");
        $http.post("/event/find", {filters: {}}).then(function (response) {
            callback(response);
        });
    }
}]);