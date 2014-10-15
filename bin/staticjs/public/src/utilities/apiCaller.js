module.exports = function($http, $rootScope) {
  return function(url, success, error, opts) {
    var req;
    if (opts == null) {
      opts = {};
    }
    opts.url = process.env.host + "/api" + url;
    if (opts.data) {
      opts.data = JSON.stringify(opts.data);
      if (opts.method == null) {
        opts.method = "POST";
      }
    }
    opts.method = opts.method || "GET";
    if (opts.headers == null) {
      opts.headers = {};
    }
    if ($rootScope.accessToken) {
      opts.headers.Authorization = "Bearer " + $rootScope.accessToken;
    }
    if (opts.method === "POST" || opts.method === "PUT") {
      opts.headers['Content-Type'] = 'application/json';
    }
    req = $http(opts);
    if (success) {
      req.success(success);
    }
    if (error) {
      return req.error(error);
    }
  };
};
