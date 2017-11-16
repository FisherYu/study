var http = require('http')
var fs = require('fs')
var parseUrl = require('parseurl')
var path = require('path')
var url = require('url')
 
var server = http.createServer(function onRequest (req, res) {
	var pathname = path.join(process.cwd(), decodeURI(parseUrl(req).pathname));
	fs.lstat(pathname, function(error, stats) {
		if(error) {
			res.end('Read file error: ' + error.code + ' ..\n');
            res.end();
			return;
		}
		if(stats.isFile()) {
			handleFile(res, pathname);
		} else if(stats.isDirectory()) {
			handleDirectory(res, pathname, req.url);
		} else {
			// TODO
		}
	})
})
 
server.listen(3030, function() {
	console.log('app listening port 3030')
})


var handleFile = (function() {
	function getContype(filePath) {
		var extname = path.extname(filePath);
	    var contentType = 'text/plain';
	    switch (extname) { 
	    	case '.html':
	        	contentType = 'text/html';
	            break;
	        case '.js':
	            contentType = 'text/javascript';
	            break;
	        case '.css':
	            contentType = 'text/css';
	            break;
	        case '.png':
	            contentType = 'image/png';
	            break;      
	        case '.jpg':
	            contentType = 'image/jpg';
	            break;
	    }
	    return contentType;
	}
	return function (response, path) {
		fs.readFile(path, function(error, content) {
	        if (error) {
	            if(error.code == 'ENOENT'){
	                response.writeHead(404, { 'Content-Type': 'text/plain' });
	                response.end('Not Found', 'utf-8');
	            }
	            else {
	                response.writeHead(500);
	                response.end('Read file error: ' + error.code + ' ..\n');
	                response.end(); 
	            }
	        }
	        else {
	            response.writeHead(200, { 'Content-Type': getContype(path) });
	            response.end(content, 'utf-8');
	        }
	    });
	}
})();

var handleDirectory = (function() {
	var whiteExt = ['.html'],
		blackDirectory = ['node_modules'];

	function genLi(href, text) {
		return ['<li><a href="',href,'">', text, '</a></li>'].join('');
	}
	function createDirectoryHtml(parentPath, list, parentUrl) {
		var liStr = [];
		if(parentUrl.substr(-1) !== '/') {
			parentUrl += '/';
		}
		var pre = url.resolve(parentUrl.substr(0, parentUrl.length -1), '.');
		list.forEach(function(item) {
			try{
				var stats = fs.lstatSync(path.join(parentPath,item));
				if(stats.isFile() && (whiteExt === '*' || whiteExt.indexOf(path.extname(item)) !== -1)
					|| (stats.isDirectory() && blackDirectory.indexOf(item) === -1) ) {
					liStr.push(genLi(url.resolve(parentUrl, item), item));
				}
			} catch(e) {
				console.log(e)
			}			
		})
		liStr = liStr.join('');
		return '<!DOCTYPE html>\n' +
	    '<html lang="en">\n' +
	    '<head>\n' +
	    '<meta charset="utf-8">\n' +
	    '<title>Directory</title>\n' +
	    '</head>\n' +
	    '<body>\n' +
	    '<a href="' + pre + '"><<< Pre</a>' + 
	    '<ul>' + liStr + '</ul>\n' +
	    '</body>\n' 
	}

	return function (response, path, url) {		
		fs.readdir(path, function onReaddir (err, list) {
			if (err) {
				response.end('Read Directory error');
				return;
			}
		    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
		    response.end(createDirectoryHtml(path, list, url) + '\n')
		})
	}
})()


