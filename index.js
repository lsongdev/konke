const URI     = require('url');
const qs      = require('querystring');
const request = require('superagent');
const EventEmitter = require('events');

class KonKe extends EventEmitter {
  /**
   * [parse description]
   * @param  {[type]} response [description]
   * @return {[type]}          [description]
   */
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
  /**
   * [constructor description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  constructor(options){
    super();
    var defaults = {
      api: 'http://kk.bigk2.com:8080'
    };
    this.options = Object.assign(defaults, options);
    return this;
  }

  set(name, value){
    this.options[ name ] = value;
  }
  /**
   * [authorize description]
   * @param  {[type]} redirect_uri [description]
   * @return {[type]}              [description]
   */
  authorize(redirect_uri){
    const { client_id, client_secret } = this.options;
    return this.options.api + [
      '/KOAuthDemeter/authorize',
      qs.stringify({
        client_id,
        client_secret,
        redirect_uri,
        response_type: 'code'
      })
    ].join('?');
  }


  /**
   * [refresh description]
   * @param  {[type]} refresh_token [description]
   * @return {[type]}               [description]
   */
  refresh(refresh_token){
    const { client_id, client_secret } = this.options;
    return request
    .post(this.options.api + '/KOAuthDemeter/token')
    .type('form')
    .send({
      client_id,
      client_secret,
      redirect_uri,
      refresh_token,
      grant_type: 'refresh_token'
    }).then(KonKe.parse)
  }

  /**
   * [access_token description]
   * @param  {[type]} code         [description]
   * @param  {[type]} redirect_uri [description]
   * @return {[type]}              [description]
   */
  accessToken(code, redirect_uri){
    const { client_id, client_secret } = this.options;
    return request
    .post(this.options.api + '/KOAuthDemeter/accessToken')
    .type('form')
    .send({
      code,
      client_id,
      client_secret,
      redirect_uri,
      grant_type: 'authorization_code'
    }).then(KonKe.parse)
  }


  /**
   * 验证 access_token 有效性
   */
  checkAccessToken(){
    return this.exec('/CheckAccessToken');
  }

   /**
   * 验证当前 access_token 有效性
   * @param {[type]} userid [description]
   * @param {[type]} kid    [description]
   */
  verificateAccessToken(userid){
    return this.exec('/User/verificateAccessToken', { userid });
  }

  /**
   * [user description]
   * @return {[type]} [description]
   */
  user(){
    const { access_token } = this.options;
    return request
    .post(this.options.api + '/KOAuthDemeter/UserInfo')
    .set('Authorization', `Bearer ${access_token}`)
    .then(KonKe.parse)
  }

   /**
   * 根据用户名获取用户 Id
   * @param  {[type]} username [description]
   * @return {[type]}          [description]
   */
  queryUserId(username){
    return this.exec('/User/queryUserId', { username });
  }
 
  /**
   * [exec description]
   * @param  {[type]} path   [description]
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  exec(path, params){
    const { api, access_token } = this.options;
    return request
    .post(`${api}/KOAuthDemeter${path}`)
    .set('Authorization', `Bearer ${access_token}`)
    .type('json')
    .send(params)
    .then(KonKe.parse)
  }

  /**
   * 获取用户头像(接口暂未实现)
   * @param  {[type]} userid [用户 id]
   */
  getAvatar(userid){
    return this.exec('/User/getAvatar', { userid });
  }
  /**
   * 获取用户账号内所有小 K 的编号
   * @param  {[type]} userid [用户 id]
   * @return {[type]}        [description]
   */
  getKList(userid){
    return this
    .exec('/User/getKList', { userid })
    .then(res => res.datalist)
  }

  /**
   * 获取小 K 的详细信息
   * @return {[type]} [description]
   */
  getKInfo(userid, kid){
    return this.exec('/User/getKInfo', { 
      userid, kid 
    }).then(k => k.data);
  }

  /**
   * 获取小 K 的开关状态
   * @param  {[type]} userid   [description]
   * @param  {[type]} kid [description]
   * @return {[type]}          [description]
   */
  getKState(userid, kid){
    return this.exec('/KInfo/getKState', { 
      userid, kid: kid 
    }).then(k => k.data);
  }

  /**
   * 查询小 K 是否在线
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKOnlineStatus(userid, kid){
    return this.exec('/KInfo/getKOnlineStatus', { 
      userid, kid 
    }).then(res => res.data);
  }

   /**
   * 批量获取小 K 在线状态
   * @param  {[type]} userid [description]
   * @param  {[type]} kids   [description]
   * @return {[type]}        [description]
   */
  getMultipleKOnlineStatus(userid, kids){
    return this.exec('/User/getMultipleKOnlineStatus', { user, kids });
  }

