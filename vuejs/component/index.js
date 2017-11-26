;(function() {
	Vue.component('my-div', {
		template: '<div>A custom component</div>'
	})

	var myP = {
	}

	Vue.component('button-counter', {
		template: '<p><label>{{ref.name}}</label><button @click="onClick" >{{count}}</button></p>',
		data: function() {
			return {
				count: 0,
				ref: {
					name: 'john',
					age: 22
				}
			}
		},
		methods: {
			onClick: function() {
				this.count++;
				this.$emit('click', this.ref);
			}
		}
	});

	var vm = new Vue({
		el: '#app1',
		// 不只是组件，Vue实例的data选项也可以是个函数
		data: function() {
			return {
				count: 0,
				total: 0,
				myMessage: {
					title: 'msg-title',
					content: 'msg-content'
				}
			}
		},
		components: {
			'my-p': {
				props: ['title', 'content'],
				template: '<div class="blue" name="myMsg"><h2>{{title}}</h2><p>{{content}}</p></div>'
			}, 
		},
		methods: {
			/* 监听子组件触发的事件的回调函数参数就是$emit触发时传递的参数
				如果传递的参数是个引用类型，那在父组件中对其的修改会影响子组件
			*/
			increseTotal: function(e) {
				e.name = 'p' + e.name;
				console.log(e);
			}
		}
	});

	/*
		Slot
		1、怎么理解插槽呢？ 如何混合【放在子组件标签内的模板】和【子组件本身的模板】
		html标签一般都有两个格式<a></a>或者<a />
		2、插槽的数据一般来自父组件作用域

	**/
	Vue.component('app-header', {
		template: ['<div>',
		  '<h2>我是子组件的标题</h2>',
		  // slot标签的属性会被忽略的, 除非是作用域插槽
		  // 作用域插槽slot的属性可以用？ 试了试class属性不行
		  // 作用域插槽可以实现把子组件的数据喷到插槽模板中
		  '<slot a="hello from child">只有在没有要分发的内容时才会显示.</slot>',
		'</div>'].join('')
	})
	Vue.component('default-layout', {

	})
	var app2 = new Vue({
		el: '#app2',

	})

	// 动态组件
	var app3 = new Vue({
		el: '#app3',
		components: {
			tab1: {
				template: '<h2>I\'m Tab1</h2>'
			},
			tab2: {
				template: '<h2>I\'m Tab2</h2>'
			}
		},
		data: {
			currentTab: 'tab1'
		},
		methods: {
			switchTab: function(target) {
				this.currentTab = target;
			}
		}
	})


})()

/*
1. 单向数据流：是指父子组件间的数据流，不是指view-model直接的数据流
2. 模板中的所有的标签都是组件，包含html内置的标签（也可以使用ref属性）
3. 组件的模板字符串来源：1：js中定义，2，x-template中定义
*/