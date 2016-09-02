const _ = require('lodash');
const path = require('path');
const Logbot = require('./logbot');

const Cmds = [];

const formatResponse = function(response){
	if(_.isString(response)){
		return {
			text : response
		};
	}else if(!_.isPlainObject(response)){
		return {
			text : JSON.stringify(response)
		};
	}else{
		return response;
	}
};


const reply_callback = function(res, response){
	return res.status(200).send(_.extend({
		'response_type': 'in_channel',
	}, formatResponse(response)));
};

const error_callback = function(res, err){
	if(_.isString(err)){
		return res.status(200).send(_.extend({
			'response_type': 'ephemeral',
		}, formatResponse(err)));
	}
	Logbot.error('Command Dev Error : ' + cmdPath, err);
}

module.exports = {

	load : function(expressInstance, cmds){
		const rootDir = path.dirname(Object.keys(require.cache)[0]);
		const loadResults ={
			success : [],
			error : []
		}

		_.each(cmds, function(cmdPath){
			try{
				const cmd = require(path.join(rootDir, cmdPath));
				loadResults.success.push(cmdPath);
				Cmds.push({
					name : cmdPath,
					cmd : cmd
				});
			}catch(err){
				Logbot.error('Command Load Error : ' + cmdPath, err);
				loadResults.error.push(cmdPath);
				return;
			}

			const cmdUrl = '/' + path.basename(cmdPath, '.js');

			expressInstance.post(cmdUrl, function(req, res){
				res.status(200).send({
					text : "Opps, looks like you set your command to have a *method* of `POST`, it should be set to `GET`"
				})
			});

			expressInstance.get(cmdUrl, function(req, res){
				try{
					cmd(req.query.text, req.query, reply_callback.bind(this, res), error_callback.bind(this, res));
				}catch(err){
					Logbot.error('Command Run Error : ' + cmdPath, err);
					return res.status(200).send();
				}
			})
		})

		return loadResults;
	}
}
