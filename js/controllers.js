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
        console.log(track);
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

app.controller('HistoryViewCtrl', function($scope, $stateParams, $filter, Workouts, RunServ) {
    $scope.workout = {};
    Workouts.get(  $stateParams.workoutid ).then( function( workout ) {
        $scope.workout = workout;
        console.log(workout);
        $scope.workout.speed = $filter('kmPerHour')(workout.distance, workout.seconds);
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
        $scope.user.name = $scope.profile.name;
    }
});

app.controller('LogCtrl', function($scope, $http, Log) {
    $scope.search = {list:[], value:''};
    $scope.todayList = [];
    $scope.selected;
    $scope.data = {
        'energy': 0,
        'weight': 100,
        'name': false
    }

    $scope.searchProduct = function() {
        if ( $scope.search.value.length > 2 ) {
            var url = 'http://stoyandelev.com/projects/caloriesdb/search.php?callback=JSON_CALLBACK&q=' + $scope.search.value;
            $http.jsonp( url ).then( function(result){
                $scope.search.list = result.data;
            });
        }
    }

    $scope.show = function(product) {
        $scope.search.value = product.name;
        $scope.selected = product;
    }
    
    $scope.save = function() {
        
        var date = new Date();
        $scope.data.date = date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' +  date.getDate();
        $scope.data.name = $scope.selected.name;
        Log.add($scope.data);
        $scope.selected = null;
        $scope.search.value = null;
        $scope.search.list = [];
        $scope.data.weight = 100;
        $scope.getToday();
    }

    $scope.getToday = function() {
        var date = new Date();
        date  = date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' +  date.getDate();
        Log.getDay(  date ).then( function( list ) {
            $scope.todayList = list;
        });
    }

    $scope.delete = function(index) {
        Log.remove( $scope.todayList[index].id );
        $scope.todayList.splice(index, 1);
    }

    $scope.getTotal = function(){
        var total = 0;
        for( var i = 0; i < $scope.todayList.length; i++) {
            total += $scope.todayList[i].energy;
        }
        return total;
    }

    $scope.getToday();
});

app.controller('HelpCtrl', function($scope) {
});

app.controller('ForumCtrl', function($scope) {
});