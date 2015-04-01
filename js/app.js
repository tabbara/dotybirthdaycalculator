var app = angular.module("myApp", [
  "ui.router",
  "mainModule"
]);

angular.module("mainModule", []);

angular.module('mainModule')
.controller('mainCtrl', function($rootScope, $scope) {

  console.log('loaded');

});

angular.module("myApp")
.config( function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
  .state('/', {
    cache: false,
    url: "/",
    templateUrl: "views/main.html",
    controller: "mainCtrl"
  })
});
