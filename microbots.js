var _ = require('lodash');
var logbot = require('./logbot');

const SlackInterface = require('./src/slack.api.js');
const BotLoader = require('./src/bot.loader.js')
const CmdLoader = require('./src/cmd.loader.js')


module.exports = function(token, botInfo = {}){
	const BotInfo = _.defaults(botInfo, {
		icon : ':gear:',
		name : 'corebot'
	});

	const Slack = SlackInterface(token);
	const Bots = BotLoader(Slack, BotInfo);

	Slack.openSocket(Bots.handleMessage);

	return {
		loadCmds : function(cmds){
			return CmdLoader.load(cmds);
		},
		loadBots : function(bots){
			return Bots.load(bots);
		}
	};
};
