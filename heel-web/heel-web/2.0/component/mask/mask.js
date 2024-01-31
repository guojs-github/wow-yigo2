/*
	heel-web component mask.
	2023.3.28 GuoJS Created
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.mask = (new (function (){
	let _el = $('<div class="hw-mask"></div>');
	$('body').append(_el);
		
	this.hide = function() {
		_el.hide();
	};
	
	this.show = function() {
		_el.show();
	};
	
	this.hide();
})());