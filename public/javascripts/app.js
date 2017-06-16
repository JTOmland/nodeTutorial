var vsapp = angular.module('vsapp', ['ngMaterial','ngRoute'])
    .config(['$routeProvider','$locationProvider',function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
            templateUrl: '/partials/login',
            controller: MainController
            })
            .when('/table', {
            templateUrl: 'partials/table',
            controller: MainController
            })
            .otherwise({
            redirectTo: '/'
            });

}]).run(function($rootScope) {
});