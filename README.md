## konke [![konke](https://img.shields.io/npm/v/konke.svg)](https://npmjs.org/konke)

> [konke](http://ikonke.com) sdk for node.js

### Installation

```bash
$ npm install konke
```

### Example

```js
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
```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

This work is licensed under the [MIT license](./LICENSE).

---
