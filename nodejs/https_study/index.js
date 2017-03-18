const https = require('https');
const http = require('http');
const url = require('url');

var fs = require('fs');

var app = require('express')();

var options = {
   key  : fs.readFileSync('server.key'),
   cert : fs.readFileSync('server.crt')
};
// app.get('/', function (req, res) {
//    res.send('Hello World!');
// });
https.createServer(options, function(req, res){
	console.log(req.url);
	console.log(http.STATUS_CODES)
	res.writeHead(200);
  	res.end('hello world\n');
}).listen(3000, function () {
   console.log('Started!');
}).on('error', function(){
	console.log('error')
})

// http.createServer(function(req, res){
// 	console.log(req.url);
// 	res.writeHead(200);
//   	res.end('hello world\n');
// }).listen(3000, function () {
//    console.log('Started!');
// }).on('error', function(e){
// 	console.log(e)
// }).on('connection', function(e){
// 	debugger;
// 	console.log('connection' + e.url)
// });


// var target = "https://www.baidu.com/";
// // var options = {
// //   hostname: 'baidu.com',
// //   port: 443,
// //   path: '/',
// //   method: 'GET',
// //   protocol: 'https'
// // };

// var options = url.parse(target);
// debugger
// var req = https.request(options, (res) => {
//   console.log('statusCode:', res.statusCode);
//   console.log('headers:', res.headers);

//   res.on('data', (d) => {
//     process.stdout.write(d);
//   });
// });

// req.on('error', (e) => {
//   console.error(e);
// });
// req.end();