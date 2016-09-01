var _ = require('lodash');
//var Storage = require('slack-helperbot/storage');

const console = require('../logbot.js');


module.exports = {
	name : 'testbot',
	icon : 'tophat',
	listenFor : ['message'],
	channel : 'general',
	handle : function(msg, info, Slack){

		if(info.user == 'scott') Slack.reply('yo', 'scott')
				.then((res) => {
					console.error(res);
					console.msg('hey!');
				})
	}
}