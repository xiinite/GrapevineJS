/**
 * Created by daeme_000 on 9/22/2015.
 */
"use strict";
app.controller('cymeriad.controller.character.showbychronicle', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.characters = [];

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
        $http.post("/character/all/full", { where: {chronicle: id, state: {$in: ["Approved", "Active"]}}}).then(function (response) {
            root.characters = response.data;
            root.characters.sort(function (a,b) {
                if (a.name < b.name)
                    return -1;
                if (a.name > b.name)
                    return 1;
                return 0;
            });
            loading.hide();
        });
    };
}]);