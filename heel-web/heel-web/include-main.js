/**
	主界面导入所有heel-web外部文件
	2022.11.11 GuoJS 创建
*/
(function () {
	var now = new Date();	
	var version = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	var vStatic = '?v=202210241652';
	var vDynamic = '?v=' + version;
	var root = "heel-web/";

	var file = "<link rel='stylesheet' href='" + root + "common/css/myApi.min.css" + vDynamic + "'/>"
		+ "<link rel='stylesheet' href='" + root + "2.0/css/index.css" + vDynamic + "'/>"
		+ "<link rel='stylesheet' href='" + root + "2.0/css/main.css" + vDynamic + "'/>"
		+ "<script type='text/javascript' src='" + root + "common/js/myApi.min.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "common/js/keys.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "common/js/array.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "common/plugin/Sortable/1.8.3/Sortable.min.js" + vStatic + "'></script>" 
		+ "<script type='text/javascript' src='" + root + "common/plugin/font-awesome/6.2.1/js/all.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/common/misc.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/js/config.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/js/main-head.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/js/main-tabs.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/js/main-search.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/js/main.js" + vStatic + "'></script>"
		+ "<script type='text/javascript' src='" + root + "2.0/component/include.js" + vStatic + "'></script>";
				
	document.write(file);	
}());