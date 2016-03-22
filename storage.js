var Sync = require('syncho');
var logbot = require('./logbot');
var db = require("redis").createClient(process.env.REDIS_URL);

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
		return db.set(key, JSON.stringify(val), function(err, res){
			return cb(res);
		});
	},
};


//Fallback storage
var TEMP_STORAGE = {}
var fallback = {
	get : function(key){
		return TEMP_STORAGE[key];
	},
	set : function(key, val){
		TEMP_STORAGE[key] = val;
	},
	getAsync : function(key, cb){
		return cb(TEMP_STORAGE[key]);
	},
	setAsync : function(key, val, cb){
		TEMP_STORAGE[key] = val;
		return cb();
	},
};



//Check for local fallback
db.on("error", function(err){
	if(process.env.PRODUCTION) logbot.warn("Redis Storage Error", "Falling back to temporary storage instance.");
	db.end();
	console.log('REDIS ERROR: Falling back to node in-memory storage');

	storage.get = fallback.get;
	storage.set = fallback.set;
	storage.getAsync = fallback.getAsync;
	storage.setAsync = fallback.setAsync;
});


module.exports = storage;