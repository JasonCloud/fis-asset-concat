
var _c = function(content,option) {
	var host = option.host || '';
	var tags = option.tag;
	var max = option.max;
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		if (!/(link)|(script)/.test(tag)) continue;
		// 当配置了使用相对路径时fis 会给路径加上relative包裹
		var reg = new RegExp('<'+tag+'(.+)[(src)|(href)]="__relative(.+)>(</'+tag+'>)?', 'ig');
		var regPath = new RegExp('.+<<<(.+)>>>.+', 'ig');
		if (!reg.test(content)) {
			// 以http或者https开头的第三方资源不再合并的范围里
			reg = new RegExp('<'+tag+'(.+)[(src)|(href)]="((?!https?:).)+">(</'+tag+'>)?', 'ig');
			regPath = new RegExp('.+src="(.+)".+', 'ig');
		}
		var arr = content.match(reg) || [];
		var excludeTag = []; //
		var dir = [];
		for (var j = 0; j < arr.length; j ++) {
			// 如果标签是要被忽略的，则不进行合并
			if (option.exclude.length && includeArr(option.exclude, arr[j])) {
				excludeTag.push(arr[j]);
			} else {
				var path = arr[j].replace(regPath, '$1');
				var info = fis.project.lookup(path);
				if (!info.file) {
					dir.push(info.origin);
					continue;
				}
				// 再编译一遍，为了保证 hash 值是一样的。
				info.file.useHash && fis.compile(info.file);
				dir.push(info.file.useHash ? info.file.map.uri : path);
			}
		}
		// 去掉过滤出来的链接
		content = content.replace(reg, '');
		// 将要忽略的链接重新加回去
		content += excludeTag.join('')
		// while循环每个链接最大的合并数
		while (dir.length) {
			switch (tag) {
				case 'link':
					content += '<link rel="stylesheet" href="'+ host +'/??' + dir.splice(0,max).join(',') + '">'
					break;
				case 'script':
					content += '<script type="text/javascript" src="'+ host +'/??' + dir.splice(0,max).join(',') + '"></script>'
					break;
			}
		}

	}

	return content;
}

var includeArr = function (arr, str) {
	var _include = false;
	for (var i = 0; i < arr.length; i ++) {
		var reg = new RegExp(arr[i], 'g');
		if (reg.test(str)) {
			_include = true;
			break;
		}
	}
	return _include
}
// 配置项option处理
var _option = function(option) {
	if (!option.tag) option.tag = ['link', 'script'];
	if (typeof option.tag == 'string') {
		option.tag = option.tag.replace(/\s+/g,'').split(',')
	}
	option.max = ~~option.max || 10;
	if(typeof option.exclude == 'string') {
		option.exclude = option.exclude.replace(/\s+/g,'').split(',')
	}
	if (!option.exclude) option.exclude = [];
	return option
}

module.exports = function (content, file, option) {
	option = _option(option)
	if (file.ext == '.html') {
		content = _c(content, option)
	}
	return content
}
