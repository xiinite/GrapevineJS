"use strict";
app.controller('cymeriad.controller.character.influences', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.log = function (event) {
        console.log(event);
    };

    $scope.characters = [];
    $scope.chronicles = [];

    $scope.findChronicle = function(id){
        var i = $scope.chronicles.length;
        if(id === undefined) return false;
        while(i--){
            if($scope.chronicles[i].id == id) return $scope.chronicles[i];
        }
        return false;
    };

    $scope.findInfluence = function(chronicle, id){
        var i = chronicle.influences.length;
        if(id === undefined) return false;
        while(i--){
            if(chronicle.influences[i].name == id) return chronicle.influences[i];
        }
        return false;
    };

    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        $http.post("/character/all", {fields: 'id name influences chronicle state'}).then(function (response) {
            root.characters = response.data;
            var i = root.characters.length;
            while(i--) {
                var char = root.characters[i];
                if (char.chronicle.name === undefined) continue;
                if (char.state !== 'Active') continue;
                var chronicle = $scope.findChronicle(char.chronicle.id);
                if (!chronicle) {
                    $scope.chronicles.push({id: char.chronicle.id, name: char.chronicle.name, influences: []});
                    chronicle = $scope.findChronicle(char.chronicle.id);
                }

                var j = char.influences.length;
                while (j--) {
                    var influenceName = char.influences[j].name;
                    var note = '';
                    if (char.influences[j].note) {
                        note =  char.influences[j].note;
                    }
                    var influence = $scope.findInfluence(chronicle, influenceName);
                    if (!influence) {
                            chronicle.influences.push({name: influenceName, total: 0, characters: []});
                            influence = $scope.findInfluence(chronicle, influenceName)
                    }
                    if (influence) {
                        influence.total += char.influences[j].rating;
                        influence.characters.push({char: char.name, note: note, rating: char.influences[j].rating})
                        influence.characters.sort(function (a,b) {
                            if (a.rating < b.rating)
                                return -1;
                            if (a.rating > b.rating)
                                return 1;
                            if (a.rating == b.rating){
                                if (a.char < b.char)
                                    return -1;
                                if (a.char > b.char)
                                    return 1;
                                return 0;
                            }
                        });
                    }
                }
                chronicle.influences.sort(function (a,b) {
                    if (a.name < b.name)
                        return -1;
                    if (a.name > b.name)
                        return 1;
                    return 0;
                });
            }
            root.chronicles.sort();


            loading.hide();
        });
    };
}]);
