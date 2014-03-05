'use strict';
angular.module('h2o.app', []).
  controller('app', function ($rootScope, $scope, $location, $http, $routeParams){
     $scope.module = $routeParams.module;
     $scope.section = $routeParams.section;
     $scope.load = document.getElementById('loadCont');
     $scope.load.style.display = 'block';
     $scope.init = function(){
        console.log('load');   
        };
     $scope.intervalLoad = setInterval(function(){
       if ($rootScope.state === 'start') {
          clearInterval($scope.intervalLoad);
          console.log($rootScope.uname);
          if ($rootScope.uname === 'alien')   
             $rootScope.$apply(function(){
               $location.path("/");
             });
          else 
             $scope.init();
             $scope.load.style.display = 'none';
          }
       },100);     
  });