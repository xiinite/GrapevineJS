app.controller('CharacterEditController', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.log = function (event) {
        console.log(event);
    }

    $scope.character = [];
    $scope.players = [];
    $scope.statusses = [
        "Active", "Stopped", "Deceased"
    ];
    $scope.save = function(){
        var fields = {};
        $(".ng-dirty").each(function(){
            if($(this).data("field") !== undefined){
                fields[$(this).data("field")] = angular.element(this).data('$ngModelController').$modelValue;
            }
        })
        $http.post("/character/update", {id: $scope.character.id, fields: fields}).then(function(response){
            $scope.init($scope.character.id);
        });
        $scope.editId = 0;
    }

    $scope.display = function(player){
        if(player.emails[0] !== undefined)
        {
            return player.displayName + " (" + player.provider + " - " + player.emails[0].value + ")";
        }else {
            return player.displayName + " (" + player.provider + ")";
        }
    }
    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        $http.get("/character/find/" + id).then(function (response) {
            root.character = response.data;
            root.character.experience.unspent = parseInt(root.character.experience.unspent);
            root.character.experience.total = parseInt(root.character.experience.total);
            $http.get("/chronicle/find/" + root.character.chronicle.id).then(function (response) {
                $scope.players = response.data.playerDocs;
                $scope.characterForm.$setPristine();
                loading.hide();
            });
        });
    };
}]);
