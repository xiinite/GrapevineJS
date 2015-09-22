"use strict";
app.controller('cymeriad.controller.downtime.handle', ['$scope', '$http', 'loading', '$q', 'ngToast', function ($scope, $http, loading, $q, ngToast) {
    $scope.downtimes = [];
    $scope.characters = {};
    $scope.period = {};
    $scope.active;

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

    $scope.findInfluenceValue = function(character, name){
        if(character === undefined) return 0;
        var result = $.grep(character.influences, function(e){ return e.name == name });
        if(result.length > 0){
            return result[0].rating;
        }
        return 0;
    };

    $scope.isActive = function(downtime){
        if(downtime === -2) return $scope.active === -2;
        if(downtime === -3) return $scope.active === -3;
        return downtime.id === $scope.active;
    };

    $scope.next = function(){
        $scope.direction = 'right';
        if($scope.active === -2){
            $scope.active = $scope.downtimes[0].id;
            return ;
        }
        if($scope.active === -3){
            $scope.active = -2;
            return ;
        }
        var i = $scope.findIndex($scope.active);
        if(i + 1 == $scope.downtimes.length) {
            $scope.active = -3;
            return;
        }
        $scope.active = $scope.downtimes[i + 1].id;
    };

    $scope.previous = function(){

        $scope.direction = 'left';
        if($scope.active === -2){
            $scope.active = -3;
            return ;
        }
        if($scope.active === -3){
            $scope.active = $scope.downtimes[$scope.downtimes.length - 1].id;
            return ;
        }
        var i = $scope.findIndex($scope.active);
        if(i == 0){
            $scope.active = -2;
            return;
        }
        $scope.active = $scope.downtimes[i - 1].id;
    };

    $scope.setActive = function(id){
        $scope.active = id;
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
                        arr.push(ac);
                    }
                }
            }
        }

        return arr.sort(function(a,b){
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
        });
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
                if ($scope.findCharacter(a.characterid).name < $scope.findCharacter(b.characterid).name)
                    return -1;
                if ($scope.findCharacter(a.characterid).name > $scope.findCharacter(b.characterid).name)
                    return 1;
                return 0;
            });
            root.active = -2;
            loading.hide();
        });
    };
}]);
