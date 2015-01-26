var app = angular.module('grapevinejs', []);

app.service('loading', function() {
    this.show = function() {
        $('#veil').show();
        $('#feedloading').show();
    };
    this.hide=function () {
        $('#veil').fadeOut(500);
        $('#feedloading').fadeOut(500);
    };
});