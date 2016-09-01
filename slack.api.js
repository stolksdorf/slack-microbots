const request = require('superagent-promise')(require('superagent'), Promise);
const _ = require('lodash');
const WebSocket = require('ws');


const Slack = function(token){

	let socket;

	const processConnection = function(teamData){
		_.each(teamData.channels, (channel)=>{ slack.channels[channel.id] = channel.name; });
		_.each(teamData.groups,   (channel)=>{ slack.channels[channel.id] = channel.name; });
		_.each(teamData.users,    (user)   =>{ slack.users[user.id] = user.name; });
		_.each(teamData.ims,      (im)     =>{ slack.dms[im.id] = slack.users[im.user]});
	};

	const processMsg = function(msg){
		msg.channelId = msg.channel;
		msg.userId = msg.user;

		//For reactions
		if(msg.item && msg.item.channel) msg.channelId = msg.item.channel;

		if(msg.channelId) msg.channel = slack.channels[msg.channelId];
		if(msg.userId) msg.user = slack.users[msg.userId];
		if(msg.username) msg.user = msg.username;
		if(msg.channelId && msg.channelId[0] == 'D'){
			msg.isDirect = true;
			msg.channel = 'direct';
		}
		return msg;
	};

	const slack = {
		channels : {},
		users    : {},
		dms      : {},

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
					processConnection(res.body);
					socket = new WebSocket(res.body.url);
					socket.on('open', () => {
						//logger.info('socket connected!');
						console.log('Socket connected');
					});

					socket.on('message', (rawData, flags) => {
						const msg = JSON.parse(rawData);
						//make sure you can't listen to yourself


						if(msg.type == 'message') handler(processMsg(msg));
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