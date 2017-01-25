//create the angular module
//ngMaterial is a dependancy that handles input design
var todoDocs;
(function(){
    'use strict';
    angular
    .module('formApp', ['ngMaterial', 'ngMessages'])
    .controller('formController',formController);
    
    function formController($scope, $http, $timeout, $q, $log, $mdToast){
        var allGroups;
        var allOwners;
        var self = this;
        $scope.formData = {};
        $scope.currentData = {};

        $scope.processForm = function(selectedItem){
            //save the selected item before wiping it
            $scope.formData.group = selectedItem['display'];
            self.selectedItem = null;
            self.searchText = "";
            $http({
                method: 'POST',
                url: '/write',
                data: $.param($scope.formData),
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function(){
                todoDocs.data.shift();
                $mdToast.show(
                    $mdToast
                    .simple()
                    .textContent('Success!')
                    .position('top right')
                    .hideDelay(3000)
                );
                writeData(todoDocs, $scope);
                selectedItem = null;

            });
        
        };

        $scope.$watch('$viewContentLoaded', function() {
            $http.get('/todoDocs').then(function(response){
                todoDocs = response; 
                writeData(response, $scope);
            });
            
        });
    

        // list of  value/display objects for groups
        //self.groups        = loadAll();
        loadAll();
        self.querySearch   = querySearch;


        function querySearch (query) {
        var results = query ? self.groups.filter( createFilterFor(query) ) : self.groups;
            return results;
        }

        function loadAll() {
            $http.get('/groups').success(function(data){
                allGroups = data[0].group;
                for( var i = 1; i < data.length; i++){
                    //item = JSON.parse(data[i]);
                    allGroups = allGroups + ',' +data[i].group;
                }
                
                }).then(function(){
                    var groupArray = allGroups.split(',');
                    self.groups = groupArray.map( function (group) {
                        return {
                            value: group.toLowerCase(),
                            display: group
                        };
                    });
            });
        }

        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

            return function filterFn(group) {
                return (group.value.indexOf(lowercaseQuery) === 0);
        };

        }

    };
})();

    function writeData(response, $scope){
        var done = 0; //lazy, I don't want to change the rest of the code
        $scope.formData = {};
        //$scope.currentData.pendingReview = response[0].pendingReview;
        $scope.currentData.docTitle = response.data[done].title;
        $scope.currentData.owner = response.data[done].owner;
        $('#docLink').attr("href", "https://kb.wisc.edu/kbAdmin/document.php?id=" + response.data[done].docId).attr('target','_blank');
        $scope.currentData.docId = response.data[done].docId;
        $scope.formData.docId = response.data[done].docId;
        $scope.formData.owner = response.data[done].owner;
        $scope.formData.commentsTopic = response.data[done].comments.topics;
        $scope.formData.commentsOwner = response.data[done].comments.ownership;
    }

