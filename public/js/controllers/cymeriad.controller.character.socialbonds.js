"use strict";
app.controller('cymeriad.controller.character.socialbonds', ['$scope', '$http', 'loading', '$modal', 'ngToast', function ($scope, $http, loading, $modal, ngToast) {
    $scope.log = function (event) {
        console.log(event);
    };

    $scope.chronicles = [];
    $scope.schar = {};

    $scope.addBond = function (char) {
        $scope.schar = char;

        var chron = $scope.findChronicle($scope.schar.chronicle.id);
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'bondModal.html',
            controller: 'bondModalCrtl',
            size: 'md',
            resolve: {
                model: function () {
                    return {char: $scope.schar, chronicle: chron};
                }
            }
        });

        modalInstance.result.then(function (bond) {
            var result = $.grep($scope.schar.bloodbonds, function(e){ return (e.character == bond.character
            && e.level == bond.level); });

            if(result.length === 0) {
                $scope.schar.bloodbonds.push(bond);
            }
            else{
                result[0].level++;
            }

            modalInstance.close();
            $scope.update($scope.schar.id, { bloodbonds: $scope.schar.bloodbonds });

            if(bond.mutual){
                var chronicle = $scope.findChronicle($scope.schar.chronicle.id);
                if(chronicle !== false){
                    var partner = $scope.findCharacter(chronicle, bond.character);
                    if(partner !== false){
                        result = $.grep(partner.bloodbonds, function(e){ return (e.character == $scope.schar.name
                        && e.level == bond.level); });

                        if(result.length === 0) {
                            bond = {level: bond.level, character: $scope.schar.name, node: bond.name};
                            partner.bloodbonds.push(bond);
                        }
                        else{
                            result[0].level++;
                        }
                        $scope.update(partner.id, { bloodbonds: partner.bloodbonds });
                    }
                }
            }
        }, function () {
        });
    };

    $scope.removeBond = function(char, bond){
        if(bond.level === undefined){
            char.bloodbonds.splice($.inArray(bond, char.bloodbonds),1);
        }
        else if(bond.level == 1){
            char.bloodbonds.splice($.inArray(bond, char.bloodbonds),1);

        }else{
            bond.level--;
        }

        $scope.update(char.id, { bloodbonds: char.bloodbonds });
    };

    $scope.incrementBond = function(char, bond){
        bond.level++;
        if(bond.level > 3) bond.level = 3;

        $scope.update(char.id, { bloodbonds: char.bloodbonds });
    };

    $scope.addBoon = function(char){
        $scope.schar = char;

        var chron = $scope.findChronicle($scope.schar.chronicle.id);
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'boonModal.html',
            controller: 'boonModalCrtl',
            size: 'md',
            resolve: {
                model: function () {
                    return {char: $scope.schar, chronicle: chron};
                }
            }
        });

        modalInstance.result.then(function (boon) {
            if($scope.schar.boons === undefined) $scope.schar.boons = [];
            $scope.schar.boons.push(boon);

            modalInstance.close();
            $scope.update($scope.schar.id, { boons: $scope.schar.boons });

        }, function () {
        });
    };

    $scope.removeBoon = function(char, boon){
        char.boons.splice($.inArray(boon, char.boons),1);
        $scope.update($scope.schar.id, { boons: $scope.schar.boons });
    };

    $scope.updateCoterie = function(char){
        $scope.schar = char;

        var chron = $scope.findChronicle($scope.schar.chronicle.id);
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'coterieModal.html',
            controller: 'coterieModalCrtl',
            size: 'md',
            resolve: {
                model: function () {
                    return {char: $scope.schar, chronicle: chron, coterie: $scope.schar.coterie};
                }
            }
        });
        modalInstance.result.then(function (coterie) {
            modalInstance.close();
            $scope.schar.coterie = coterie;
            $scope.update($scope.schar.id, { coterie: coterie });
        }, function () {
        });
    };

    $scope.update = function(id, fields){
        var saving = ngToast.create({
            className: 'info',
            content: 'Saving...',
            timeout: 2000
        });
        $http.post("/character/update", {id: id, fields: fields}).then(function(){
            ngToast.dismiss(saving);
            ngToast.create({
                className: 'success',
                content: 'Saved!',
                timeout: 2000
            });
        });
    };

    $scope.findChronicle = function(id){
        var i = $scope.chronicles.length;
        if(id === undefined) return false;
        while(i--){
            if($scope.chronicles[i].id == id) return $scope.chronicles[i];
        }
        return false;
    };
    $scope.findCharacter = function(chronicle, name){
        var i = chronicle.characters.length;
        if(name === undefined) return false;
        while(i--){
            if(chronicle.characters[i].name == name) return chronicle.characters[i];
        }
        return false;
    };

    $scope.loadContent = function(id){
        var chronicle = $scope.findChronicle(id);
        if(!chronicle) return;
        if(chronicle.loaded == true) return;
        loading.show();
        var root = $scope;
        $http.post("/character/all", {where: {state: {$in: ["Approved", "Active"]},chronicle: id}, fields: 'id name coterie chronicle bloodbonds boons state'}).then(function (response) {
            chronicle.characters = response.data;

            chronicle.characters.sort(function(a,b){
                if (a.name < b.name)
                    return -1;
                if (a.name > b.name)
                    return 1;
                return 0;
            });
            chronicle.loaded = true;
            loading.hide();
        });
    };

    $scope.init = function () {
        loading.show();
        var root = $scope;
        $http.get("/chronicle/list").then(function (response) {
            root.chronicles = response.data;
            root.chronicles.sort();


            loading.hide();
        });
    };
}]);


app.controller('bondModalCrtl', function ($scope, $modalInstance, model) {
    $scope.char = model.char;
    $scope.chronicle = model.chronicle;
    $scope.bond = { level: '1', character: '', note: '' };
    $scope.ok = function () {
        $modalInstance.close($scope.bond);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('boonModalCrtl', function ($scope, $modalInstance, model) {
    $scope.char = model.char;
    $scope.chronicle = model.chronicle;
    $scope.boon = { level: 'trivial', character: '', note: '' };
    $scope.ok = function () {
        $modalInstance.close($scope.boon);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('coterieModalCrtl', function ($scope, $modalInstance, model) {
    $scope.char = model.char;
    $scope.chronicle = model.chronicle;
    $scope.coterie = model.coterie;
    $scope.ok = function () {
        $modalInstance.close($scope.coterie);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if(keys.indexOf(key) === -1 && key.length > 0) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});