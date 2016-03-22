# slack-helperbot
A slackbot framework for easily building microbots and commands


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