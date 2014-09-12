async = require 'async'

module.exports = (app) ->
	app.controller 'AnalyticsCtrl', ['$scope', '$state', '$rootScope',
		($scope, $state, $rootScope) ->
			console.log "IN analytics ctrl"
			
	]