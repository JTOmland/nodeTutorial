var vsapp = angular.module('vsapp', ['ngMaterial','ngRoute'])
    .config(['$routeProvider','$locationProvider',function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
            templateUrl: '/partials/table',
            controller: MainController
            }).
            when('/table', {
            templateUrl: 'partials/table',
            controller: MainController
            }).
            otherwise({
            redirectTo: '/'
            });

    $locationProvider.html5Mode(true);
}]).run(function($rootScope) {
});