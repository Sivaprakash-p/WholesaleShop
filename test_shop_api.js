const http = require('http');

const data = JSON.stringify({
  name: "Test Shop",
  address: "Owner",
  city: { id: 1 }
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/shops',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let responseData = '';
  res.on('data', chunk => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(responseData);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
