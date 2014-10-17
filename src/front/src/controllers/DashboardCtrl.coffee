module.exports = (app) ->
	app.controller('DashboardCtrl', ['$scope', '$state', '$rootScope',
		($scope, $state, $rootScope) ->
			console.log "In dashboard ctrl STATS"
			$scope.state = $state
	])