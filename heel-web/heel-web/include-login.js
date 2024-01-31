/**
	登录界面导入所有heel-web外部文件
	2022.10.24 GuoJS 创建
	2022.11.11 GuoJS 修改名称，专用于登录界面
**/
(function () {
	var now = new Date();	
	var version = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	var vStatic = '?v=202210241652';
	var vDynamic = '?v=' + version;
	var root = "heel-web/";

	var file = "<link rel='stylesheet' href='" + root + "common/css/myApi.min.css" + vDynamic + "'/>" +
				"<link rel='stylesheet' href='" + root + "2.0/css/index.css" + vDynamic + "'/>" +				
				"<link rel='stylesheet' href='" + root + "2.0/css/login.css" + vDynamic + "'/>" +
				"<script type='text/javascript' src='" + root + "common/js/myApi.min.js" + vStatic + "'></script>" +
				"<script type='text/javascript' src='" + root + "common/js/keys.js" + vStatic + "'></script>" +
				"<script type='text/javascript' src='" + root + "common/js/array.js" + vStatic + "'></script>" +
				"<script type='text/javascript' src='" + root + "common/plugin/font-awesome/6.2.1/js/all.js" + vStatic + "'></script>" +
				"<script type='text/javascript' src='" + root + "2.0/js/login.js" + vStatic + "'></script>";
				
	document.write(file);	
}());