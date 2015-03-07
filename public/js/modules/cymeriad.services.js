angular.module('cymeriad.services', [])
    .service('loading', function () {
        this.show = function () {
            $('#veil').show();
        };
        this.hide = function () {
            $('#veil').fadeOut(200);
        };
    });