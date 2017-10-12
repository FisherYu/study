/*

1. 绑定
	on, once
	事件名称（大小写敏感）
2. 触发
	参数，调用方式（同步）
3. error event
*/
var EventEmitter = require('events');

var myEventEmitter = new EventEmitter();
myEventEmitter.on('event', function(a, b) {
	console.log('event: ' + (a + b));
	console.log(this);
});
// myEventEmitter.on('newListener', function() {
// 	console.log(arguments);
// })

//myEventEmitter.emit('error')
myEventEmitter.emit('event', 1, 2); // 同步事件
console.log('end')

// myEventEmitter.once('event-one', function() {
// 	console.log('event-one')
// });

// myEventEmitter.emit('event-one')
// myEventEmitter.emit('event-one')

// - Max listener
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})
myEventEmitter.once('e1', function(){})