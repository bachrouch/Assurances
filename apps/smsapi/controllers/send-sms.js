angular.module('app')
  /*
    .run(function ($ionicPlatform) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })
  */
  .factory('API', function ($http) {
    var api = {};
    var baseURL = 'http://192.168.162.145:3000';
    api.sendMsg = function (to, text) {
      return $http.post(baseURL + '/sendmsg', {
        "to": to,
        "text": text
      });
    };
    return api;
  })
  .controller('SendSmsCtrl', function ($scope, API) {
    $scope.processing = false;
    $scope.sendMessage = function () {
      console.log("9**************************" + $scope.msgTo);
      $scope.processing = true;
      API.sendMsg($scope.msgTo, $scope.msgText)
        .then(function (data) {
          //console.log('wezza');
          if (data.status == 'success') {
            $scope.msgTo = '';
            $scope.msgText = '';
            console.log('success');
          }
          else {
            console.log('erroeee');
          }
          $scope.processing = false;
        });
    };
  });
/*
angular.module('msg')
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })
  
  .config(
    ['$routeProvider',
      function ($routeProvider) {
        $routeProvider.when('/savings/search', {
            templateUrl: '/msg/savings-policy-search',
            controller: 'SavingsPolicySearchCtrl'
          })
          .otherwise({
            redirectTo: '/index'
          });
      }
    ])

  .factory('API', function ($http) {
    var api = {};
    //var baseURL = 'http://5935c388.ngrok.com';
    api.sendMsg = function (to, text) {
      return $http.post(baseURL + '/sendmsg', {
        "to": to,
        "text": text
      });
    };
    return api;
  })
  .controller('AppCtrl', function ($scope, $ionicLoading, $ionicPopup, API) {
    $scope.processing = false;
    $scope.show = function (message) {
      $ionicLoading.show({
        template: message
      });
    };
    $scope.hide = function () {
      $ionicLoading.hide();
    };
    $scope.showAlert = function (msg) {
      $ionicPopup.alert({
        title: msg.title,
        template: msg.message,
        okText: 'Cool',
        okType: 'button-assertive'
      });
    };
    $scope.sendMessage = function () {
      $scope.processing = true;
      $scope.show('Sending Message...');
      API.sendMsg($scope.msgTo, $scope.msgText)
        .then(function (data) {
          if (data.data.status == 'success') {
            $scope.msgTo = '';
            $scope.msgText = '';
            $scope.showAlert({
              title: "Success",
              message: "Message sent successfully"
            });
          }
          else {
            $scope.showAlert({
              title: "Oops!!",
              message: "Oops something went wrong! Please try again later."
            });
          }
          $scope.hide();
          $scope.processing = false;
        });
    };
  });




























*/
