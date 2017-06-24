const http = require('http');
const kelp = require('kelp');
const send = require('kelp-send');
const body = require('kelp-body');
const cookie = require('kelp-cookie');
const KonKe = require('..');

const konke = new KonKe({
  client_id    : '2d6M5lH0jBf72y6a',
  client_secret: 'c1895e1k3505701t'
});

const app = kelp();


const url = 'http://konke.dev:3000';

app.use(send);
app.use(body);
app.use(cookie);
app.use((req, res, next) => {
  const { code } = req.query;
  const { token } = req.cookies;
  if(token){
    req.token = token;
    return next();
  }
  if(!code) return res.redirect( konke.authorize(url) );
  konke.access_token(code, url).then(token => {
    req.token = token.access_token;
    res.cookie('token', req.token);
    next();
  });
});

app.use((req, res, next) => {
  konke.access_token = req.token;
  konke.user().then(user => {
    req.user = user;
    next();
  });
});

app.use((req, res, next) => {
  konke.user_id = req.user.userid;
  konke.devices().then(deivces => {
    req.deivces = deivces;
    next();
  });
});

app.use((req, res, next) => {
  const { user, deivces } = req;
  res.send(`
    <html>
      <head>
        <title>KonKe Example</title>
        <style>
        body{
          background: #efefef;
        }
        .container{
          width: 30%;
          margin: auto;
          padding: 50px;
          background: #fefefe;
          text-align: center;
        }
        .user{}
        .user img{
          width: 50px;
          height: 50px;
          border-radius: 100%;
        }
        .user span{
          color: #333;
          display: block;
        }
        .devices{
          padding: 0;
          min-height: 500px;
        }
        .devices li{
          list-style: none;
        }
        </style>
      </head>
      <body>
        <div class="container" >
          <div class="user">
            <img src="" />
            <span>${user.username}</span>
          </div>
          <ul class="devices" >
          ${deivces.map(device => `
            <li>
              <a
                href="/${device.kid}" 
                mac="${device.device_mac}"
                type="${device.device_type}" >
                ${device.device_name}
              </a>
            </li>`
          )}
          </ul>
        </div>
      </body>
    </html>
  `);
});

http.createServer(app).listen(3000);