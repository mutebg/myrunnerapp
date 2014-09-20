var app = angular.module('runner', ['ionic']);

app.run(function($ionicPlatform, DB) {
    $ionicPlatform.ready(function() {
        //hide splashcreen
        //navigator.splashscreen.hide();

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });

    DB.init();
})

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
              url: "/app",
              abstract: true,
              templateUrl: "templates/menu.html",
              controller: 'AppCtrl'
        })

        .state('app.start', {
            url: "/start",
            views: {
                'menuContent' :{
                    templateUrl: "templates/start.html",
                    controller: 'StartCtrl'
                }
            }
        })

        .state('app.history', {
            url: "/history",
            views: {
                'menuContent' :{
                    templateUrl: "templates/history.html",
                    controller: 'HistoryCtrl'
                }
            }
        })

        .state('app.historyview', {
            url: "/history/:workoutid",
            views: {
                'menuContent' :{
                    templateUrl: "templates/historyview.html",
                    controller: 'HistoryViewCtrl'
                }
            }
        })
    
        .state('app.profile', {
            url: "/profile",
            views: {
                'menuContent' :{
                    templateUrl: "templates/profile.html",
                    controller: 'ProfileCtrl'
                }
            }
        })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/start');
});