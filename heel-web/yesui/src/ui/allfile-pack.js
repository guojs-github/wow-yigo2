/**
 * 此文件中仅包含对jQuery的扩展
 */
(function () {
	
	var file = "<link rel='stylesheet' href='yesui/ui/plugin/css/fullcalendar/fullcalendar.css'>" + 
				"<link rel='stylesheet' href='yesui/ui/plugin/css/fullcalendar/fullcalendar.css'>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/bootstrap/bootstrap.css'>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/datepicker/css/datepicker.css'/>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/smartspin/smartspinner.css'/>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/modaldialog/css/jquery.modaldialog.css'/>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/paginationjs/pagination.css'/>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/wangEditor/wangEditor-1.4.0.css'/>" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/treetable/stylesheets/jquery.treetable.theme.default.css' />" +
				"<link rel='stylesheet' href='yesui/ui/plugin/css/scrollbar/scrollbar.css' />" +
				
				"<link rel='stylesheet' href='yesui/ui/res/css/default/YIUI-all.css'>" +
				
				"<script type='text/javascript' src='common/jquery/jquery-1.10.2.js'></script>" +
				"<script type='text/javascript' src='common/jquery/jstz-1.0.4.min.js'></script>" +
				
				"<script type='text/javascript' src='yesui/ui/YIUI-common-debug.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/YIUI-control-debug.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/YIUI-parser-debug.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/YIUI-svr-debug.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/YIUI-render-debug.js'></script>" +
				
				"<script type='text/javascript' src='yesui/ui/plugin/js/raphael-src.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/jquery.cookie.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/datepicker/datetimemask/dateTimeMask.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/jquery.json-2.3.min.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/ygrid/ygrid.locale-cn.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/ygrid/jquery.yGrid.src.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/decimal/decimal.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/picture/ajaxfileupload.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/ui-extend/jquery.placeholder.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/ui-extend/jquery.ui.treeTable.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/lib/bean-min.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/lib/underscore-min.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Flotr.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/DefaultOptions.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Color.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Date.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/DOM.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/EventAdapter.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Text.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Graph.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Axis.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Series.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/Series.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/lines.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/bars.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/points.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/pie.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/candles.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/markers.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/radar.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/bubbles.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/gantt.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/types/timeline.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/download.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/selection.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/spreadsheet.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/grid.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/hit.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/crosshair.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/labels.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/legend.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/flotr/js/plugins/titles.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/datepicker/js/datepicker.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/smartspin/smartspinner.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/modaldialog/js/resize.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/modaldialog/js/modaldialog.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/paginationjs/pagination.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/wangEditor/wangEditor-1.4.0.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/picture/jquery_photoCut.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/treetable/jquery.treetable.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/pdf/pdfobject.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/throttle-debounce/jquery.ba-throttle-debounce.min.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/scrollbar/jquery_scrollbar.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/rsa/jsbn.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/rsa/prng4.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/rsa/rng.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/rsa/rsa.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/rsa/BASE_64.js'></script>" +
				"<script type='text/javascript' src='yesui/ui/plugin/js/pako/pako.js'></script>";
	document.write(file);
}());
