var _ = require('lodash');
//var Storage = require('slack-helperbot/storage');


module.exports = {
	name : 'testbot',
	icon : 'tophat',
	listenFor : ['message'],
	response : function(msg, info, Higgins){
		if(info.user == 'scott') Higgins.reply('yo');
	}
}