angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $state, LocalStorage) {
  $scope.keyword = null;
  $scope.city = LocalStorage.get("city", "北京");
  $scope.cityList = ["北京", "上海", "广州"];
  $scope.recentKeywords = LocalStorage.getRecentKeyword();

  $scope.search = function(keyword) {
    LocalStorage.set("city", $scope.city);
  	LocalStorage.addRecentKeyword(keyword);
  	$scope.recentKeywords = LocalStorage.getRecentKeyword();

  	$state.go('houses', {"city": $scope.city, "keyword": keyword});
  }
})

.controller('HousesCtrl', function($scope, $state, $stateParams, $http, $ionicPopup) {
	var server = "http://alfredduck.com:8000/search/condition";
	$scope.houses  = [];
	$scope.keyword = $stateParams.keyword;
  $scope.city = $stateParams.city;
	$scope.page = 1;
	$scope.no_more_data = false;
	$scope.showInfoMessage = false;

	function requestHouseRentInfo (city, keyword, page) {
		$scope.showInfoMessage = false;
    $http({
      method: "post",
      url: server,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: {
        city: city,
        keyword: keyword,
        room_size: '',
        room_number: '',
        rent_way: '',
        page: page
      }
    }).success(function(result){
    	$scope.$broadcast('scroll.infiniteScrollComplete');
    	if(result.empty != 'yes') {
      	$scope.houses = $scope.houses.concat(result.content);
      } else {
      	$scope.no_more_data = true;
      	$scope.showInfoMessage = true;
      }
    }).error(function(response) {
    	$scope.$broadcast('scroll.infiniteScrollComplete');
    	$ionicPopup.alert({
	      title: '网络连接失败',
	      template: '请检查网络连接后重试搜索租房信息'
    	});
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
