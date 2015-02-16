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

    $scope.freetraitspendage = [];
    $scope.reversefreetrait = function(trait){
        var list;

        if(trait.list == 'disciplines'){
            list = $scope.character.disciplines;
            var item = trait.item;
            var result = $.grep(list, function (e) {
                return e.name == item.name && e.path == item.path;
            });
            var attr = result[0];
            list.splice($.inArray(attr, list), 1);
        }
        if(trait.list == "merits"){
            list = $scope.character.merits;
            var item = trait.item;
            var result = $.grep(list, function (e) {
                return e.name == item.name && e.cost == item.cost;
            });
            var attr = result[0];
            list.splice($.inArray(attr, list), 1);
        }else if(trait.list !== undefined){
            var nparts = trait.list.split('.');
            if(nparts.length == 2){
                list = $scope.character[nparts[0]][nparts[1]];
            }else{
                list = $scope.character[trait.list];
            }
            var value = trait.value;

            var result = $.grep(list, function (e) {
                return e.name == value;
            });
            var attr = result[0];

            if (attr.val == 1){
                list.splice($.inArray(attr, list), 1);
            } else if(attr.rating == 1) {
                list.splice($.inArray(attr, list), 1);
            }
            else if(attr.val !== undefined){
                attr.val--;
            }else if(attr.rating !== undefined){
                attr.rating--;
            }
        }else if(trait.item !== undefined){
            trait.item.rating--;
        }


        $scope.character.freetraits += parseInt(trait.cost);

        $scope.freetraitspendage.splice($.inArray(trait, $scope.freetraitspendage), 1);
    };

    $scope.addTrait = function (value, listname) {
        var nparts = listname.split('.');
        var list = $scope.character[nparts[0]][nparts[1]];
        if (value.length === undefined) return;
        if (value.length == 0) return;
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            list.push({name: value, val: 1});
            list = orderBy(list, 'name', false);
        } else {
            result[0].val++;
        }

        $scope.freetraitspendage.push({value: value, list: listname, cost: 1});
        $scope.character.freetraits--;
    };

    $scope.addAdvantage = function (value, listname) {
        var list = $scope.character[listname];
        if (value.length === undefined) return;
        if (value.length == 0) return;
        var result = $.grep(list, function (e) {
            return e.name == value;
        });
        if (result.length === 0) {
            list.push({name: value, note: "", rating: 1});
            list = orderBy(list, 'name', false);
        } else {
            result[0].rating++;
            if(result[0].rating > 5){
                result[0].rating = 5;
                return;
            };
        }

        $scope.freetraitspendage.push({value: value, list: listname, cost: 1});
        $scope.character.freetraits--;
    };
    $scope.addMerit = function (item) {
        if(item === undefined) return;
        if($scope.character.freetraits - item.cost < 0 || $scope.calctotalcost($scope.character.merits) + item.cost > 7) return;

        var list = $scope.character.merits;
        var result = $.grep(list, function (e) {
            return e.name == item.name;
        });
        if (result.length === 0) {
            list.push(item);
            list = orderBy(list, 'name', false);

            $scope.freetraitspendage.push({value: item.name, item: item, list: "merits", cost: item.cost});
            $scope.character.freetraits -= item.cost;
        }
    };
    $scope.addDiscipline= function (item, listname) {
        if(item === undefined) return;
        if($scope.character.freetraits - item.cost < 0 || $scope.calctotalcost($scope.character.merits) + item.cost > 7) return;

        var list = $scope.character[listname];
        var result = $.grep(list, function (e) {
            return e.name == item.name;
        });
        if (result.length === 0) {
            list.push(item);
            list = orderBy(list, 'path', false);

            var cost = 6;
            if(item.level == 'basic') cost = 3;
            $scope.freetraitspendage.push({value: item.name, item: item, list: listname, cost: cost});
            $scope.character.freetraits -= cost;
        }
    };
    $scope.addVirtue = function (item) {
        if(item === undefined) return;
        item.rating++;
        if(item.rating > 5){
            item.rating = 5;
            return;
        }

        $scope.freetraitspendage.push({value: item.name, item: item, list: undefined, cost: 2});
        $scope.character.freetraits -= 2;
    };
    $scope.addMorality = function (item) {
        item.rating++;
        if(item.rating > 5){
            item.rating = 5;
            return;
        }

        $scope.freetraitspendage.push({value: "Morality path", item: item, list: undefined, cost: 3});
        $scope.character.freetraits -= 3;
    };
    $scope.addWillpower = function (item) {
        item.current++;
        if(item.rating > 5){
            item.rating = 5;
            return;
        }

        $scope.freetraitspendage.push({value: "Willpower", item: item, list: undefined, cost: 3});
        $scope.character.freetraits -= 3;
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

    $scope.submitDraft = function(){
        loading.show();
        var root = $scope;
        $http.post("/character/submitdraft", {character: root.character}).then(function(){
            location = '/character/show/' + root.character.id;
        });
    };
}]);

app.filter('isClanDiscipline', function () {

    return function (items, filter) {
        var contains = function(a, obj) {
            var i = a.length;
            while (i--) {
                if (a[i].path === obj.path && a[i].name === obj.name) {
                    return true;
                }
            }
            return false;
        };
        var containspath = function(a, obj) {
            var i = a.length;
            while (i--) {
                if(a[i].path === undefined){
                    if ( obj.path.indexOf(a[i]) > -1 ) {
                        return true;
                    }
                }else{
                    if (a[i].path === obj.path) {
                        return true;
                    }
                }
            }
            return false;
        };

        var clan;
        var clandisciplines;
        var currentdisciplines;
        if(filter !== undefined){
            clan = filter[0];
            clandisciplines = filter[1];
            currentdisciplines = filter[2];
        }
        var clanDiscs = [];
        var clanFound = false;
        for (var i = 0; i < clandisciplines.length; i++) {
            if(clandisciplines[i].clan == clan){
                clanFound = true;
                for(var j = 0; j< clandisciplines[i].disciplines.length; j++){
                    clanDiscs.push(clandisciplines[i].disciplines[j]);
                }
            }
        }
        var arrayToReturn = [];
        for (var i = 0; i < items.length; i++) {
            if (clanFound == false) {
                if(items[i].level == 'basic' || items[i].level == 'intermediate' ){
                    arrayToReturn.push(items[i]);
                }
            } else{
                if((items[i].level == 'basic' || items[i].level == 'intermediate') && containspath(clanDiscs, items[i]) && !contains(currentdisciplines, items[i]) && !containspath(arrayToReturn, items[i])){
                    //
                    arrayToReturn.push(items[i]);
                }
            }
        }

        return arrayToReturn;
    };
});