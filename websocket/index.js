const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use('/', express.static(__dirname));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true);
  console.log(ws)
  console.log(location)
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send('Echo > ' + message);
  });

  //ws.send('something');
});

server.listen(3030, function listening() {
  console.log('Listening on %d', server.address().port);
});