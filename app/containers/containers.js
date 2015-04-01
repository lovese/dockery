'use strict';

angular.module('containers', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/containers', {
            templateUrl: 'app/containers/containers.html',
            controller: 'ContainerCtrl'
        });
    }])
    .controller('ContainerCtrl', ['$rootScope', '$scope', '$location', 'Helpers', 'Docker', function ($rootScope, $scope, $location, Helpers, Docker) {
        if (Helpers.isEmpty($rootScope.hostUrl)) {
            $location.path('/hosts');
        } else {
            $scope.showAllContainersFlag = false;
            $scope.showContainerSizeFlag = false;
            refreshContainers();

            $scope.refreshContainers = function () {
                refreshContainers();
            };
            //
            $scope.switchShowAllContainersFlag = function () {
                $scope.showAllContainersFlag = !$scope.showAllContainersFlag;
                refreshContainers();
            };
            $scope.switchShowContainerSizeFlag = function () {
                console.log('sizeswitch');
                $scope.showContainerSizeFlag = !$scope.showContainerSizeFlag;
                refreshContainers();
            };

            //
            $scope.goContainerDetails = function (path) {
                $location.path('/containerDetails/' + path);
            };
            //
            $scope.goImageDetails = function (path) {
                $location.path('/imageDetails/' + path);
            };
        }
        function getObjectPropertiesAmount(containerDataList) {
            var count = 0;
            for (var prop in containerDataList) {
                if (containerDataList.hasOwnProperty(prop)) {
                    ++count;
                }
            }
            return count;
        }

        function refreshContainers() {
            var containerDataList = {};
            var containerParam = {};
            if ($scope.showAllContainersFlag == true) {
                containerParam.all = 1;
            }
            var containers = Docker.containers().query(containerParam, function () {
                containers.forEach(function (container) {
                    var containerData = {};

                    containerData.Id = container.Id;
                    containerData.Image = container.Image;
                    containerData.Created = container.Created;
                    containerData.Command = container.Command;
                    containerData.Status = container.Status;
                    containerData.SizeRw = 0;
                    containerData.SizeRootFs = 0;
                    containerDataList[containerData.Id] = containerData;

                    var containerDetails = Docker.containers().get({containerId: container.Id}, function () {
                        $scope.containerDetails = containerDetails;
                        containerData.ImageId = containerDetails.Image;
                        containerData.Name = containerDetails.Name.substr(1);
                    });

                });
                $scope.containerDataList = containerDataList;
                $scope.containerDataSize = getObjectPropertiesAmount(containerDataList);
            });
            if ($scope.showContainerSizeFlag == true) {
                console.log('Size ' + $scope.showContainerSizeFlag);
                containerParam = {};
                if ($scope.showAllContainersFlag == true) {
                    containerParam.all = 1;
                }
                if ($scope.showContainerSizeFlag == true) {
                    containerParam.size = 1;
                }
                console.log(JSON.stringify(containerParam));
                var containersWithSize = Docker.containers().query(containerParam, function () {
                    containersWithSize.forEach(function (containerWithSize) {
                        var containerData = containerDataList[containerWithSize.Id];
                        if (containerWithSize.Id == containerData.Id) {
                            containerData.SizeRw = containerWithSize.SizeRw;
                            containerData.SizeRootFs = containerWithSize.SizeRootFs;
                        }
                    });
                    $scope.containerDataList = containerDataList;
                    $scope.containerDataSize = getObjectPropertiesAmount(containerDataList);
                });
            }
        }
    }]);