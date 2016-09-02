const logbot = require('../logbot.js');
const config = require('./config.json');
const MicroBots = require('../index.js');

logbot.setupWebhook(config.diagnostics_webhook);


const app = {
	all : ()=>{}
};


const SlackCore = MicroBots(config.token, {
	name : 'TestBot',
	icon : ':factory:'
});

SlackCore.loadBots([
	require('./test.bot.js')
]);

SlackCore.loadCmds(app, [
	require('./test.cmd.js')
]);
