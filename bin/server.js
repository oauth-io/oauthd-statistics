var Url, async, fs, restify;

restify = require('restify');

fs = require('fs');

Url = require('url');

async = require('async');

module.exports = function(env) {
  ({
    setup: function(callback) {
      var sendStats;
      env.server.get(/^(\/oauthd\/plugins\/statistics(\/.*)?)/, function(req, res, next) {
        var _base;
        if ((_base = req.params)[1] == null) {
          _base[1] = "";
        }
        req.url = req.params[1];
        req._url = Url.parse(req.url);
        req._path = req._url.pathname;
        return fs.stat(__dirname + '/public' + req.params[1], function(err, stat) {
          if (stat != null ? stat.isFile() : void 0) {
            next();
          } else {
            return fs.readFile(__dirname + '/public/index.html', {
              encoding: 'UTF-8'
            }, function(err, data) {
              res.setHeader('Content-Type', 'text/html');
              res.send(200, data);
            });
          }
        });
      }, restify.serveStatic({
        directory: __dirname + '/public',
        "default": __dirname + '/public/index.html'
      }));
      env.data.timelines = require('./db_timelines');
      env.events.on('connect.callback', (function(_this) {
        return function(data) {
          env.data.timelines.addUse({
            target: 'co:a:' + data.key + ':' + data.status
          }, (function() {}));
          env.data.timelines.addUse({
            target: 'co:p:' + data.provider + ':' + data.status
          }, (function() {}));
          return env.data.timelines.addUse({
            target: 'co:a:' + data.key + ':p:' + data.provider + ':' + data.status
          }, (function() {}));
        };
      })(this));
      env.events.on('connect.auth', (function(_this) {
        return function(data) {
          env.data.timelines.addUse({
            target: 'co:p:' + data.provider
          }, (function() {}));
          env.data.timelines.addUse({
            target: 'co:a:' + data.key + ':p:' + data.provider
          }, (function() {}));
          return env.data.timelines.addUse({
            target: 'co:a:' + data.key
          }, (function() {}));
        };
      })(this));
      sendStats = env.utilities.check({
        target: 'string',
        unit: ['string', 'none'],
        start: 'int',
        end: ['int', 'none']
      }, (function(_this) {
        return function(data, callback) {
          var err, now;
          now = Math.floor((new Date).getTime() / 1000);
          if (data.unit == null) {
            data.unit = 'd';
          }
          if (data.end == null) {
            data.end = now;
          }
          err = new env.utilities.check.Error;
          if (data.unit !== 'm' && data.unit !== 'd' && data.unit !== 'h') {
            err.error('unit', 'invalid unit type');
          }
          if (data.end > now + 12 * 31 * 24 * 3600 * 24) {
            err.error('end', 'invalid format');
          }
          if (err.failed()) {
            return callback(err);
          }
          if (data.unit === 'm' && data.end - data.start > 50 * 31 * 24 * 3600 || data.unit === 'd' && data.end - data.start > 50 * 24 * 3600 || data.unit === 'h' && data.end - data.start > 50 * 3600) {
            return callback(new env.utilities.check.Error('Too large date range'));
          }
          return async.parallel([
            function(cb) {
              return env.data.timelines.getTimeline(data.target, data, cb);
            }, function(cb) {
              return env.data.timelines.getTimeline(data.target + ':success', data, cb);
            }, function(cb) {
              return env.data.timelines.getTimeline(data.target + ':error', data, cb);
            }
          ], function(e, r) {
            var k, res, v, _ref;
            if (e) {
              return callback(e);
            }
            res = {
              labels: Object.keys(r[0]),
              ask: [],
              success: [],
              fail: []
            };
            _ref = r[0];
            for (k in _ref) {
              v = _ref[k];
              res.ask.push(v);
              res.success.push(r[1][k]);
              res.fail.push(r[2][k]);
            }
            return callback(null, res);
          });
        };
      })(this));
      env.server.get(env.config.base_api + '/apps/:key/stats', env.middlewares.auth.needed, (function(_this) {
        return function(req, res, next) {
          req.params.target = 'co:a:' + req.params.key;
          return sendStats(req.params, env.server.send(res, next));
        };
      })(this));
      env.server.get(env.config.base_api + '/apps/:key/keysets/:provider/stats', env.middlewares.auth.needed, (function(_this) {
        return function(req, res, next) {
          req.params.target = 'co:a:' + req.params.key + ':p:' + req.params.provider;
          return sendStats(req.params, env.server.send(res, next));
        };
      })(this));
      env.server.get(env.config.base_api + '/providers/:provider/stats', env.middlewares.auth.needed, (function(_this) {
        return function(req, res, next) {
          req.params.target = 'co:p:' + req.params.provider;
          return sendStats(req.params, env.server.send(res, next));
        };
      })(this));
      return env.server.get(env.config.base_api + '/analytics', env.middlewares.auth.needed, (function(_this) {
        return function(req, res, next) {
          var filter, tasksTime, tasksTotal, _fn, _i, _len, _ref;
          req.filters = req.params.filters.split(",");
          req.appkeys = req.params.appkeys.split(",");
          tasksTime = [];
          tasksTotal = [];
          _ref = req.filters;
          _fn = function(filter) {
            filter = filter.replace(":allapps:", ":a:");
            tasksTime.push(function(cb) {
              return env.data.timelines.getTimeline(filter, req.params, cb);
            });
            return tasksTotal.push(function(cb) {
              return env.data.timelines.getTotal(filter, cb);
            });
          };
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            filter = _ref[_i];
            _fn(filter);
          }
          return async.series(tasksTime, function(errTime, resTime) {
            if (errTime) {
              return next(errTime);
            }
            return async.series(tasksTotal, function(errTotal, resTotal) {
              if (errTotal) {
                return next(errTotal);
              }
              res.send({
                totals: resTotal,
                timelines: resTime,
                params: req.params
              });
              return next();
            });
          });
        };
      })(this));
    }
  });
  return callback();
};
