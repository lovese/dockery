'use strict';

angular.module('containerDetails', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/containerDetails/:containerId', {
            templateUrl: 'app/containerDetails/containerDetails.html',
            controller: 'ContainerDetailsCtrl'
        });
    }])

    .controller('ContainerDetailsCtrl', ['$rootScope', '$scope', '$location', '$routeParams', 'Helpers', 'Docker', function ($rootScope, $scope, $location, $routeParams, Helpers, Docker) {
        if (Helpers.isEmpty($rootScope.hostUrl)) {
            $location.path('/hosts');
        } else {
            $scope.activeTab = 'top';
            $scope.newDiffPageSize = 20;
            //
            var diffSettings = [];
            diffSettings["pageIndex"] = 1;
            diffSettings["maxPageIndex"] = 0;
            diffSettings["startIndex"] = 0;
            diffSettings["endIndex"] = 0;
            diffSettings["pageSize"] = $scope.newDiffPageSize;
            $scope.diffSettings = diffSettings;
            //
            var logSettings = [];
            logSettings["showStdOut"] = true;
            logSettings["stdOutTail"] = 1000;
            logSettings["stdOutTailAll"] = false;
            logSettings["stdOutTimestamp"] = true;
            logSettings["showStdErr"] = true;
            logSettings["stdErrTail"] = 1000;
            logSettings["stdErrTailAll"] = false;
            logSettings["stdErrTimestamp"] = true;
            $scope.logSettings = logSettings;

            //
            var containerDetails = Docker.containers().get({containerId: $routeParams.containerId}, function () {
                $scope.containerDetails = containerDetails;
                $scope.showProcesses($routeParams.containerId);
            });
            //
            $scope.showLogs = function (containerId) {
                $scope.activeTab = 'logs';

                var logParams = {};
                logParams.stderr = 0;
                logParams.stdout = 1;
                logParams.timestamps = logSettings["stdOutTimestamp"];
                logParams.tail = logSettings["stdOutTailAll"] == true ? true : logSettings["stdOutTail"];

                Docker.containerLogs(containerId, logParams, function (data, status, headers, config) {
                    $scope.stdOutLog = data;
                    logParams.stderr = 1;
                    logParams.stdout = 0;
                    logParams.timestamps = logSettings["stdErrTimestamp"];
                    logParams.tail = logSettings["stdErrTailAll"] == true ? true : logSettings["stdErrTail"];
                    Docker.containerLogs(containerId, logParams, function (data, status, headers, config) {
                        data = data.substring(8);
                        $scope.stdErrLog = data;
                    });
                });

                $scope.switchStdOutPanel = function () {
                    logSettings["showStdOut"] = !logSettings["showStdOut"];
                };
                $scope.switchStdErrPanel = function () {
                    logSettings["showStdErr"] = !logSettings["showStdErr"];
                };

                $scope.refreshStdOutLogs = function () {
                    logParams.stderr = 0;
                    logParams.stdout = 1;
                    logParams.timestamps = logSettings["stdOutTimestamp"];
                    logParams.tail = logSettings["stdOutTailAll"] == true ? true : logSettings["stdOutTail"];
                    Docker.containerLogs(containerId, logParams, function (data, status, headers, config) {
                        $scope.stdOutLog = data;
                    });
                };

                $scope.switchShowStdOutTimestamp = function () {
                    logSettings["stdOutTimestamp"] = !logSettings["stdOutTimestamp"];
                    $scope.refreshStdOutLogs();
                };

                $scope.switchStdOutTailAll = function () {
                    logSettings["stdOutTailAll"] = !logSettings["stdOutTailAll"];
                    $scope.refreshStdOutLogs();
                };

                $scope.refreshStdErrLogs = function () {
                    logParams.stderr = 1;
                    logParams.stdout = 0;
                    logParams.timestamps = logSettings["stdErrTimestamp"];
                    logParams.tail = logSettings["stdErrTailAll"] == true ? true : logSettings["stdErrTail"];
                    Docker.containerLogs(containerId, logParams, function (data, status, headers, config) {
                        $scope.stdErrLog = data;
                    });
                };

                $scope.switchShowStdErrTimestamp = function () {
                    logSettings["stdErrTimestamp"] = !logSettings["stdErrTimestamp"];
                    $scope.refreshStdErrLogs();
                };

                $scope.switchStdErrTailAll = function () {
                    logSettings["stdErrTailAll"] = !logSettings["stdErrTailAll"];
                    $scope.refreshStdErrLogs();
                };
            };

            $scope.showProcesses = function (containerId) {
                $scope.activeTab = 'top';
                var containerProcesses = Docker.containers().top({containerId: containerId}, function () {
                    $scope.containerProcesses = containerProcesses;
                });
            };

            $scope.showDiff = function (containerId) {
                $scope.activeTab = 'diff';
                var containerDiffs = Docker.containers().diff({containerId: containerId}, function () {
                    updateDiffPagedList();
                });
                //
                var updateDiffPagedList = function () {
                    var diffPageSize = $scope.newDiffPageSize;
                    diffSettings["pageSize"] = diffPageSize;
                    diffSettings["maxPageIndex"] = Math.trunc(containerDiffs.length / diffPageSize) + 1;
                    diffSettings["pageIndex"] = Math.min(diffSettings["maxPageIndex"], diffSettings["pageIndex"]);
                    diffSettings["count"] = containerDiffs.length;
                    var subDiffs = [];
                    var startIndex = containerDiffs.length > 0 ? (diffSettings["pageIndex"] - 1) * diffPageSize + 1 : 0;
                    var endIndex = Math.min((diffSettings["pageIndex"]) * diffPageSize, containerDiffs.length);

                    diffSettings["startIndex"] = startIndex;
                    diffSettings["endIndex"] = endIndex;

                    for (var i = startIndex - 1; i < endIndex; i++) {
                        subDiffs.push(containerDiffs[i]);
                    }
                    $scope.containerDiffs = subDiffs;
                };
                $scope.changeDiffPaging = function () {
                    if ($scope.newDiffPageSize != diffSettings["pageSize"]) {
                        updateDiffPagedList();
                    }
                };
                $scope.firstDiffPage = function () {
                    diffSettings["pageIndex"] = 1;
                    updateDiffPagedList();
                };
                $scope.prevDiffPage = function () {
                    if (diffSettings["pageIndex"] > 1) {
                        diffSettings["pageIndex"]--;
                        updateDiffPagedList();
                    }
                };
                $scope.nextDiffPage = function () {
                    if (diffSettings["pageIndex"] < diffSettings["maxPageIndex"]) {
                        diffSettings["pageIndex"]++;
                        updateDiffPagedList();
                    }
                };
                $scope.lastDiffPage = function () {
                    diffSettings["pageIndex"] = diffSettings["maxPageIndex"];
                    updateDiffPagedList();
                }
            };


            $scope.showTty = function (containerId) {
                $scope.activeTab = 'tty';
                console.log(containerId);
            };


            $scope.showJson = function (containerId) {
                $scope.activeTab = 'json';
                console.log(containerId);
            };
        }
    }])
;