"use strict";
app.controller('cymeriad.controller.downtime.edit', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.period = {};
    $scope.chronicles = [];

    $scope.Save = function(){
        loading.show();
        $http.post("/downtime/update", {period: $scope.period}).then(function(response){
           location = "/downtime/";
        });
    };

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $http.get("/downtime/findPeriod/" + id).then(function (response) {
            root.period = response.data[0];
            root.period.openFrom = new Date(root.period.openFrom);
            root.period.openTo = new Date(root.period.openTo);

            $http.get("/chronicle/list").then(function (resp) {
                root.chronicles = resp.data;
                if (root.chronicles.length > 0) {
                    $scope.loaded = true;
                }
                loading.hide();
            });
        });
    };
}]);