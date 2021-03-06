const request = require('superagent-promise')(require('superagent'), Promise);
const _ = require('lodash');
const WebSocket = require('ws');
const log = require('../logbot.js');

const Slack = function(token){
	let socket;

	const processTeamData = function(teamData){
		const bot = _.find(teamData.users, (user) => {
			return user.id == teamData.self.id;
		});
		if(bot) slack.botId = bot.profile.bot_id;

		_.each(teamData.channels, (channel)=>{ slack.channels[channel.id] = channel.name; });
		_.each(teamData.groups,   (channel)=>{ slack.channels[channel.id] = channel.name; });
		_.each(teamData.users,    (user)   =>{ slack.users[user.id] = user.name; });
		_.each(teamData.ims,      (im)     =>{ slack.dms[im.id] = slack.users[im.user]});
	};

	const processIncomingMsg = function(msg){
		const res = _.assign({}, msg);

		res.text = res.text || "";
		res.channelId = msg.channel;
		res.userId = msg.user || msg.bot_id;

		//For reactions
		if(msg.item && msg.item.channel) res.channelId = msg.item.channel;

		if(res.channelId) res.channel = slack.channels[res.channelId];
		if(res.userId) res.user = slack.users[res.userId];
		if(msg.username) res.user = msg.username;
		if(res.channelId && res.channelId[0] == 'D'){
			res.isDirect = true;
			res.channel = 'direct';
		}
		return res;
	};

	const slack = {
		channels : {},
		users    : {},
		dms      : {},
		botId    : '',

		api : (command, payload) => {
			return request
				.get(`https://slack.com/api/${command}`)
				.query(_.assign({}, payload, { token : token }))
				.then((res)=>{
					if(res.body && res.body.ok === false) throw res.body.error;
					return res;
				});
		},
		openSocket : (handler) => {
			slack.api('rtm.start')
				.then((res) => {
					if (!res.body.ok || !res.body.url) throw `bad access token for removing`; //LOGBOT
					processTeamData(res.body);
					socket = new WebSocket(res.body.url);
					socket.on('open', () => {
						console.log('Socket connected');
					});
					socket.on('message', (rawData, flags) => {
						const msg = JSON.parse(rawData);
						if(msg.bot_id === slack.botId) return;
						const message = processIncomingMsg(msg);
						if(message.user == 'logbot') return;
						handler(message);
					});
				})
				.catch((err)=>{
					console.log(err.toString());
				})
		},
	}
	return slack;
};

module.exports = Slack;