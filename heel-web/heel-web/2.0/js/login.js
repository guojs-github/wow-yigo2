/**
	Yigo2.0 登录窗口补充脚本
	2022.10.24 GuoJS
**/
$(function () {	
	console.log('Heal Web login part loading.');
	
	interface();
	events();
	timer();
	show();
});

function interface() {
	console.log('Initialize interface.');

	$('body').addClass('heel-web');
	// $('div.login-loginbox').addClass('myApi-box-shadow');
	$('div.login-loginbox > .login-strip > input').addClass('hw-focus-scale');
	$('div.login-button').addClass('hw-focus-scale');
	
	interfaceLoginBox();
};

function interfaceLoginBox() {
	console.log('Initialize interface login box.');
	var inputUserName = $('.heel-web input.login-username');
	var inputPassword = $('.heel-web input.login-password');

	inputUserName.attr('placeholder', '请输入用户');
	inputPassword.attr('placeholder', '请输入密码');

	// add a nail to the login button
	let nail = $('<i class="fa-solid fa-circle-xmark nail"></i>');
	nail.appendTo($('div.login-loginbox'));
};

function events() {
	console.log('Initialize events handler.');

	// 接管输入回车事件
	$('.heel-web input').unbind();
	// 按键事件处理
	$('.heel-web input').keyup(function(e) {
		if (e.keyCode == 13) { // Enter
			console.log('Input box accept enter key.');

			if (is_input(this, 'login-username')) {
				$('.heel-web input.login-password').focus();
			} else if (is_input(this, 'login-password')) {
				$('.login-button').focus().click();
			}
		}
	});	

	// 获取焦点
	$('.heel-web input').focus(function(e) {
		$(this).select();
	});	
	
	// 接管登录按钮事件
	loginHandler = $._data(document.getElementsByClassName('login-button')[0],'events').click[0].handler;
	$('.heel-web .login-button').unbind();
	$('.heel-web .login-button').click(function(e) {
		// 调用原有处理程序
		loginHandler();	

		// 延迟捕获对话框的事件
		setTimeout(() => {
			let close_buttons = $('#error_dialog .dialog-close,.dialog-button.close');
			if (close_buttons.length > 0) {
				close_buttons.click(() => {
					console.log('On close dialog');
					$('.heel-web input.login-username').focus();
				})
			}
		}, 500);

		myApi.display.tricks.play_water_ripple({
			x: e.pageX,
			y: e.pageY
		});			
	});
};

function timer() {
	console.log('Initialize timers.');
	let header = $('.heel-web div.header');
	let main = $('.heel-web div.login-main');

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

function show() {
	console.log('It\'s show time.');
	var inputUserName = $('.heel-web input.login-username');
	var inputPassword = $('.heel-web input.login-password');

	// 防止浏览器自动填写
	inputUserName.attr('disabled', 'true'); 
	inputPassword.attr('disabled', 'true');

	// 标题
	$('.heel-web div.login-main').hide();
	myApi.display.tricks.play({
		domEl: '.heel-web div.header', 
		styleName: 'heel-web-drop-in',
		callback: function() {
			// 主区域
			$('.heel-web div.login-main').show();
			myApi.display.tricks.play({
				domEl: '.heel-web div.login-main', 
				styleName: 'heel-web-drop-in',
			});

			// 登录窗口
			myApi.display.tricks.play({
				domEl: '.heel-web div.login-loginbox', 
				styleName: 'heel-web-flip-in-login', 
				callback: function() {
					console.log('Loginbox tricks end');
				
					// 开放编辑
					inputUserName.removeAttr('disabled'); 
					inputPassword.removeAttr('disabled');
				
					// 从用户名开始输入
					inputUserName.focus().select(); 
					
					// 去除可能出现的平台遮罩层
					$('.dialog-mask').hide();
				}, 
				timeout: 1200
			});			
		}
	});
};

function hide(callback) {
	console.log('It\'s over time.');

	// 标题
	myApi.display.tricks.play({
		domEl: '.heel-web div.header', 
		styleName: 'heel-web-drop-out',
		keepStyle: false,
		callback: function() {
			// 主区域
			myApi.display.tricks.play({
				domEl: '.heel-web div.login-main', 
				styleName: 'heel-web-drop-out',
				keepStyle: true,
				callback: function() {
					if (typeof callback == 'function') {
						callback();
					}
				}
			});
		}
	});
};

function is_input(el, key) { // 判断是否某个控件
	if (typeof key != 'string') return false;
	if (key.trim().length <= 0) return false;

	if (el && $(el)[0].className.indexOf(key) >= 0) {
		return true;
	}

	return false;
};