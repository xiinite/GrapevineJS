app.controller('BackgroundController', ['$scope', '$http', 'loading', 'resources', '$window', function ($scope, $http, loading, resources, $window) {
    $scope.character = {};
    $scope.background = "";

    $scope.submitted = false;
    $scope.editing = false;

    $scope.showForm = function(){
        return ($scope.chronicles.length > 0 && !$scope.submitted);
    };
    $scope.showSubmitted = function(){
        return ($scope.submitted);
    };

    $scope.submitForm = function(){
        var root = $scope;
        if($scope.background != null){
            root.submitted = true;
            loading.show();
            $http.post("/character/submitbackground", {id: $scope.character.id, background: $scope.background}).then(function(){

                location = '/character/show/' + $scope.character.id;

                loading.hide();
            });
        }
    };

    $scope.init = function (id) {
        var root = $scope;
        loading.show();
        $http.get("/character/find/" + id).then(function (response) {
            loading.hide();
            root.character = response.data;
            root.character.experience.unspent = parseInt(root.character.experience.unspent);
            root.character.experience.total = parseInt(root.character.experience.total);

            if(root.character.background.length == 0 || root.character.state == 'Background Rejected'){
                root.submitted = false;
                root.editing = true;
            }else{
                root.submitted = true;
                root.editing = false;
            }
        });
    }
}]);