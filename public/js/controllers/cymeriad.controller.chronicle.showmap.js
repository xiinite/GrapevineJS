"use strict";
app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'drawing,places,weather,geometry,visualization'
    });
});
app.controller('cymeriad.controller.chronicle.showmap', ['$scope', '$http', 'loading', 'ngToast', function ($scope, $http, loading, ngToast) {
    var events = {
        places_changed: function (searchBox) {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            var map = $scope.gmap.getGMap();
            map.fitBounds(bounds);
        }
    };
    $scope.gmap= {};
    $scope.mapid = '';
    $scope.chronicle = {};
    $scope.map = { center: { latitude: 0, longitude: 0 }, zoom: 1, markers: [], polygons: []};
    $scope.searchbox = { template:'searchbox.tpl.html', events:events};
    $scope.lastObj = {};
    $scope.drawingManagerControl = {};
    $scope.shapes = {};
    $scope.selectedShape = null;
    $scope.selectedLabelContent = {};
    $scope.selectedColor = '#FF0000';
    $scope.$watch('selectedColor', function(val) {});
    $scope.update = false;
    $scope.mapevents = {
        idle: function (e){
            if(!$scope.update) return;
            if($scope.gmap.getGMap){
                var map = $scope.gmap.getGMap();
                if(map){
                    map.setZoom($scope.map.zoom);
                    map.panTo({lat: $scope.map.center.latitude, lng: $scope.map.center.longitude});

                    var i = $scope.map.markers.length;
                    while(i--){
                        var marker = $scope.map.markers[i];
                    }
                    $scope.update = false;
                }

                $scope.$apply();
            }
        }
    };

    var addMarker = function(id, position, label, color){
        try{
            $scope.map.markers.push({
                id: id,
                coords: {latitude: position.latitude, longitude: position.longitude},
                opts: {labelContent: label, labelStyle: {opacity: 1, textAlign: "center", fontSize: "12pt", color: "#000000"}},
                labeltext: label,
                color: color,
                type: 'marker',
                events: {
                    click: function(e){
                        var m = $scope.findMarker(e.key);
                        setOpacities();
                        $scope.selectedShape = m;
                        $scope.selectedColor = null;
                        $scope.selectedLabelContent = m.opts.labelContent;
                    }
                }
            });
        }catch(error){
            console.log(error);
        }
    };

    var addPolygon = function(id, path, label, color){
        try{
            $scope.map.polygons.push({
                id: id,
                path: path,
                type: 'polygon',
                color: color,
                labeltext: label,
                stroke: {
                    color: color,
                    weight: 2
                },
                editable: false,
                draggable: false,
                geodesic: false,
                visible: true,
                fill: {
                    color: color,
                    opacity: 0.25
                },
                opts: {labelContent: label, labelStyle: {opacity: 1, textAlign: "center", fontSize: "12pt", width: "50px", color: "#000000"}},
                events: {
                    click: function(gPolygon, event, obj){
                        $scope.selectPolygon(obj);
                    }
                }
            });
        }catch(error){
            console.log(error);
        }
    };

    $scope.selectPolygon = function(polygon){
        var m = $scope.findPolygon(polygon);
        setOpacities();
        $scope.selectedShape = m;
        $scope.selectedShape.fill.opacity = 0.8;
        $scope.selectedColor = m.color;
        $scope.selectedLabelContent = m.labeltext;
    };

    var setOpacities = function(){
        var i = $scope.map.polygons.length;
        while(i--){
            $scope.map.polygons[i].fill.opacity = 0.25;
        }
    };

    $scope.findMarker = function(id){
        var i = $scope.map.markers.length;
        while(i--){
            if($scope.map.markers[i].id === id) return $scope.map.markers[i];
        }
    };
    $scope.findPolygon = function(obj){
        var i = $scope.map.polygons.length;
        while(i--){
            if($scope.map.polygons[i].path === obj.path) return $scope.map.polygons[i];
        }
    };

    $scope.init = function (id, mapid) {
        $scope.mapid = mapid;
        loading.show();
        var root = $scope;
        $http.get("/chronicle/find/" + id).then(function(response) {
            root.chronicle = response.data;
            $http.get("/chronicle/getmap/" + mapid).then(function(res){
                if(res.data){
                    var config = res.data.config;
                    var nodes = res.data.nodes;
                    if(config){
                        $scope.map.center.latitude = config.latitude;
                        $scope.map.center.longitude = config.longitude;
                        $scope.map.zoom = config.zoom;
                        //$scope.map.ltlg = new google.maps.GLatLng($scope.map.center.latitude,$scope.map.center.longitude);
                        $scope.update = true;
                    }
                    if(nodes){
                        if(nodes.shapes){
                            var i = nodes.shapes.length;
                            while(i--){
                                var s = nodes.shapes[i];
                                if(s.type == 'marker'){
                                    addMarker(s.id, s.position, s.label, s.color);
                                }else if (s.type == 'polygon'){
                                    var pi = s.path.length;
                                    while(pi--){
                                        if(s.path[pi].A !== undefined && s.path[pi].F !== undefined)
                                            s.path[pi] = {latitude: s.path[pi].A, longitude: s.path[pi].F};
                                    }
                                    addPolygon(s.id, s.path, s.label, s.color);
                                }
                            }
                        }
                    }
                }
                loading.hide();
            });
        });

    };
}]);
