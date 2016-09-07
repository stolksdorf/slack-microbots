var _ = require('lodash');
var request = require('superagent');

var diagnosticsURL = '';

var logbot = function(val, title='', color='good'){
	console.log(val);
	if(!diagnosticsURL) return;
	request.post(diagnosticsURL)
		.send({
			username : 'logbot',
			icon_emoji : ':information_source:',
			attachments: [{
				color     : color,
				title     : title,
				text      : val,
				mrkdwn_in : ['text']
			}]
		})
		.end(function(err){})
}


module.exports = {
	setupWebhook : function(url){
		diagnosticsURL = url;
	},

	log : function(...args){
		let hasObj = false;
		const msg = _.map(args, (arg)=>{
			if(_.isObject(arg)) hasObj = true;
			return JSON.stringify(arg, null, '  ') || 'undefined'
		}).join(', ');
		if(!hasObj) return logbot('`' + msg + '`');
		return logbot('``` ' + msg + ' ```');
	},

	error : function(err){
		/*
		if(err instanceof Error){
			console.log(err);
			console.log(err.message);
			console.log(err.name);
			console.log(err.stack);
		};


		err = err || {};
		var stack = err.stack ? err.stack : err;

		logbot(stack, 'error', 'danger');
		*/
	},

	warn : function(title, msg){
		logbot(msg, title, 'warning');
	},

	info : function(...args){
		logbot(args, 'info', 'good');
	},

	msg : function(text){
		if(!diagnosticsURL) return;
		request.post(diagnosticsURL)
			.send({
				username : 'logbot',
				icon_emoji : ':information_source:',
				text : text
			})
			.end(function(err){})
	},
};