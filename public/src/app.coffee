

app = angular.module("oauthd_stats_plugin", ["ui.router"]).config(["$stateProvider", "$urlRouterProvider", "$locationProvider",
	($stateProvider, $urlRouterProvider, $locationProvider) ->
		
		$stateProvider.state 'dashboard',
			url: '/',
			templateUrl: '/oauthd/plugins/statistics/templates/dashboard.html'
			controller: 'statistics_plugin_DashboardCtrl'

		$urlRouterProvider.when "", "dashboard"

		$urlRouterProvider.otherwise "dashboard" 

		$locationProvider.html5Mode(true)
])

require('./filters/filters') app

require('./services/AnalyticsService') app

require('./controllers/DashboardCtrl') app
require('./controllers/AnalyticsCtrl') app

app.run(["$rootScope", "$state" 
	($rootScope, $state) ->
		console.log "APP.coffee oauthd plugin statistics_plugin_DashboardCtrl"
		console.log "$state", $state
])