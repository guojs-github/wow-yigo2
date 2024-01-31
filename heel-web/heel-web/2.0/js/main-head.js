/*
	main head routines.
	2022.11.16 GuoJS created.
*/
var heelWeb = heelWeb || {};
heelWeb.main = heelWeb.main || {};
heelWeb.main.head = (new function () {
	let _logo = function() {
		$('.heel-web > .nav .logo-text').addClass('heel-web-main-head-font-color heel-web-main-head-font-family');
	};
	
	let _userName = function() {
		$('.heel-web > .nav .login_username').addClass('heel-web-main-head-font-color heel-web-main-head-font-family');			
	};

	let _menuButton = function() {
		// Setting
		$('.heel-web > .nav > .navRight .nav-field-box.setting > .nav-field-btn')[0].innerHTML
			= '<i class="fa-solid fa-gear hw-def-button-color hw-scale-rotate"></i>';
		$('.heel-web > .nav > .navRight .nav-field-box.setting').attr('title', '设置');
		// User
		$('.heel-web > .nav > .navRight .nav-field-box.user > .nav-field-btn')[0].innerHTML 
			= '<i class="fa-solid fa-user hw-def-button-color hw-scale"></i>';
		$('.heel-web > .nav > .navRight .nav-field-box.user').attr('title', '用户');
	};

	let _menu = function(style) {
		// setting
		let menu = $(style);
		let button_old = $(style + ' > .nav-field-btn');
		let button_new = button_old.clone(); button_new.removeClass('nav-field-btn'); button_new.addClass('hw-nav-field-btn');
		let dropdown = $(style + ' > .nav-field-content');
		
		// Disable events
		dropdown.removeClass();
		dropdown.addClass('hw-nav-dropdown-menu');			
		
		// Bind new events
		let hideDropdown = () => {
			if (!dropdown.is(':visible')) { 
				return;
			}
			
			myApi.display.tricks.play({
				domEl: style + ' > .hw-nav-dropdown-menu', 
				styleName: 'heel-web-drop-out',
				callback: () => {
					dropdown.hide();
				}
			});					
		};

		button_new.click(function() {
			console.log('click dropdown menu button');

			$(this).next().show();
		});
		
		menu.mouseleave(() => {
			console.log('mouse leave menu.');

			hideDropdown();
		});
		
		// Remove exit dropdown menu
		let menuExit = $('.nav-field-list li.nav-field-items > a.exit:parent');
		menuExit.parent('li').hide();

		// Replace old button with new button
		button_new.insertBefore(button_old);
		button_old.remove();		
	};

	this.install = function() {
		console.log('Install main.head.');
		
		_logo();
		_userName();
		_menuButton();
		_menu('.heel-web > .nav > .navRight .nav-field-box.setting');
		_menu('.heel-web > .nav > .navRight .nav-field-box.user');
	};
}());


