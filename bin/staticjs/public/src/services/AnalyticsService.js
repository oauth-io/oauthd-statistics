var Q;

Q = require('q');

module.exports = function(app) {
  return app.factory('AnalyticsService', [
    '$http', '$rootScope', '$location', function($http, $rootScope, $location) {
      var analytics_service, api;
      api = require('../utilities/apiCaller')($http, $rootScope);
      analytics_service = {
        getGraphData: function(opts, success, error) {
          var defer;
          console.log("AnalyticsService getGraphData opts", opts);
          if (opts.unit == null) {
            opts.unit = 'h';
          }
          if (opts.start == null) {
            opts.start = new Date() - 24 * 3600 * 1000;
          }
          if (opts.end == null) {
            opts.end = (new Date).getTime();
          }
          defer = Q.defer();
          api("analytics?filters=" + opts.filters + "&appkeys=" + opts.appkeys + "&start=" + opts.start + "&end=" + opts.end + "&unit=" + opts.unit, function(data) {
            defer.resolve(data.data);
          }, function(e) {
            defer.reject(e);
          });
          return defer.promise;
        }
      };
      return analytics_service;
    }
  ]);
};
