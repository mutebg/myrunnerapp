app
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('StartCtrl', function($scope, $interval, RunServ) {
    $scope.state = 'start';
    $scope.workouts = [
    {tag:'run', name:'бягане'}, 
    {tag:'bike', name:'колоездене'},
    {tag:'walk', name:'ходене'}];
    $scope.workout = $scope.workouts[0].name;
    $scope.pauseBtn = 'Пауза';
    $scope.timer = null;
    $scope.clearData = {time:0, distance:0, energy:0, speed: 0}
    $scope.data = $scope.clearData;
    $scope.currentCircle = 'time';

    $scope.start = function() {
        $scope.state = 'run';
        RunServ.start();

        $scope.timer = $interval( function(){
            $scope.data = RunServ.getData();
            //console.log('running interval in ctrl');
        }, 1000);

    }

    $scope.stop = function() {
        $scope.state = 'finish';
        RunServ.stop();
        var track = RunServ.getTrack();
        $interval.cancel( $scope.timer );
        $scope.data = $scope.clearData;
    }

    $scope.pause = function() {
        var status = RunServ.pause();
        if ( status ) {
            $scope.pauseBtn = 'Пауза';
        } else {
            $scope.pauseBtn = 'Продължи';        
        }
    }

    $scope.save = function() {
        $scope.state = 'start';
    }

    $scope.changeSport = function(index) {
        $scope.workout = $scope.workouts[index].name;
    }

    //$scope.start();
})

.controller('HistoryCtrl', function($scope) {

})

.controller('HistoryViewCtrl', function($scope, $stateParams) {

})

.controller('ProfileCtrl', function($scope) {

})