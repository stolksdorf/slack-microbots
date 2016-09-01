const logbot = require('../logbot.js');
const config = require('./config.json');
const MicroBots = require('../index.js');

logbot.init(config.diagnostics_webhook);


const SlackCore = MicroBots(config.token, {
	name : 'TestBot',
	icon : 'factory'
});

SlackCore.loadBots([
	require('./test.bot.js')
]);
