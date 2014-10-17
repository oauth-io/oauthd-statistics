
app = angular.module("oauthd_stats_plugin", ["ui.router"]).config(["$stateProvider", "$urlRouterProvider", "$locationProvider",
	($stateProvider, $urlRouterProvider, $locationProvider) ->

		$stateProvider.state 'dashboard',
			url: '/dashboard',
			templateUrl: 'templates/dashboard.html'
			controller: 'DashboardCtrl'

		$stateProvider.state 'analytics',
			url: '/analytics',
			templateUrl: 'templates/analytics.html'
			controller: 'AnalyticsCtrl'

		$urlRouterProvider.when "", "dashboard"
		$urlRouterProvider.otherwise "dashboard"

		# $locationProvider.html5Mode(true)
])

require('./filters/filters') app

require('./services/AnalyticsService') app
require('./services/AppService') app

require('./controllers/DashboardCtrl') app
require('./controllers/AnalyticsCtrl') app

app.run(["$rootScope", "$state",
	($rootScope, $state) ->
		$rootScope.accessToken = JSON.parse(window.parent.localStorage.__amplify__loginData).data.token
		$rootScope.$watch 'window.parent.localStorage.__amplify__loginData', () ->
			$rootScope.accessToken = JSON.parse(window.parent.localStorage.__amplify__loginData).data.token
		, true
])