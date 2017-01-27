//create the angular module
//ngMaterial is a dependancy that handles input design
(function(){
    'use strict';
    angular
    .module('formApp', ['ngMaterial', 'ngMessages'])
    .controller('formController',formController);
    
    function formController($scope, $http, $timeout, $q, $log, $mdToast, $mdSidenav){
        $scope.toggle = toggle();
        function toggle(){
            return function(){
                $mdSidenav("left_panel").toggle();
            }
        }

        
    };
})();
