app.controller('ApproveController', ['$scope', '$http', 'loading', 'resources', function ($scope, $http, loading, resources) {
    $scope.characters = [];

    $scope.showList = function(){
        if($scope.characters.length > 0){
            return true;
        }else{
            return false;
        }
    }

    $scope.approve = function(id){
        $http.post("/character/approveconcept", {id: id, state: "Approved"}).then(function(){
            for(var i=0;i<$scope.characters.length;i++){
                if($scope.characters[i].id == id){
                    $scope.characters.splice(i, 1);
                    return;
                }
            }
        });
    }

    $scope.reject = function(id){
        $http.post("/character/approveconcept", {id: id, state: "Rejected"}).then(function(){
            for(var i=0;i<$scope.characters.length;i++){
                if($scope.characters[i].id == id){
                    $scope.characters.splice(i, 1);
                    return;
                }
            }
        });

    }

    $scope.init = function () {

        $http.get("/character/approvelist/").then(function (response) {
            $scope.characters = response.data;
        });
    }
}]);