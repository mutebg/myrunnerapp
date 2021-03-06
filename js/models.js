app.factory('RunServ', function ($interval, Profile) {
	var self = {};
	self.watchID = null;
	self.running = false;
	self.timer;
	self.temp;
	self.data = {};
    self.bodyweight;
	self.resetData = {
		'start_at': null,
		'end_at': null,
		'speed': 0,
		'seconds': 0,
		'km': 0,
		'sport': '',
		'energy': 0,
		'track': []
	}

    var types = [
        {tag:'run', name:'бягане'}, 
        {tag:'bike', name:'колоездене'},
        {tag:'walk', name:'ходене'}
    ];

	self.reset = function() {
		navigator.geolocation.clearWatch( self.watchID );	
		$interval.cancel( self.timer );
		self.temp = null;
		self.watchID = null;
		self.timer = null;
		self.running = false;
		self.data = self.resetData;
	}

	self.start = function(sport){
		self.reset();
		self.running = true;
        self.bodyweight =  Profile.get()['weight'];
        self.data.sport = sport;
		self.data.seconds = 0;
		self.data.start_at = new Date().getTime();
		self.timer = $interval( function(){
			if ( self.running ) {
				self.data.seconds = self.data.seconds + 1;
			}
		}, 1000);

		self.watchID = navigator.geolocation.watchPosition( 
            function(position) {
                var data = {
                    'lat': 		position.coords.latitude,
                    'lng': 		position.coords.longitude,
                    'speed':  	position.coords.speed,
                    'time': 	position.timestamp
                }

                if ( self.running ) {
                    if ( self.temp ) {
                    	var km = self
                			.getDistanceFromLatLonInKm(self.temp.lat, self.temp.lng, data.lat, data.lng);
                		self.data.km += km;
                	}	

                	self.data.speed = data.speed;
                    self.data.track.push(data);
                    self.temp = data;
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

	self.pause = function() {
		self.running = ! self.running;
		return self.running;
	}

	self.stop = function(){
		navigator.geolocation.clearWatch( self.watchID );
		self.running = false;
		self.data.end_at = new Date().getTime();
		$interval.cancel( self.timer );
	}

	self.getTrack = function() {
        self.data.energy = calculateEnergy(self.bodyweight, self.data.km, (self.data.seconds / 60), 0 );
		return self.data;
	}

	self.getData = function() {
		var lastData = self.data;
		return {
			'speed': lastData.speed,
			'distance': lastData.km,
			'time': lastData.seconds,
			'energy': calculateEnergy(self.bodyweight, lastData.km, (lastData.seconds / 60), 0 )
		}
	}

	self.getDistanceFromLatLonInKm = function(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = self.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = self.deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(self.deg2rad(lat1)) * Math.cos(self.deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}

	self.deg2rad = function(deg) {
	  return deg * (Math.PI/180)
	}


    self.getTypes = function() {
        return types;
    }

    self.getType = function(search) {
        for( var i = 0; i <= types.length; i++ ) {
            if ( search == types[i].tag ) {
                return types[i];
            }
        }
    }

	return self;
});

app.factory('DB', function ($q) {
    var self = this;
    self.db = null;
 	self.tables = [
      	{
            name: 'workouts',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'type', type: 'text'},
                {name: 'added', type: 'integer'},
                {name: 'seconds', type: 'integer'},
                {name: 'track', type: 'text'},
                {name: 'distance', type: 'integer'},
                {name: 'energy', type: 'integer'},
                {name: 'sync', type: 'integer'}
            ]
        },
        {
            name: 'log',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'name', type: 'text'},
                {name: 'weight', type: 'integer'},
                {name: 'energy', type: 'integer'},
                {name: 'added', type: 'varchar(10)'},
            ]
        }
    ]

    self.init = function() {
        self.db = window.openDatabase('myrunner', '1.1', 'database', -1);
 		angular.forEach(self.tables, function(table) {
            var columns = [];
 			
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
 
            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log('Table ' + table.name + ' initialized');
        });
    };
 
    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
       	self.db.transaction(function(transaction) {
       		transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
            	console.log(error);
     			deferred.reject(error);
            });
        });
 
        return deferred.promise;
    };
 
    self.fetchAll = function(result) {
        var output = [];
 
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        
        return output;
    };
 
    self.fetch = function(result) {
        return result.rows.item(0);
    };
 
    return self;
});

