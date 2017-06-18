## konke [![konke](https://img.shields.io/npm/v/konke.svg)](https://npmjs.org/konke)

> 

### Installation

```bash
$ npm install konke
```

### Example

```js
const KonKe = require('konke');

const konke = new KonKe({
  client_id    : '2d6M5lH0jBf72y6a',
  client_secret: 'c1895e1k3505701t',

  access_token: 'xxx',
  user_id     : 'song940@163.com',
  device_id   : 'xxx:xxx'
});

konke.power('open').then(res => {
  console.log(res);
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