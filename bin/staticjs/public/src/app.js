var app;

app = angular.module("oauthd_stats_plugin", ["ui.router"]).config([
  "$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('dashboard', {
      url: '/',
      templateUrl: '/oauthd/plugins/statistics/templates/dashboard.html',
      controller: 'DashboardCtrl'
    });
    $stateProvider.state('analytics', {
      url: '/',
      templateUrl: '/oauthd/plugins/statistics/templates/analytics.html',
      controller: 'AnalyticsCtrl'
    });
    $urlRouterProvider.when("", "dashboard");
    $urlRouterProvider.otherwise("dashboard");
    return $locationProvider.html5Mode(true);
  }
]);

require('./filters/filters')(app);

require('./services/AnalyticsService')(app);

require('./services/AppService')(app);

require('./controllers/DashboardCtrl')(app);

require('./controllers/AnalyticsCtrl')(app);

app.run([
  "$rootScope", "$state", function($rootScope, $state) {
    console.log("APP.coffee oauthd plugin statistics_plugin_DashboardCtrl");
    console.log("$state", $state);
    $rootScope.accessToken = JSON.parse(window.parent.localStorage.__amplify__loginData).data.token;
    console.log("$rootScope.accessToken", $rootScope.accessToken);
    return $rootScope.$watch('window.parent.localStorage.__amplify__loginData', function() {
      console.log("modify stats local storage login data");
      return $rootScope.accessToken = JSON.parse(window.parent.localStorage.__amplify__loginData).data.token;
    }, true);
  }
]);
