var vsapp = angular.module('vsapp', ['ngMaterial','ngRoute'])
    .config(['$routeProvider','$locationProvider',function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: 'login',
                controller: MainController
            })
            .when('/table', {
                templateUrl: 'table',
                controller: MainController
            })
            .when('/signup', {
                templateUrl: 'signup',
                controller: MainController
            })
            .otherwise({
                redirectTo: '/'
            });

}]).run(function($rootScope) {
});