"use strict";
angular.module('cymeriad.crudTable', ['cymeriad.services']).directive('crudtable', function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            data: '&'
        },
        template: '<div class="col-md-12">' +
        '<div class="col-md-3">' +
        '<div class="btn-group">' +
        '<button class="btn btn-default" ng-click="DeleteSelected()">Delete</button>' +
        '<button class="btn btn-default" ng-click="addNew()">New</button>' +
        '</div>' +
        '</div>' +
        '<div class="col-md-3">' +
        '</div>' +
        '<span class="col-md-3 text-right">' +
        'Search:' +
        '</span>' +
        '<span class="col-md-3">' +
        '<input class=" form-control" type="text" ng-model="query" ng-change="search()"/>' +
        '</span>' +
        '<table class="table table-striped table-condensed table-hover">' +
        '<thead>' +
        '<tr>' +
        '<th width="10px"></th>' +
        '<th ng-repeat="col in columns" custom-sort order="col" sort="sort">{{col}}</th>' +
        '</tr>' +
        '</thead>' +
        '<tfoot>' +
        '<td colspan="3">' +
        '<nav class="col-md-6">' +
        '<ul class="pagination">' +
        '<li ng-class="{disabled: currentPage == 0}">' +
        '<a href ng-click="prevPage()" aria-label="Previous">' +
        '<span aria-hidden="true">&laquo;</span>' +
        '</a>' +
        '</li>' +
        '<li ng-repeat="n in range(pagedItems.length, currentPage, currentPage + gap) "' +
        'ng-class="{active: n == currentPage}"' +
        'ng-click="setPage()">' +
        '<a href ng-bind="n + 1">1</a>' +
        '</li>' +
        '<li ng-class="{disabled: (currentPage) == pagedItems.length - 1}">' +
        '<a href ng-click="nextPage()">' +
        '<span aria-hidden="true">&raquo;</span>' +
        '</a>' +
        '</li>' +
        '</ul>' +
        '</nav>' +
        '</td>' +
        '</tfoot>' +
        '<tbody>' +
        '<tr ng-repeat="item in pagedItems[currentPage] | orderBy:sort.sortingOrder:sort.reverse">' +
        '<td><input type="checkbox" ng-model="selected[item.id]"></td>' +
        '<td ng-repeat="col in columns" class="clickable" ng-click="openItem(item.id)">{{item[col]}}</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '</div>',
        link: function(scope) {
            scope.init();
        },
        controller: ['$scope', '$attrs', '$element', '$http', '$filter', 'loading',
            function ($scope, $attrs, $element, $http, $filter, loading) {
                $scope.sort = {
                    sortingOrder: 'name',
                    reverse: false
                };
                $scope.itemtype = "";
                $scope.columns = [];
                $scope.items = [];

                $scope.gap = 5;
                $scope.itemsPerPage = 10;
                $scope.selected = {};

                $scope.filteredItems = [];
                $scope.groupedItems = [];
                $scope.pagedItems = [];
                $scope.currentPage = 0;

                $scope.addNew = function () {
                    location = "/" + $scope.itemtype + "/new/";
                };

                $scope.DeleteSelected = function () {
                    var ids = [];
                    for (var key in $scope.selected) {
                        if ($scope.selected[key] === true) {
                            ids.push(key);
                        }
                    }
                    $scope.selected = {};
                    if (ids.length > 0) {
                        loading.show();
                        $http.post("/" + $scope.itemtype + "/delete", {ids: ids}).then(function () {
                            $scope.init();
                        });
                    }
                };

                $scope.init = function () {
                    $scope.itemtype = $attrs.table;
                    $scope.columns = $attrs.columns.split('|');
                    $scope.sort.sortingOrder = $attrs.sort;
                    loading.show();
                    var root = $scope;
                    if($attrs.data === undefined)
                    {
                        $http.get("/" + $scope.itemtype + "/all").then(function (response) {
                            root.items = response.data;
                            for(var i = root.items.length; i--; ){
                                if(root.items[i].date !== undefined){
                                    root.items[i].date = $filter('date')(root.items[i].date, 'yyyy-MM-dd');
                                }
                            }
                            $scope.search();
                            loading.hide();
                        });
                    }
                    else
                    {
                        var cb = function(response){
                            root.items = response.data;
                            for(var i = root.items.length; i--; ){
                                if(root.items[i].date !== undefined){
                                    root.items[i].date = $filter('date')(root.items[i].date, 'yyyy-MM-dd');
                                }
                            }
                            $scope.search();
                            loading.hide();
                        };
                        $scope.data({callback: cb});
                    }
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
                        for (var attr in item) {
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
                            $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]];
                        } else {
                            $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                        }
                    }
                };

                $scope.range = function (size, start, end) {
                    var ret = [];

                    if (size < end) {
                        end = size;
                        start = size - $scope.gap;
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

                $scope.openItem = function (itemid) {
                    location = "/" + $scope.itemtype + "/edit/" + itemid;
                }
            }]
    };
}).directive("customSort", function() {
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
});;