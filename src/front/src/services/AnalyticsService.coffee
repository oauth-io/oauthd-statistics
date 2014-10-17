Q = require('q')

module.exports = (app) ->
	app.factory('AnalyticsService', ['$http', '$rootScope', '$location', 
		($http, $rootScope, $location) ->
			# api = apiRequest $http, $rootScope
			api = require('../utilities/apiCaller') $http, $rootScope
			analytics_service =
				getGraphData: (opts, success, error) ->
					# console.log "AnalyticsService getGraphData opts", opts
					opts.unit ?= 'h'
					opts.start ?= new Date() - 24*3600*1000
					opts.end ?= (new Date).getTime()
					# api "analytics?filters=#{opts.filters}&appkeys=#{opts.appkeys}&start=#{opts.start}&end=#{opts.end}&unit=#{opts.unit}", success, error
					defer = Q.defer()
					api "/analytics?filters=#{opts.filters}&appkeys=#{opts.appkeys}&start=#{opts.start}&end=#{opts.end}&unit=#{opts.unit}", success, error
					# api "/analytics?filters=#{opts.filters}&appkeys=#{opts.appkeys}&start=#{opts.start}&end=#{opts.end}&unit=#{opts.unit}", (data) ->
					# 	console.log "AnalyticsService getGraphData data", data
					# 	defer.resolve(data.data)
					# 	return 
					# , (e) ->
					# 	console.log "AnalyticsService getGraphData e", e
					# 	defer.reject(e)
					# 	return 
					# return defer.promise

			analytics_service
	])
