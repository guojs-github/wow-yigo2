/**
	Yigo2.0 主窗口补充脚本
	2022.11.11 GuoJS
**/
$(function () {	
	console.log('Heal Web main part loading.');	
	
	interface();
	events();
	timer();
});

function interface() {
	console.log('Initialize interface.');

	$('body').addClass('heel-web');
	heelWeb.config.load();
	heelWeb.main.head.install();
	heelWeb.main.tabs.install();
	heelWeb.main.search.install();
};

function events() {
	console.log('Initialize events.');

	$('body').delegate('a.tbr-btn', 'click', (e) => {
		console.log('Click toolbar button.(x=' + e.pageX + ',y=' + e.pageY + ')');

		myApi.display.tricks.play_water_ripple({
			x: e.pageX,
			y: e.pageY
		});	
	});
};

function timer() {
	console.log('Initialize timers.');
	let header = $('.heel-web div.nav');
	let main = $('.heel-web div.main');

	setInterval(() => {
		if ($('.dialog-mask').is(':visible')) { // 有对话框弹出？
			if (header.hasClass('myApi-glass') == false) {
				header.addClass('myApi-glass')
			}
			if (main.hasClass('myApi-glass') == false) {
				main.addClass('myApi-glass')
			}
		} else { // 对话框隐藏
			if (header.hasClass('myApi-glass')) {
				header.removeClass('myApi-glass')
			}
			if (main.hasClass('myApi-glass')) {
				main.removeClass('myApi-glass')
			}
		}
	}, 500);
};