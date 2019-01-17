
var _c = function(content,option) {
	var host = option.host || '';
	var tags = option.tag;
	var max = option.max;
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		if (!/(link)|(script)/.test(tag)) continue;
		// When configured to use a relative path, fis adds a relative package to the path.
		var reg = new RegExp('<'+tag+'(.+)[(src)|(href)]="__relative(.+)>(</'+tag+'>)?', 'ig');
		var regPath = new RegExp('.+<<<(.+)>>>.+', 'ig');
		if (!reg.test(content)) {
			//  resources starting with http or https are not in the scope of consolidation.
			reg = new RegExp('<'+tag+'(.+)[(src)|(href)]="((?!https?:).)+">(</'+tag+'>)?', 'ig');
			regPath = new RegExp('.+src="(.+)".+', 'ig');
		}
		var arr = content.match(reg) || [];
		var excludeTag = []; //
		var dir = [];
		for (var j = 0; j < arr.length; j ++) {
			// If the tag is to be ignored, no merge is done
			if (option.exclude.length && includeArr(option.exclude, arr[j])) {
				excludeTag.push(arr[j]);
			} else {
				var path = arr[j].replace(regPath, '$1');
				var info = fis.project.lookup(path);
				if (!info.file) {
					dir.push(info.origin);
					continue;
				}
				// Compile again, in order to ensure that the hash value is the same。
				info.file.useHash && fis.compile(info.file);
				if (info.file.domain ) {
					var regD = new RegExp(info.file.domain);
					dir.push(info.file.useHash ? info.file.map.uri.replace(regD, '') : path.replace(regD, ''));
				} else {
					dir.push(info.file.useHash ? info.file.map.uri : path);
				}
			}
		}
		// Remove filtered tags
		content = content.replace(reg, '');
		// Add the tags to be ignored back
    for(var k = 0; k < excludeTag.length; k++) {
      if(tag == 'link') {
        content = content.replace(/<\/head>/,  excludeTag[k] + '</head>')
      } else if(tag == 'script') {
        content = content.replace(/<\/body>/,  excludeTag[k] + '</body>')
      }
    }
		// while cycle the maximum number of merges per tag
		while (dir.length) {
			switch (tag) {
				case 'link':
					content = content.replace(/<\/head>/, '<link rel="stylesheet" href="'+ host +'/??' + dir.splice(0,max).join(',') + '"></head>')
					break;
				case 'script':
					content = content.replace(/<\/body>/, '<script type="text/javascript" src="'+ host +'/??' + dir.splice(0,max).join(',') + '"></script></body>')
					break;
			}
		}

	}

	return content;
}
/**
 *
 * determine  the element is in an array
 * params arr Array
 * params str string
 * params strict Booleam // equals strict
 * **/
var includeArr = function (arr, str, strict) {
	var _include = false;
	var strict = strict || false;
	for (var i = 0; i < arr.length; i ++) {
		var reg = strict ? new RegExp('^'+arr[i]+'$', 'g') : new RegExp(arr[i], 'g');
		if (reg.test(str)) {
			_include = true;
			break;
		}
	}
	return _include
}
// set option
var _option = function(option) {
	if (!option.tag) option.tag = ['link', 'script'];
	if (typeof option.tag == 'string') {
		option.tag = option.tag.replace(/\s+/g,'').split(',')
	}
	option.max = ~~option.max || 10;
	// exclude: ignore not concat css,js file ，
	if(typeof option.exclude == 'string') {
		option.exclude = option.exclude.replace(/\s+/g,'').split(',')
	}
	if (!option.exclude) option.exclude = [];
	// ignoreFile: ignore not concat HTML file
	if(typeof option.ignoreFile == 'string') {
		option.ignoreFile = option.ignoreFile.replace(/\s+/g,'').split(',')
	}
	if (!option.ignoreFile) option.ignoreFile = [];
	return option
}

module.exports = function (content, file, option) {
	option = _option(option);
	if (file.ext == '.html' && !includeArr(option.ignoreFile, file.filename+file.ext, true)) { // just concat html file and not in ignoreFile
		content = _c(content, option)
	}
	return content
}
