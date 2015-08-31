"use strict";
app.controller('cymeriad.controller.character.status', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.log = function (event) {
        console.log(event);
    };

    $scope.chronicles = [];

    $scope.findChronicle = function(id){
        var i = $scope.chronicles.length;
        if(id === undefined) return false;
        while(i--){
            if($scope.chronicles[i].id == id) return $scope.chronicles[i];
        }
        return false;
    };

    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        $http.get("/character/all/full").then(function (response) {
            var characters = response.data;
            var i = characters.length;
            while(i--) {
                var char = characters[i];
                if (char.chronicle.name === undefined) continue;
                if (char.state !== 'Active') continue;
                var chronicle = $scope.findChronicle(char.chronicle.id);
                if (!chronicle) {
                    $scope.chronicles.push({id: char.chronicle.id, name: char.chronicle.name, characters: []});
                    chronicle = $scope.findChronicle(char.chronicle.id);
                }
                chronicle.characters.push({
                    name: char.name,
                    id: char.id,
                    status: char.status,
                    state: char.state,
                    title: char.title
                });

                chronicle.characters.sort(function(a,b){
                    if (a.status.length > b.status.length)
                        return -1;
                    if (a.status.length < b.status.length)
                        return 1;
                    if (a.status.length == b.status.length){
                        if (a.name < b.name)
                            return -1;
                        if (a.name > b.name)
                            return 1;
                        return 0;
                    }
                });
            }

            root.chronicles.sort();


            loading.hide();
        });
    };
}]);
