var plug_in = {
		IMAGE_HEIGHT : "显示框的宽不能小于头像框，高至少大于头像框高50px",
		IMAGE_FILEERROR : "选择文件错误,图片类型必须是",
		IMAGE_BILDERTYPE : "中的一种",
		RICHEDITOR_TEST : "检测到页面没有引用jQuery，请先引用，否则wangEditor将无法使用。",
		RICHEDITOR_CANNOT : "检测到 window.jQuery 已被修改，wangEditor无法使用。",
		RICHEDITOR_ARIAL : '宋体',
		RICHEDITOR_BLACKBODY : '黑体',
		RICHEDITOR_REGULARSCRIPT : '楷体',
		RICHEDITOR_OFFICIALSCRIPT : '隶书',
		RICHEDITOR_YOUYUAN : '幼圆',
		RICHEDITOR_MICROSOFTYAHEI : '微软雅黑', 
		RICHEDITOR_MARROON : '暗红色',
		RICHEDITOR_PURPLE : '紫色',
		RICHEDITOR_RED : '红色',
		RICHEDITOR_BRIGHTPINK : '鲜粉色',
		RICHEDITOR_MAZARINE : '深蓝色',
		RICHEDITOR_BLUE : '蓝色',
		RICHEDITOR_LAKEBLUE : '湖蓝色',
		RICHEDITOR_BLUSHGREEN : '蓝绿色',
		RICHEDITOR_GREEN : '绿色',
		RICHEDITOR_OLIVE : '橄榄色',
		RICHEDITOR_RESEDA : '浅绿色',
		RICHEDITOR_AURANTIUS : '橙黄色',
		RICHEDITOR_GRAY : '灰色',
		RICHEDITOR_SILVER : '银色',
		RICHEDITOR_BLACK : '黑色',
		RICHEDITOR_WHITE : '白色',
		RICHEDITOR_INSERTEXPRESSION : "实际项目中，表情图标要配置到自己的服务器（速度快），也可配置多组表情，请查阅文档。\n\n\n【该弹出框在实际项目中不会出现】",
		RICHEDITOR_INSERTIMAGE: "实际项目中，可查阅配置文件，如何配置上传本地图片（支持跨域）\n\n\n【该弹出框在实际项目中不会出现】",
		RICHEDITOR_INSERTCODE : "实际项目中，可配置高亮代码，请查阅文档\n\n\n【该弹出框在实际项目中不会出现】",
		RICHEDITOR_INSERTPICTURE : "插入本地图片",
		RICHEDITOR_INSERT : '插入',
		RICHEDITOR_SUBMIT : '提交',
		RICHEDITOR_UPDATE : '更新',
		RICHEDITOR_CANCEL : '取消',
		RICHEDITOR_CLOSE : '关闭',
		RICHEDITOR_UPLOAD : '上传',
		RICHEDITOR_UNSAFEALERT : '输入的内容不安全，请重新输入！',
		RICHEDITOR_FORMATERROR : '输入的内容格式错误，请重新输入！',
		RICHEDITOR_UNCHECKED : '未选中编辑区，无法执行操作',
		RICHEDITOR_PROMPT : 'wangEditor提示：请使用textarea扩展富文本框。',
		RICHEDITOR_EVENT : '针对一个textarea不能执行两遍wangEditor()事件'
		
};

var YIUI = YIUI || {};
if(YIUI.I18N) {
	YIUI.I18N = $.extend(YIUI.I18N, plug_in);
}else {
	YIUI.I18N = plug_in;
}