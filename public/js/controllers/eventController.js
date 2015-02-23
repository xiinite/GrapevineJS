app.controller('EventController', ['$scope', '$http', 'loading', '$filter', function ($scope, $http, loading, $filter) {
    $scope.sort = {
        sortingOrder : 'name',
        reverse : false
    };

    $scope.gap = 5;
    $scope.itemsPerPage = 10;
    $scope.selected = {};

    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.items = [];

    $scope.addNew = function(){
        location = "/event/new/";
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
            $http.post("/event/delete", {ids: ids}).then(function(){
                $scope.init();
            });
        }
    };

    $scope.init = function(){
        loading.show();
        var root = $scope;
        $http.post("/event/find", {filters: {}}).then(function (response) {
            root.items = response.data;

            $scope.search();
            loading.hide();
        });
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
                if (searchMatch(item[attr], $scope.query))
                    return true;
            }
            return false;
        });
        // take care of the sorting order
        if ($scope.sort.sortingOrder !== '') {
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
        }
        $scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
        $scope.selected = {};
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
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
        $scope.selected = {};
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
        $scope.selected = {};
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
        $scope.selected = {};
    };

    $scope.openItem = function(itemid)
    {
        location = "/event/edit/" + itemid;
    }
}]);

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
                if(column == scope.sort.sortingOrder){
                    return ('icon-chevron-' + ((scope.sort.reverse) ? 'down' : 'up'));
                }
                else{
                    return'icon-sort'
                }
            };
        }// end link
    }
});