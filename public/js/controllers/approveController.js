app.controller('ApproveController', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.characters = [];

    $scope.showList = function(){
        return $scope.characters.length > 0;
    };

    $scope.approve = function(id){
        loading.show();
        $http.post("/character/approveconcept", {id: id, state: "Approved"}).then(function(){
            loading.hide();
            for(var i=0;i<$scope.characters.length;i++){
                if($scope.characters[i].id == id){
                    $scope.characters.splice(i, 1);
                    return;
                }
            }
        });
    };

    $scope.reject = function(id, reason){
        loading.show();
        $http.post("/character/approveconcept", {id: id, state: "Rejected", reason: reason}).then(function(){
            loading.hide();
            for(var i=0;i<$scope.characters.length;i++){
                if($scope.characters[i].id == id){
                    $scope.characters.splice(i, 1);
                    return;
                }
            }
        });

    };

    $scope.init = function () {
        loading.show();
        $http.get("/character/approvelist/").then(function (response) {
            $scope.characters = response.data;
            loading.hide();
        });
    }
}]);