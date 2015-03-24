'use strict';

// TODO add better logging

// Declare app level module which depends on views, and components
angular.module('dockermon', [
    'ngRoute',
    'ngResource',
    'services',
    'hosts',
    'hostDetails',
    'containers',
    'containerDetails',
    'images',
    'imageDetails'
])
    .run(function ($rootScope) {
        //$rootScope.host = "http://devft-docker-host-02.web.zooplus.de:2375";
        //$rootScope.host = "http://192.168.100.29:2375";
        //
        //$rootScope.sidemenu = 'app/shared/sidemenu.html';
        console.log("Rootscope initialized");
    }).config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/hosts'});
    }])

;

