app.controller('ConceptController', ['$scope', '$http', 'loading', 'resources', '$window', function ($scope, $http, loading, resources, $window) {
    $scope.chronicles = [];
    $scope.schronicle = undefined;

    $scope.characterid = "";

    $scope.clans = [];
    $scope.sclan = undefined;

    $scope.name = "";
    $scope.concept = "";
    $scope.submitted = false;

    $scope.showForm = function(){
        return ($scope.chronicles.length > 0 && !$scope.submitted);
    };
    $scope.showNoChrons = function(){
        return ($scope.chronicles.length == 0 && !$scope.submitted);
    };
    $scope.showSubmitted = function(){
        return ($scope.submitted);
    };

    $scope.submitForm = function(){
        if($scope.schronicle !== undefined && $scope.sclan !== undefined && $scope.concept != "" && $scope.name != ""){
            loading.show();
            $http.post("/character/submitconcept", {chronicle: $scope.schronicle.id, clan: $scope.sclan, concept: $scope.concept, name: $scope.name}).then(function(response){
                if(response.data.id !== undefined){
                    $scope.characterid = response.data.id;
                    $scope.submitted = true;
                }else
                {
                    $window.alert(response.data);
                }
                loading.hide();
            });
        }
    };

    $scope.init = function () {
        loading.show();
        $http.get("/chronicle/listByPlayer").then(function (response) {
            $scope.chronicles = response.data;
            loading.hide();
        });

        resources.clans.get(function(data){
            $scope.clans = data;
        });
    }
}]);