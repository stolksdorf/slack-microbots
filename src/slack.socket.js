const WebSocket = require('ws');


const SlackSocket = function(socketUrl, handler){
	const socket = new WebSocket(socketUrl);
	socket.on('open', () => {
		logger.info('socket connected!');
	});

	socket.on('message', (rawData, flags) => {
		const msg = JSON.parse(rawData);

		handler(msg);
	});
};

module.exports = SlackSocket;