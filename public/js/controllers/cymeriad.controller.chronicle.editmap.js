"use strict";
app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'drawing,places,weather,geometry,visualization'
    });
});
app.controller('cymeriad.controller.chronicle.editmap', ['$scope', '$http', 'loading', 'ngToast', function ($scope, $http, loading, ngToast) {
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
    $scope.map = { center: { latitude: 0, longitude: 0 }, zoom: 1, markers: []};
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
                }

                if($scope.shapes.getShapes){

                    var shapes = $scope.shapes.getShapes();
                    var i = shapes.length;
                    while(i--){
                        var position = {};
                        var offset = {};
                        var s = shapes[i];
                        if(s.type == 'marker')
                        {
                            position = s.getPosition();
                            offset = new google.maps.Size(-25, 0);
                        }
                        var labelOptions = {
                            content: "New Label",
                            boxStyle: {
                                textAlign: "center",
                                fontSize: "12pt",
                                width: "50px",
                                color: "#000000"
                            },
                            disableAutoPan: true,
                            pixelOffset: offset,
                            position: position,
                            closeBoxURL: "",
                            isHidden: false,
                            pane: "mapPane",
                            enableEventPropagation: true
                        };

                        var shapeLabel = new InfoBox(labelOptions);
                        shapeLabel.open(map);
                        $scope.selectedShape.labelText = "New Label";
                        $scope.selectedShape.label = shapeLabel;
                    }
                    $scope.update = false;
                }

                $scope.$apply();
            }
        }
    };
    $scope.drawevents = {
        overlaycomplete: function(manager, e) {
            var map = $scope.gmap.getGMap();
            var lastShape = $scope.shapes.getLastShape();
            lastShape.color = "#FFFFFF";

            var shapes = $scope.shapes.getShapes();
            var i = shapes.length;
            while(i--){
                shapes[i].set('strokeColor', "#000000")
            }
            lastShape.set('strokeColor', '#FFFFFF');
            $scope.selectedShape = lastShape;
            $scope.selectedColor = lastShape.color;
            var position = {};
            var offset = {};
            if(lastShape.type === 'marker'){
                position = lastShape.getPosition();
                offset = new google.maps.Size(-25, 0);
            }else{
                var bounds = new google.maps.LatLngBounds();
                for (i = 0; i < lastShape.getPath().getArray().length; i++) {
                    bounds.extend(lastShape.getPath().getArray()[i]);
                }
                position = bounds.getCenter();
                offset = new google.maps.Size(-40, 0);
                lastShape.path = lastShape.getPath();
            }
            lastShape.position = position;
            var labelOptions = {
                content: "New Label",
                boxStyle: {
                    textAlign: "center",
                    fontSize: "12pt",
                    width: "50px",
                    color: "#000000"
                },
                disableAutoPan: true,
                pixelOffset: offset,
                position: position,
                closeBoxURL: "",
                isHidden: false,
                pane: "mapPane",
                enableEventPropagation: true
            };

            var shapeLabel = new InfoBox(labelOptions);
            shapeLabel.open(map);
            $scope.selectedShape.labelText = "New Label";
            $scope.selectedShape.label = shapeLabel;
            $scope.selectedShape.set('labelContent', 'Selected');
            $scope.selectedLabelContent = $scope.selectedShape.label.getContent();
            if(!$scope.$$phase) $scope.$apply();

            google.maps.event.addListener(lastShape, 'click', function(s) {
                $scope.selectedShape = lastShape;
                $scope.selectedColor = $scope.selectedShape.color;
                $scope.selectedLabelContent = $scope.selectedShape.label.getContent();
                var shapes = $scope.shapes.getShapes();
                var i = shapes.length;
                while(i--){
                    shapes[i].set('strokeColor', '#000000')
                }
                lastShape.set('strokeColor', '#FFFFFF');

                if(!$scope.$$phase) $scope.$apply();
            });
        }
    };

    $scope.setLabel = function(){
        $scope.selectedShape.label.setContent($scope.selectedLabelContent);
        $scope.selectedShape.labelText = $scope.selectedLabelContent;
    };
    $scope.setColor = function(){
        $scope.selectedShape.color = $scope.selectedColor;
        $scope.selectedShape.set('fillColor', $scope.selectedColor);
    };

    $scope.deleteShape = function(){
        if(!$scope.selectedShape) return;
        $scope.selectedShape.setMap(null);
        $scope.selectedShape.label.setMap(null);

        $scope.selectedShape = {};
        $scope.selectedLabelContent = "";
    };

    $scope.save = function(){
        var saving = ngToast.create({
            className: 'info',
            content: 'Saving...',
            timeout: 2000
        });
        var map = $scope.gmap.getGMap();
        var config = {
            latitude: map.center.A,
            longitude: map.center.F,
            zoom: map.zoom
        };
        var nodes = {shapes: []};
        var shapes = $scope.shapes.getShapes();
        var i = shapes.length;
        while(i--){
            var s = shapes[i];
            if(s.type == 'marker'){
                nodes.shapes.push({
                    id: Date.now(),
                    position: s.position,
                    label: s.labelText,
                    color: s.color,
                    type: s.type
                });
            }
        }
        $http.post("/chronicle/updatemap", {id: $scope.mapid, nodes: nodes, config: config}).then(function(){
            ngToast.dismiss(saving);
            ngToast.create({
                className: 'success',
                content: 'Saved!',
                timeout: 2000
            });
        });
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
                    if(nodes.shapes){
                        var i = nodes.shapes.length;
                        while(i--){
                            var s = nodes.shapes[i];
                            if(s.type == 'marker'){
                                $scope.map.markers.push({
                                    id: s.id,
                                    coords: {latitude: s.position.A, longitude: s.position.F}
                                });
                            }
                        }
                    }
                }
                loading.hide();
            });
        });

    };
}]);
