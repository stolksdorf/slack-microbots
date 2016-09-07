const _ = require('lodash');
//var Storage = require('slack-helperbot/storage');

//const console = require('../logbot.js');
const utils = require('../utils.js');


module.exports = {
	name : 'testbot',
	icon : ':tophat:',
	channel : '*',
	handle : function(msg, info, Slack){
		console.log('handling');


		if(info.user == 'scott'){
			Slack.react('thumbsup');
		}
		if(utils.messageHas(msg, ['fancybot', 'fancypants'])){
			Slack.reply('You rang? :tophat:');
		}
	}
}