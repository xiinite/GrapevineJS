"use strict";
app.controller('cymeriad.controller.event.edit', ['$scope', '$http', 'loading', '$filter', 'ngToast', function ($scope, $http, loading, $filter, ngToast) {
    $scope.event = {};
    $scope.chronicles = [];
    $scope.characters = [];
    $scope.players = [];
    $scope.attendee = {};
    $scope.xpamount = 1;

    $scope.isPlayerChar = function (actual, expected) {
        if(actual == expected) return true;
        return false
    };

    $scope.updateSelectedChronicle = function(){
        $scope.players = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].playerDocs;
        $scope.characters = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].characters;
    };

    $scope.addAttendee = function(){
        $scope.event.players.push($scope.attendee.selected);
    };

    $scope.removeAttendee = function(item){
        $scope.event.players.splice($.inArray(item, $scope.event.players),1)
    };

    $scope.addChar = function(char){
        if($scope.event.characters === undefined) $scope.event.characters = [];
        $scope.event.characters.push(
            {name: char.name, id: char.id, googleId: char.googleId, chronicle: char.chronicle.id}
        );
    };

    $scope.removeChar = function(item){
        $scope.event.characters.splice($.inArray(item, $scope.event.characters),1)
    };

    $scope.save = function(){
        var saving = ngToast.create({
            className: 'info',
            content: 'Saving...',
            timeout: 2000
        });
        $http.post("/event/update", {event: $scope.event}).then(function(response){
            if(response.data === "ok")
            {
                ngToast.dismiss(saving);
                ngToast.create({
                    className: 'success',
                    content: 'Saved!',
                    timeout: 2000
                });
                $scope.init($scope.event.id);
            }
            else{
                ngToast.dismiss(saving);
                ngToast.create({
                    className: 'error',
                    content: 'Error!' + response.data,
                    timeout: 2000
                });
            }
        });
    };

    $scope.awardXP = function(){
        var root = $scope;
        var saving = ngToast.create({
            className: 'info',
            content: 'Saving...',
            timeout: 2000
        });
        var charIds = $scope.event.characters.map(function(item){return item.id});
        $http.post("/character/awardxp", {ids: charIds, amount: $scope.xpamount}).then(function(response){
            if(response.data === "ok")
            {
                root.event.xpawarded = true;
                root.save();
            }
            else{
                alert(response.data);
            }
        });
    };

    $scope.init = function(id){
        loading.show();
        var root = $scope;
        $http.post("/event/find", {filters: {id: id}}).then(function (response) {
            root.event = response.data[0];
            root.event.date = new Date(root.event.date);
            $http.get("/chronicle/all").then(function (response) {
                $scope.chronicles = response.data;
                $scope.players = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].playerDocs;
                $scope.characters = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].characters;
                loading.hide();
            });
        });

    };
}]);