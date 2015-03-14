app.controller('cymeriad.controller.character.approve', ['$scope', '$http', 'loading', function ($scope, $http, loading) {
    $scope.characters = [];
    $scope.freebees = 0;
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

    $scope.showList = function(){
        return $scope.characters.length > 0;
    };

    $scope.showbg = function(char){
        if(char.visible === undefined) char.visible = false;
        char.visible = !char.visible;
    }

    $scope.approve = function(id, state, freebees){
        loading.show();
        if(state == "Approval Pending"){
            $http.post("/character/approveconcept", {id: id, state: "Approved"}).then(function(){
                loading.hide();
                for(var i=0;i<$scope.characters.length;i++){
                    if($scope.characters[i].id == id){
                        $scope.characters.splice(i, 1);
                        return;
                    }
                }
            });
        }else if(state == "Final Approval Pending"){
            $http.post("/character/approvefinal", {id: id, state: "Active"}).then(function(){
                loading.hide();
                for(var i=0;i<$scope.characters.length;i++){
                    if($scope.characters[i].id == id){
                        $scope.characters.splice(i, 1);
                        return;
                    }
                }
            });
        }else{
            $http.post("/character/approvebackground", {id: id, state: "Background Approved", freebees: freebees}).then(function(){
                loading.hide();
                for(var i=0;i<$scope.characters.length;i++){
                    if($scope.characters[i].id == id){
                        $scope.characters.splice(i, 1);
                        return;
                    }
                }
            });
        }
    };

    $scope.reject = function(id, reason, state){
        loading.show();
        if(state == "Approval Pending"){
            $http.post("/character/approveconcept", {id: id, state: "Rejected", reason: reason}).then(function(){
                loading.hide();
                for(var i=0;i<$scope.characters.length;i++){
                    if($scope.characters[i].id == id){
                        $scope.characters.splice(i, 1);
                        return;
                    }
                }
            });
        }else if(state == "Final Approval Pending"){
            $http.post("/character/approvefinal", {id: id, state: "Rejected", reason: reason}).then(function(){
                loading.hide();
                for(var i=0;i<$scope.characters.length;i++){
                    if($scope.characters[i].id == id){
                        $scope.characters.splice(i, 1);
                        return;
                    }
                }
            });
        }else{
            $http.post("/character/approvebackground", {id: id, state: "Background Rejected", reason: reason}).then(function(){
                loading.hide();
                for(var i=0;i<$scope.characters.length;i++){
                    if($scope.characters[i].id == id){
                        $scope.characters.splice(i, 1);
                        return;
                    }
                }
            });

        }

    };

    $scope.init = function () {
        loading.show();
        $http.get("/character/approvelist/").then(function (response) {
            $scope.characters = response.data;
            loading.hide();
        });
    }
}]);