"use strict";
app.controller('cymeriad.controller.character.status', ['$scope', '$http', 'loading', '$modal', 'ngToast', function ($scope, $http, loading, $modal, ngToast) {
    $scope.log = function (event) {
        console.log(event);
    };

    $scope.chronicles = [];
    $scope.schar = {};
    $scope.findChronicle = function(id){
        var i = $scope.chronicles.length;
        if(id === undefined) return false;
        while(i--){
            if($scope.chronicles[i].id == id) return $scope.chronicles[i];
        }
        return false;
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
    }
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
    }

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
    $scope.init = function () {
        loading.show();
        var root = $scope;
        $http.post("/character/all", {fields: 'id name title status chronicle state'}).then(function (response) {
            var characters = response.data;
            $scope.chronicles = [];
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
