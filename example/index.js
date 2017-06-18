const co       = require('co');
const KonKe    = require('..');
const readline = require('readline');

const konke = new KonKe({
  client_id    : '2d6M5lH0jBf72y6a',
  client_secret: 'c1895e1k3505701t'
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

co(function*(){
  
  const url = 'https://lsong.org';

  console.log(konke.authorize(url));

  const code = yield waitingForInput('Input code here :> ');

  const token = yield konke.access_token(code, url);

  konke.access_token = token.access_token;

  const user = yield konke.user();

  const devices = yield konke.devices(user.userid);

  const k = new KonKe.K(konke, user, devices[0]);

  yield k.power('close');

});

function waitingForInput(question){
  return new Promise((accept, reject) => {
    rl.question(question, (answer) => {
      accept(answer)
      rl.close();
    });
  });
}