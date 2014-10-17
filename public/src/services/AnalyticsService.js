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
          return api("/analytics?filters=" + opts.filters + "&appkeys=" + opts.appkeys + "&start=" + opts.start + "&end=" + opts.end + "&unit=" + opts.unit, success, error);
        }
      };
      return analytics_service;
    }
  ]);
};
