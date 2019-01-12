# fis3-optimizer-concat-asset
基于FIS的资源合并，为了满足Nginx服务器端资源的合并下载，将资源合并成单一链接

# 配置

```
fis.plugin('concat-asset',{
		host: '', // 主域名 默认是相对路径 type: string
		max: '',// 合并资源的数 type: number | string
		tag: '', // 需要合并资源的标签目前暂时只支持 script和link 标签,type: array | string   exg: ['link','script'] | 'link, script'(字符串时以英文逗号隔开)
		exclude: '',// 需要忽略的合并项  type: array | string exg: ['name1','name2'] | 'name1, name2'(字符串时以英文逗号隔开)
		ignoreFile: '' // 需要忽略的html文件 type: array | string exg: ['test','test2'] | 'test, test2'(字符串时以英文逗号隔开, 是HTML文件名，不用带路径和后缀)
	})
```

# 安装
npm install fis3-optimizer-concat-asset -D
## 合并前

```
    <link rel="stylesheet" href="a.css">
    <link rel="stylesheet" href="b.css">
    <link rel="stylesheet" href="c.css">
    <link rel="stylesheet" href="d.css">


    <script src="test1.js"></script>
    <script src="https://xxxx/a/a.js"></script>
    <script src="b.js"></script>
    <script src="c.js"></script>
    <script src="d.js"></script>

```
```
fis.match('test.html', {
	optimizer: fis.plugin('concat-asset',{
		host: '',
		max: 3,
		tag: 'script,link',
		exclude: 'test1.js'
	})
});

```
##合并后
```
 <link rel="stylesheet" href="/??a.css,b.css,c.css" />
 <link rel="stylesheet" href="/??d.css" />

 <script src="https://xxxx/a/a.js"></script>
 <script src="test1.js"></script>
 <script type="text/javascript" src="/??b.js,c.js,d.js"></script>
```
## GitHub

[fis3-optimizer-concat-asset](https://github.com/JasonCloud/fis3-optimizer-concat-asset)
## License

MIT