  /**
   * 对小 K 进行开关控制
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @param  {[type]} key    [description]
   * @return {[type]}        [description]
   */
  doSwitchK(userid, kid, key){
    const { device_id } = this.options;
    return this.exec('/KControl/doSwitchK', { userid, kid, key });
  }
  /**
   * 获取小 K 的定时信息
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKTimerList(userid, kid){
    return this.exec('/KInfo/getKTimerList', { 
      userid, kid: kid 
    }).then(res => res.datalist);
  }

  /**
   * 获取小 K 的用电信息(这个接口仅适用于二代小 K)
   * @return {[type]} [description]
   */
  getKElectricity(userid, kid){
    return this.exec('/KInfo/getKElectricity', { 
      userid, kid 
    }).then(res => res.datalist);
  }

  /**
   * 按月获取小 K 的用电信息(这个接口仅适用于二代小 K)
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKElectricityByMonth(userid, kid){
    return this.exec('/KInfo/getKElectricityByMonth', { 
      userid, kid 
    }).then(res => res.datalist);
  }
  /**
   * 按天获取小 K 的用电信息(这个接口仅适用于二代小 K)
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKElectricityByDay(userid, kid){
    return this.exec('/KInfo/getKElectricityByDay', { 
      userid, kid 
    }).then(res => res.datalist);
  }
  /**
   * 按小时获取小 K 的用电信息(这个接口仅适用于二代小 K)
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKElectricityByHour(userid, kid){
    return this.exec('/KInfo/getKElectricityByHour', { 
      userid, kid 
    }).then(res => res.datalist);
  }

  /**
   * 获取小 K 的延时设置信息(开)
   * @return {[type]} [description]
   */
  getKDelayOpenInfo(userid, kid){
    return this.exec('/KInfo/getKDelayOpenInfo', { 
      userid, kid 
    }).then(res => res.datalist);
  }
  /**
   * 获取小 K 的延时设置信息(关)
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKDelayCloseInfo(userid, kid){
    return this.exec('/KInfo/getKDelayCloseInfo', { 
      userid, kid 
    }).then(res => res.datalist);
  }
  
  /**
   * 控制小 K 的小夜灯开关
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @param  {[type]} key    [description]
   * @return {[type]}        [description]
   */
  switchKLight(userid, kid, key){
    return this.exec('/User/switchKLight', { userid, kid, key });
  }

  /**
   * 获取小 K 的小夜灯开关状态
   * @return {[type]} [description]
   */
  getKLightInfo(userid, kid){
    return this.exec('/User/getKLightInfo', { 
      userid, kid
    }).then(res => res.data);
  }
 
