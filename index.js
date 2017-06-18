const URI     = require('url');
const qs      = require('querystring');
const request = require('superagent');
const EventEmitter = require('events');

class KonKe extends EventEmitter {

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
    this.api = 'http://kk.bigk2.com:8080';
    Object.assign(this, options);
    return this;
  }

  authorize(redirect_uri){
    const { client_id, client_secret } = this;
    return this.api + '/KOAuthDemeter/authorize?' + qs.stringify({
      client_id,
      client_secret,
      redirect_uri,
      response_type: 'code'
    });
  }

  access_token(code, redirect_uri){
    const { client_id, client_secret } = this;
    return request
    .post(this.api + '/KOAuthDemeter/accessToken')
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
    .post(this.api + '/KOAuthDemeter/token')
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
    .post(this.api + '/KOAuthDemeter/UserInfo')
    .set('Authorization', `Bearer ${access_token}`)
    .then(KonKe.parse)
  }

  devices(){
    const { user_id, access_token } = this;
    return request
    .post(this.api + '/KOAuthDemeter/User/getKList')
    .set('Authorization', `Bearer ${access_token}`)
    .type('json')
    .send({ userid: user_id })
    .then(KonKe.parse)
    .then(res => res.datalist)
  }

  power(key){
    const { access_token, user_id, device_id } = this;
    return request
    .post(this.api + '/KOAuthDemeter/KControl/doSwitchK')
    .set('Authorization', `Bearer ${access_token}`)
    .type('json')
    .send({ userid: user_id, kid: device_id, key })
    .then(KonKe.parse)
  }

}

module.exports = KonKe;