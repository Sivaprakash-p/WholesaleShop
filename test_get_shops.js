const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/shops',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});

req.end();
