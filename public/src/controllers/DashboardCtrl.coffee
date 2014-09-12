async = require 'async'

module.exports = (app) ->
	app.controller 'DashboardCtrl', ['$scope', '$state', '$rootScope',
		($scope, $state, $rootScope) ->
			console.log "IN dashboard ctrl"
			
	]