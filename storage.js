var _ = require('lodash');
var logbot = require('./logbot');
var async = require('async');
var db = require("redis").createClient(process.env.REDIS_URL);

db.on("error", function(err){
	if(process.env.PRODUCTION) logbot.warn("Redis Storage Error", "Falling back to temporary storage instance.");
	db.end();
	console.log('REDIS ERROR: Falling back to node in-memory storage');
});

var STORAGE = {};

module.exports = storage = {
	init : function(ready){
		db.keys('*', function (err, keys) {
			async.map(keys, function(key, cb){
				db.get(key, function(err, res){
					cb(err, [key, JSON.parse(res)]);
				});
			}, function(err, res){
				STORAGE = _.fromPairs(res);
				ready && ready();
			})
		})
	},
	get : function(key, cb){
		if(cb && db.connected){
			db.get(key, function(err, res){
				return cb(err, JSON.parse(res))
			})
		}
		return STORAGE[key];
	},
	set : function(key, val, cb){
		STORAGE[key] = val;
		return db.connected && db.set(key, JSON.stringify(val), cb);
	},
};