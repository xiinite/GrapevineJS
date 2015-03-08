app.controller('ChronicleEditController', ['$scope', '$filter', '$http', 'loading', function ($scope, $filter, $http, loading) {
    var orderBy = $filter('orderBy');
    
    $scope.disabled = undefined;
    
    $scope.enable = function() {
        $scope.disabled = false;
    };
    
    $scope.disable = function() {
        $scope.disabled = true;
    };
    
    $scope.clear = function() {
        $scope.userid = undefined;
    };
  
    $scope.log = function (event) {
        console.log(event);
    }

    $scope.id = "";
    $scope.user = {};
    $scope.player = {};
    $scope.chronicle = [];
    $scope.users = [];

    $scope.editId = 0;

    $scope.edit = function (id) {
        $scope.editId = id;
    };
    $scope.cancelEdit = function(){
        $scope.editId = 0;
    }

    $scope.editting = function (id) {
        return $scope.editId == id;
    };
    $scope.noteditting = function(id){
        return $scope.editId != id;
    }
    $scope.saveDescription = function(){
        $http.post("/chronicle/update", {id: $scope.id, field: 'description', data: $scope.chronicle.description}).then(function(response){
            $scope.init($scope.id);
        });
        $scope.editId = 0;
    }
    $scope.saveEmail = function(){
        $http.post("/chronicle/update", {id: $scope.id, field: 'email', data: $scope.chronicle.email}).then(function(response){
            $scope.init($scope.id);
        });
        $scope.editId = 0;
    }
    $scope.descriptionNull = function(){
        if($scope.chronicle.description === undefined)
        {
            return true;
        }
        if($scope.chronicle.description.length == 0){
            return true;
        }
        return false;
    }
    $scope.emailNull = function(){
        if($scope.chronicle.email === undefined)
        {
            return true;
        }
        if($scope.chronicle.email.length == 0){
            return true;
        }
        return false;
    }
    $scope.addAdmin = function(){
        $http.post("/chronicle/addadmin", {id: $scope.id, userId: $scope.user.selected.googleId}).then(function(response){
            $scope.user = {};
            $scope.init($scope.id);
        });
    };

    $scope.addPlayer = function(){
        $http.post("/chronicle/addplayer", {id: $scope.id, userId: $scope.player.selected.googleId}).then(function(response){
            $scope.player = {};
            $scope.init($scope.id);
        });
    }

    $scope.removeAdmin = function(id){
        $http.post("/chronicle/removeadmin", {id: $scope.id, userId: id}).then(function(response){
            $scope.init($scope.id);
        });
    }

    $scope.removePlayer = function(id){
        $http.post("/chronicle/removeplayer", {id: $scope.id, userId: id}).then(function(response){
            $scope.init($scope.id);
        });
    }


    $scope.init = function (id) {
        loading.show();
        var root = $scope;
        $scope.id = id;
        $http.get("/chronicle/find/" + root.id).then(function(response) {
            root.chronicle =  response.data;

            $http.get("/user/all").then(function(response) {
                root.users = orderBy(response.data, '-displayName',false);//response.data;
                loading.hide();
                //root.$apply();
            });
        });
    };
}]);
