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
        $scope.flaggedDocs = [];
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
                    .textContent('Updated')
                    .position('top right')
                    .hideDelay(3000)
                );
                $scope.todoDoc.shift();
                writeData(0, todoDocs, $scope);
                selectedItem = null;
                $scope.docsLeft--;

            });
        
        };
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
            writeData(index, doneDocs, $scope);
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

function generateListTodo($scope, todoDocs){
    //only generates next floor(100 || #of docs left) to greatly decrease loading times
    for( var i = 0; i < todoDocs.data.length; i++){
        console.log(todoDocs.data[i].important);
        if (todoDocs.data[i].important == undefined || todoDocs.data[i].important == false){
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
        else {
            $scope.flaggedDocs.push({
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
}

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