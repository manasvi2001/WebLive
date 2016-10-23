var webLiveApp = angular.module("webLive", []);

webLiveApp
	.constant("SERVER_CONFIG", {
    "url": "http://172.16.67.209:9000"
  })
	.controller('MainController', ['$scope', '$rootScope', '$interval', '$http', 'SERVER_CONFIG', 'SettingsService',
	 	function($scope, $rootScope, $interval, $http, SERVER_CONFIG, SettingsService) {
	 	$rootScope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };
    $scope.input = {
    	percentage: '0.5'
    };
		$scope.stockData = [];
		$scope.settingsView = false;
		$scope.editStock = false;
		$scope.setThreshold = function() {
			console.log("pressed enter");
			// set threshold
		}
		$scope.openSettings = function() {
			console.log("Opens Setting");
			$scope.settingsView = true;
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
			// 		SettingsService.setNumberWidgetUsed();
			// 	});
			// $http.get(SERVER_CONFIG.url + '/allStocks', {params: parameters})
			// 	.success(function(data) {
			// 		var topics = data.topics;
			// 		var numberWidgetUsed = SettingsService.getNumberWidgetUsed()
			// 		SettingsService.setNewsTopics(topics);
			// 		SettingsService.setNumberWidgetUsed();
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
					$rootScope.safeApply(function() {
						$scope.stockData = data.stocks;
					});
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
					$rootScope.safeApply(function() {
						$scope.stockData = data.stocks;
					});
				})
				.error(function(error) {
					console.log(JSON.stringify(error));
				})
		}, 60000);
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


            //TODO:getting list of all stocks
            $http.get(SERVER_CONFIG.url + '/stocklist')
                .success(function(data) {
                    console.log("list of stocks available are available->",JSON.stringify(data));
                    $rootScope.safeApply(function() {
                        $scope.availableStocks = data.result;
                    });
                })
                .error(function(error) {
                    console.log(JSON.stringify(error));
                })

            //TODO:adding a new stock to db
            $http.post(SERVER_CONFIG.url+'/addstock',{userId:$scope.userId,stockName:$scope.newStockName,stockExchange:"NASDAQ"})
                .success(function(data){
                    console.log("added stock successfully",data.lastPrice,data.percentChange);
                })
                .error(function(error){
                    console.log("failed adding stock",error);
                })
            //TODO:deleting a stock to db
            $http.post(SERVER_CONFIG.url+'/removestock',{userId:$scope.userId,stockName:$scope.oldStockName,stockExchange:$scope.oldStockExchange})
                .success(function(data){
                    console.log("remove stock successfully");
                })
                .error(function(error){
                    console.log("failed removing stock",error);
                })

	}])
	.controller('GraphController', ['$scope', function($scope) {
		// $scope.
	}])
	.service('SettingsService', [function() {
		var newsTopics = {};
		var numberWidgetUsed = 0;
		var stocks={'AAPL','GOOGL','IDEA'};
		settings.setNewsTopics = function(topics) {
			newsTopics = topics;
		};
		settings.getNewsTopics = function() {
			return newsTopics;
		};
		settings.setNumberWidgetUsed = function() {
			numberWidgetUsed += 1;
		};
		settings.getNumberWidgetUsed = function() {
			return numberWidgetUsed;
		};
		return settings;
	}])
	.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
	});