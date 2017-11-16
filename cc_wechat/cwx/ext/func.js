// module.exports = (function(){
//     var t = function(){};
//     var ret = {};
//     if (t instanceof t.constructor){
//         ret = t.constructor('return this')();
//     }else{
//         var b = t.__proto__.apply;
//         t.__proto__.apply = function(){ return this; };
//         ret = t.constructor();
//         t.__proto__.apply = b;
//     }
//     return ret;
// })();