app.filter('kmh', function () {
        return function (ms) {
            if ( typeof ms == 'undefined' ) {
                return 0;
            }
            return ms / 1000 * 60 * 60;

        };
    })
    .filter('mmss', function() {
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
    })
    .filter('km', function() {
         return function (km) {
            if ( typeof km == 'undefined' ) {
                return 0;
            }
            return km.toFixed(3);
        };
    })
    .filter('m', function() {
         return function (km) {
            if ( typeof km == 'undefined' ) {
                return 0;
            }
            return ( km * 1000 ).toFixed(0);
        };
    })