/*
	main window search box routines.
	2022.11.21 GuoJS created.
*/
var heelWeb = heelWeb || {};
heelWeb.main = heelWeb.main || {};

heelWeb.main.search = (new function () {
	let _keyWords = []; // Key words
	let _menus = []; // menus
	let _recents = []; // recent records

	let _style = function() {
		console.log('main.search.style');
		let searchbox = $('.heel-web .main > .mainLeft > .searchBox > .btn > input');
		let searchboxResultList = $('.heel-web .main > .mainLeft > .matchItems');
		
		// input box
		searchbox.attr('placeholder', '搜索菜单');
		// default search result dropdown
		searchboxResultList.addClass('myApi-box-shadow');
		// pinyin search result dropdown 
		let searchboxResultList4Pinyin = $('<div class="hw-search-result-list myApi-box-shadow"><ul></ul></div>');
		searchboxResultList4Pinyin.appendTo($('.heel-web .main > .mainLeft'));
		// recent visit record dropdown
		let recentDropdown = $('<div class="hw-recent-dropdown myApi-box-shadow"><div class="title"><span>最近访问</span><i class="fa-solid fa-times hw-def-button-color hw-scale control-box"/></div><ul></ul></div>');
		recentDropdown.appendTo($('.heel-web .main > .mainLeft'));
	};

	let _event = function() {
		console.log('main search event');
		let searchbox = $('.heel-web .main > .mainLeft > .searchBox > .btn > input');
		
		searchbox.focus(function() {
			$(this).select();
			let words = $(this).val();
			
			
			if ('' == words) { // Search words is empty
				_showRecents();
			}
		});
		searchbox.focus();

		searchbox.keyup(function(e) {
			console.log('search box keyup:' + e.keyCode);
			let words = $(this).val();

			if ('' == words) { // Search words is empty,
				_hidePinyin();
				
				_showRecents();
				_selectRecent(e.keyCode);
			} else { // Search words is not empty
				_hideRecents();

				if (_selectPinyin(e.keyCode)) {
					return;
				}
														
				if (_selectDefault(e.keyCode, words)) {
					return;
				}

				setTimeout(() => {
					// default search dropdown is visible
					if ($('.heel-web .main > .mainLeft > .matchItems').is(':visible')) { 
						_hidePinyin();
						return;
					}

					// pinyin search
					let result = _searchPinyin(words);
					_showPinyin(result); // Show dropdown menu items
				}, 100);
			}						
		});	
					
		$('.hw-search-result-list').delegate('.item', 'click', function() {
			let text = $(this).text();
			console.log('click item:' + text);

			_updateSearchBox($(this).data('text'));
		});
		
		$('.hw-recent-dropdown').delegate('.item', 'click', function() {
			let text = $(this).text();
			console.log('click item:' + text);

			_hideRecents();
			_open_entry($(this).data('path'), $(this).data('key'));
		});

		$('.hw-recent-dropdown').delegate('.control-box', 'click', function() {
			_hideRecents();
		});
		
		$('.heel-web .main > .mainLeft > .matchItems').delegate('.item', 'click', function() {
			let text = $(this).text();
			console.log('click item:' + text);
			
			_addRecentByKey(text);
		});

		$('.mainLeft > div#listBox > ul.tm').delegate('a.tm-anchor.noExpand', 'click', function() {
			let id = $(this)[0].id;
			console.log('click item id:' + id);
			
			_addRecent(id);
		});
	};

	let _updateSearchBox = function(text, key) {
		console.log('select item:' + text);
		let searchbox = $('.heel-web .main > .mainLeft > .searchBox > .btn > input');

		_hidePinyin(); // 隐藏拼音菜单
		searchbox.val(text); // 利用菜单中文字替换查询框内文字。
		searchbox.focus();
		
		// 模拟一个left key,触发平台搜索菜单功能
		const event = new KeyboardEvent('keyup', {
			bubbles: true, 
			cancelable: true, 
			keyCode: 37
		});
		searchbox[0].dispatchEvent(event);
		
		setTimeout(() => {
			_selectItemInDefaultDropdown(key);
		}, 100);
	};

	let _selectItemInDefaultDropdown = function(key) {
		console.log('select item in default dropdown list:' + key);
		if (!$('.heel-web .main > .mainLeft >.matchItems').is(':visible')) { // default dropdown menu is invisible
			return;
		}
		let items = $('.heel-web .main > .mainLeft > .matchItems a');
		if (1 == items.length) {
			_addRecentByKey($(items[0]).text());
			_clickItemInDefaultDropdown(items[0]);
		} else if (typeof key == 'string') {
			for (let i = 0; i < items.length; i++) {
				if ($(items[i]).text() == key) { // 在默认搜寻结果中，寻找匹配菜单
					_addRecentByKey(key);
					_clickItemInDefaultDropdown(items[i]);					
				}
			}
		}
	};

	let _clickItemInDefaultDropdown = function(item) {
		// create
		let e = document.createEvent('MouseEvent');
		// initialize
		e.initMouseEvent('click', true, false);
		// trigger mouse click
		item.dispatchEvent(e);
	};

	let _isSelectKey = function(key) {
		// console.log('press key:' + key);
		let keys = {
			esc: 27,
			left: 37,
			up: 38,
			right: 39,
			down: 40,
			enter: 13
		};
		
		for (let item in keys) {
			if (keys[item] == key) {
				return true;
			}
		}
		
		return false;
	};	

	// pinyin routine //////////////////////////////////
	let _hidePinyin = function() {
		$('.hw-search-result-list').hide();
	};
	
	let _showPinyin = function(result) {
		// console.log('Pinyin result length:' + result.length);
		console.log('pinyin result:' + JSON.stringify(result));
		let list = $('.hw-search-result-list > ul');
		
		list.html(''); // clear
		for (let i = 0; i < result.length; i++){
			let li = $('<li></li>');
			let a = $('<a class="item">' + result[i] + '</a>');
			a.data('text', result[i]).appendTo(li);
			li.appendTo(list);
		}
		
		$('.hw-search-result-list').show();
		$(list.find('a')[0]).addClass('selected');
	};

	let _searchPinyin = function(text) {
		console.log('search pinyin:' + text);
		let t = text.trim().toLowerCase();
		let result = [];
		
		if (t.length > 0) { // not empty
			for (let i=0; i<_keyWords.length; i++) {
				if ((0 <= _keyWords[i].full.toLowerCase().indexOf(t)) 
					|| (0 <= _keyWords[i].camel.toLowerCase().indexOf(t))) { // 拼音匹配
					result[result.length] = _keyWords[i].text;
				}
			}
		}
		
		return result.sort();
	};

	let _selectPinyin = function(key) {
		if (!_isSelectKey(key)) { // 不是选择按钮
			return false;
		}
		
		if ((!$('.heel-web .main > .mainLeft > .hw-search-result-list').is(':visible')) 
			|| (0 >= $('.heel-web .main > .mainLeft > .hw-search-result-list a').length)) {
			return false;
		}

		// console.log('select in pinyin result list item');
		let items = $('.heel-web .main > .mainLeft > .hw-search-result-list a');
		let nextItemIndex = -1;
		for (let i = 0; i < items.length; i++){
			if (0 <= items[i].className.indexOf('selected')) {
				$(items[i]).removeClass('selected');
				if (40 == key) { // down
					nextItemIndex = (i + 1) % items.length;
				} else if (38 == key) { // up
					nextItemIndex = (i - 1) >= 0? i - 1: items.length - 1;					
				} else if (13 == key) { // enter
					_updateSearchBox($(items[i]).data('text'));				
				} else if (27 == key) { // escape
					_hidePinyin();
				} else {
					nextItemIndex = i;
				}
				break;
			}
		}
		$(items[nextItemIndex]).addClass('selected');
		
		return true;
	};

	// recents routine //////////////////////////////////
	let _initRecents = function() {
		console.log('Init recents');
		_recents = heelWeb.config.get('recents');
		_recents = 'undefined' == typeof _recents ? []: _recents;			
	};

	let _addRecentByKey = function(key) {
		console.log('Add recent by key:' + key);
		// Search menu list
		for (let i = 0; i < _menus.length; i++) {
			if (_menus[i].key == key) {
				// 增加访问记录
				_addRecent(_menus[i].id);
				break;
			}
		}		
	};
	
	let _addRecent = function(id) {
		console.log('Add recent:' + id);
		let recent = {};
		let found = false;
		let maxLength = 10;
		
		// match？
		for (let i=0; i<_menus.length; i++) {
			if (_menus[i].id == id) {
				found = true;
				recent = {
					time: myApi.time.formatTime(new Date()),
					id: id,
					menu: _menus[i].menu,
					parent: _menus[i].parent,
					path: _menus[i].path
				};
				break;
			}
		}
		
		// add
		if (found) {
			// 删除id相同的记录
			recents = _recents.filter((item, index) => {
				return item.id != recent.id 
			})
			_recents = recents

			_recents.unshift(recent); // 在头部插入访问记录
			_recents = _recents.slice(0, maxLength); // 取指定长度
			
			// update config
			heelWeb.config.set('recents', _recents);
			heelWeb.config.update();
		}
	};

	let _showRecents = function(words) {
		console.log('Show recents');
		let list = $('.hw-recent-dropdown > ul');
		
		if (0 == _recents.length) { // empty recent record list
			return;
		}

		if ($('.heel-web .main > .mainLeft > .hw-recent-dropdown').is(':visible')) { // already show
			return;
		}
		
		list.html(''); // clear
		for (let i = 0; i < _recents.length; i++){
			let title = _recents[i].menu + '(' + _recents[i].parent + ')';
			let path = _recents[i].path;
			let li = $('<li></li>');
			let a = $('<a class="item"><span class="time">' + _recents[i].time + '</span><span class="name">' + title + '</span></a>');
			a.data('text', _recents[i].menu).data('key', title).data('path', path).appendTo(li);
			li.appendTo(list);
		}
		
		$('.hw-recent-dropdown').show();
		$(list.find('a')[0]).addClass('selected');
	};
	
	let _hideRecents = function() {
		$('.hw-recent-dropdown').hide();
	};

	let _selectRecent = function(key) {
		if (!_isSelectKey(key)) { // 不是控制按钮
			return;
		}
		
		if ((!$('.heel-web .main > .mainLeft > .hw-recent-dropdown').is(':visible'))
			|| (0 >= $('.heel-web .main > .mainLeft > .hw-recent-dropdown a').length)) {
			return;
		}

		// console.log('select in recent list item');
		let items = $('.heel-web .main > .mainLeft > .hw-recent-dropdown a');
		let nextItemIndex = -1;
		for (let i = 0; i < items.length; i++){
			if (0 <= items[i].className.indexOf('selected')) {
				$(items[i]).removeClass('selected');
				if (40 == key) { // down
					nextItemIndex = (i + 1) % items.length;
				} else if (38 == key) { // up
					nextItemIndex = (i - 1) >= 0? i - 1: items.length - 1;					
				} else if (13 == key) { // enter
					_hideRecents();
					_open_entry($(items[i]).data('path'), $(items[i]).data('key'));
				} else if (27 == key) { // escape
					_hideRecents();					
				} else {
					nextItemIndex = i;
				}
				break;
			}
		}
		$(items[nextItemIndex]).addClass('selected');
	};
	
	// menu routine //////////////////////////////////
	let _listMenus = function() {
		console.log('list menu');
		let node = $('.heel-web > .main > .mainLeft ul.tm')[0];

		_keyWords = [];
		_menus = [];
		_listMenu(node);
	};

	let _listMenu = function(e, parent) {
		let nodes = $(e).children('li');
		
		// reach a end of a branch
		if (0 >= nodes.length ) {
			return;
		}
		
		// go through the list
		for(let i = 0; i < nodes.length; i++) {
			if (-1 == nodes[i].className.indexOf('tm-node')) { // not menu item
				continue;
			}
			
			let a = $(nodes[i]).children('a')[0];
			let text = $(a).children('span')[0].textContent;
			let path = $(nodes[i]).attr('path');
			if (0 <= a.className.indexOf('noExpand')) { // a menu function								
				_addKeyWord(text);
				_addMenu(a.id, text, parent, path);
			} else { // sub tree
				let uls = $(nodes[i]).children('ul');
				if (0 < uls.length) {
					_listMenu(uls[0], text);
				}
			}
		}		
	};
	
	let _addKeyWord = function(text) {
		let found = false;
		for(let i = 0; i < _keyWords.length; i++) {
			if (text == _keyWords[i].text) {
				found = true;
				break;
			}
		}
		
		if (!found) {
			_keyWords[_keyWords.length] = {
				text: text,
				full: myApi.pinyin.getFullChars(text),
				camel: myApi.pinyin.getCamelChars(text)
			};
		}			
	};

	let _addMenu = function(id, menu, parent, path) {
		if (menu && parent) {
			_menus[_menus.length] = {
				id: id,
				menu: menu,
				parent: parent,
				key: menu + '(' + parent + ')',
				path: path
			};
		} 
	};

	let _selectDefault = function(key, words) {
		if (13 != key) { // not enter
			return false;
		}
		
		if ('' == words) { // search words is empty
			return false
		}
		
		if ($('.heel-web .main > .mainLeft > .hw-search-result-list').is(':visible')) { // pinyin dropdown is visible
			return false;
		}
		
		if ($('.heel-web .main > .mainLeft > .hw-recent-dropdown').is(':visible')) { // recent visit list dropdown is visible
			return false;
		}
		
		if ($('.heel-web .main > .mainLeft > .matchItems').is(':visible')) { // default dropdown is visible
			return false;
		}
		
		// Selected item
		let selectedItem = $('.heel-web .main > .mainLeft > .matchItems li.hover > a');
		if (1 != selectedItem.length) {
			return;
		}
		
		// Add recent list
		let text = selectedItem[0].text;
		console.log('Selected default item:' + text);
		_addRecentByKey(text);
	};

	let _open_entry = function(path, key) {
		// Open menu entry
		UI && UI.BaseFuns && UI.BaseFuns.OpenEntry('OpenEntry', null, [path]);

		// Add recent list
		_addRecentByKey(key);
	};
	
	this.install = function(){
		console.log('Install main.search');

		setTimeout(() => {
			_initRecents();
			_listMenus();		
			_style();
			_event();
		}, 500);
	};
}());