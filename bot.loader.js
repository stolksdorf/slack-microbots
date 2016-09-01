const _ = require('lodash');
const console = require('./logbot.js');
let Bots = [];



module.exports = function(Slack){

	const mapTarget = (target) => {
		const channelId = _.findKey(Slack.channels, (channel)=>{
			return channel == target;
		});
		if(channelId) return channelId;
		return _.findKey(Slack.dms, (user)=>{
			return user == target;
		});
	};


	const getBotContext = (bot, msg)=>{

		const context = {
			reply : (text, target) => {
				let _target = msg.channelId;

				if(target){
					_target = mapTarget(target);
					if(!_target){
						//LOGBOT AN ERROR
						console.log('ERR cant find target');
						return Promise.reject();
					}
				}

				return context.api('chat.postMessage', {
					channel : _target,
					text : text,

				})

			},
			react: (emoji) => {

			},
			api : (cmd, payload) => {
				return Slack.api(cmd, _.assign({
						username : 'gearbot',
						icon_emoji : ':gear:'
					}, payload))
					.catch((err) => {
						console.log(err); //LOGBOT
					});
			}
		}

		return context;
	};



	return {
		load : function(bots){
			//check for handle
			//check for name
			//check for proper icon formatting
			//check for channel

			Bots = bots;


		},

		handleMessage : function(msg){
			_.each(Bots, (bot)=>{
				const context = getBotContext(bot, msg)

				bot.handle(msg.text, msg, context);
			})

		}

	}
}