app.factory('Workouts', function (DB) {
	var self = this;
	self.all = function() {
		return DB.query('SELECT * FROM workouts ORDER BY id DESC')
        .then( function( result ){
            return DB.fetchAll( result );
        });
    };

    self.get = function(id) {
        return DB.query('SELECT * FROM workouts WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.remove = function(id) {
    	DB.query('DELETE FROM workouts WHERE id = ?',[id])
    }

    self.add = function(data) {
    	var params = [data.sport, data.end_at, data.seconds, 
    		JSON.stringify(data.track), data.km, data.energy];
    	var sql = 'INSERT INTO workouts (type, added, seconds, track, distance, energy) ' + 
    		'VALUES (?, ?, ?, ?, ?, ?)';
    	DB.query(sql, params);
    }

    return self;
});

app.factory('Log', function (DB) {
    var self = this;

    self.add = function(data) {
        var params = [data.name, data.energy, data.weight, data.date];
        var sql = 'INSERT INTO log (name, energy, weight, added) ' + 
            'VALUES (?, ?, ?, ?)';
        DB.query(sql, params);
    }

    self.getDay = function(day) {
        return DB.query('SELECT * FROM log WHERE added = ?', [day])
        .then(function(result){
            return DB.fetchAll( result );
        });
    }

    self.remove = function(id) {
        DB.query('DELETE FROM log WHERE id = ?',[id])
    }

    return self;
});

app.factory('Profile', function(){
    var self = this;

    self.get = function() {
        var data = localStorage.getItem('profile');
        var profile = JSON.parse(data);
        if ( profile == null ) {
            profile = {name: '', sex: 'm', weight: 0, height: 0, years: 0};
        }
        return profile;
    }

    self.update = function(data) {
        localStorage.setItem('profile', JSON.stringify(data));
    }

    self.has = function() {
        return localStorage.getItem('profile') ? true : false;
    }

    return self;
});

function calculateEnergy(weight, distance, time,  grade) {
    if ( !weight || !distance || !time ) {
        return 0;
    }

    distance = kmToMi(distance);
    weight = kgToLbs(weight);
    var speed = distance / time * 60;
    var speedmpm = 60 / speed;
    
    if (speed < 4) {
        var mets = (((((weight / 2.2) * time * (3.5 + (1.8 * grade * .01 * (speed * 26.8)) + ((speed * 26.8) * .1))) + (3.5 * (weight / 2.2))) / 3.5) / (weight / 2.2)) / time;
        var totalcalories = ((((weight / 2.2) * time * (3.5 + (1.8 * grade * .01 * (speed * 26.8)) + ((speed * 26.8) * .1))) + (3.5 * (weight / 2.2))) / 1000) * 5;
    } else {
        var mets = (((((weight / 2.2) * time * (3.5 + (.9 * grade * .01 * (speed * 26.8)) + ((speed * 26.8) * .2))) + (3.5 * (weight / 2.2))) / 3.5) / (weight / 2.2)) / time;
        var totalcalories = ((((weight / 2.2) * time * (3.5 + (.9 * grade * .01 * (speed * 26.8)) + ((speed * 26.8) * .2))) + (3.5 * (weight / 2.2))) / 1000 ) * 5;
    }
        
    return totalcalories.toFixed(0);
}

function kgToLbs(kg) {
    return kg * 2.20462;
}

function kmToMi(km){
    return km * 0.621371;
}
