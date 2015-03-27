'use strict';

// TODO add better logging

// Declare app level module which depends on views, and components
angular.module('dockermon', [
    'ngRoute',
    'ngResource',
    'filters',
    'services',
    'hosts',
    'hostDetails',
    'containers',
    'containerDetails',
    'images',
    'imageDetails'
])
    .run(function ($rootScope) {
        //$rootScope.sidemenu = 'app/shared/sidemenu.html';
        console.log("Rootscope initialized");
    }).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/hosts'});
    }]);


