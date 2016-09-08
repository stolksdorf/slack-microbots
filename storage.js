var _ = require('lodash');
var logbot = require('./logbot');
var async = require('async');
var db = require("redis").createClient(process.env.REDIS_URL);

db.on("error", function(err){
	if(process.env.PRODUCTION) logbot.warn("Redis Storage Error", "Falling back to temporary storage instance.");
	db.end();
	console.log('REDIS ERROR: Falling back to node in-memory storage');
});

const attemptParse = (json) => {
	try{
		return JSON.parse(json);
	}catch(e){
		return json;
	}
}

var STORAGE = {};

module.exports = storage = {
	init : function(ready){
		db.keys('*', function (err, keys) {
			async.map(keys, function(key, cb){
				db.get(key, function(err, res){
					cb(err, [key, attemptParse(res)]);
				});
			}, function(err, res){
				STORAGE = _.fromPairs(res);
				ready && ready();
			})
		})
	},
	create : function(prefix){
		return {
			get : function(key, cb){
				if(cb && db.connected){
					db.get(`${prefix}|${key}`, function(err, res){
						return cb(err, attemptParse(res))
					})
				}
				return STORAGE[`${prefix}|${key}`];
			},
			set : function(key, val, cb=()=>{}){
				STORAGE[`${prefix}|${key}`] = val;
				return db.connected && db.set(`${prefix}|${key}`, JSON.stringify(val), cb);
			},
		}
	}

};