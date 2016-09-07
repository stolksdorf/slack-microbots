const _ = require('lodash');
//var Storage = require('slack-helperbot/storage');

//const console = require('../logbot.js');
const utils = require('../utils.js');



const processError = (err)=>{
	var res= {};
	var stack = err.stack.split('\n');

	res.name = stack[0];
	res.file

	//stack.shift();

	const path = require('path');

	var t = _.compact(_.map(stack, (trace, idx)=>{
		if(idx === 0) return trace;
		var temp = /(.*)\((.*)\)/g.exec(trace);
		if(temp[2].indexOf('module.js') !== -1) return;
		return `${temp[1]} (${path.basename(temp[2])})`;
	})).join('\n');


	var line = _.find(stack, (trace, idx)=>{
		if(idx === 0) return false;
		var temp = /(.*)\((.*)\)/g.exec(trace);
		if(temp[2].indexOf('module.js') !== -1) return;
		return true;
	})

	console.log('line', path.basename(line));


	console.log(t);


	console.log(res);
}


try{
	throw new Error('Test!!!')
}catch(e){

	processError(e);

}










module.exports = {
	name : 'testbot',
	icon : ':tophat:',
	channel : '*',
	handle : function(msg, info, Slack){
		//console.log('handling');

		a +b


		if(info.user == 'scott'){
			Slack.react('thumbsup');
		}
		if(utils.messageHas(msg, ['fancybot', 'fancypants'])){
			Slack.reply('You rang? :tophat:');
		}
	}
}