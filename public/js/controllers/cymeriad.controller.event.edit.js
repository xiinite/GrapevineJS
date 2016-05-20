"use strict";
app.controller('cymeriad.controller.event.edit', ['$scope', '$http', 'loading', '$filter', 'ngToast', '$q', function ($scope, $http, loading, $filter, ngToast, $q) {
    $scope.event = {};
    $scope.chronicles = [];
    $scope.characters = [];
    $scope.players = [];
    $scope.attendee = {};
    $scope.xpamount = 1;
    $scope.alldowntimes = [];
    $scope.downtimes = [];
    $scope.feedingactions = [];
    $scope.parseInt = parseInt;

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
        $scope.downtimes = $filter('filter')($scope.alldowntimes, $scope.event.chronicleid);
    };

    $scope.updateSelectedDowntime = function(){
      $http.get("/downtime/listbyperiod/" + $scope.event.selectedDowntime.id).then(function (response) {
          $scope.feedingactions = getFeedingActions(response.data);
      })
    }

    var getFeedingActions = function (downtimes) {
        var arr = [];
        var i = downtimes.length;
        while(i--){
            for (var prop in downtimes[i].actions) {
                var ac = downtimes[i].actions[prop];
                if (ac.action === "Feed") {
                    if(ac){
                        ac.dt = (downtimes[i])._id;
                        ac.name = prop;
                        arr.push(ac);
                        var char = findCharById(downtimes[i].characterid);
                        if(char !== undefined){
                            ac.charactername = char.name
                        }else{
                            ac.charactername = "";
                        }
                    }
                }
            }
        }

        return arr;
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
                willpower: char.willpower, status: char.status,
                backgrounds: char.backgrounds,
                flaws: char.flaws,
                merits: char.merits,
                clan: char.clan,
                bloodpool: char.bloodpool
            }
        );
        $scope.save();
    };

    $scope.removeChar = function(item){
        $scope.event.characters.splice($.inArray(item, $scope.event.characters),1);
        $scope.save();
    };

    var findCharById = function(id){
      var i = $scope.characters.length;
      while(i--){
          if($scope.characters[i].id == id) return $scope.characters[i];
      }
    }
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
    $scope.findFeedingValue = function(charactername){
        var i = $scope.feedingactions.length;
        var char = findChar(charactername);
        var value = 3;
        if(char.clan === 'Ventrue') value = 2;
        if(char.clan === 'Toreador') value = 4;
        while(i--){
          var action = $scope.feedingactions[i];
          if(action.charactername == charactername){
            value += parseInt(action.location.harvest) + parseInt(action.feedingtype.harvest);
            if(findMerit(char.merits, 'Efficient digestion')) value += 1;
            if(findMerit(char.flaws, 'Haunted')) value -= 1;
          }
        }
        value += getBackgroundvalue(char.backgrounds, 'Herd');
        return Math.min(value, char.bloodpool.max);
    };

    var getBackgroundvalue = function(bgs, name){
      var i = bgs.length;
      while(i--){
        if(bgs[i].name === name){
          return bgs[i].rating;
        }
      }
      return 0;
    }

    var findMerit = function(merits, name){
      var i = merits.length;
      while(i--){
        if(merits[i].name === name)
        {
          return true;
        }
      }
      return false;
    }

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

            $q.all([
                $http.get("/downtime/allPeriods/").then(function (response) {
                    root.alldowntimes = response.data;
                    root.downtimes = $filter('filter')(root.alldowntimes, root.event.chronicleid);
                }),
                $http.get("/chronicle/all").then(function (response) {
                    $scope.chronicles = response.data;
                    $scope.players = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].playerDocs;
                    $scope.characters = $filter('filter')($scope.chronicles, $scope.event.chronicleid)[0].characters;
                })]
            ).then(function(){loading.hide();});
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
