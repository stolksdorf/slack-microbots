var _ = require('lodash');
var path = require('path');
var SlackBot = require('slackbots');
var Logbot = require('./logbot');
var Storage = require('./storage');

var DEBUG = false;
var LOCAL = false;

var Channels = {};
var Users = {}
var Bots = [];

var botEventMapping = {}

var BotInstance = {};
var BotInfo = {
	icon : ':robot_face:',
	name : 'helperbot'
}

var getBotInContext = function(bot, eventData){
	var botInfo = {
		icon_emoji : bot.icon || BotInfo.icon,
		username : bot.name || BotInfo.name
	}

	return {
		reply : function(msg, target){
			var targ = eventData.channel;
			if(eventData.isDirect) targ = eventData.user;
			return BotInstance.postTo(target || targ, msg, botInfo)
		},
		react : function(emoji){
			return BotInstance._api('reactions.add', {
				name : emoji,
				channel : eventData.channelId,
				timestamp : eventData.ts
			});
		},
		whisper : function(msg, target){
			target = target || eventData.user;
			BotInstance.postTo(target, msg, botInfo);
		}
	}
}


var shouldHelperRespond = function(eventData){
	//Don't listen to yourself
	if(eventData.user == BotInfo.name) return false;

	//Don't ever listen to logbot
	if(eventData.user == 'logbot') return false;

	//if in production, never listen to #diagnostics
	if(!LOCAL && eventData.channel == 'diagnostics') return false;

	return true;
}

var shouldBotRespond = function(eventData, bot){
	//Don't listen to yourself
	if(eventData.user && eventData.user == bot.name) return false;

	//Unless locally developing, check if the bot is only supposed to listen in one channel
	if(_.isString(bot.listenIn)){
		if(eventData.channel == bot.listenIn) return true;
		return false;
	}

	return true;
}

//Cleans up the event object slack gives us
var enhanceEventData = function(eventData){
	eventData.channelId = eventData.channel;
	eventData.userId = eventData.user;

	//For reactions
	if(eventData.item && eventData.item.channel) eventData.channelId = eventData.item.channel;

	if(eventData.channelId) eventData.channel = Channels[eventData.channelId];
	if(eventData.userId) eventData.user = Users[eventData.userId];
	if(eventData.username) eventData.user = eventData.username;
	if(eventData.channelId && eventData.channelId[0] == 'D'){
		eventData.isDirect = true;
		eventData.channel = BotInfo.name;
	}

	return eventData;
}


var handleEvent = function(data) {
	data = enhanceEventData(data);
	if(!shouldHelperRespond(data)) return;

	//if locally developing, it console logs every event
	if(LOCAL){console.log(data);console.log('---');}

	_.each(botEventMapping[data.type], (bot)=>{
		if(shouldBotRespond(data, bot)){
			var errHandler = function(err){
				Logbot.error('Bot Run Error : ' + bot.file, err);
				getBotInContext(bot, data).reply('Oops, looks like I broke. Check out #diagnostics for details.');
			};
			var d = require('domain').create();
			d.on('error', errHandler);
			d.run(function(){
				try{
					bot.response(data.text, data, getBotInContext(bot, data), BotInstance);
				}catch(err){
					errHandler(err);
				}
			});
		}
	});
};

var handleStart = function(){
	//Populate public Channels
	_.each(BotInstance.channels, (channel)=>{
		Channels[channel.id] = channel.name;
	});

	//Populate private Channels
	_.each(BotInstance.groups, (channel)=>{
		Channels[channel.id] = channel.name;
	});

	//Popualte Users
	_.each(BotInstance.users, (user)=>{
		Users[user.id] = user.name;
	});
}


module.exports = {
	getBots : function(){
		return Bots;
	},
	getBotContext : function(botInfo){
		return getBotInContext(botInfo || {}, {});
	},

	start : function(botInfo, isLocal){
		LOCAL = isLocal;

		BotInstance = new SlackBot({
			token : botInfo.token,
			name  : botInfo.name
		});
		BotInfo = _.extend(BotInfo, botInfo);

		BotInstance.on('start', handleStart);
		BotInstance.on('message', handleEvent);
	},

	load : function(botList){
		var rootDir = path.dirname(Object.keys(require.cache)[0]);
		var loadResults ={
			success : [],
			error : []
		};

		var createDummyBot = ()=>{return {name:BotInfo.name,listenFor:[], response:function(){}}};

		Storage.init(function(){
			Bots = _.map(botList, function(botPath){
				try{
					var bot = require(path.join(rootDir, botPath));
					bot.path = botPath;
					bot.file = path.basename(botPath);
					loadResults.success.push(botPath);
					bot = _.extend(createDummyBot(), bot); //Add defaults
					return bot;
				}catch(err){
					Logbot.error('Bot Load Error : ' + botPath, err);
					if(LOCAL) throw err;
					loadResults.error.push(botPath);
					return createDummyBot();
				}
			});

			//Create object that maps message types to which bot triggers it
			_.each(Bots, function(bot){
				_.each(bot.listenFor, function(trigger){
					if(!botEventMapping[trigger]) botEventMapping[trigger] = [];
					botEventMapping[trigger].push(bot);
				})
			});
		})

		return loadResults;
	}
}

