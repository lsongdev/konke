const KonKe = require('..');

const uid = "song940@163.com";
const kid = "a5d13626-c4f8-45c7-8923-6f3562616927";
const tok = "3736a7ab79b27be49345523aab48941b";

const konke = new KonKe({ access_token: tok });

konke.getKState(uid, kid).then(result => {
  console.log(result);
});

konke.doSwitchK(uid, kid, 'close').then(result => {
  console.log(result);
});