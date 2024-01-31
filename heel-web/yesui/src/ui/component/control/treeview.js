/**
 * TreeView。
 * 以table实现的树，可单列，可多列。
 */
(function() {
// 自动生成节点id
var nodeId = 0;
function getId() {
	return 'n-' + (++nodeId);
}

YIUI.Control.TreeView = YIUI.extend(YIUI.Control, {
	/** HTML默认创建为label */
	autoEl: '<div></div>',
	
	selectId: null,
	
	/** 
	 * String。
	 * 加载数据的url，优先于data。
	 */
	dataUrl : null,
	
	/** 
	 * Array。
	 * 真实数据，如果指定了dataUrl，忽略data中定义的数据。
	 */
	data : null,
	
	/** 
	 * Object。
	 * 根节点。
	 */
	root : null,
	
	/**
	 * Array。 
	 * 列信息。
	 */
	colModel : null,
	
	/**
	 * Boolean。
	 * 是否支持列宽拖动。
	 */
	enableColumnResize : true,
	
	/**
	 * 未指定列宽时的默认宽度。
	 */
	defaultWidth : 100,
	
	_$table : null,
	/**
	 * 表格选中模式  0单元格选 1行选
	 */
	selectionModel : 1,

    isDataBinding: function() {
        return false;
	},
	
	init : function(options) {
		this.base(options);
		this.dataUrl = '';
		var treeview = this;
		treeview.loadedNodes = {};
		this.option = {
			theme : 'default',
			expandLevel : 2,
			beforeExpand : function($table, id) {
				if(!treeview.loadedNodes[id]) {
					
					YIUI.EventHandler.doExpand(treeview, id || 0);
					
					//var rows = treeview.loadChildren(id);
					//var html = treeview.createRowsHtml(rows);
					//$table.addChilds(html);
					treeview.loadedNodes[id] = true;
				}
			},
			onSelect : function($table, id) {
				$('#' + treeview.selectId, $table).removeClass("trchekedstyle");
				//console.log('onSelect: ' + id);
				var $tr = $('#' + id, $table);
				$tr.addClass('trchekedstyle');
				var rowIndex =  $tr.index();
				YIUI.EventHandler.doOnClick(treeview, id || 0);
				treeview.selectId = id;
			}
		};
		
		this.data = options.data.addedNodes;
		if(this.data == undefined){
			this.data = {};
		}

	},
	
	/** 
	 * 完成渲染。
	 */
	onRender: function (ct) {
		this.base(ct);
		
		this.el.addClass('treeview');
		
		this._$table = $('<table cellpadding="0" cellspacing="0"></table>').appendTo(this.el);
		
		
		var tr = $('<tr ></tr>').appendTo(this._$table),
			colModel = this.colModel,
			col, i, len, width;
		
		for (i=0,len=colModel.length;i<colModel.length;i++) {
			col = colModel[i];
			width = col.width || this.defaultWidth;
			$('<col></col>').attr('width', width).prependTo(this._$table);
			$('<th>' + col.caption + '</th>').appendTo(tr);
		}
		
		if(this.root) {
			var rootTr = this.createRow(this.root);
			rootTr.attr('isLastOne', true);
			this._$table.append(rootTr);		
		}
		
		this._$table.treeTable(this.option);
		
		var html = this.createRowsHtml(this.data);
		
		this._$table.addChilds(html);

	},
	
	// private
	createRow : function(rowdata) {
		
       
		//rowdata.id = rowdata.id || getId();
		var tr = $('<tr id="'+rowdata.id+'"></tr>'),
			colModel = this.colModel;
		
		if(rowdata.pid != undefined ){
			tr.attr('pId', rowdata.pid);
		}
			
		if(rowdata.expand != undefined && rowdata.expand){
			tr.attr('hasChild', true);
		}
		
		if(rowdata.previd != undefined){
			tr.attr('prevId', rowdata.previd);
		}
		
		if(rowdata.islast != undefined && rowdata.islast){
			tr.attr('isLastOne', true);
		}
		var value;
		for (var j=0,len=colModel.length;j<len;j++) {
			value = rowdata[colModel[j].key];
			if(!value){
				value = '';
			}
			$('<td>' + value + '</td>').appendTo(tr);
		}
		
		return tr;
	},
	
	// private
	createRowsHtml : function(rows) {
		var html = '';
		for(var i=0,len=rows.length;i<len;i++) {
			html += this.createRow(rows[i])[0].outerHTML;
		}
		return html;
	},
	
	/**
	 * 根据dataUrl加载所有下层子节点。
	 * @param pid 父节点id。
	 * @return Array。所有子节点的数组。
	 */
	/*
	loadChildren : function(pid) {
		var children;
		$.ajax({
			url : SvrMgr.ServletURL,
			
			//{Service: SvrMgr.Service.DealWithEvent, FormID: formID,
            //    EventType: eventType, ControlKey: controlKey, ExtParas: extParas});
                
			data : {
				Service : SvrMgr.Service.DealWithEvent,
				FormID : this.ofFormID,
				EventType :  SvrMgr.EventType.Expand,
				ControlKey : this.key,
				ExtParas :  pid || 0
			},
			
			method : 'get',
			dataType : 'json',
			async : false,
			success : function(result) {
				children = result.data;
			}
		});
		
		$.each(children, function() {
			this.pid = this.pid || pid;
		});
		return children;
	},*/
	
	install: function () {
		this.base();
				
		this.enableColumnResize && this.addColumnResize();
		
	},
	
	focusNode: function(id){
		var $tr = $('#' + id, this._$table);
		if($tr){		
			$('#' + this.selectId, this._$table).removeClass("trchekedstyle");
	
			$tr.addClass('trchekedstyle');	
			this.selectId = id;
		}
		
	},
	
	// 删除节点
	deleteNodes: function(nodes){
		if(nodes == undefined){
			return;
		}
		this._$table.deleteChilds(nodes);
	},
	
	// 添加节点
	addNodes: function(nodes){
		if(nodes == undefined){
			return;
		}
		
		var html = this.createRowsHtml(nodes);
		
		this._$table.addChilds(html);
		//this.loadedNodes[id] = true;
	},
	
	// private 添加列宽拖动支持
	addColumnResize : function() {

		var colModel = this.colModel,
			row = this.el.find('tr:first-child'),
			cells = row.children(),
			left = 0;
			
		//this.$handleContainer = $("<div class='rc-handle-container'/>");
		
		var $handleContainer = $('<div class="treeview-resizer-container">');
		
		this._$table.before($handleContainer);
		
		var _this = this;
		
        function syncHandleWidths(a){
			//var _this = this;

	        $handleContainer.width(_this._$table.width());
	        $handleContainer.find('.treeview-resizer').each(function (_, el) {
	
	            return $(el).css({
	                left: $(el).data('th').outerWidth() + ($(el).data('th').offset().left - $handleContainer.offset().left),
	                height: _this._$table.height()
	
	            });
	
	        });
		};
						
		this._$table.find('tr th').each(function (i, el) {
            var $resizer;

            $resizer = $("<div class='treeview-resizer' />");
            $resizer.data('th', $(el));
            $resizer.bind('mousedown', function (e) {
                var $currentGrip , $leftColumn  , leftColumnStartWidth , tableWidth ;

                e.preventDefault();

                var startPosition = e.pageX;

                $currentGrip = $(e.currentTarget);

                $leftColumn = $currentGrip.data('th');

                leftColumnStartWidth = $leftColumn.width();

                tableWidth = _this._$table.width();
				
                $(document).on('mousemove.rc', function (e) {
                    var difference , newLeftColumnWidth;
                    difference = e.pageX - startPosition;
                    newLeftColumnWidth = leftColumnStartWidth + difference;

                    $leftColumn.width(newLeftColumnWidth);
                    //console.log('mousemove: ' + _this._$table.width() + 'difference:'+difference + ' newLeftColumnWidth:'+newLeftColumnWidth)
                   _this._$table.width(tableWidth+difference);
                    return 	syncHandleWidths(newLeftColumnWidth);	
  


                });

                return $(document).one('mouseup', function () {
                    $(document).off('mousemove.rc');
                });

            });
            
            return $resizer.appendTo($handleContainer);

        });
        
        syncHandleWidths();
		/*	
		for(var i=0,len=colModel.length;i<len;i++) {
			var resizer = $('<div class="treeview-resizer"></div>').attr('index', i).appendTo(this.el);
			
			left += cells[i].clientWidth;
			resizer.css('left', left + 'px');
		}
		
		var treeview = this,
			startPos, endPos, startWidth, index, cell, startLeft;
			
			
		function mousedownFn(event) {
			var target = $(event.target);
			if(target.hasClass('treeview-resizer')) {
				event.preventDefault();
				startPos = event.pageX;
				index = target.attr('index');
				cell = $(cells[index]);
				startWidth = cell.width();
				startLeft = parseInt(target.css('left'));
				$(document).on('mousemove', mouseoverFn).one('mouseup', mouseupFn);
			}
		}
		function mouseoverFn(event) {
			var endPos = event.pageX;
			cell.width(startWidth + endPos - startPos);
		}
		function mouseupFn(event) {
			var target = $(event.target),
				endPos = event.pageX,
				resizers = treeview.el.find('.treeview-resizer'),
				resizer;
			for(var i=index,len=resizers.length;i<len;i++) {
				resizer = $(resizers[i]);
				resizer.css('left', (parseInt(resizer.css('left')) + endPos - startPos) + 'px');
			}
			
			$(document).off('mousemove', mouseoverFn);
		}
		
		function syncHandleWidths(){
			var _this = this;

	        this.$handleContainer.width(this.$table.width());
	        this.$handleContainer.find('.rc-handle').each(function (_, el) {
	
	            return $(el).css({
	                left: $(el).data('th').outerWidth() + ($(el).data('th').offset().left - _this.$handleContainer.offset().left),
	                height: _this.$table.height()
	
	            });
	
	        });
		}
		
		this.el.on('mousedown', mousedownFn);*/
	}
	
});
YIUI.reg('treeview', YIUI.Control.TreeView);
})();