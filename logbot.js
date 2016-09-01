var _ = require('lodash');
var request = require('superagent');

var diagnosticsURL = '';

var logbot = function(val, title='log', color='#0000FF'){
	console.log(val);
	if(!diagnosticsURL) return;
	request.post(diagnosticsURL)
		.send({
			attachments: [{
				color     : color,
				title     : title,
				text      : '```' + JSON.stringify(val, null, '  ') + '```',
				mrkdwn_in : ['text']
			}]
		})
		.end(function(err){})
}


module.exports = {
	init : function(url){
		diagnosticsURL = url;
	},

	log : function(...args){
		logbot(args);
	},

	error : function(err){
		err = err || {};
		var stack = err.stack ? err.stack : JSON.stringify(err, null, '  ');

		logbot(stack, 'error', 'danger');
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
			.send(text)
			.end(function(err){})
	},
};