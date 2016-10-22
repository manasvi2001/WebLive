var webLiveApp = angular.module("webLive", []);

webLiveApp
	.controller('MainController', ['$scope', '$interval', function($scope, $interval) {
		$scope.myName = "Aman";
		$scope.settingsView = false;
		$scope.openSettings = function() {
			console.log("Opens Setting");
			$scope.settingsView = true;
		}
		$scope.goToHome = function() {
			console.log("Close Setting");
			$scope.settingsView = false;
		}
	}]);