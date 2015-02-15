app.controller('CharacterFreebiesController', ['$scope', '$http', 'loading', 'resources', '$filter', function ($scope, $http, loading, resources, $filter) {
    $scope.log = function (event) {
        console.log(event);
    };
    var orderBy = $filter('orderBy');

    $scope.conscienceTypes = ["Conscience", "Conviction"];
    $scope.selfcontrolTypes = ["Self-Control", "Instinct"];
    $scope.bloodbondlevels = ["1", "2", "3"];
    $scope.resourcesLoaded = false;
    $scope.abilities = [];
    $scope.sability = {};
    $scope.backgrounds = [];
    $scope.sbackground = {};
    $scope.clans = [];
    $scope.disciplines = [];
    $scope.sdiscipline = {};
    $scope.derangements = [];
    $scope.sderangement = {};
    $scope.flaws = [];
    $scope.sflaw = {};
    $scope.influences = [];
    $scope.sinfluences = {};
    $scope.mental = [];
    $scope.smental = {};
    $scope.merits = [];
    $scope.smerit = {};
    $scope.natures = {};
    $scope.negativemental = [];
    $scope.snegativemental = {};
    $scope.negativephysical = [];
    $scope.snegativephysical = {};
    $scope.negativesocial = [];
    $scope.snegativesocial = {};
    $scope.paths = [];
    $scope.physical = [];
    $scope.sphysical = {};
    $scope.rituals = [];
    $scope.sritual = {};
    $scope.sects = [];
    $scope.social = [];
    $scope.ssocial = {};
    $scope.clandisciplines = [];
    $scope.sstatus = '';
    $scope.sbloodbond = {};

    $scope.sstatus = "";
    $scope.sstatustype = "";

    $scope.character = {};
    $scope.chronicle = {};

    $scope.resourcesLoaded = false;

    $scope.attributes = [];

    $scope.noteItem;
    $scope.selectedList;
    $scope.previousNoteValue = {};
    $scope.addNoteDialog = function(adv, list)
    {
        angular.copy(adv, $scope.previousNoteValue);
        $scope.noteItem = adv;
        $scope.selectedList = list;
        $("#advNoteModal").modal();
    };

    $scope.revertNoteItem = function(){
        angular.copy($scope.previousNoteValue, $scope.noteItem);
        $scope.noteItem = {};
        $scope.selectedList = {};
    };

    $scope.saveNoteItem = function(){
        $scope.noteItem = {};
        $scope.selectedList = {};
    };

    $scope.calctotal = function (list) {
        if (list === undefined) return "";
        var count = 0;
        $.each(list, function (index, item) {
            if(item.val !== undefined){
                count += item.val;
            }else if(item.rating !== undefined){
                count += item.rating;
            }
        });
        return count;
    };
    $scope.calctotalcost = function (list) {
        if (list === undefined) return "";
        var count = 0;
        $.each(list, function (index, item) {
            count += item.cost;
        });
        return count;
    };


    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        if (!$scope.resourcesLoaded) {
            $scope.resourcesLoaded = true;
            resources.abilities.get(function (data) {
                root.abilities = data;
            });
            resources.abilities.get(function (data) {
                root.abilities = data;
            });
            resources.backgrounds.get(function (data) {
                root.backgrounds = data;
            });
            resources.clans.get(function (data) {
                root.clans = data;
            });
            resources.clandisciplines.get(function (data) {
                root.clandisciplines = data;
            });
            resources.derangements.get(function (data) {
                root.derangements = data;
            });
            resources.disciplines.get(function (data) {
                root.disciplines = data;
            });
            resources.flaws.get(function (data) {
                root.flaws = data;
            });
            resources.influences.get(function (data) {
                root.influences = data;
            });
            resources.mental.get(function (data) {
                root.mental = data;
                root.attributes.push({key: 'mental', val: data});
            });
            resources.merits.get(function (data) {
                root.merits = data;
            });
            resources.natures.get(function (data) {
                root.natures = data;
            });
            resources.negativemental.get(function (data) {
                root.negativemental = data;
            });
            resources.negativephysical.get(function (data) {
                root.negativephysical = data;
            });
            resources.negativesocial.get(function (data) {
                root.negativesocial = data;
            });
            resources.paths.get(function (data) {
                root.paths = data;
            });
            resources.physical.get(function (data) {
                root.physical = data;
                root.attributes.push({key: 'physical', val: data});
            });
            resources.rituals.get(function (data) {
                root.rituals = data;
            });
            resources.sects.get(function (data) {
                root.sects = data;
            });
            resources.social.get(function (data) {
                root.social = data;
                root.attributes.push({key: 'social', val: data});
            });

        }
        $http.get("/character/find/" + id).then(function (response) {
            root.character = response.data;
            root.character.experience.unspent = parseInt(root.character.experience.unspent);
            root.character.experience.total = parseInt(root.character.experience.total);

            if (root.chronicle === null) {
                root.chronicle = root.character.chronicle;
            }
            else {
                loading.hide();
            }
        });
    };
}]);