const _ = require('lodash');
//var Storage = require('slack-helperbot/storage');

const console = require('../logbot.js');


module.exports = {
	//name : 'testbot',
	//icon : ':tophat:',
	channel : '*',
	handle : function(msg, info, Slack){


		//a + b;

		if(info.user == 'scott') Slack.reply('thumbsup')
				.then((res) => {

				})
	}
}