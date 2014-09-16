module.exports = (app) ->
	app.controller('statistics_plugin_DashboardCtrl', ['$scope', '$state', '$rootScope',
		($scope, $state, $rootScope) ->
			console.log "IN statistics_plugin_DashboardCtrl"
			$scope.state = $state
	
	])