module.exports = function(app) {
  return app.controller('DashboardCtrl', [
    '$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
      console.log("IN statistics_plugin_DashboardCtrl");
      return $scope.state = $state;
    }
  ]);
};
