"use strict";
app.controller('cymeriad.controller.character.visualise', ['$scope', '$rootScope', '$http', 'loading', '$q', 'ngToast', '$modal', '$timeout', function ($scope, $rootScope, $http, loading, $q, ngToast, $modal,$timeout) {
    $scope.characters = {};
    $scope.period = {};
    $scope.active;
    $scope.filterText = "";
    $scope.cyOptions = {
        showBonds: 'yes',
        showBoons: 'yes',
        showCoterie: 'yes'
    };

    $scope.needsUpdate = false;
    $scope.showLabels = 'no';
    $scope.selectedCharacter = null;
    $scope.layoutTypes = ['circle', 'grid', 'concentric', 'breadthfirst', 'cola', 'dagre'];
    $scope.layoutType = 'cola';
    $scope.mapData = [];
    $scope.edgeData = [];
    // data types/groups object - used Cytoscape's shapes just to make it more clear
    $scope.objTypes = ['ellipse','triangle','rectangle','roundrectangle','pentagon','octagon','hexagon','heptagon','star'];

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
    }

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
        var i = $scope.characters.length;
        var coteries = [];
        while(i--){
            var char = $scope.characters[i];
            if(!char.boons) char.boons = [];
            if((($scope.cyOptions.showBonds === 'yes') && char.bloodbonds.length > 0)
                || (($scope.cyOptions.showBoons === 'yes') && char.boons.length > 0)
                || (($scope.cyOptions.showCoterie === 'yes') && char.coterie))
            $scope.addObj(char.name, $scope.getClanShape(char.clan), char);
            if(char.coterie){
                if($scope.findIndex(coteries, char.coterie) == -1){
                    coteries.push({name: char.coterie, characters: []});
                }

                coteries[$scope.findIndex(coteries, char.coterie)].characters.push(char.name);
            }
        }

        i = $scope.characters.length;
        while(i--) {
            var char = $scope.characters[i];
            if ($scope.cyOptions.showBonds === 'yes') {
                var j = char.bloodbonds.length;
                while (j--) {
                    var item = char.bloodbonds[j];
                    //if(!$scope.findEdgeByTargets(char.name, item.character, "red"))
                    if (!$scope.findEdge(item.character)) {
                        $scope.addObj(item.character, $scope.getClanShape(""), {name: item.character});
                    }
                    $scope.addEdge(char.name, item.character, "bloodbond", "red", item, false);
                }
            }
            if($scope.cyOptions.showBoons === 'yes') {
                if (char.boons) {
                    j = char.boons.length;
                    while (j--) {
                        var item = char.boons[j];
                        if (!$scope.findEdge(item.character)) {
                            $scope.addObj(item.character, $scope.getClanShape(""), {name: item.character});
                        }
                        $scope.addEdge(char.name, item.character, "boon", "green", item, false);
                    }
                }
            }
        }
        if($scope.cyOptions.showCoterie === 'yes') {
            i = coteries.length;
            while (i--) {
                var c = coteries[i];
                var x = c.characters.length;
                while (x--) {
                    var charx = c.characters[x];
                    var y = c.characters.length;
                    while (y--) {
                        var chary = c.characters[y];
                        if (charx !== chary) {
                            if (!$scope.findEdgeByTargets(charx, chary, "blue"))
                                $scope.addEdge(charx, chary, "coterie: " + c.name, "blue", c, true);
                        }
                    }
                }
            }
        }

        $scope.needsUpdate = true;
    };

    $scope.findIndex = function(array, obj){
        if(array.length == 0) return -1;
        var i = array.length;
        while(i--){
            if(array[i].name == obj) return i;
        }
        return -1;
    };

    $scope.addObj = function(name, type, data){
        // collecting data from the form
        var newObj = name;
        var newObjType = type;
        // building the new Node object
        // using the array length to generate an id for the sample (you can do it any other way)
        var newNode = {id:'n'+($scope.mapData.length), name:newObj, type:newObjType, data: data};
        // adding the new Node to the nodes array
        $scope.mapData.push(newNode);
    };

    $scope.addEdge = function(fromName, toName, label, color, data, double){
        // collecting the data from the form
        var from = $scope.findEdge(fromName);
        var to = $scope.findEdge(toName);
        if(to){
            var edge1 = from.id;
            var edge2 = to.id;
            // building the new Edge object from the data
            // using the array length to generate an id for the sample (you can do it any other way)
            var newEdge = {id:'e'+($scope.edgeData.length), source: edge1, target: edge2, label: label, color: color, data: data, double: double};
            // adding the new edge object to the adges array
            $scope.edgeData.push(newEdge);
        }
    };

    $scope.findEdge = function(name) {
        var i = $scope.mapData.length;
        while(i--){
            var edge = $scope.mapData[i];
            if(edge.name == name) return edge;
        }
    };

    $scope.findEdgeByTargets = function(fromName, toName, color) {
        var from = $scope.findEdge(fromName);
        var to = $scope.findEdge(toName);
        if(from && to){
            var i = $scope.edgeData.length;
            while(i--){
                var edge = $scope.edgeData[i];
                if(edge.source == from.id && edge.target == to.id && edge.color == color) return edge;
                if(edge.source == to.id && edge.target == from.id && edge.color == color) return edge;
            }
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
        var el =$scope.findObj(value);
        if(el){
            if(el.data.player){
                $scope.selectedCharacter = el.data;
            }else{
                $scope.selectedCharacter = null;
            }
        }
        $scope.$apply();
    };

    $scope.init = function(id) {
        loading.show();
        var root = $scope;
        $http.post("/character/all", { where: {state: {$in: ["Approved", "Active"]},chronicle: id}, fields: 'id name boons bloodbonds coterie clan player googleId'}).then(function (response) {
            root.characters = response.data;
        }).then(function() {
            root.visualiseData();
            loading.hide();
        });
    };
}]);