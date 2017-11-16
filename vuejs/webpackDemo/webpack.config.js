var path = require('path');

module.exports = {
	entry: {
		'main': './src/index.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].[hash].js'
	},
	module: {
		rules: [
		 	// 使用vue-loader 加载 .vue 结尾的文件
			{
				test: /\.vue$/,
				loader: 'vue'
			}
		]
	}
}