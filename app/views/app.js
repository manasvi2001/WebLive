var webLiveApp = angular.module("webLive", []);

webLiveApp
	.constant("SERVER_CONFIG", {
    "url": "http://172.16.67.209:9000"
  })
	.controller('MainController', ['$scope', '$interval', '$http', 'SERVER_CONFIG', 'SettingsService',
	 	function($scope, $interval, $http, SERVER_CONFIG, SettingsService) {
		$scope.stockData = [];
		$scope.settingsView = false;
		$scope.openSettings = function() {
			console.log("Opens Setting");
			// $scope.settingsView = true;
			// $scope.selectedTopics = SettingsService.getNewsTopics();
			// var parameters = {
			// 	userId: $scope.userId,
			// 	topics: $scope.selectedTopics;
			// }
			// $http.get(SERVER_CONFIG.url + '/allNewsTopics', {params: parameters})
			// 	.success(function(data) {
			// 		var topics = data.topics;
			// 		var numberWidgetUsed = SettingsService.getNumberWidgetUsed()
			// 		if(numberWidgetUsed == 0) {
			// 			SettingsService.setNewsTopics(topics);
			// 		} else {

			// 		}
			// 		SettingsService.setNumberWidgetUsed(numberWidgetUsed+1);
			// 	});
		}
		$scope.goToHome = function() {
			console.log("Close Setting");
			$scope.settingsView = false;
		}
		var query = window.location.href;
		var userDetail = "";
		$scope.userId = "";
		query = query.split('%2C');
		for(var i=0;i<query.length;i++) {
			if(query[i].match(/userId/g)) {
				userDetail = query[i];
			}
		}
		userDetail = userDetail.split('%22')[3].split('%3A');
		$scope.userId = userDetail[0] + ":" + userDetail[1];
		var parameters = {
			userId: $scope.userId
		};
		$http.get(SERVER_CONFIG.url + '/stock', {params: parameters})
				.success(function(data) {
					console.log(JSON.stringify(data));
					$scope.stockData = data.stock;
				})
				.error(function(error) {
					console.log(JSON.stringify(error));
				})
		$interval(function() {
			var parameters = {
				userId: $scope.userId
			};
			$http.get(SERVER_CONFIG.url + '/stock', {params: parameters})
				.success(function(data) {
					console.log(JSON.stringify(data));
					$scope.stockData = data.stock;
				})
				.error(function(error) {
					console.log(JSON.stringify(error));
				})
		}, 600000);
		// $interval(function() {
		// 	var parameters = {
		// 		userId: $scope.userId
		// 	};
		// 	$http.get(SERVER_CONFIG.url + '/news', {params: parameters})
		// 		.success(function(data) {
		// 			$scope.stockData = data.stock;
		// 		})
		// 		.error(function(error) {

		// 		})
		// }, 60000);
	}])
	.service('SettingsService', [function() {
		var newsTopics = {};
		var numberWidgetUsed = 0;
		var settings={};
		settings.setNewsTopics = function(topics) {
			newsTopics = topics;
		};
		settings.getNewsTopics = function() {
			return newsTopics;
		};
		return settings;
	}]);