var app;

app = angular.module("oauthd_stats_plugin", ["ui.router"]).config([
  "$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider.state('dashboard', {
      url: '/dashboard',
      templateUrl: 'templates/dashboard.html',
      controller: 'DashboardCtrl'
    });
    $stateProvider.state('analytics', {
      url: '/analytics',
      templateUrl: 'templates/analytics.html',
      controller: 'AnalyticsCtrl'
    });
    $urlRouterProvider.when("", "analytics");
    return $urlRouterProvider.otherwise("analytics");
  }
]);

require('./filters/filters')(app);

require('./services/AnalyticsService')(app);

require('./services/AppService')(app);

require('./controllers/DashboardCtrl')(app);

require('./controllers/AnalyticsCtrl')(app);

app.run([
  "$rootScope", "$state", function($rootScope, $state) {
    $rootScope.accessToken = JSON.parse(window.parent.localStorage.__amplify__loginData).data.token;
    return $rootScope.$watch('window.parent.localStorage.__amplify__loginData', function() {
      return $rootScope.accessToken = JSON.parse(window.parent.localStorage.__amplify__loginData).data.token;
    }, true);
  }
]);
