"use strict";
app.controller('cymeriad.controller.downtime.handle', ['$scope', '$http', 'loading', '$q', 'ngToast', 'truerandom', '$timeout',
function ($scope, $http, loading, $q, ngToast, truerandom, $timeout) {
    $scope.downtimes = [];
    $scope.characters = {};
    $scope.period = {};
    $scope.active = {};

    $scope.getRandomRPC = function(action){
            action.testresult = "loading";

            truerandom.getRand(1, 1, 3).then(function (data) {
                console.log(data.data.result.random.data[0]);
                if(data.data.result.random.data.length > 0){
                    switch(data.data.result.random.data[0]){
                        case 1:
                            $timeout(function(){action.testresult = "rock";});

                            return;
                        case 2:
                            $timeout(function(){action.testresult = "paper";});
                            //action.testresult = "paper";
                            return;
                        case 3:
                            $timeout(function(){action.testresult = "scissors";});
                            //action.testresult = "scissors";
                            return;
                    }
                }
            }, function (response){
                ngToast.create({
                    className: 'danger',
                    content: 'Failed to retrieve data from random.org',
                    timeout: 2000
                });
                console.log("Failed random.org request response:")
                console.log(response);
            });
    };

    $scope.getResultClass = function(action){
        if(!action.testresult) return "";
        switch(action.testresult){
            case "rock":
                if(action.test === "paper") return "success";
                if(action.test === "scissors") return "danger";
                return "warning";
            case "paper":
                if(action.test === "scissors") return "success";
                if(action.test === "rock") return "danger";
                return "warning";
            case "scissors":
                if(action.test === "rock") return "success";
                if(action.test === "paper") return "danger";
                return "warning";
        }
    }
    $scope.showTotalTraits = function(action){
        return action.name.indexOf("playerAction") <= -1;

    };
    $scope.getTotalTraits = function(action, downtime){
        if(downtime === undefined) return "?";
        if(action.name.indexOf("playerAction") > -1) return "?";
        var assists = $scope.findAssists(downtime, action.name);

        var total = 0;
        if(action.name.indexOf("Action") > -1){
            total = $scope.findBackgroundValueNumeric($scope.findCharacter(downtime.characterid), action.name.replace('Action',''))
        }else{
            total = $scope.findInfluenceValue($scope.findCharacter(downtime.characterid),action.name);
        }

        if(assists){
            var i = assists.length;

            while(i--){
                var ac = assists[i];
                var acval = 0;
                if(ac.name.indexOf('Action') > -1){
                    acval = $scope.findBackgroundValueNumeric($scope.findCharacter(ac.characterid), ac.name.replace('Action', ''))
                }else{
                    acval = $scope.findInfluenceValue($scope.findCharacter(ac.characterid),ac.name)
                }
                total += acval;
            }
        }
        return total;
    }

    $scope.getPlayersInLocation = function(characterid, location){
        var character = $scope.findCharacter(characterid);
        if(character === undefined) return false;
        if(location === undefined) return false;
        var loc = "";
        if(location.name !== undefined){
          loc = loc.name;
        }else{
          loc = location;
        }
        var i = $scope.downtimes.length;
        var players = "";
        while(i--){
            var dt = $scope.downtimes[i];
            if(dt.characterid == characterid) continue;
            for(var a in dt.actions){
                var action = dt.actions[a];
                if(action.location === undefined) continue;
                if(action.location === loc || action.location.name === loc){
                    var char = $scope.findCharacter(dt.characterid);
                    if(players.indexOf(char.name) === -1){
                        players = players + char.name + "(" + action.action + "), ";
                    }
                }
            }
        }

        if(players.length === 0) return "None";
        return players;
    }

    $scope.getTestresultIconClass = function(testresult){
        if(testresult === "loading"){
            return "fa fa-circle-o-notch fa-spin";
        }
        else{
            return 'fa fa-hand-' + testresult + '-o';
        }
    }

    $scope.findCharacter = function(id){
        var i = $scope.characters.length;
        while(i--){
            if($scope.characters[i].id == id){
                return $scope.characters[i];
            }
        }
    };
    $scope.findCharacterByName = function(name){
        var i = $scope.characters.length;
        while(i--){
            if($scope.characters[i].name == name){
                return $scope.characters[i];
            }
        }
    };

    $scope.isDefending = function(char, bg){
        if(char === undefined) return false;
        var downtime = $scope.findDowntimeByCharacter(char.id);
        if(downtime === undefined) return false;
        for (var prop in downtime.actions) {
            if (downtime.actions.hasOwnProperty(prop)) {
                var ac = downtime.actions[prop];
                if(ac){
                    if(ac.name === bg){
                        if(ac.action === "Defend"){
                            return ac.test;
                        }
                        else{
                            return false;
                        }
                    }
                }
            }
        }
        return false;
    };

    $scope.findDowntime = function(id){

        var i = $scope.downtimes.length;
        while(i--){
            if($scope.downtimes[i]._id == id){
                return $scope.downtimes[i];
            }
        }
    };

    $scope.findDowntimeByCharacter = function(id){

        var i = $scope.downtimes.length;
        while(i--){
            if($scope.downtimes[i].characterid == id){
                return $scope.downtimes[i];
            }
        }
    };

    $scope.hasAssists = function(dt){
        for(var a in dt.actions){
            var action = dt.actions[a];
            if(action.action == 'Assist'){
                return true;
            }
        }
        return false;
    };

    $scope.hasInfluences = function(dt){
        for(var a in dt.actions){
            var action = dt.actions[a];
            if(action.name === undefined || action.action === undefined) continue;
            if(action.name.indexOf('Action') === -1 && action.name.indexOf('Rating') == -1 && action.action !== 'Assist'){
                return true;
            }
        }
        return false;
    };

    $scope.findAssists = function(downtime, bg){
        if(downtime === undefined) return;
        if(bg === undefined) return;
        var i = $scope.downtimes.length;
        var character = $scope.findCharacter(downtime.characterid);
        if(character === undefined) return false;
        var ac = downtime.actions[bg];
        var assists = [];
        while(i--){
            var dt = $scope.downtimes[i];
            for(var a in dt.actions){
                var action = dt.actions[a];
                if(action.targetBackground === ac.name && action.action === 'Assist' && action.target !== undefined && action.targetBackground !== undefined){
                    if( action.target === character.name){
                        var assister = $scope.findCharacter(dt.characterid);
                        action.assister = assister.name;
                        action.characterid = dt.characterid;
                        assists.push(action)
                    }
                }
            }
        }
        if(assists.length > 0){
            return assists;
        }
    };

    $scope.findAssistsByPlayer = function(bgname, charname){
        var character = $scope.findCharacterByName(charname);
        if(character === undefined) return false;
        var dt = $scope.findDowntimeByCharacter(character.id);
        if(dt === undefined) return false;

        var i = $scope.downtimes.length;
        var ac = dt.actions[bgname];
        var assists = [];
        while(i--){
            var dt = $scope.downtimes[i];
            for(var a in dt.actions){
                var action = dt.actions[a];
                if(action.targetBackground === ac.name && action.action === 'Assist' && action.target !== undefined && action.targetBackground !== undefined){
                    if( action.target === character.name){
                        var assister = $scope.findCharacter(dt.characterid);
                        action.assister = assister.name;
                        action.characterid = dt.characterid;
                        assists.push(action)
                    }
                }
            }
        }
        if(assists.length > 0){
            return assists;
        }
    };

    $scope.findTargets = function(downtime){
        if(downtime === undefined) return;
        var i = $scope.downtimes.length;
        var character = $scope.findCharacter(downtime.characterid);
        if(character === undefined) return false;
        var targets = [];
        while(i--){
            var dt = $scope.downtimes[i];
            if(dt.characterid != downtime.characterid)
            {
                for(var a in dt.actions){
                    var action = dt.actions[a];
                    if(action.target !== undefined){
                        if( action.target === character.name){
                            var char = $scope.findCharacter(dt.characterid);
                            action.char = char.name;
                            action.characterid = dt.characterid;
                            targets.push(action)
                        }
                    }
                }
            }
        }
        if(targets.length > 0){
            return targets;
        }
    };

    $scope.findBackgroundValue = function(character, name){
        if(character === undefined) return 0;
        var retainer = false;
        if(name === 'ally') name = 'Allies';
        if(name === 'contact') name = 'Contacts';
        if(name === 'resource') name = 'Resources';
        if(name.indexOf('retainer') > -1) retainer = true;
        var result = [];
        if(retainer) {
            var index = parseInt(name.replace('retainer', ''));
            var all = $.grep(character.backgrounds, function(e){ return e.name == 'Retainers' });
            if(all[index].note){
                return all[index].note + ': ' + all[index].rating;
            }else{
                return all[index].rating;
            }
        }else{
            result = $.grep(character.backgrounds, function(e){ return e.name == name });
        }
        if(result.length > 0){

            return result[0].rating;
        }
        return 0;
    };

    $scope.findBackgroundValueNumeric = function(character, name){
        if(character === undefined) return 0;
        var retainer = false;
        if(name === 'ally') name = 'Allies';
        if(name === 'contact') name = 'Contacts';
        if(name === 'resource') name = 'Resources';
        if(name.indexOf('retainer') > -1) retainer = true;
        var result = [];
        if(retainer) {
            var index = parseInt(name.replace('retainer', ''));
            var all = $.grep(character.backgrounds, function(e){ return e.name == 'Retainers' });
            return all[index].rating;
        }else{
            result = $.grep(character.backgrounds, function(e){ return e.name == name });
        }
        if(result.length > 0){

            return result[0].rating;
        }
        return 0;
    };

    $scope.findInfluenceValue = function(character, name){
        if(character === undefined) return 0;
        var result = $.grep(character.influences, function(e){ return e.name == name });
        if(result.length > 0){
            return result[0].rating;
        }
        return 0;
    };

    $scope.isActive = function(downtime){
        if(downtime === 'destroys') return $scope.active.current === downtime;
        if(downtime === 'grows') return $scope.active.current === downtime;
        if(downtime === 'feedings') return $scope.active.current === downtime;
        return downtime.id === $scope.active.current;
    };

    $scope.next = function(){
        $scope.direction = 'right';
        if($scope.active.current === 'destroys'){
            $scope.active.current = $scope.downtimes[0].id;
            return ;
        }
        if($scope.active.current === 'grows'){
            $scope.active.current = 'feedings';
            return ;
        }
        if($scope.active.current === 'feedings'){
            if($scope.hasDestroys()){
                $scope.active.current = 'destroys';
            }else{
                $scope.active.current = $scope.downtimes[0].id;
            }
            return ;
        }
        var i = $scope.findIndex($scope.active.current);
        if(i + 1 == $scope.downtimes.length) {
            if($scope.hasGrows()){
                $scope.active.current = 'grows';
            }else{
                $scope.active.current = 'feedings';
            }
            return;
        }
        $scope.active.current = $scope.downtimes[i + 1].id;
    };

    $scope.previous = function(){

        $scope.direction = 'left';
        if($scope.active.current === 'destroys'){
            $scope.active.current = 'feedings';
            return ;
        }
        if($scope.active.current === 'feedings'){
          if($scope.hasGrows()){
              $scope.active.current = 'grows';
          }else{
              $scope.active.current = $scope.downtimes[$scope.downtimes.length - 1].id;
          }
            return ;
        }
        if($scope.active.current === 'grows'){
            $scope.active.current = $scope.downtimes[$scope.downtimes.length - 1].id;
            return ;
        }
        var i = $scope.findIndex($scope.active.current);
        if(i == 0){
            if($scope.hasDestroys()){
                $scope.active.current = 'destroys';
            }else{
                $scope.active.current = 'feedings';
            }
            return;
        }
        $scope.active.current = $scope.downtimes[i - 1].id;
    };

    $scope.setActive = function(id){
        $scope.active.current = id;
    }

    $scope.findIndex = function(id){
        var i = $scope.downtimes.length;
        while(i--){
            if($scope.downtimes[i].id === id) return i;
        }
    };

    $scope.getDirection = function(){
        if($scope.direction == 'left'){
            return "slide-left"
        }
        else{
            return "slide-right";
        }
    };

    $scope.flatten = function (downtimes) {
        var arr = [];
        var i = downtimes.length;
        while(i--){
            for (var prop in downtimes[i].actions) {
                if (downtimes[i].actions.hasOwnProperty(prop)) {
                    var ac = downtimes[i].actions[prop];
                    if(ac){
                        ac.dt = (downtimes[i])._id;
                        ac.name = prop;
                        ac.totalValue = $scope.getTotalTraits(ac, downtimes[i]);
                        arr.push(ac);
                        var char = $scope.findCharacter(downtimes[i].characterid);
                        if(char !== undefined){
                            ac.charactername = char.name
                        }else{
                            ac.charactername = "";
                        }
                    }
                }
            }
        }

        return arr;/*.sort(function(a,b){
            if(a.action === b.action){
                if(a.target == b.target){
                    if(a.targetBackground == b.targetBackground){
                        return (a.order > b.order ? 1 : -1);
                    }else{
                        return (a.targetBackground > b.targetBackground ? 1 : -1);
                    }
                }else{
                    return (a.target > b.target ? 1 : -1);
                }
            }
            return (a.action == 'Grow' ? -1 : 1);
        });*/
    };

    $scope.updateSave = function(action){
        if(action.outcome){
            action.handled = true;

            if(action.outcome === 'success')
            {
                var char = $scope.findCharacterByName(action.target);
                if(!char){
                    alert('Could not find character ' + action.target);
                }
                else{

                    var result = $.grep(char.influences, function(e){ return e.name == action.targetBackground });
                    if(result.length === 0){
                        if(action.action === 'Grow'){
                            char.influences.push({name: action.targetBackground, note: '', rating: 1});
                        }
                    }else{
                        if(action.action === 'Grow'){
                            result[0].rating = result[0].rating + 1;
                            if(result[0].rating > 5 ) result[0].rating = 5;
                        }
                        if(action.action === 'Destroy'){
                            result[0].rating = result[0].rating - 1;
                            if(result[0].rating === 0){
                                char.influences.splice($.inArray(result[0], char.influences),1);
                            }
                        }
                    }

                    var updating = ngToast.create({
                        className: 'info',
                        content: 'Updating character...',
                        timeout: 2000
                    });

                    var fields = {};
                    fields['influences'] = char.influences;

                    $http.post("/character/update", {id: char.id, fields: fields}).then(function(){
                        ngToast.dismiss(updating);
                        ngToast.create({
                            className: 'success',
                            content: 'Character updated!',
                            timeout: 2000
                        });
                    });
                }
            }

            var saving = ngToast.create({
                className: 'info',
                content: 'Saving...',
                timeout: 2000
            });
            if(!action.response) {
                action.response = action.outcome;
            }
            $http.post("/downtime/updatesubmission", {downtimes: [$scope.findDowntime(action.dt)]}).then(function(response){
                ngToast.dismiss(saving);
                ngToast.create({
                    className: 'success',
                    content: 'Saved!',
                    timeout: 2000
                });
            });
        }
    };

    $scope.save = function(){
        var saving = ngToast.create({
            className: 'info',
            content: 'Saving...',
            timeout: 2000
        });
        $http.post("/downtime/updatesubmission", {downtimes: $scope.downtimes}).then(function(response){
            ngToast.dismiss(saving);
            ngToast.create({
                className: 'success',
                content: 'Saved!',
                timeout: 2000
            });
        });
    };

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
            $http.post("/character/all", {fields: 'id name influences backgrounds player googleId'}).then(function (response) {
                root.characters = response.data;
            }),
            $http.get("/downtime/listbyperiod/" + id).then(function (response) {
                root.downtimes = response.data;
            }),
            $http.get("/downtime/findPeriod/" + id).then(function (response) {
                root.period = response.data[0];
            })
        ]).then(function(){
            root.downtimes.sort(function(a,b){
                if(!$scope.findCharacter(a.characterid)) return 0;
                if ($scope.findCharacter(a.characterid).name < $scope.findCharacter(b.characterid).name)
                    return -1;
                if ($scope.findCharacter(a.characterid).name > $scope.findCharacter(b.characterid).name)
                    return 1;
                return 0;
            });
            if($scope.hasDestroys()){
              root.active.current = 'destroys';
            }else if($scope.downtimes.length > 0){
              root.active.current = $scope.downtimes[0].id;
            }else{
              root.active.current = 0;
            }
            fillbag();
            loading.hide();
        });
    };

    $scope.hasDestroys = function() {
      if($scope.downtimes === undefined) return false;
      if($scope.downtimes.length === 0) return false;
      return $scope.flatten($scope.downtimes).some(function(element,index,array){
        if(element === undefined) return false;
        return element.action === 'Destroy';
      });
    };

    $scope.hasGrows = function() {
      if($scope.downtimes === undefined) return false;
      if($scope.downtimes.length === 0) return false;
      return $scope.flatten($scope.downtimes).some(function(element,index,array){
        if(element === undefined) return false;
        return element.action === 'Grow';
      });
    };

    $scope.feedinglocation = [];
    $scope.getTotalFeeders = function(charid, location){
        if($scope.feedinglocation[location] === undefined){
            $scope.feedinglocation[location] = 0;
            var val = 0;
            if($scope.downtimes === undefined) return val;
            if($scope.downtimes.length === 0) return val;
            var downtimes = $scope.flatten($scope.downtimes);
            var i = downtimes.length;
            val = 1;
            while(i--){
              var action = downtimes[i];
              if(action.action === "Feed" && action.location.name === location){
                var playerid = $scope.findDowntime(action.dt).characterid;
                if(charid !== playerid){
                  val++;
                }
              }
            }
            $scope.feedinglocation[location] = val;
        }

        return $scope.feedinglocation[location];
    }

    $scope.drawDoom = function(action, amount){
      action.doomtraits = [];
      while(amount--){
        var trait = {
          type: 'ok',
          css: {color: "blue"}
        }
        var rnd = getRandom(1, $scope.bagofdoom.length) - 1;
        var result = $scope.bagofdoom[rnd];
        $scope.bagofdoom.splice(rnd, 1);
        switch(result){
          case 1:
            trait.type = "ok";
            trait.css = {color: "red"};
            break;
          case 2:
            trait.type = "minor event";
            trait.css = {color: "darkblue"};
            break;
          case 3:
            trait.type = "major event";
            trait.css = {color: "lightblue"};
            break;
          case 4:
            trait.type = "death level";
            trait.css = {color: "white"};
            break;
          case 5:
            trait.type = "worst case";
            trait.css = {color: "hotpink"};
            break;
        }
        action.doomtraits.push(trait);

      }
      fillbag();
      return;
    }

    var getRandom = function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    $scope.parseInt = parseInt;
    var fillbag = function(){
      var i = 80;
      while(i--){
        $scope.bagofdoom.push(1);
      }
      i = 10;
      while(i--){
        $scope.bagofdoom.push(2);
      }
      i = 7;
      while(i--){
        $scope.bagofdoom.push(3);
      }
      i = 2;
      while(i--){
        $scope.bagofdoom.push(4);
      }
      i = 1;
      while(i--){
        $scope.bagofdoom.push(5);
      }
    }
    $scope.bagofdoom = [];

}]);
