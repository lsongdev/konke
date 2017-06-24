const KonKe = require('..');

const konke = new KonKe({
  access_token : '3736a7ab79b27be49345523aab48941b'
});

konke.sendGeneralRemoteOrder(
  "song940@163.com",
  "d5d7c8f3-43d7-44cc-a62d-261f882eb2a2",
  KonKe.REMOTE_TYPE.IR,
  "rc_1498303352#1498303616"
).then(result => {
  console.log(result);
});