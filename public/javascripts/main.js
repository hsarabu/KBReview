//create the angular module
//ngMaterial is a dependancy that handles input design
var todoDocs;
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
        $scope.todoDoc = [];
        $scope.toggle = toggle();
        

        function toggle(){
            return function(){
                $mdSidenav("left_panel").toggle();
            }
        }

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
                $scope.todoDoc.shift();
                writeData(0, todoDocs, $scope);
                selectedItem = null;
                $scope.docsLeft--;

            });
        
        };

        $scope.$watch('$viewContentLoaded', function() {
            $http.get('/todoDocs').then(function(response){
                todoDocs = response;
                $scope.docsLeft = todoDocs.data.length;
                generateListTodo($scope, todoDocs); 
                writeData(0,response, $scope);
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

        $scope.changeDoc = function(index){
            writeData(index, todoDocs, $scope);
        }

        $scope.changeColor = function(){
            if($scope.formData.important) $("#btn").addClass('md-warn')
            else {
                try {
                    $("#btn").removeClass('md-warn');
                }
                finally {
                    console.log('gotta do something');
                }
            }
        }

    };
})();

function writeData(done, response, $scope){
    //var done = 0; //lazy, I don't want to change the rest of the code
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

function generateListTodo($scope, todoDocs){
    //only generates next floor(100 || #of docs left) to greatly decrease loading times
    for( var i = 0; i < less(); i++){
        $scope.todoDoc.push({
            title: todoDocs.data[i].title,
            group: todoDocs.data[i].group,
            id: todoDocs.data[i].docId,
            index: i
        });
    }
}

//function returns 100 or docs.data.length, whichever is less 

function less(){
    if(todoDocs.data.length <= 100) return docs.data.length;
    else return 100;
}
