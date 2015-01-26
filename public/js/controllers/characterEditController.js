app.controller('CharacterEditController', ['$scope', '$http', 'loading', 'resources', function ($scope, $http, loading, resources) {
    $scope.log = function (event) {
        console.log(event);
    }
    $scope.resourcesLoaded = false;
    $scope.abilities = [];
    $scope.backgrounds = [];
    $scope.clans = [];
    $scope.disciplines = [];
    $scope.flaws = [];
    $scope.influences = [];
    $scope.mental = [];
    $scope.merits = [];
    $scope.negativemental = [];
    $scope.negativephysical = [];
    $scope.negativesocial = [];
    $scope.physical = [];
    $scope.rituals = [];
    $scope.sects = [];
    $scope.social = [];

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
        if(!$scope.resourcesLoaded)
        {
            resources.abilities.get(function(data){
                root.abilities = data;
            });
            resources.backgrounds.get(function(data){
                root.backgrounds = data;
            });
            resources.clans.get(function(data){
                root.clans = data;
            });
            resources.disciplines.get(function(data){
                root.disciplines = data;
            });
            resources.flaws.get(function(data){
                root.flaws = data;
            });
            resources.influences.get(function(data){
                root.influences = data;
            });
            resources.mental.get(function(data){
                root.mental = data;
            });
            resources.merits.get(function(data){
                root.merits = data;
            });
            resources.negativemental.get(function(data){
                root.negativemental = data;
            });
            resources.negativephysical.get(function(data){
                root.negativephysical = data;
            });
            resources.negativesocial.get(function(data){
                root.negativesocial = data;
            });
            resources.physical.get(function(data){
                root.physical = data;
            });
            resources.rituals.get(function(data){
                root.rituals = data;
            });
            resources.sects.get(function(data){
                root.sects = data;
            });
            resources.social.get(function(data){
                root.social = data;
            });
        }
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
