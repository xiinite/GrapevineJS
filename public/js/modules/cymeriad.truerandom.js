"use strict";
angular.module('cymeriad.truerandom', ['ngResource', 'ngRoute']).factory('truerandom', function($http) {
  return {
    getRand: function(numberOfDices, min, max) {
    var xsrf = ({
      'jsonrpc': '2.0',
      'method': 'generateIntegers',
      'params': {
        'apiKey': '03933be7-0bd2-4310-991a-86dcb8c7ebe0',
        'n': 1,
        'min': min,
        'max': max,
        'replacement': true,
        'base': 10
      },
      'id': 27846
    });
  
      return $http({
        url: 'https://cors-anywhere.herokuapp.com/https://api.random.org/json-rpc/1/invoke',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json-rpc'
        },
        data: xsrf
      });
    }
  };
});