"use strict";
app.controller('cymeriad.controller.character.harpies', ['$scope', '$http', 'loading', '$modal', 'ngToast', function ($scope, $http, loading, $modal, ngToast) {
    $scope.log = function (event) {
        console.log(event);
    };

    $scope.statusHidden = false;
    $scope.chronicles = [];
    $scope.schar = {};

    $scope.toggleStatus = function(){
        $scope.statusHidden = !$scope.statusHidden;
    };

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

    $scope.updateTitle = function(char)
    {
        $scope.schar = char;

        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'titleModal.html',
            controller: 'titleModalCrtl',
            size: 'md',
            resolve: {
                char: function () {
                    return $scope.schar;
                }
            }
        });

        modalInstance.result.then(function (char) {
            $scope.schar.title = char.title;

            modalInstance.close();
            $scope.update($scope.schar.id, { title: $scope.schar.title });
        }, function () {
        });
    };

    $scope.addStatus = function (char) {
        $scope.schar = char;

        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'statusModal.html',
            controller: 'statusModalCrtl',
            size: 'md',
            resolve: {
                char: function () {
                    return $scope.schar;
                }
            }
        });

        modalInstance.result.then(function (status) {
            var result = $.grep($scope.schar.status, function(e){ return (e.name == status.name
            && e.statustype == status.statustype); });
            if(result.length === 0) {
                $scope.schar.status.push(status);
            }
            else{
                result[0].rating++;
            }

            modalInstance.close();
            $scope.update($scope.schar.id, { status: $scope.schar.status });
        }, function () {
        });
    };

    $scope.removeStatus = function(char, status){
        if(status.rating === undefined){
            char.status.splice($.inArray(status, char.status),1);
        }
        else if(status.rating == 1){
            char.status.splice($.inArray(status, char.status),1);

        }else{
            status.rating--;
        }

        $scope.update(char.id, { status: char.status });
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
        $http.post("/character/all", {where: {state: {$in: ["Approved", "Active", "Final Approval Pending", "Background Submitted"]},chronicle: id}, fields: 'id name chronicle title status boons state'}).then(function (response) {
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

app.controller('statusModalCrtl', function ($scope, $modalInstance, char) {
    $scope.char = char;
    $scope.status = { statustype: 'fleeting', name: '', rating: 1 };
    $scope.ok = function () {
        $modalInstance.close($scope.status);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('titleModalCrtl', function ($scope, $modalInstance, char) {
    $scope.char = char;
    $scope.ok = function () {
        $modalInstance.close($scope.char);
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