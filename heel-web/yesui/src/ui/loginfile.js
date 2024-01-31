/**
 * 此文件中仅包含对jQuery的扩展
 */
(function () {
	var v = '?v=20191126';
	var root = "yesui/dist/";

	var getCookie = function(key){
		var arr,reg = new RegExp("(^| )"+key+"=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg)){
			return unescape(arr[2]);
		}
		return null;
	}
	
	window.getLang = function () {
		var local = (navigator.language || navigator.userLanguage).toLowerCase();
		var idx = local.indexOf("-");
		return local.substring(0,idx) + "-" + local.substring(idx + 1).toUpperCase();
    }

	var myStyle = getCookie("myStyle") || 'default';
	
	var local = getCookie("locale") || getLang();

    // 设置到cookie
    document.cookie = "locale=" + local;

	//IE 下兼容console
	if(/msie/.test(navigator.userAgent.toLowerCase()) || /rv:([\d.]+)\) like gecko/.test(navigator.userAgent.toLowerCase())){
		document.write("<script type='text/javascript' src='"+root+"js/fauxconsole.js"+v+"'></script>");
	}

	var file = "<link rel='stylesheet' href='"+root+"css/plugin/modaldialog/css/jquery.modaldialog.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/scrollbar/scrollbar.css"+v+"' />" +
				
				"<link rel='stylesheet' href='"+root+"css/"+myStyle+"/login.css"+v+"' />" +
				
				"<script type='text/javascript' src='"+root+"js/yigo-base.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"js/yigo-parser.js"+v+"'></script>" +
				//"<script type='text/javascript' src='"+root+"ui/yigo-ui.js"+v+"'></script>" +
				//"<script type='text/javascript' src='"+root+"ui/yigo-plugin.js"+v+"'></script>" +

				"<script type='text/javascript' src='"+root+"js/language/i18n.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/language/"+local+"/i18N.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/language/"+local+"/plug-in.js"+v+"' defer='defer'></script>"+
				"<script type='text/javascript' src='"+root+"js/exception/bpm/"+local+"/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/exception/view/"+local+"/stringtable.js"+v+"' defer='defer'></script>";
				
	document.write(file);
}());
