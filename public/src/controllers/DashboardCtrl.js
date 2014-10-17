module.exports = function(app) {
  return app.controller('DashboardCtrl', [
    '$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
      return $scope.state = $state;
    }
  ]);
};
