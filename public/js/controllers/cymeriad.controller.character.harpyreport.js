"use strict";
app.controller('cymeriad.controller.character.harpyreport', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.log = function (event) {
        console.log(event);
    };
    $scope.currentid;

    $scope.options = {
        status: true,
        title: true,
        boons: true,
        states: [
            {name: "Trashed"},
            {name: "Concept"},
            {name: "Draft"},
            {name: "Approval Pending"},
            {name: "Approved"},
            {name: "Rejected"},
            {name: "Background Submitted"},
            {name: "Background Approved"},
            {name: "Background Rejected"},
            {name: "Final Approval Pending"},
            {name: "Active"},
            {name: "Retired"},
            {name: "Deceased"}
        ]
    };
    $scope.states = [
        {ticked: false, name: "Trashed"},
        {ticked: false, name: "Concept"},
        {ticked: false, name: "Draft"},
        {ticked: false, name: "Approval Pending"},
        {ticked: true, name: "Approved"},
        {ticked: false, name: "Rejected"},
        {ticked: true, name: "Background Submitted"},
        {ticked: true, name: "Background Approved"},
        {ticked: false, name: "Background Rejected"},
        {ticked: true, name: "Final Approval Pending"},
        {ticked: true, name: "Active"},
        {ticked: false, name: "Retired"},
        {ticked: false, name: "Deceased"}
    ];

    $scope.$watch('states', function(newValue, oldValue) {
        if (newValue)
            $scope.showCharacters($scope.currentid);
    }, true);

    $scope.chronicles = [];

    $scope.print = function(){
        window.print();
    };

    $scope.findChronicle = function(id){
        var i = $scope.chronicles.length;
        if(id === undefined) return false;
        while(i--){
            if($scope.chronicles[i].id == id) return $scope.chronicles[i];
        }
        return false;
    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    $scope.showCharacters = function(id){
        var chronicle = $scope.findChronicle(id);
        if(!chronicle) return;
        chronicle.characters = [];
        var i = chronicle.allcharacters.length;
        while(i--) {
            var char = chronicle.allcharacters[i];
            if($scope.getStateActive(char.state)){
                chronicle.characters.push(char);
            }
        }
        chronicle.characters.sort(function(a,b){
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
    };

    $scope.getStateActive = function(state){
        var i = $scope.states.length;
        while(i--)
        {
            if($scope.states[i].name.toLowerCase() == state.toLowerCase()) return $scope.states[i].ticked;
        }
    };

    $scope.loadContent = function (id) {
        $scope.currentid = id;
        var chronicle = $scope.findChronicle(id);
        if(!chronicle) return;
        if(chronicle.loaded == true) return;
        loading.show();
        $http.post("/character/all", { where: {chronicle: id},fields: 'id name title status state boons '}).then(function (response) {
            var characters = response.data;
            var i = characters.length;
            if(!chronicle.allcharacters) chronicle.allcharacters = [];
            if(!chronicle.characters) chronicle.characters = [];
            while(i--) {
                var char = characters[i];
                chronicle.allcharacters.push(char);
            }
            $scope.showCharacters(id);
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

app.filter('range', function() {
    return function(input, total) {
        total = parseInt(total);
        for (var i=0; i<total; i++)
            input.push(i);
        return input;
    };
});