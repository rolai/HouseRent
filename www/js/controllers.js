angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $state, LocalStorage) {
  $scope.keyword = null;
  $scope.city = LocalStorage.get("city", "北京");
  $scope.cityList = ["北京", "上海", "广州", "深圳",  "成都",  "杭州", "武汉"];
  $scope.recentKeywords = LocalStorage.getRecentKeyword();

  $scope.search = function(keyword) {
    LocalStorage.set("city", $scope.city);
  	LocalStorage.addRecentKeyword(keyword);
  	$scope.recentKeywords = LocalStorage.getRecentKeyword();

  	$state.go('houses', {"city": $scope.city, "keyword": keyword});
  }
})

.controller('HousesCtrl', function($scope, $state, $stateParams, $http, $ionicPopup) {
	var server = "https://leancloud.cn/1.1/functions/query";
    var APP_ID = "hkidDS9UrfqHOp34mP9tl9aJ-gzGzoHsz";
    var APP_KEY =  "0ElmgE26TGMaSL7SipPgiTS7";
	$scope.houses  = [];
	$scope.keyword = $stateParams.keyword;
    $scope.city = $stateParams.city;
	$scope.page = 1;
	$scope.no_more_data = false;
	$scope.showInfoMessage = false;

	function requestHouseRentInfo (city, keyword, page) {
		$scope.showInfoMessage = false;
        var notifyError = false;
        $http({
          method: "post",
          url: server,
          headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'X-LC-Id': APP_ID,
              'X-LC-Key': APP_KEY,
              'X-LC-Prod': 1
          },
          data: {
            city: city,
            keyword: keyword,
            page: page - 1
          }
      }).success(function(response){
            $scope.$broadcast('scroll.infiniteScrollComplete');
            if(response.result && response.result.length > 0) {
                $scope.houses = $scope.houses.concat(response.result);
            } else {
                $scope.no_more_data = true;
                $scope.showInfoMessage = true;
            }
        }).error(function(response) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.no_more_data = true;
            $scope.showInfoMessage = true;
            if(!notifyError) {
                $ionicPopup.alert({
                  title: '网络连接失败',
                  template: '请检查网络连接后重试搜索租房信息'
                });
                notifyError = true;
            }
        });
	}

	$scope.openDetails = function (url) {
		var ref = window.open(url + '?entry=app', '_blank', 'location=no');
		ref.addEventListener("loadstart", IABcallback);

		function IABcallback(event){
    	    if( event.url.substr(event.url.search(/entry/, '')) === "entry=app"){
    	        // This is a lazy check for "entry" paramater, you should use a library or something
    	        console.log("already have entry=app query string");
    	    }else{
    	        // open a new window with the same URL but add ?entry=app
    	        ref = window.open(event.url+"?entry=app", "_blank", "location=no");
    	        // reattach this event listener since it is a new window
    	        ref.addEventListener("loadstart", IABcallback);
    	    }
		}
	}

	$scope.loadMore = function () {
		if (!$scope.no_more_data) {
			$scope.page += 1;
			requestHouseRentInfo($scope.city, $scope.keyword, $scope.page);
		}
	}

	$scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });

});
