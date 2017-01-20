//create the angular module
//ngMaterial is a dependancy that handles input design

(function(){
    'use strict';
    angular
    .module('formApp', ['ngMaterial', 'ngMessages'])
    .controller('formController',formController);
    
    function formController($scope, $http, $timeout, $q, $log){
        var allGroups;
        var allOwners;
        var self = this;
        $scope.formData = {};
        $scope.currentData = {};

        $scope.processForm = function(selectedItem){
            //save the selected item before wiping it
            $scope.formData.group = selectedItem['display'];
            selectedItem = null;
            $http({
                method: 'POST',
                url: '/write',
                data: $.param($scope.formData),
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function(response){
                writeData(response, $scope);

            });
        
        };

        $scope.$watch('$viewContentLoaded', function() {
            $http.get('/get').then(function(response){
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

        //begin code for owners
        loadAllOwners();
        self.queryOwners = queryOwners();

        function queryOwners(query) {
            return query ? self.owners.filter( createFilterFor(query ) ) : self.owners;
        }

        function loadAllOwners() {
            $http.get("/getOwners").success(function(data){
                allOwners = data[0].owner;
                for (var i = 1; i < data.length; i++){
                    allOwners = allOwners + "," + data[i].owner
                }
            }).then(function(){
                var ownerArray = allOwners.split(',');
                self.owners = ownerArray.map( function( owner){
                    return {
                        value: owner.toLowerCase(),
                        display: owner
                    }
                })
            })
        }

    };
})();

    function writeData(response, $scope){
        $scope.formData = {};
        $scope.currentData.pendingReview = response.data.pendingReview;
        console.log($scope.currentData.pendingReview);
        $scope.currentData.docTitle = response.data.docTitle;
        $scope.currentData.owner = response.data.owner;
        $('#docLink').attr("href", "https://kb.wisc.edu/kbAdmin/document.php?id=" + response.data.docId).attr('target','_blank');
        $scope.currentData.docId = response.data.docId;
        $scope.formData.docId = response.data.docId;
        $scope.formData.owner = response.data.owner;
        $scope.formData.commentsTopic = response.data.commentsTopics;
        $scope.formData.commentsOwner = response.data.commentsOwnership; 
    }

