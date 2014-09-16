module.exports = (app) ->
	app.controller 'statistics_plugin_AnalyticsCtrl', ['$scope', '$state', '$rootScope',
		($scope, $state, $rootScope) ->
			console.log "IN statistics_plugin_AnalyticsCtrl"
			
	]