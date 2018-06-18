#!/usr/bin/env node

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

function waitingForInput(question){
  return new Promise((accept, reject) => {
    rl.question(question, (answer) => {
      accept(answer)
      rl.close();
    });
  });
}

(async () => {

  const url = 'https://lsong.org';

  console.log(konke.authorize(url));

  const code = await waitingForInput('Input code here :> ');

  const token = await konke.accessToken(code, url);

  konke.set('access_token', token.access_token);

  const user = await konke.user();

  const devices = await konke.getKList(user.userid);


  console.log(devices);
})();