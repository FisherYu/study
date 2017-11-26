var fs = require('fs');

//get directory list 
fs.readdir(process.cwd(), function onReaddir (err, list) {
	if (err) return stream.error(err);
 	console.log(list.join('\n'))
})