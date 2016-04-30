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

    $scope.renderStatus = function(status){
        var i = status.length;
        var abiding = 0;
        var fleeting = 0;
        while(i--){
            var s = status[i];
            if(s.statustype == "fleeting"){
                fleeting++;
            }
            if(s.statustype == "abiding"){
                if(s.name != "Acknowledged"){
                    abiding++;
                }
            }
        }
        return "Sf: " + fleeting + ", Sa: " + abiding;
    };

    $scope.updateSelectedChronicle = function(){
        $scope.players = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].playerDocs;
        $scope.characters = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].characters;
    };

    $scope.addAttendee = function(){
        if(findPlayer($scope.attendee.selected.googleId)) return;
        $scope.event.players.push($scope.attendee.selected);
    };

    $scope.removeAttendee = function(item){
        $scope.event.players.splice($.inArray(item, $scope.event.players),1)
    };

    $scope.addChar = function(char){
        if($scope.event.characters === undefined) $scope.event.characters = [];
        if(findChar(char.name)) return;
        $scope.event.characters.push(
            {
                name: char.name, id: char.id,
                googleId: char.googleId,
                chronicle: char.chronicle.id,
                willpower: char.willpower, status: char.status
            }
        );
        $scope.save();
    };

    $scope.removeChar = function(item){
        $scope.event.characters.splice($.inArray(item, $scope.event.characters),1);
        $scope.save();
    };

    var findChar = function(name){
        var i = $scope.event.characters.length;
        while(i--){
            if($scope.event.characters[i].name == name) return $scope.event.characters[i];
        }
    };
    var findPlayer = function(googleId){
        var i = $scope.event.players.length;
        while(i--){
            if($scope.event.players[i].googleId == googleId) return $scope.event.players[i];
        }
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
                //$scope.init($scope.event.id);
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

app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});