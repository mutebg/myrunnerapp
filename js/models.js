var RunnerFactory = function ($interval) {
	var factory = {};
	factory.watchID = null;
	factory.running = false;
	factory.timer;
	factory.temp;
	factory.data = {};
	factory.resetData = {
		'start_at': null,
		'end_at': null,
		'speed': 0,
		'seconds': 0,
		'km': 0,
		'track': []
	}

	factory.reset = function() {
		navigator.geolocation.clearWatch( factory.watchID );	
		$interval.cancel( factory.timer );
		factory.temp = null;
		factory.watchID = null;
		factory.timer = null;
		factory.running = false;
		factory.data = factory.resetData;
	}

	factory.start = function(){
		factory.reset();

		factory.data.seconds = 0;

		factory.running = true;
		factory.data.start_at = new Date().getTime();
		factory.timer = $interval( function(){
			if ( factory.running ) {
				factory.data.seconds = factory.data.seconds + 1;
			}
		}, 1000);

		factory.watchID = navigator.geolocation.watchPosition( 
            function(position) {
                var data = {
                    'lat': 		position.coords.latitude,
                    'lng': 		position.coords.longitude,
                    'speed':  	position.coords.speed,
                    'time': 	position.timestamp
                }

                if ( factory.running ) {
                    if ( factory.temp ) {
                    	var km = factory
                			.getDistanceFromLatLonInKm(factory.temp.lat, factory.temp.lng, data.lat, data.lng);
                		factory.data.km += km;
                	}	

                	factory.data.speed = data.speed;
                    factory.data.track.push(data);
                    factory.temp = data;
                }
            }, 
            function(error) {
                alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
            },{ 
                maximumAge: 3000, 
                timeout: 30000, 
                enableHighAccuracy: true
            });
	}

	factory.pause = function() {
		factory.running = ! factory.running;
		return factory.running;
	}

	factory.stop = function(){
		navigator.geolocation.clearWatch( factory.watchID );
		factory.running = false;
		factory.data.end_at = new Date().getTime();
		$interval.cancel( factory.timer );
	}

	factory.getTrack = function() {
		return factory.data;
	}

	factory.getData = function() {
		var lastData = factory.data;
		return {
			'speed': lastData.speed,
			'distance': lastData.km,
			'time': lastData.seconds,
			'energy': 123//energy
		}
	}

	factory.getDistanceFromLatLonInKm = function(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = factory.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = factory.deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(factory.deg2rad(lat1)) * Math.cos(factory.deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}

	factory.deg2rad = function(deg) {
	  return deg * (Math.PI/180)
	}

	return factory;	
};	

app.factory('RunServ', ['$interval', RunnerFactory]);