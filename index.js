

function KonKe(options){
  this.options = options;
}

KonKe.prototype.authorize = function(redirect_uri){
  console.log('http://kk.bigk2.com:8080/KOAuthDemeter/authorize?client_id=$client_id&response_type=code&redirect_uri=$redirect_uri'.replace('$redirect_uri', redirect_uri).replace('$client_id', this.options.client_id));
};

module.exports = KonKe;