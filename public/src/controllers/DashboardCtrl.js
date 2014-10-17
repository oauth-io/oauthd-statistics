module.exports = function(app) {
  return app.controller('DashboardCtrl', [
    '$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
      console.log("In dashboard ctrl STATS");
      return $scope.state = $state;
    }
  ]);
};