  /**
   * 获取普通遥控器列表
   * @param  {[type]} userid [description]
   * @return {[type]}        [description]
   */
  getGeneralRemoteList(userid){
    return this.exec('/User/getGeneralRemoteList', { 
      userid 
    }).then(res => res.datalist);
  }
  /**
   * 发送普通遥控器指令
   * @param  {[type]} userid     [description]
   * @param  {[type]} kid        [description]
   * @param  {[type]} remoteType [description]
   * @param  {[type]} order      [description]
   * @return {[type]}            [description]
   */
  sendGeneralRemoteOrder(userid, kid, remoteType, order){
    return this.exec('/KControl/sendGeneralRemoteOrder', {
      userid, kid, remoteType, order
    });
  }
  /**
   * 获取空调遥控器列表
   * @param  {[type]} userid [description]
   * @return {[type]}        [description]
   */
  getAirConditionerRemoteList(userid){
    return this.exec('/User/getAirConditionerRemoteList', { 
      userid 
    }).then(res => res.datalist);
  }
  /**
   * 发送空调控制指令
   * @param  {[type]} userid     [description]
   * @param  {[type]} kid        [description]
   * @param  {[type]} remoteType [description]
   * @param  {[type]} order      [description]
   * @param  {[type]} extraOrder [description]
   * @return {[type]}            [description]
   */
  sendAirConditionerOrder(userid, kid, remoteType, order, extraOrder){
    return this.exec('/KControl/sendAirConditionerOrder', {
      userid, kid, remoteType, order, extraOrder
    });
  }
  /**
   * 设置(修改)一个定时
   * @param {[type]} userid      [description]
   * @param {[type]} kid         [description]
   * @param {[type]} timerId     [description]
   * @param {[type]} openEnable  [description]
   * @param {[type]} openTime    [description]
   * @param {[type]} closeEnable [description]
   * @param {[type]} closeTime   [description]
   * @param {[type]} repeat      [description]
   */
  setTimerTask(userid, kid, timerId, openEnable, openTime, closeEnable, closeTime, repeat){
    return this.exec('/User/setTimerTask', {
      userid, kid, timerId, openEnable, openTime, closeEnable, closeTime, repeat
    });
  }
  /**
   * 删除一个定时
   * @param  {[type]} userid  [description]
   * @param  {[type]} kid     [description]
   * @param  {[type]} timerId [description]
   * @return {[type]}         [description]
   */
  removeTimerTask(userid, kid, timerId){
    return this.exec('/User/removeTimerTask', { userid, kid, timerId });
  }
  /**
   * 设置(修改)小 K 的延时
   * @param {[type]} userid         [description]
   * @param {[type]} kid            [description]
   * @param {[type]} openEnable     [description]
   * @param {[type]} countdownOpen  [description]
   * @param {[type]} closeEnable    [description]
   * @param {[type]} countdownClose [description]
   * @param {[type]} repeat         [description]
   */
  setDelayTask(userid, kid, openEnable, countdownOpen, closeEnable, countdownClose, repeat){
    return this.exec('/User/setDelayTask', {
      userid, kid, openEnable, countdownOpen, closeEnable, countdownClose, repeat
    });
  }
  /**
   * 删除小 K 的延时
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  removeDelayTask(userid, kid){
    return this.exec('/User/removeDelayTask', { userid, kid });
  }
  /**
   * 开启充电保护
   * @param  {[type]} userid   [description]
   * @param  {[type]} kid      [description]
   * @param  {[type]} interval [description]
   * @return {[type]}          [description]
   */
  openChargingProtection(userid, kid, interval){
    return this.exec('/User/openChargingProtection', { userid, kid, interval });
  }
  /**
   * 关闭充电保护
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  closeChargingProtection(userid, kid){
    return this.exec('/User/closeChargingProtection', { userid, kid });
  }
  /**
   * 获取插件列表
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getSingleKStatus(userid, kid){
    return this.exec('/KInfo/getSingleKStatus', { 
      userid, kid 
    }).then(res => res.datalist);
  }

  /**
   * 获取环境插件数据
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getEnvironmentInfo(userid, kid){
    return this.exec('/KInfo/getEnvironmentInfo', { 
      userid, kid 
    }).then(res => res.datalist);
  }
  /**
   * 获取人体感应次数
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKHumanInfo(userid, kid){
    return this.exec('/KInfo/getKHumanInfo', { 
      userid, kid 
    }).then(res => res.datalist);
  }
  /**
   * 获取最近的人体感应时间
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  getKLatestHumanInfo(userid, kid){
    return this.exec('/KInfo/getKLatestHumanInfo', { 
      userid, kid 
    }).then(res => res.datalist);
  }
   /**
   * 获取用户所有设置的场景
   * @return {[type]} [description]
   */
  getKSceneList(userid){
    return this.exec('/User/getKSceneList', { 
      userid 
    }).then(res => res.datalist);
  }
  /**
   * 删除单个场景信息
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  deleteSceneByIndex(userid, sceneIndex){
    return this.exec('/User/deleteSceneByIndex', { user, sceneIndex });
  }
  /**
   * 上传场景列表
   * @param  {[type]} userid    [description]
   * @param  {[type]} sceneData [description]
   * @return {[type]}           [description]
   */
  uploadKSceneList(userid, sceneData){
    return this.exec('/User/uploadKSceneList', { user, sceneData });
  }

  /**
   * 单个上传场景信息
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  uploadSceneByIndex(userid, sceneData){
    return this.exec('/User/uploadSceneByIndex', { user, sceneData });
  }
  /**
   * 单个下载场景信息
   * @param  {[type]} userid     [description]
   * @param  {[type]} sceneIndex [description]
   * @return {[type]}            [description]
   */
  downloadSceneByIndex(userid, sceneIndex){
    return this.exec('/User/uploadSceneByIndex', { user, sceneIndex });
  }
 
  /**
   * 开启 WiFi 增强功能
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  enableWiFiBridge(userid, kid){
    return this.exec('/KControl/enableWiFiBridge', { userid, kid });
  }
  /**
   * 关闭 WiFi 增强功能
   * @param  {[type]} userid [description]
   * @param  {[type]} kid    [description]
   * @return {[type]}        [description]
   */
  disableWiFiBridge(userid, kid){
    return this.exec('/KControl/disableWiFiBridge', { userid, kid });
  }

  /**
   * 上传联动信息
   * @param  {[type]} userid      [description]
   * @param  {[type]} linkageData [description]
   * @return {[type]}             [description]
   */
  putLinkage(userid, linkageData){
    return this.exec('/User/putLinkage', { user, linkageData });
  }

}

module.exports = KonKe;