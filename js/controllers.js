app.controller('AppCtrl', function($scope, $location, Profile) {
    if ( ! Profile.has() ) {
        $location.path('/app/profile');
    }

    $scope.user = Profile.get();
});

app.controller('StartCtrl', function($scope, $interval, RunServ, Workouts) {
    $scope.state = 'start';
    $scope.workouts = RunServ.getTypes();
    $scope.workout = $scope.workouts[0].name;
    $scope.workoutTag = $scope.workouts[0].tag;
    $scope.pauseBtn = 'Пауза';
    $scope.timer = null;
    $scope.clearData = {time:0, distance:0, energy:0, speed: 0}
    $scope.data = $scope.clearData;
    $scope.currentCircle = 'time';

    $scope.start = function() {
        $scope.state = 'run';
        RunServ.start($scope.workoutTag);

        $scope.timer = $interval( function(){
            $scope.data = RunServ.getData();
        }, 1000);
    }

    $scope.stop = function() {
        $scope.state = 'finish';
        RunServ.stop();
        $interval.cancel( $scope.timer );
        //$scope.data = $scope.clearData;
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
        $scope.data = $scope.clearData;
        var track = RunServ.getTrack();
        Workouts.add(track);
        $scope.state = 'start';
    }

    $scope.changeSport = function(index) {
        $scope.workout = $scope.workouts[index].name;
        $scope.workoutTag = $scope.workouts[index].tag;
    }
});

app.controller('HistoryCtrl', function( $scope, Workouts ) {
    $scope.list = [];
    Workouts.all().then( function( list ) {
        $scope.list = list;
    });

    $scope.delete = function(index) {
        Workouts.remove( $scope.list[index].id );
        $scope.list.splice(index, 1);
    }
})

app.controller('HistoryViewCtrl', function($scope, $stateParams, Workouts, RunServ) {
    $scope.workout = {};
    Workouts.get(  $stateParams.workoutid ).then( function( workout ) {
        $scope.workout = workout;
        $scope.workout.type_name = RunServ.getType(workout.type).name;
        /*var track = JSON.parse( workout.track );
        angular.forEach(track, function(value, key) {

        });*/
    });
})

app.controller('ProfileCtrl', function($scope, Profile) {
    $scope.profile = Profile.get();

    $scope.save = function() {
        Profile.update( $scope.profile );
    }
});