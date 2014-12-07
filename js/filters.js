app.filter('kmh', function () {
    return function (ms) {
        if ( typeof ms == 'undefined' ) {
            return 0;
        }
        return ms / 1000 * 60 * 60;

    };
});

app.filter('mmss', function() {
    return function (sec) {
        if ( typeof sec == 'undefined' ) {
            return '00:00';
        }

        var minutes = Math.floor(sec / 60);
        var seconds = sec % 60;
        
        if ( seconds < 10 ) {
            seconds = '0' + seconds;
        }
        if ( minutes < 10 ) {
            minutes = '0' + minutes;
        }

        return minutes + ':' + seconds; 
    };
});

app.filter('km', function() {
    return function (km) {
        if ( typeof km == 'undefined' ) {
            return 0;
        }
        return km.toFixed(3);
    };
});

app.filter('m', function() {
    return function (km) {
        if ( typeof km == 'undefined' ) {
            return 0;
        }
        return ( km * 1000 ).toFixed(0);
    };
});

app.filter('date', function() {
    return function (timestamp) {
        //var months = ['яну','фев','мар','апр','май','юни','юли','авг','септ','окт','нов','дек'];
        var months = ['Януари','Февруари','Март','Април','Май','Юни','Юли',
            'Август','Септември','Октомври','Ноември','Декември'];
        var date = new Date(timestamp);
        return date.getDate() + ' ' + months[ date.getMonth() - 1];
    };
});

app.filter('kmPerHour', function(){
    return function(distanceInKM, timeInSeconds) {
        var timeInHours = timeInSeconds / 60 / 60;
        var kmPerHour = distanceInKM / timeInHours;
        return kmPerHour.toFixed(2);
    }
});