(function () {
	var v = '?v=20191126';
	var root = "yesui/src/";
	
	var getCookie = function(key){
		var arr,reg = new RegExp("(^| )"+key+"=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg)){
			return unescape(arr[2]);
		}
		return null;
	}

	var myStyle = getCookie("myStyle");
	if(!myStyle){
		myStyle = 'default';
	}

    window.cssPath = root + "ui/res/css/" + myStyle;

	var local = getCookie("locale");
	if(!local){
		local = 'zh-CN';
	}
	
	//IE 下兼容console
	if(/msie/.test(navigator.userAgent.toLowerCase()) || /rv:([\d.]+)\) like gecko/.test(navigator.userAgent.toLowerCase())){
		document.write("<script type='text/javascript' src='"+root+"ui/plugin/js/fauxconsole/fauxconsole.js"+v+"'></script>");
	}

	var file = "<link rel='stylesheet' href='"+root+"ui/plugin/css/fullcalendar/fullcalendar.css"+v+"'>" + 
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/fullcalendar/fullcalendar.css"+v+"'>" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/bootstrap/bootstrap.css"+v+"'>" +
				// "<link rel='stylesheet' href='"+root+"ui/plugin/css/datepicker/css/datepicker.css"+v+"'/>" +
				"<link rel='stylesheet' href='heel-web/2.0/component/datetime/datepicker.css" + v + "'/>" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/smartspin/smartspinner.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/modaldialog/css/jquery.modaldialog.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/paginationjs/pagination.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/wangEditor/wangEditor-1.4.0.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/treetable/stylesheets/jquery.treetable.theme.default.css"+v+"' />" +
				"<link rel='stylesheet' href='"+root+"ui/plugin/css/scrollbar/scrollbar.css"+v+"' />" +
				
				"<link rel='stylesheet' href='"+root+"ui/res/css/"+myStyle+"/main.css"+v+"'>" +
				"<link rel='stylesheet' href='"+root+"ui/res/css/"+myStyle+"/core.css"+v+"'>" +
				"<link rel='stylesheet' href='"+root+"ui/res/css/"+myStyle+"/grid.css"+v+"'>" +
				
//				"<script type='text/javascript' src='"+root+"common/jquery/jquery-3.1.1.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"common/jquery/jquery-1.10.2.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"common/jquery/jstz-1.0.4.min.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"common/ext/jsext.js"+v+"'></script>" +

				"<script type='text/javascript' src='"+root+"ui/yes-ui.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"common/data/yiuiconsts.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/data/itemdata.js"+v+"' defer='defer'></script>" + 

				"<script type='text/javascript' src='"+root+"ui/language/i18n.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/language/"+local+"/i18N.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/language/"+local+"/plug-in.js"+v+"' defer='defer'></script>" +
				
			
				"<script type='text/javascript' src='"+root+"common/cache/lru/lrucache.js"+v+"' defer='defer'></script>" +
				//"<script type='text/javascript' src='"+root+"common/cache/dict/dictlrucache.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/cache/indexeddb/indexeddbproxy.js"+v+"' defer='defer'></script>" +
				//"<script type='text/javascript' src='"+root+"common/cache/dict/dictindexeddb.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"base/datacache.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/dictcacheproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/docserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/metaserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/remoteserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/rightsserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/bpmserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/datamapserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/printserviceproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/service/base64imageserviceproxy.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"common/data/datatype.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"common/exception/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/coreexception.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/view/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/view/viewexception.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/view/"+local+"/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/bpm/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/bpm/bpmexception.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/exception/bpm/"+local+"/stringtable.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"base/jQueryExt.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"base/prototypeExt.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/request.js"+v+"'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/svrmgr.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"common/expr/parser.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/expr/valimpl.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/expr/exprutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/expr/funimplmap.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/datautil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/printgridutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/headinfoutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/numericutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/typeconvertor.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"common/util/gridlookuputil.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"common/util/subdetailutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/yesjsonutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"common/util/totalrowcountutil.js"+v+"' defer='defer'></script>" +


				"<script type='text/javascript' src='"+root+"svr/purehandler.js"+v+"' defer='defer'></script>" +
				// "<script type='text/javascript' src='"+root+"svr/handler/basehandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/server/handler/basehandler.js"+v+"' defer='defer'></script>" + 

				"<script type='text/javascript' src='"+root+"svr/handler/attachmenthandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/buttonhandler.js"+v+"' defer='defer'></script>" +
        		"<script type='text/javascript' src='"+root+"svr/handler/textbuttonhandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/comboboxhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/checkboxhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/dicthandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/datepickerhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/dropdownbuttonhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/gridhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/hyperlinkhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/imagehandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/listviewhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/listlayoutviewhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/numbereditorhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/passwordeditorhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/radiobuttonhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/splitbuttonhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/searchboxhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/textareahandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/texteditorhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/toolbarhandler.js"+v+"' defer='defer'></script>" + 
				//"<script type='text/javascript' src='"+root+"svr/handler/treehandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/dialoghandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/dictviewhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/filechooserhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/mapdrawhandler.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/handler/richeditorhandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/stepeditorhandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/iconhandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/imagelisthandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/timepickerhandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/monthpickerhandler.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/handler/uploadbuttonhandler.js"+v+"' defer='defer'></script>" +
				
				"<script type='text/javascript' src='"+root+"svr/behavior/basebehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/buttonbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/checkboxbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/comboboxbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/checklistboxbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/datepickerbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/dictbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/gridbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/hyperlinkbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/imagebehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/listviewbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/numbereditorbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/radiobuttonbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/splitbuttonbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/searchboxbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/textareabehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/texteditorbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/utcdatepickerbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/richeditorbehavior.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/behavior/stepeditorbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/monthpickerbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/timepickerbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/iconbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/imagelistbehavior.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/behavior/uploadbuttonbehavior.js"+v+"' defer='defer'></script>" +
				
				"<script type='text/javascript' src='"+root+"svr/format/dateformat.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/format/utcdateformat.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/format/decimalformat.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"svr/format/numberformat.js"+v+"' defer='defer'></script>" +
        		"<script type='text/javascript' src='"+root+"svr/format/textformat.js"+v+"' defer='defer'></script>" +
        		"<script type='text/javascript' src='"+root+"svr/format/timeformat.js"+v+"' defer='defer'></script>" +
				
				"<script type='text/javascript' src='"+root+"svr/service/dictserviceproxy.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/Base64Utils.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/uiutils.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"svr/batchutils.js"+v+"' defer='defer'></script>" + 
			    

			   	"<script type='text/javascript' src='"+root+"ui/util/viewutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/util/fileutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/util/rightsutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/util/loadingutil.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/util/suggestutil.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"ui/filtermap.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/opt.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/showdata.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/vparser.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/fun/basefun.js"+v+"' defer='defer'></script>" + 
		        "<script type='text/javascript' src='"+root+"ui/objectloop.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/vcontext.js"+v+"' defer='defer'></script>" +
				
				"<script type='text/javascript' src='"+root+"ui/workiteminfo.js"+v+"' defer='defer'></script>" + 
		        "<script type='text/javascript' src='"+root+"ui/statusproxy.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/abstractuiprocess.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"ui/process/uienableprocess.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/process/uicalcprocess.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/process/uicheckruleprocess.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/process/uivisibleprocess.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/process/uidependencyprocess.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/process/uiparaprocess.js"+v+"' defer='defer'></script>" +
				
				
				
				"<script type='text/javascript' src='"+root+"ui/bpm/inplacetoolbar.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/bpm/bpminplacetoolbar.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/bpm/loadworkiteminplacetoolbar.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/bpm/batchoperationinplacetoolbar.js"+v+"' defer='defer'></script>" +
				

				"<script type='text/javascript' src='"+root+"ui/headinfos.js"+v+"' defer='defer'></script>" +

				"<script type='text/javascript' src='"+root+"ui/uiprocess.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/process/viewdatamonitor.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/paras.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/ppobject.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/formstack.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/form.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/appenv.js"+v+"' defer='defer'></script>" + 
		        "<script type='text/javascript' src='"+root+"ui/focuspolicy.js"+v+"' defer='defer'></script>" + 
			    "<script type='text/javascript' src='"+root+"ui/formadapt.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/formbuilder.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/appdef.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/error.js"+v+"' defer='defer'></script>" + 
				
				"<script type='text/javascript' src='"+root+"ui/printpreview.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/positionutil.js"+v+"' defer='defer'></script>" +
				
				"<script type='text/javascript' src='"+root+"ui/builder/yiuibuilder.js"+v+"' defer='defer'></script>" + 

				//工具类 供他人直接渲染单据
				//"<script type='text/javascript' src='"+root+"svr/formutils.js"+v+"' defer='defer'></script>" + 
				//"<script type='text/javascript' src='"+root+"ui/formRender.js"+v+"' defer='defer'></script>" + 

                //组件
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesbutton.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yeshyperlink.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesimage.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yestextarea.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yestexteditor.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yeslabel.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yesnumbereditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/input/yesnumbereditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yescheckbox.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yesdict.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/dict/yesdict.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yesdatepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/yesdatepicker.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yescombobox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/combobox/yescombobox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesdialog.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesstepeditor.js"+v+"' defer='defer'></script>" +
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yesmonthpicker.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/yesmonthpicker.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yestimepicker.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/yestimepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yeschaindict.js"+v+"' defer='defer'></script>" +
				// "<script type='text/javascript' src='"+root+"ui/yescomponent/yesbasedict.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/dict/yesbasedict.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesicon.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesimagelist.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/yescomponent/yesuploadbutton.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/component/componentmgr.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/component.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/conditionparas.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/control.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/toolbar.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/treemenubar.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/databinding.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/button.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/richeditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/buttongroup.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/dropdownbutton.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/splitbutton.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/calendar.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/component/control/checkbox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/input/checkbox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/combobox.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/component/control/datepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/datepicker_control.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/dict.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/dicttree.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/dictview.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/dictquerypanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/hyperlink.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/imagelist.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/label.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/component/control/listview.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/listview/listview.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/listlayoutview.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/numbereditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/image.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/radiobutton.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/texteditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/textarea.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/textbutton.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/statusbar.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/treeview.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/passwordeditor.js"+v+"' defer='defer'></script>" + 
				//"<script type='text/javascript' src='"+root+"ui/component/control/tree.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/attachment.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/separator.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/chart.js"+v+"' defer='defer'></script>" + 
		        "<script type='text/javascript' src='"+root+"ui/component/control/bpmgraph.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/custom.js"+v+"' defer='defer'></script>" + 
                "<script type='text/javascript' src='"+root+"ui/component/control/flatcanvas.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/component/control/userinfopane.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/rightsset.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/dialog.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/filechooser.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/mapdraw.js"+v+"' defer='defer'></script>" + 
				// "<script type='text/javascript' src='"+root+"ui/component/control/utcdatepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/utcdatepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/searchbox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/webbrowser.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/control/stepeditor.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/component/control/gantt.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/component/control/uploadbutton.js"+v+"' defer='defer'></script>" + 
                
                // "<script type='text/javascript' src='"+root+"ui/component/control/monthpicker.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/monthpicker.js"+v+"' defer='defer'></script>" + 
                // "<script type='text/javascript' src='"+root+"ui/component/control/timepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/timepicker.js"+v+"' defer='defer'></script>" + 
                "<script type='text/javascript' src='"+root+"ui/component/control/icon.js"+v+"' defer='defer'></script>" + 
                
                "<script type='text/javascript' src='"+root+"ui/component/grid/gridsumutil.js"+v+"' defer='defer'></script>" +
                // "<script type='text/javascript' src='"+root+"ui/component/grid/grid.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/grid/grid.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='heel-web/2.0/component/grid/grid-user-style.js"+v+"' defer='defer'></script>" + 
                "<script type='text/javascript' src='"+root+"ui/component/grid/griddef.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/component/grid/columnexpand.js"+v+"' defer='defer'></script>" +
        		"<script type='text/javascript' src='"+root+"ui/component/grid/cellexpand.js"+v+"' defer='defer'></script>" +
        		"<script type='text/javascript' src='"+root+"ui/component/grid/rowareaexpand.js"+v+"' defer='defer'></script>" +
        		"<script type='text/javascript' src='"+root+"ui/component/grid/showgriddata.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/component/grid/gridutil.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/component/grid/rowgroup.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celleditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celltextarea.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celltexteditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellnumbereditor.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celldatepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellutcdatepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellcombobox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celldict.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celldynamicdict.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellimage.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celltextbutton.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellmonthpicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celltimepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellicon.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/cellimagelist.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/grid/editor/celluploadbutton.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/component/layout/autolayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/borderlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/columnlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/fluidcolumnlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/gridlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/tablayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/tab.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/splitlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/flexflowlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/flowlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/tablelayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/fluidtablelayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/wizardlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/customlayout.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/layout/flexbox.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/panel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/borderlayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/columnlayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/flowlayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/flexflowlayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/fluidcolumnlayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/fluidtablelayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/gridlayoutpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/splitpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/tabpanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/tabpanelex.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/treepanel.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/tabcontainer.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/tabexcontainer.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/stackcontainer.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/component/panel/wizardpanel.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/component/panel/customlayoutpanel.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/component/panel/flexboxpanel.js"+v+"' defer='defer'></script>" +

        		"<script type='text/javascript' src='"+root+"ui/maincontainer.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"ui/maintree.js"+v+"'></script>" + 
				
                "<script type='text/javascript' src='"+root+"ui/plugin/js/print/jquery.printarea.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/raphael-src.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/jquery.cookie.js"+v+"' defer='defer'></script>" +
				// "<script type='text/javascript' src='"+root+"ui/plugin/js/datepicker/datetimemask/dateTimeMask.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/dateTimeMask.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/plugin/js/jquery.json-2.3.min.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/ygrid/ygrid.locale-cn.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/ygrid/jquery.yGrid.src.js"+v+"' defer='defer'></script>" +
				//"<script type='text/javascript' src='"+root+"ui/plugin/js/decimal/decimal.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/decimal/bignumber.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/picture/ajaxfileupload.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/ui-extend/jquery.placeholder.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/ui-extend/jquery.ui.treeTable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/lib/bean-min.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/lib/underscore-min.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Flotr.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/DefaultOptions.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Color.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Date.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/DOM.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/EventAdapter.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Text.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Graph.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Axis.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Series.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/Series.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/lines.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/bars.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/points.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/pie.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/candles.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/markers.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/radar.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/bubbles.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/gantt.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/types/timeline.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/download.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/selection.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/spreadsheet.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/grid.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/hit.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/crosshair.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/labels.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/legend.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/flotr/js/plugins/titles.js"+v+"' defer='defer'></script>" +
				// "<script type='text/javascript' src='"+root+"ui/plugin/js/datepicker/js/datepicker.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='heel-web/2.0/component/datetime/datepicker.js"+v+"' defer='defer'></script>" + 
				"<script type='text/javascript' src='"+root+"ui/plugin/js/datepicker/js/monthpicker.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/smartspin/smartspinner.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/modaldialog/js/resize.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/modaldialog/js/modaldialog.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/paginationjs/pagination.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/wangEditor/wangEditor-1.4.0.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/picture/jquery_photoCut.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/treetable/jquery.treetable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/pdf/pdfobject.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/throttle-debounce/jquery.ba-throttle-debounce.min.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/scrollbar/jquery_scrollbar.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/rsa/jsbn.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/rsa/prng4.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/rsa/rng.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/rsa/rsa.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/rsa/BASE_64.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/plugin/js/gantt/gantt.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"ui/plugin/js/pako/pako.js"+v+"' defer='defer'></script>" + 
                "<script type='text/javascript' src='"+root+"ui/plugin/js/flatcanvas/snap.svg.js"+v+"' defer='defer'></script>" +
                "<script type='text/javascript' src='"+root+"ui/plugin/js/flatcanvas/flatcanvas.plugin.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='project/extend.js"+v+"' defer='defer'></script>";

	document.write(file);
}());
