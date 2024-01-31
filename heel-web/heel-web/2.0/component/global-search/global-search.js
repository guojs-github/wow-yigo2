/*
	heel-web component global search.
	2023.8.7 created by guojs.
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.global_search = (new function () {
	let _create = function() {
		let control = $('<div class="hw-global-search" title="全局搜索"> \
							<i class="fa-solid fa-magnifying-glass hw-scale hw-global-search-icon"/> \
						</div>');

		let create = () => {
			let el = $('.heel-web .nav > .navRight > .setting');

			if (el.length == 1) {
				el.after(control);	
			} else {
				setTimeout(create, 1000);
			}	
		};

		create();
	};

	let _event = function() {
		console.log('Global search event handler.');

		$('body').delegate('.hw-global-search .hw-global-search-icon', 'click', () => {
			console.log('Global search icon clicked.');
			let path = 'Common/System/GlobalSearchView';

			UI && UI.BaseFuns && UI.BaseFuns.OpenEntry('OpenEntry', null, [path]);
		});
	};

	let _init = function(){
		console.log('Create global search.');

		_create();
		_event();
	};

	_init();
}());


