# slack-microbots

Slack-microbots allows you to split one Slackbot into many little and simple 'microbots'. This is ideal for a team that uses several bots, but doesn't want to setup/code the infrastructure for each. If you user Heroku and setup automatic deploys via Github, you could even code a new bot entirely in the browser and deploy it!

### features

* Handles all authentication and communication with Slack. Just provide it with a Bot Token
* Has a useful `logbot` which acts like `console.log` but prints messages to a `#diagnostics` channel on your team
* Each microbot has an incredibly simple structure, and the framework provides easy-to-parse, processed information about messages and your team
* Provides a syncronous and scoped Redis storage solution for each microbot
* Provides useful message parsing utilities for microbots
* Slash command support



### sample bot

```javascript
const Storage = require('slack-microbots/storage');
const console = require('slack-microbots/logbot');
const utils = require('slack-microbots/utils');

module.exports = {
	name : 'fancybot',
	icon : ':tophat:',
	channel : '*',
	handle : function(msg, info, Slack){
		if(info.user == 'scott'){
			Slack.react('thumbsup');
		}
		if(utils.messageHas(msg, ['fancybot', 'fancypants'])){
			Slack.reply('You rang? :tophat:');
		}
	}
}
```




### usage

In your `server.js`, add this following bit of code

```javascript
//Boot up helperbot
require('helperbot')({
	expressApp : app,
	diagnosticsWebhook : DIAGNOSTICS_WEBHOOK,
	local : !IS_PRODUCTION,
	debug : true,

	cmdList : ['path/tocmd.js'],
	botList : ['path/to/bot.js],

	botInfo : {
		icon : ':tophat:',
		name : 'higgins',
		token : SLACK_BOT_TOKEN
	}
});
```

### bot spec

Design your micro-bots in the following way

```javascript

module.exports = {
	listenFor : ['message'],
	response : function(msg, info, HelperBot){
		if(info.user == 'john'){
			HelperBot.reply('Hello John!');
			HelperBot.react('joy');
		}
	}
}
```

### logbot

Logbot is a logging bot that messages to your `#diagnostics` channel on your slack. Use it just like you would use `console`.