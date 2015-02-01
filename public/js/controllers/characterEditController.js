app.controller('CharacterEditController', ['$scope', '$http', 'loading', 'resources', '$filter', function ($scope, $http, loading, resources, $filter) {
    $scope.log = function (event) {
        console.log(event);
    }
    var orderBy = $filter('orderBy');

    $scope.conscienceTypes = ["Conscience", "Conviction"];
    $scope.selfcontrolTypes = ["Self-Control", "Instinct"];
    $scope.resourcesLoaded = false;
    $scope.abilities = [];
    $scope.backgrounds = [];
    $scope.clans = [];
    $scope.disciplines = [];
    $scope.flaws = [];
    $scope.influences = [];
    $scope.mental = [];
    $scope.smental = [];
    $scope.merits = [];
    $scope.negativemental = [];
    $scope.snegativemental = [];
    $scope.negativephysical = [];
    $scope.snegativephysical = [];
    $scope.negativesocial = [];
    $scope.snegativesocial = [];
    $scope.paths = [];
    $scope.physical = [];
    $scope.sphysical = {};
    $scope.rituals = [];
    $scope.sects = [];
    $scope.social = [];
    $scope.ssocial = [];

    $scope.chronicle = null;
    $scope.character = [];
    $scope.players = [];
    $scope.statusses = [
        "Active", "Stopped", "Deceased"
    ];

    $scope.dirtylists = [];

    $scope.addTrait = function(value, list, total, select){
        if(value.length === undefined) return;
        var result = $.grep(list, function(e){ return e.name == value; });
        if(result.length === 0) {
            list.push({name: value, val: 1});
            list = orderBy(list, 'name', false);
        }else{
            result[0].val++;
        }

        if(total.length !== undefined)
        {
            var t = 0;
            $.each(list, function(index, item){
                t +=  item.val;
            });
            $scope.character.attributes[total] = t;
            $scope.setItemDirty("attributes." + total, t);
        }

        value = {};
        if(select !== undefined)
        {
            $("#slc-" + select).removeClass("ng-dirty");
            $("#slc-" + select).val(null);
        }
        $scope.setItemDirty(list);
    };

    $scope.removeTrait = function(value, list, total){
        var result = $.grep(list, function(e){ return e.name == value; });
        var attr = result[0];

        if(attr.val == 1){
            list.splice($.inArray(attr, list),1);
        }else{
            attr.val--;
        }
        if(total.length !== undefined)
        {
            var t = 0;
            $.each(list, function(index, item){
                t +=  item.val;
            });
            $scope.character.attributes[total] = t;
            $scope.setItemDirty("attributes." + total, t);
        }
        $scope.setItemDirty(list);
    };

    $scope.setItemDirty = function(list, value)
    {
        if (typeof list == 'string' || list instanceof String)
        {
            $scope.dirtylists.push({key: list, value: value});
        }else{
            for(key in $scope.character)
            {
                if($scope.character[key] === list)
                {
                    $scope.dirtylists.push({key: key, value: $scope.character[key]});
                }

                if(key == 'attributes')
                {
                    for(akey in $scope.character[key])
                    {
                        if($scope.character[key][akey] === list){
                            $scope.dirtylists.push({key: key + "." + akey, value: $scope.character[key][akey]});
                        }
                    }
                }
            }
        }
    }



    $scope.save = function(){
        var fields = {};
        fields;
        $(".ng-dirty").each(function(){
            if($(this).data("field") !== undefined){

                    fields[$(this).data("field")] = angular.element(this).data('$ngModelController').$modelValue;
                
            }
        });
        $.each($scope.dirtylists, function(index, item){
            $.each(item.value, function(i, m){
                delete m._id;
            });
            fields[item.key] = item.value;
        });
        $http.post("/character/update", {id: $scope.character.id, fields: fields}).then(function(response){
            $scope.init($scope.character.id);
        });
        $scope.editId = 0;
        $scope.dirtylists = [];
    }

    $scope.display = function(player){
        if(player.emails[0] !== undefined)
        {
            return player.displayName + " (" + player.provider + " - " + player.emails[0].value + ")";
        }else {
            return player.displayName + " (" + player.provider + ")";
        }
    }

    $scope.revert = function(date){
        $http.post("/character/revert", {id: $scope.character.id, date: date}).then(function(response){
            $scope.init($scope.character.id);
        });
    }

    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        if(!$scope.resourcesLoaded)
        {
            $scope.resourcesLoaded = true;
            resources.abilities.get(function(data){
                root.abilities = data;
            });
            resources.backgrounds.get(function(data){
                root.backgrounds = data;
            });
            resources.clans.get(function(data){
                root.clans = data;
            });
            resources.disciplines.get(function(data){
                root.disciplines = data;
            });
            resources.flaws.get(function(data){
                root.flaws = data;
            });
            resources.influences.get(function(data){
                root.influences = data;
            });
            resources.mental.get(function(data){
                root.mental = data;
            });
            resources.merits.get(function(data){
                root.merits = data;
            });
            resources.negativemental.get(function(data){
                root.negativemental = data;
            });
            resources.negativephysical.get(function(data){
                root.negativephysical = data;
            });
            resources.negativesocial.get(function(data){
                root.negativesocial = data;
            });
            resources.paths.get(function(data){
                root.paths = data;
            });
            resources.physical.get(function(data){
                root.physical = data;
            });
            resources.rituals.get(function(data){
                root.rituals = data;
            });
            resources.sects.get(function(data){
                root.sects = data;
            });
            resources.social.get(function(data){
                root.social = data;
            });
        }
        $http.get("/character/find/" + id).then(function (response) {
            root.character = response.data;
            root.character.experience.unspent = parseInt(root.character.experience.unspent);
            root.character.experience.total = parseInt(root.character.experience.total);
            if(root.chronicle === null)
            {
                root.chronicle = root.character.chronicle;
                $http.get("/chronicle/find/" + root.chronicle.id).then(function (response) {
                    $scope.players = response.data.playerDocs;
                    $scope.characterForm.$setPristine();
                    loading.hide();
                });
            }
            else
            {
                $scope.characterForm.$setPristine();
                loading.hide();
            }
        });
    };
}]);
