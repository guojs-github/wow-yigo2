<%@page contentType="text/html;charset=UTF-8" language="java" %>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%
	SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	Date currentTime = new Date();//得到当前系统时间
	String now = formatter.format(currentTime); //将日期时间格式化
%>
<!doctype html>
<html>
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
		<title>2.0最佳实践</title>
		<link rel="shortcut icon" href="yesui/dist/css/default/images/logo-1.png">
		
		<script type="text/javascript" src="yesui/src/ui/allfile-src.js?v=20191126"></script>
		
		<script type="text/javascript" src="home/menutree.js?v=20191126" defer="defer"></script>
		<script type="text/javascript" src="home/navigation.js?v=20191126" defer="defer"></script>
		<script type="text/javascript" src="home/main.js?v=20191126" defer="defer"></script>
	</head>
	<body>
		<div class="nav"></div>
		<!-- 主体 -->
		<div class="main">
			<div class="mainLeft"></div>
		    <div class="mainMiddle"></div>
		    <div id="form" class="mainRight"></div>
		</div>

		<script type="text/javascript">
			$(function () {
				var nav = $(".nav").navigation();
				var container = new YIUIContainer($("#form"));
				var tree = $(".mainLeft").menuTree(container);

				var place_w = parseInt($("#form").css("padding-left")) + parseInt($("#form").css("padding-right")) + parseInt($("#form").css("margin-left")) + parseInt($("#form").css("margin-right"));
			    var resize = function() {
				    var place_h = parseInt($("#form").css("padding-top")) + parseInt($("#form").css("padding-bottom")) + parseInt($("#form").css("margin-top")) + parseInt($("#form").css("margin-bottom"));
				    $(".mainRight").width($(document.body).width() - $(".mainLeft").outerWidth() - $(".mainMiddle").outerWidth() - place_w);
				    $(".mainLeft,.mainMiddle,.main").height($(document.body).height() - $('.nav').height());
				    $(".mainRight").height($(document.body).height() - $('.nav').height() - place_h);
	    			tree.resetHeight();
	    			nav.resize();
			    };
			    resize();
			    
			    setTimeout(function() {
			    	nav.resize();
			    }, 0);

			    //移动条
			    var bool = false;
			    $('.mainMiddle').mousedown(function (event) {
			        bool = true;
					$('.mainLeft').append($("<div class='m-mask' />"));
					$(".mainRight").append($("<div class='m-mask' />"));
			    });
			    $('body').mouseup(function () {
			        bool = false;
					$('.mainLeft').children(".m-mask").remove();
					$('.mainRight').children(".m-mask").remove();
			    });
			    $(".main").mousemove(function (event) {
			        if (bool == true) {
			            var x = event.pageX;
			            if (x <= 175) {
			                x = 175;
			            }
			            if (($(document.body).width() - x) < 175) {
			                x = $(document.body).width() - 175;
			            }
			            $('.mainLeft').width(x).show();
			            $('.mainMiddle').css({left: x});
			            $('.mainLeft').width(x);
			            var $s_btn = $('.mainLeft .searchBox .search');
			            var $s_txt = $('.mainLeft .searchBox .searchtext');
			            $s_txt.width(x - $s_btn.width() - 20);
			            $('.mainRight').width($(document.body).width() - x - $(".mainMiddle").outerWidth() - place_w);
			            $('.matchItems').width($('.searchtext').width());
			            container.doLayout($(".mainRight").width(), $(".mainRight").height());
			        }
			    });
			    $(window).resize(function () {
			        resize();
			        container.doLayout($(".mainRight").width(), $(".mainRight").height());
			    });

				YIUI.LoadingUtil.initEl();

				if( $.browser.isIE ) {
					window.onbeforeunload = function(e){

						var e = e || window.event;

						var n = e.screenX - window.screenLeft;
						var b = n > document.documentElement.scrollWidth - 20;
						if(b && e.clientY < 0 || e.altKey) { // IE专用判断
							var paras = {
								async:false
							};
							Svr.SvrMgr.doLogout(paras,function(){
								$.cookie("clientID", null);
								$.cookie("oldURL",null);
							});
						}
					}
				} else {

					var _beforeUnload_time = 0,_gap_time = 0;

					window.onbeforeunload = function(){
						_beforeUnload_time = new Date().getTime();
					}

					window.onunload = function(){
						_gap_time = new Date().getTime() - _beforeUnload_time;

						console.log(_gap_time);

						if( _gap_time < 3 ) { // Chrome判断方法,关闭时不访问服务,事件间隔很小
							var paras = {
								async:false
							};
							Svr.SvrMgr.doLogout(paras,function(){
								$.cookie("clientID", null);
								$.cookie("oldURL",null);
							});
						} else {
							console.log("浏览器刷新...");
						}
					};

					// 火狐浏览器关闭时不触发onunload事件,onbeforeunload无法判断出刷新还是关闭,不支持此功能

				}

			});
		</script>
		<script type="text/javascript" src="heel-web/include-main.js?v=<%=now%>"></script>
	</body>
</html>
