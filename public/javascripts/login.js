/**
 * Created by hitesh on 1/4/17.
 */
//create the angular module
//ngMaterial is a dependancy that handles input design

angular.module('formApp', ['ngMaterial', 'ngMessages'])
    .controller('formController',function formController($scope, $http){
        $scope.formData = {};

        $scope.processForm = function(){

            $http({
                method: 'POST',
                url: '/login',
                data: $.param($scope.formData),
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function(data){
                window.location.reload(true);
            });

        }
    });