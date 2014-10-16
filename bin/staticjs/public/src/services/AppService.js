var Q;

Q = require('q');

module.exports = function(app) {
  return app.factory('AppService', [
    '$rootScope', '$http', function($rootScope, $http) {
      var api;
      api = require('../utilities/apiCaller')($http, $rootScope);
      return {
        all: function() {
          var defer;
          defer = Q.defer();
          api('/apps', function(data) {
            return defer.resolve(data.data);
          }, function(e) {
            return defer.reject(e);
          });
          return defer.promise;
        },
        get: function(key) {
          var defer;
          defer = Q.defer();
          api('/apps/' + key, function(data) {
            console.log("AppService get data", data);
            return defer.resolve(data.data);
          }, function(e) {
            console.log("AppService get fail", e);
            return defer.reject(e);
          });
          return defer.promise;
        },
        create: function(app) {
          var defer;
          defer = Q.defer();
          api('/apps', function(data) {
            return defer.resolve(data.data);
          }, function(e) {
            return defer.reject(e);
          }, {
            method: 'POST',
            data: app
          });
          return defer.promise;
        },
        update: function(app) {
          var defer;
          defer = Q.defer();
          api('/apps/' + app.key, function(data) {
            return defer.resolve(data.data);
          }, function(e) {
            return defer.reject(e);
          }, {
            method: 'POST',
            data: app
          });
          return defer.promise;
        },
        getBackend: function(key) {
          var defer;
          defer = Q.defer();
          api('/apps/' + key + '/backend', function(data) {
            return defer.resolve(data.data);
          }, function(e) {
            return defer.reject(e);
          }, {
            method: 'GET'
          });
          return defer.promise;
        },
        setBackend: function(key, backend) {
          var defer;
          defer = Q.defer();
          if ((backend != null) && backend !== 'none') {
            api('/apps/' + key + '/backend/' + backend, function(data) {
              return defer.resolve(data.data);
            }, function(e) {
              return defer.reject(e);
            }, {
              method: 'POST'
            });
          } else {
            api('/apps/' + key + '/backend', function(data) {
              return defer.resolve(data.data);
            }, function(e) {
              return defer.reject(e);
            }, {
              method: 'DELETE'
            });
          }
          return defer.promise;
        },
        del: function(app) {
          var defer, key;
          defer = Q.defer();
          if (typeof app === 'object') {
            key = app.key;
          }
          if (typeof app === 'string') {
            key = app;
          }
          api('/apps/' + key, function(data) {
            return defer.resolve(data.data);
          }, function(e) {
            return defer.reject(e);
          }, {
            method: 'DELETE'
          });
          return defer.promise;
        },
        resetKeys: function(key) {
          var defer;
          defer = Q.defer();
          api('/apps/' + key + '/reset', function(data) {
            return defer.resolve(data.data);
          }, function(e) {
            return defer.reject(e);
          }, {
            method: 'POST'
          });
          return defer.promise;
        }
      };
    }
  ]);
};
