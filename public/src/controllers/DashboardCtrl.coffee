module.exports = (app) ->
	app.controller('DashboardCtrl', ['$scope', '$state', '$rootScope',
		($scope, $state, $rootScope) ->
			$scope.state = $state
	])