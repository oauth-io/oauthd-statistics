

app = angular.module("oauthd_stats_plugin", ["ui.router"]).config(["$stateProvider", "$urlRouterProvider", "$locationProvider",
	($stateProvider, $urlRouterProvider, $locationProvider) ->
		
		$stateProvider.state 'dashboard',
			url: '/',
			templateUrl: '/templates/dashboard.html'
			controller: 'DashboardCtrl'

		$urlRouterProvider.when "", "/dashboard"

		$urlRouterProvider.otherwise '/dashboard' 

		$locationProvider.html5Mode(true)
])

require('./filters/filters') app

require('./services/AnalyticsService') app

require('./controllers/DashboardCtrl') app

app.run(["$rootScope", 
	($rootScope) ->
		console.log "APP.coffee oauthd plugin"
		
])