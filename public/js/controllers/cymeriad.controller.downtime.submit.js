app.controller('cymeriad.controller.downtime.submit', ['$scope', '$http', 'loading', '$q', function ($scope, $http, loading, $q) {
    $scope.period = {};
    $scope.downtime = {};
    $scope.characters = [];
    $scope.scharacter = {};

    $scope.submit = function(){
        loading.show();
        $scope.downtime = {
            downtimePeriod: $scope.period.id,
            characterid: $scope.scharacter.id,
            actions: {},
            response: {}
        };
        $http.post("/downtime/savesubmission", {downtime: $scope.downtime}).then(function(response){
           location = "/downtime/";
        });
    };

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all(
            $http.get("/downtime/findPeriod/" + id).then(function (response) {
                root.period = response.data[0];
                root.period.openFrom = new Date(root.period.openFrom);
                root.period.openTo = new Date(root.period.openTo);
            }),
            $http.get("/character/allByPlayer/").then(function (response) {
                root.characters = response.data;
            })
        ).then(function(){
            loading.hide()
        });
    };
}]);