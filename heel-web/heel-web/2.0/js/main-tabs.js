/*
	main tabs routines.
	2022.11.11 GuoJS created.
*/
var heelWeb = heelWeb || {};
heelWeb.main = heelWeb.main || {};
heelWeb.main.tabs = (new function(){
	let _enable_sortable = function() {
		let tabs = $('ul.ui-tabs-nav');	
		if (tabs.length == 1) { // 找到了
			Sortable.create(tabs[0], {
				animation: 150
			}); 
		};
	};

	this.install = function() {
		console.log('Install main.tabs.');

		_enable_sortable();
	};
}());

