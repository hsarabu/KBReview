//create the angular module
//ngMaterial is a dependancy that handles input design
var doneDocs;
(function(){
    'use strict';
    angular
    .module('formApp', ['ngMaterial', 'ngMessages'])
    .controller('formController',formController);
    
    function formController($scope, $http, $timeout, $q, $log, $mdToast, $mdSidenav){
        var allGroups;
        var allOwners;
        var self = this;
        $scope.formData = {};
        $scope.currentData = {};
        $scope.doneDocs = [];
        $scope.toggle = toggle();
        

        function toggle(){
            return function(){
                $mdSidenav("left_panel").toggle();
            }
        }

        $scope.$watch('$viewContentLoaded', function() {
            $http.get('/doneDocs').then(function(response){
                doneDocs = response;
                $scope.docsDone = doneDocs.data.length;
                generateListTodo($scope, doneDocs); 
            });           
        });
    

    };
})();

function generateListTodo($scope, todoDocs){
    //only generates next floor(100 || #of docs left) to greatly decrease loading times
    for( var i = 0; i < less(); i++){
        $scope.doneDocs.push({
            title: todoDocs.data[i].title,
            group: todoDocs.data[i].group,
            id: todoDocs.data[i].docId,
            login: todoDocs.data[i].login,
            suggestedGroup: todoDocs.data[i].suggestedGroup,
            topicComments: todoDocs.data[i].comments.topics,
            index: i
        });
    }
}

//function returns 100 or docs.data.length, whichever is less 

function less(){
    if(doneDocs.data.length <= 100) return doneDocs.data.length;
    else return 100;
}
