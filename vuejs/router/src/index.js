
var NotFound = { template: '<p>Page not found</p>' }
var Foo = { template: '<p>Foo</p>' }
var uniq = (function() {
  var i = 0;
  return function() {
    return ++i;  
  }
  
})();
var Bar = { 
  template: '<p>Bar: {{name}}</p>',
  data: function() {
    return {
      name: 'default'
    }
  },
  beforeRouteEnter: function(route, redirect, next) {
    console.log('Bar beforeRouteEnter');
    fetchData(function(data){
     
      next(function(vm) {
         vm.name = data.name;
      });
    }, {name: 'join' + uniq()})
  },
  watch: {
    '$route': function(to, from) {
      console.log(['form:', from, ', to:', to].join(''));
    }
  }
}
var User = { 
  created : function() {
    console.log('user created')
  },
  mounted: function() {
    console.log('user mounted')
  },

  template: '<p>User: {{this.$route.params.id}}, {{this.$route.query}},{{this.$route.hash}}</p>',
  watch: {
    '$route': function(to, from) {
      console.log(['form:', from, ', to:', to].join(''));
    }
  }
}

function fetchData(callback, data) {
  setTimeout(function() {
    callback && callback(data);
  }, 1000)
}

var routes = [
  { 
    path: '/foo', 
    component: Foo,
    children: [
      {
        path: 'bar',
        component: Bar,
        // a meta field
        meta: { requiresAuth: true }
      }
    ],
    // components: {
    //   default: Foo,
    //   a: Bar,
    //   b: NotFound
    // },
    meta: {
      name: 'john',
      age: 23,
      say: function() {
        console.log('.....')
      }
    },
    ehe: 'ss' // 无效属性
  },
  { path: '/bar', component: Bar,},
  { path: '/user/:id', component: User, name: 'user' },
  { path: '*', component: NotFound}
];

var router = new VueRouter({
  //mode: 'history',
  routes: routes
});

router.beforeEach(function(route, redirect, next) {
  next();
})

new Vue({
  el: '#app',
  data: {
    id: 1
  },
  router: router,
  methods: {
  }
  // data: {
  //   currentRoute: window.location.pathname
  // },
  // computed: {
  //   ViewComponent: function() {
  //     return routes[this.currentRoute] || NotFound;
  //   }
  // },
  // render: function(h) { 
  //   return h(this.ViewComponent);
  // }
})

/*
1. 一个route对应多个View
2. Route
{
  path: <String>
  name: <String>
  component: <Object>
  components: <Object>
  redirect: <String> | <Object> | <Function> this是全局对象
  alias: <String> | [<String>],
  meta: <Object> 用来添加用户自定义的属性，方法（直接在Route上添加是不认的）
  children: [<Route>],
  matched: [<Route>] 匹配route规则的Routes
}
3. Route切换Component时，被隐藏的Component会被销毁的（重新进入会重新创建Component实例，生命周期函数也会重新调用）
4. next参数可传递个回调函数，且该回调函数的参数是当前组件实例


对象：
Route
RouteRecord

*/