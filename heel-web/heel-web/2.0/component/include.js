/**
	主界面导入所有heel-web外部文件
	2023.3.28 created by guojs
	2023.4.6 add upload by guojs
*/
(function () {
	var now = new Date();	
	var version = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	var vDynamic = '?v=' + version;
	var vStatic = '?v=202303281551';
	var root = 'heel-web/';

	var file = '<link rel="stylesheet" href="' + root + '2.0/component/index.css' + vDynamic + '"/>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/mask/mask.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/dialog/dialog.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/dialog/msgbox/msgbox.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/dialog/upload/upload.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/dialog/preview-pic/preview-pic.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/global-search/global-search.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/grid/dialog-grid-layout.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/hint/hint.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/hint/input-hint.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/listview/listview-user-style.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/user-condition/user-condition.js' + vStatic + '"></script>'
		+ '<script type="text/javascript" src="' + root + '2.0/component/combobox/yescombobox-recent.js' + vStatic + '"></script>';
				
	document.write(file);	
}());