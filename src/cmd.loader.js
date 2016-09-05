const _ = require('lodash');
const console = require('../logbot.js');

const formatResponse = (response) => {
	if(_.isString(response)){
		return { text : response };
	}else if(!_.isPlainObject(response)){
		return { text : JSON.stringify(response) };
	}else{
		return response;
	}
};

module.exports = {
	load : function(expressInstance, cmds){
		_.each(cmds, (cmd) => {
			if(!cmd.url){
				console.error('URL not set for command');
				return;
			}

			expressInstance.all(`${cmd.url}`, (req, res) => {
				const input = _.assign({}, req.query, req.body);
				try{
					cmd.handle(
						input.text,
						input,
						(response) => {
							return res.status(200).send(_.assign({
								'response_type': 'in_channel',
							}, formatResponse(response)));
						},
						(error) => {
							return res.status(200).send(_.assign({
								'response_type': 'ephemeral',
							}, formatResponse(err)));
						}
					);
				}catch(err){
					console.error(err, 'Command Run Error : ');
					return res.status(200).send();
				}
			})
		});
		return expressInstance;
	}

}