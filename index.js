var _ = require('lodash');
var logbot = require('./logbot');
var cmds = require('./cmdLoader');
var bots = require('./botLoader');


const SlackInterface = require('./slack.api.js');

const BotLoader = require('./bot.loader.js')
const CmdLoader = require('./cmd.loader.js')



//TODO: Add a server restart message



module.exports = function(token, botInfo = {}){
	const BotInfo = _.defaults(botInfo, {
		icon : ':gear:',
		name : 'corebot'
	});

	const Slack = SlackInterface(token);
	const Bots = BotLoader(Slack, BotInfo);

	Slack.openSocket(Bots.handleMessage);

	const slackCore = {
		loadCmds : function(cmds){
			CmdLoader.load(cmds);
		},
		loadBots : function(bots){
			Bots.load(bots);
		}
	};

	return slackCore;
};


/*


module.exports = function(configObj){
	configObj = _.extend({
		expressApp : null,
		diagnosticsWebhook : null,
		local : true,

		cmdList : [],
		botList : [],

		botInfo : {
			icon : ':tophat:',
			name : 'helperbot',
			token : 'SLACK_BOT_TOKEN'
		}

	}, configObj);

	logbot.setUrl(configObj.diagnosticsWebhook);
	var cmdLoadResult = cmds.load(configObj.expressApp, configObj.cmdList)

	bots.start(configObj.botInfo, configObj.local);
	var botLoadResult = bots.load(configObj.botList);

	//Separate message for local testing
	if(configObj.local){
		return logbot.info('Local Development Connected',
			'Local version of ' + configObj.botInfo.name + ' has successfully connected to slack.');
	}

	if(cmdLoadResult.error.length || botLoadResult.error.length){
		return logbot.error('Server Failed Restart', 'There were some issues restarting the server, check logbot.');
	}

	logbot.info('Server Restart', 'Successfully rebooted!');
}

*/