var Sync = require('syncho');
var logbot = require('./logbot');
var db = require("redis").createClient(process.env.REDIS_URL);

//console.log('REDIS', client.get.sync);

var TEMP_STORAGE = {}

var storage = {
	get : function(key){
		return JSON.parse(db.get.sync(key) || 'null');
	},
	set : function(key, val){
		return db.set.sync(key, JSON.stringify(val))
	},
	getAsync : function(key, cb){
		return db.get(key, function(err, res){
			if(err || !res) return cb();
			cb(JSON.parse(res || 'null'));
		})
	},
	setAsync : function(key, val, cb){
		return db.set(key, JSON.stringify(val), functioN(err, res){
			return cb(res);
		});
	},
};


//Check for local fallback
db.on("error", function(err){
	if(process.env.PRODUCTION) logbot.warn("Redis Storage Error", "Falling back to temporary storage instance.");
	db.end();

	console.log('REDIS ERROR: Falling back to node in-memory storage');

	//Fallback storage
	db = {
		get : function(key, cb){
			cb && cb(null, TEMP_STORAGE[key]);
		},
		set : function(key, val, cb){
			TEMP_STORAGE[key] = val;
			cb && cb();
		}
	}
});



module.exports = storage;