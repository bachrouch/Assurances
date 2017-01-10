angular.module('app')
  .controller('MenuCtrl', ['$scope', function ($scope) {
    $scope.status = {
      isopen: false
    };
  }]);
