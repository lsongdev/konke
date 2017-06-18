const URI 		= require('url');
const qs  		= require('querystring');
const request = require('superagent');
const EventEmitter = require('events');

class KonKe extends EventEmitter {

	static get API(){
		return 'http://kk.bigk2.com:8080';
	}

	static parse(response){
		response = JSON.parse(response.text);
		if(response.result != 0){
			var err = new Error(response.error);
			err.name = response.error;
			err.message = response.des;
			err.response = response;
			throw err;
		}
		return response;
	}

	constructor(options){
		super();
		Object.assign(this, options);
		return this;
	}

	authorize(redirect_uri){
		const { client_id, client_secret } = this;
	  return KonKe.API + '/KOAuthDemeter/authorize?' + qs.stringify({
			client_id,
			client_secret,
			redirect_uri,
			response_type: 'code'
		});
	}

	access_token(code, redirect_uri){
		const { client_id, client_secret } = this;
		return request
		.post(KonKe.API + '/KOAuthDemeter/accessToken')
		.type('form')
		.send({
			code,
			client_id,
			client_secret,
			redirect_uri,
			grant_type: 'authorization_code'
		}).then(KonKe.parse)
	}

	refresh(refresh_token){
		const { client_id, client_secret } = this;
		return request
		.post(KonKe.API + '/KOAuthDemeter/token')
		.type('form')
		.send({
			client_id,
			client_secret,
			redirect_uri,
			refresh_token,
			grant_type: 'refresh_token'
		}).then(KonKe.parse)
	}

	user(){
		const { access_token } = this;
		return request
		.post(KonKe.API + '/KOAuthDemeter/UserInfo')
		.set('Authorization', `Bearer ${access_token}`)
		.then(KonKe.parse)
	}

	devices(userid){
		const { access_token } = this;
		return request
		.post(KonKe.API + '/KOAuthDemeter/User/getKList')
		.set('Authorization', `Bearer ${access_token}`)
		.type('json')
		.send({ userid })
		.then(KonKe.parse)
		.then(res => res.datalist)
	}

}

class Device {

	constructor(konke, user, device){
		this.user_id 		  = user.userid;
		this.device_id 		= device.kid;
		this.access_token = konke.access_token;
		return this;
	}

	request(path, params){
		params = params || {};
		const { access_token, user_id, device_id } = this;
		params.userid = user_id;
		params.kid 		= device_id;
		return request
		.post(KonKe.API + `/KOAuthDemeter${path}`)
		.type('json')
		.set('Authorization', `Bearer ${access_token}`)
		.send(params)
		.then(KonKe.parse)
	}

}

class K extends Device {
	power(state){
		return this
		.request('/KControl/doSwitchK', {  
			key: state 
		});
	}
}

KonKe.Device = Device;
KonKe.K      = K;
module.exports = KonKe;