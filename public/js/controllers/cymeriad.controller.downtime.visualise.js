"use strict";
app.controller('cymeriad.controller.downtime.visualise', ['$scope', '$rootScope', '$http', 'loading', '$q', 'ngToast', '$modal', '$timeout',
    function ($scope, $rootScope, $http, loading, $q, ngToast, $modal, $timeout) {
    $scope.downtimes = [];
    $scope.characters = {};
    $scope.period = {};
    $scope.active;
    $scope.selectedDowntime = null;
    $scope.filterText = "";
    $scope.cyoptions = {
        selfreferences: 'yes',
        showempty: 'no'
    };

    $scope.needsUpdate = false;
    $scope.showLabels = 'no';
    $scope.layoutTypes = ['circle', 'grid', 'concentric', 'breadthfirst', 'cola', 'dagre'];
    $scope.layoutType = 'circle';
    $scope.mapData = [];
    $scope.edgeData = [];
    // data types/groups object - used Cytoscape's shapes just to make it more clear
    $scope.objTypes = ['ellipse','triangle','rectangle','roundrectangle','pentagon','octagon','hexagon','heptagon','star'];

    $scope.$watch('layoutType', function(newValue, oldValue) {
        if (newValue){
        }
    }, true);

    function postDigest(callback){
        var unregister = $rootScope.$watch(function(){
            unregister();
            $timeout(function(){
                callback();
                postDigest(callback);
            },0,false);
        });
    }

    postDigest(function(){
        if($scope.needsUpdate){
            $rootScope.$broadcast('appChanged');
            $scope.needsUpdate = false;
        }
    });

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

    $scope.findAssists = function(downtime, bg){
        var i = $scope.downtimes.length;
        var character = $scope.findCharacter(downtime.characterid);
        if(character === undefined) return false;
        var ac = downtime.actions[bg];
        var assists = [];
        while(i--){
            var dt = $scope.downtimes[i];
            for(var a in dt.actions){
                var action = dt.actions[a];
                if(action.targetBackground === ac.name && action.target !== undefined && action.targetBackground !== undefined){
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

    $scope.findBackgroundValue = function(character, name){
        if(character === undefined) return 0;
        var retainer = false;
        if(name === 'ally') name = 'Allies';
        if(name === 'contact') name = 'Contacts';
        if(name === 'resource') name = 'Resources';
        if(name.indexOf('retainer') > -1) retainer = true;
        var result = [];
        if(retainer) {
            return "";
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
        return downtime.id === $scope.active;
    };

    $scope.getActionColor = function(action){
        switch(action.toLowerCase()){
            case 'assist':
                return 'green';
            case 'meet other character':
                return 'yellow';
            case 'destroy':
                return 'red';
            default:
                return 'lime';

        }
    };

    $scope.reset = function(){
        $scope.mapData = [];
        $scope.edgeData = [];
        cy.reset();
        $scope.visualiseData();
    };

    $scope.update = function(){
        $scope.mapData = [];
        $scope.edgeData = [];
        $scope.visualiseData();
    };

    $scope.getClanShape = function(clan){
        var type = "";
        switch(clan.toLowerCase()) {
            case 'gangrel':
                type='ellipse';
                break;
            case 'malkavian':
                type='triangle';
                break;
            case 'toreador':
                type='rectangle';
                break;
            case 'brujah':
                type='roundrectangle';
                break;
            case 'caitiff':
                type='pentagon';
                break;
            case 'tremere':
                type='octagon';
                break;
            case 'ventrue':
                type='hexagon';
                break;
            case 'nosferatu':
                type='heptagon';
                break;
            default:
                type='star';
                break;
        }
        return type;
    };

    $scope.visualiseData = function(){
        var i = $scope.downtimes.length;
        var addedChars = [];
        while(i--){
            var dt = $scope.downtimes[i];
            var char = $scope.findCharacter(dt.characterid);
            var add = false;
            if($scope.filterText.length > 0){
                if(char.name.toLowerCase().indexOf($scope.filterText.toLowerCase()) > -1) add = true;
            }else{
                add= true;
            }
            if(add){
                addedChars.push(char.id);
                $scope.addObj(char.name, $scope.getClanShape(char.clan), dt);
            }
        }

        i = $scope.downtimes.length;
        while(i--) {
            var dt = $scope.downtimes[i];
            for (var index in dt.actions) {
                var action = dt.actions[index];
                var from =  $scope.findCharacter(dt.characterid).name;
                if(!($scope.cyoptions.selfreferences === 'no' && action.target === from)){
                    if (action.target && addedChars.indexOf(dt.characterid) > -1) {
                        if(!$scope.findMapData(action.target)){
                            var c = $scope.findCharacterByName(action.target);
                            if(c){
                                $scope.addObj(c.name, $scope.getClanShape(c.clan), {});
                            }
                        }
                        var label = action.action;
                        var color = $scope.getActionColor(action.action);
                        $scope.addEdge(from, action.target, label, color, action);
                    }
                }
            }
        }

        if($scope.cyoptions.showempty === 'no'){
            var i = $scope.mapData.length;
            while(i--){
                if(!$scope.findEdge($scope.mapData[i].id)){
                    $scope.mapData.splice(i, 1);
                }

            }
        }
        $scope.needsUpdate = true;
    };

    $scope.addObj = function(name, type, dt){
        // collecting data from the form
        var newObj = name;
        var newObjType = type;
        // building the new Node object
        // using the array length to generate an id for the sample (you can do it any other way)
        var newNode = {id:'n'+($scope.mapData.length), name:newObj, type:newObjType, data: dt};
        // adding the new Node to the nodes array
        $scope.mapData.push(newNode);
    };

    $scope.addEdge = function(fromName, toName, label, color, action){
        // collecting the data from the form
        var from = $scope.findMapData(fromName);
        var to = $scope.findMapData(toName);
        if(to){
            var edge1 = from.id;
            var edge2 = to.id;
            // building the new Edge object from the data
            // using the array length to generate an id for the sample (you can do it any other way)
            var newEdge = {id:'e'+($scope.edgeData.length), source: edge1, target: edge2, label: label, color: color, data: action};
            // adding the new edge object to the adges array
            $scope.edgeData.push(newEdge);
        }
    };

    $scope.findMapData = function(name) {
        var i = $scope.mapData.length;
        while(i--){
            var mapData = $scope.mapData[i];
            if(mapData.name == name) return mapData;
        }
    };
    $scope.findEdge = function(id) {
        var i = $scope.edgeData.length;
        while(i--){
            var edge = $scope.edgeData[i];
            if(edge.source == id || edge.target == id) return edge;
        }
    };

    $scope.findObj = function(id){
        var i = $scope.mapData.length;
        while(i--){
            var edge = $scope.mapData[i];
            if(edge.id == id) return edge;
        }
        i = $scope.edgeData.length;
        while(i--){
            var edge = $scope.edgeData[i];
            if(edge.id == id) return edge;
        }
    };

    $scope.doClick = function(value)
    {
        // sample just passes the object's ID then output it to the console and to an alert
        console.debug(value);

        var obj = $scope.findObj(value);
        $scope.selectedDowntime = obj.data;
        if(obj.source){
            var dt = $scope.findObj(obj.source);
            if(dt){
                $scope.selectedDowntime.source = $scope.findCharacter(dt.data.characterid).name;
            }
        }
        $scope.$apply();
    };

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $q.all([
            $http.post("/character/all", {fields: 'id name influences backgrounds clan player googleId'}).then(function (response) {
                root.characters = response.data;
            }),
            $http.get("/downtime/listbyperiod/" + id).then(function (response) {
                root.downtimes = response.data;
                root.active = root.downtimes[0].id
            }),
            $http.get("/downtime/findPeriod/" + id).then(function (response) {
                root.period = response.data[0];
            })
        ]).then(function(){
            root.visualiseData();
            loading.hide();
        });
    };
}]);