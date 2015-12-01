app.factory('LocalStorage', function($window) {

  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    remove: function(key) {
      return $window.localStorage.removeItem(key);
    },
    removeAll: function() {
      return $window.localStorage.clear();
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    getRecentKeyword: function() {
      return JSON.parse($window.localStorage['_recent_keywords'] || '["中关村", "北土城", "西直门", "CBD", "金融街"]');
    },
    addRecentKeyword: function (keyword) {
      var keywords = JSON.parse($window.localStorage['_recent_keywords'] || '["中关村", "北土城", "西直门", "CBD", "金融街"]');
      // remove the keyword if exists
      var i = keywords.indexOf(keyword);
      if( i >=0 ){
        keywords.splice(i, 1);
      }
      keywords.unshift(keyword);
      keywords = keywords.slice(0, 10);
      window.localStorage['_recent_keywords'] = JSON.stringify(keywords);
    }

  }
})