"use strict";
app.controller('cymeriad.controller.character.index', ['$scope', '$http', 'loading', '$filter', function ($scope, $http, loading, $filter) {
    $scope.sort = {
        sortingOrder : 'name',
        reverse : false
    };
    $scope.selectedAll = false;
    $scope.loaded = false;
    $scope.gap = 10;
    $scope.itemsPerPage = 25;

    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.items = [];

    $scope.chronicles = [];
    $scope.selectedchronicle = {};
    $scope.selectedexportchronicle = undefined;
    $scope.selected = {};

    $scope.exporttypes = [{name: 'cymeriad json', ext: "json"}, {name: 'classic grapevine gv3', ext: "gv3"}];
    $scope.exporttype = undefined;

    $scope.statusses = [
        "Select a status...", "Trashed", "Concept", "Draft", "Approval Pending", "Approved", "Rejected", "Background Submitted",
        "Background Approved", "Background Rejected", "Final Approval Pending", "Active", "Retired", "Deceased"
    ];
    $scope.selectedstatus = "Select a status...";

    $scope.init = function(){
        loading.show();
        var root = $scope;
        if($scope.loaded === false){
            try{
                $scope.itemsPerPage = localStorage.getItem("itemsperpage");
            }catch(ex){}
            if(!$scope.itemsPerPage || $scope.itemsPerPage === "null"){
                $scope.itemsPerPage = 25;
            }
            try{
                $scope.selectedstatus = localStorage.getItem("statusselection");
            }catch(ex){}
            if(!$scope.selectedstatus || $scope.selectedstatus === "null"){
                $scope.selectedstatus = 'Active';
            }
            $http.get("/chronicle/all").then(function(resp){
                root.chronicles = resp.data;
                if(root.chronicles.length > 0){
                    try{
                        var selectedchronicle = localStorage.getItem("selectedchronicle");
                        if(selectedchronicle){
                            root.selectedchronicle = $.grep(root.chronicles, function(item){
                                return item.id === selectedchronicle;
                            })[0];
                        };
                    }catch(e){

                    }
                    if(!root.selectedchronicle)
                        root.selectedchronicle = root.chronicles[0];
                    $scope.loaded = true;
                }
                
            $http.get("/character/all").then(function (response) {
                root.items = response.data;
    
                $scope.search();
                loading.hide();
            }); 
            });
        }
        else{
            $http.get("/character/all").then(function (response) {
                root.items = response.data;
    
                $scope.search();
                loading.hide();
            }); 
        }
    };

    $scope.exportvisible = function(){
        return ($scope.selectedexportchronicle === undefined || $scope.exporttype === undefined);
    };

    $scope.CreateNew = function(){
        location = "/character/new/" + $scope.selectedchronicle.id;
    };

    $scope.DeleteSelected = function(){
        var ids = [];
        for(var key in $scope.selected){
            if($scope.selected[key] === true){
                ids.push(key);
            }
        }
        $scope.selected = {};
        if(ids.length > 0){
            loading.show();
            $http.post("/character/delete", {ids: ids, chronicleid: $scope.selectedchronicle.id}).then(function(){
                $scope.init();
            });
        }
    };

    $scope.openItem = function(itemid)
    {
        window.open("/character/show/" + itemid);
    };

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toString().toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };
    // init the filtered items
    $scope.search = function () {
        $scope.filteredItems = $filter('filter')($scope.items, function (item) {
            for(var attr in item) {
                if($scope.selectedstatus == "Select a status..."){
                    if (searchMatch(item[attr], $scope.query) && item.chronicle == $scope.selectedchronicle.id)
                    {
                        return true;
                    }
                }else{
                    if (searchMatch(item[attr], $scope.query) && item.chronicle == $scope.selectedchronicle.id && item.state == $scope.selectedstatus)
                    {
                        return true;
                    }
                }
            }
            return false;
        });

        try{
            localStorage.setItem("selectedchronicle", $scope.selectedchronicle.id);
            localStorage.setItem("itemsperpage", $scope.itemsPerPage);
            localStorage.setItem("statusselection", $scope.selectedstatus);
        }catch(e){}

        // take care of the sorting order
        if ($scope.sort.sortingOrder !== '') {
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
        }
        $scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
    };


    // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
            }
        }
    };

    $scope.range = function (size,start, end) {
        var ret = [];

        if (size < end) {
            end = size;
            start = size-$scope.gap;
        }
        start = Math.max(0, start);
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };

    $scope.prevPage = function () {
        $scope.clearCheckAll();
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        $scope.clearCheckAll();
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function () {
        $scope.clearCheckAll();
        $scope.currentPage = this.n;
    };

    $scope.checkAll = function () {
        $scope.selectedAll = !!$scope.selectedAll;
        angular.forEach($scope.pagedItems[$scope.currentPage], function (item) {
            $scope.selected[item.id] = $scope.selectedAll;
        });
    };
    $scope.clearCheckAll = function () {
        $scope.selectedAll = false;
        angular.forEach($scope.pagedItems[$scope.currentPage], function (item) {
            $scope.selected[item.id] = $scope.selectedAll;
        });
    };
}]);

app.filter('findPlayer', function() {
    return function(input, allPlayers){
        var players = $.grep(allPlayers, function(element){
            return element.googleId == input;
        });
        if(players.length > 0) return players[0].displayName;
        return '';
    }
});

app.directive("customSort", function() {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            order: '=',
            sort: '='
        },
        template :
        ' <a ng-click="sort_by(order)" style="color: #555555;">'+
        '    <span ng-transclude></span>'+
        '    <i ng-class="selectedCls(order)"></i>'+
        '</a>',
        link: function(scope) {

            // change sorting order
            scope.sort_by = function(newSortingOrder) {
                var sort = scope.sort;

                if (sort.sortingOrder == newSortingOrder){
                    sort.reverse = !sort.reverse;
                }

                sort.sortingOrder = newSortingOrder;
            };


            scope.selectedCls = function(column) {
                if(scope.sort != null){
                    if(column == scope.sort.sortingOrder){
                        return ('icon-chevron-' + ((scope.sort.reverse) ? 'down' : 'up'));
                    }
                }
                else{
                    return'icon-sort'
                }
            };
        }// end link
    }
});