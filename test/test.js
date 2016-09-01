
var config = require('./config.json');
console.log(config);

var SlackLib = require('../index.js');

var SlackCore = SlackLib(config.token, {
	name : 'TestBot',
	icon : 'factory'
});

SlackCore.loadBots([
	require('./test.bot.js')
]);
