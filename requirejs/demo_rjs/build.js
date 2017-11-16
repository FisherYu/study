{
	baseUrl: "scripts",
    paths: {
    	//'main': 'scripts/main',
    	requireLib: '../../require',
    	jquery: "empty:"
    },
    //mainConfigFile: 'scripts/main.js',
    name: "main",
    include: 'requireLib',
    excludeShallow: ['two'],
    //out: "dest/main-built.js", // 相对于build.js文件路径，不存在build.js，则相对应命令执行目录

    // CSS 配置 Start
    cssIn: 'css/main.css',
    out: 'main-built.css'
    // CSS 配置 End
}