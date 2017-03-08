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

        $scope.$watch('$viewContentLoaded', function(){
            $http.get('/chartData').then(function(response){
                console.log(response.data[0]);
            })
        });
        
    };
})();


function generatePi(flagged, allReviewed, todo){
    reviewed = allReviewed - flagged; //generate number for the entire review
    var piContext = 'piChart';
    var piData = {
            labels: [
                "Reviewed",
                "Flagged",
                "Todo"
            ],
            datasets : [
                {
                    data : [
                        reviewed,
                        flagged,
                        todo
                    ],
                    backgroundColor : [
                        "#4CAF50",
                        "#E53935",
                        "#1E88E5"
                    ],
                    hoverBackgroundColor : [
                        "#4CAF50",
                        "#E53935",
                        "#1E88E5"
                    ]
                }
            ],

    }
    var piChart = new Chart(piContext, {
        type: "pie",
        data, piData,
        options: {
            animation:{
                animateScale:true
            }
        }
    })
}