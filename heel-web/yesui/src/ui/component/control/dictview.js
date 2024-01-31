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

YIUI.Control.DictView = YIUI.extend(YIUI.Control, {
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
	
	_datas :{},
	
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
	
	pageSize: this.pageRowCount,
	
	pageIndicatorCount: 3,
	
	handler: YIUI.DictViewHandler,
    
	init: function(options) {
		this.base(options);
		this.dataUrl = '';
		var self = this;
		self.loadedNodes = {};
		var metaObj = self.getMetaObj();
		self.pageSize = metaObj.pageRowCount;
		if(metaObj.rowClick) {
			self.hasClick = true;
			self.rowClick = metaObj.rowClick;
		}
		if(metaObj.rowDblClick) {
			self.hasDblClick = true;
			self.rowDblClick = metaObj.rowDblClick;
		}
		if(metaObj.focusRowChanged) {
			self.hasRowChanged = true;
			self.focusRowChanged = metaObj.focusRowChanged;
		}
		self.formulaItemKey = metaObj.formulaItemKey;
		self.pageRowCount = metaObj.pageRowCount;
		self.itemFilters = metaObj.itemFilters;
		
		this.option = {
			theme : 'default',
			expandLevel : 2,
			expandable: true,
			levelMinus: true,
			beforeExpand : function(node) {
		    	var def = $.Deferred();
				var id = $(node).attr('id');
				if(!self.loadedNodes[id]) {
					self.getDictService().getDictChildren(self.itemKey, self.getNodeValue($(node)), self.dictFilter)
						.then(function(nodes) {
							var pId = $(node).attr('id') || 0;
							nodes = self.convertData(nodes, pId);
							self.addNodes(nodes);
							
							self.loadedNodes[$(node).attr('id')] = true;
							if(!$(node).is(":hidden") && !$(node).hasClass("root") && !self.isMultiExpand) {
								$(node).click();
								if(self._selectItem) {
									var id = self._selectItem.itemKey + "_" + self._selectItem.oid;
									if(id == node.attr("id")) {
										self._selectItem.isExpandNode = true;
									}
								}
							}
							def.resolve(true);
					});
				}
				return def.promise();
			},
			onSelect : function($table, node) {
            	if(node){
					$('#' + self.selectId, $table).removeClass("sel-row");
	//				console.log('onSelect: ' + id);
					node.addClass('sel-row');
					var rowIndex =  node.index();
					var id = node.attr('id')
					if(id){
						if(self.hasClick) {
							self.selectId = id;
				            var formID = self.ofFormID,
			               		rowClick = self.rowClick;
							self.handler.doOnRowClick(formID, rowClick);
						} else if (self.hasRowChanged) {
							if(self.selectId != id){
								self.selectId = id;
					        	var itemData = self.getNodeValue(node);
					        	self.getDictService().getItem(itemData.itemKey , itemData.oid).done(function(item) {
						        	self._selectItem = item;
									self.handler.doOnRowClick(self.ofFormID, self.focusRowChanged);
					        	});
							}
						}
					}

            	}
			},
			doubleClick: self.hasDblClick ? function($table , node){
							self.handler.doOnRowDblClick(self.ofFormID, self.rowDblClick);
						}:null
		};
		
//		this.data = options.data.addedNodes;
		if(this.data == undefined){
			this.data = {};
		}

	},
	
	setEnable : function(enable) {
		this.base(enable);
		this._$table && this._$table.setEnable(enable);
		var lis = $(".paginationjs-pages li", this.el);
		if(enable) {
			lis.removeClass("disabled");
		} else {
			lis.addClass("disabled");
		}
	},
    onSetHeight : function(height) {
    	this.el.css("height", height);	
    	var pagesH = $(".paginationjs-pages", this.el).is(":hidden") ? 0 : $(".paginationjs-pages", this.el).height();
    	var realHeight = height - pagesH - this.$fuzzybar.height();
    	this._pagination.content.css("height", realHeight);
	},
	
	onSetWidth: function(width) {
		this.el.css("width", width);
		this._$fuzzyText.css("width", width );
		this.syncHandleWidths();
	},
	
	convertData: function(nodes, pId) {
		if (nodes && nodes.length > 0) {
			var len = nodes.length;
			if(this.isChainDict()) {
				var pId = this.root.id;
				nodes[len -1].islast = true;
				var prevId = null;
				for(var i=0,len=nodes.length;i<len;i++) {
					if(prevId != null){
						nodes[i].previd = prevId;
					}
				    nodes[i].id = nodes[i].itemKey+'_'+nodes[i].OID;
				    prevId = nodes[i].id;
				    nodes[i].pid = pId;
				}
			} else {
				nodes[len -1].islast = true;
				var prevId = null;
				for(var i=0,len=nodes.length;i<len;i++) {
					nodes[i].id = nodes[i].itemKey+'_'+nodes[i].OID;
					nodes[i].pid = pId;

					if(prevId != null){
						nodes[i].previd = prevId;
					}
					prevId = nodes[i].id;
				}
			}
            return nodes;
        }

	},
	
	/** 
	 * 完成渲染。
	 */
	onRender: function (ct) {
			this.base(ct);

			var self = this;

			this.el.addClass('ui-dv');
			if($.browser.isIE) {
				this.el.attr("onselectstart", "return false");
			}
			
			this.id = 'dv'+this.ofFormID;
			var $fuzzybar = this.$fuzzybar = $('<div id="'+this.id+'-fuzzy" class="fuzzy"/>');
	        this._$fuzzyText =  $('<input id="'+this.id+'_textbtn" type="text" placeholder="'+YIUI.I18N.getString("DICT_KEYWORD","请输入关键字")+'" />').addClass('txt').appendTo($fuzzybar);
	        this._$fuzzyBtn =  $('<button id="'+this.id+'_dropbtn"></button>').appendTo($fuzzybar);

	        self._pagination = self.el.pagination({
				pageSize: self.pageSize,
				//总记录数
		        totalNumber: self.totalRowCount,
		        showPages: true,
		        showPageDetail: false,
		        showFirstButton: false,
		        showLastButton: false,
		        pageIndicatorCount: self.pageIndicatorCount
			});

			this.$handleContainer = $('<div class="resizer-ctnr">').appendTo(self._pagination.content);
			this._$table = $('<table cellpadding="0" cellspacing="0" unselectable="on"></table>').appendTo(self._pagination.content);
			
			var tr = $('<tr></tr>').appendTo(this._$table),
				colModel = this.colModel,
				col, i, len, width, $th;

			this._$table = this._$table.treetable(this.option);

			var form = YIUI.FormStack.getForm(this.ofFormID);
			this.handler.getDVInfo(form, this.getMetaObj())
						.then(function(dataObj){
							self.dictType = dataObj.getSecondaryType();

							if(self.isChainDict()){
								// self.el.appendChild($fuzzybar);
								self.el.prepend($fuzzybar);
					            // $fuzzybar.appendTo(self.el);
								self.el.addClass("chain");
					        }

					        var cols = [],col, rt = {};
					        if(self.dictType == YIUI.SECONDARYTYPE.COMPDICT){
					        	// 复合字典暂时定死一列
					        	cols.push({key:'caption', caption:dataObj.caption});
					        	var k = dataObj.relation[0].itemKey

					        	rt.id = k+'_'+0;
								rt.NodeType = 1;
								rt.Enable = 0;
								rt.itemKey = k;
								rt.OID = 0;
					        }else{
					        	if(self.getMetaObj().columns && self.getMetaObj().columns.length > 0){
									cols = self.getMetaObj().columns;
					        	}else{
					        		cols = dataObj.displayCols;
					        	}

								rt.id = dataObj.getKey()+'_'+0;
								rt.NodeType = 1;
								rt.Enable = 0;
								rt.itemKey = dataObj.getKey();
								rt.OID = 0;
					        }
														
							self.itemKey = dataObj.getKey();
							self.root = rt;
							self.colModel = cols;
							
							for(i = 0, len = cols.length; i < len; i ++){
								col = cols[i];
								width = col.width ? col.width : "50%";
								$th = $('<th class="title"><span>' + col.caption + '</span></th>').css("width", width).appendTo(tr);
								if(self.enableColumnResize) {
									self.addColumnResize();
								}
								if(i == len - 1) {
									var space = $("<th class='space'></th>").appendTo(tr);;
								}
							}
							tr.appendTo(self._$table);
							self.syncHandleWidths();
							var root = self.createRow(rt);
							root.addClass("comp_Level1").attr("comp_Level", 1);
							self.loadedNodes[root.attr('id')] = true;
							root.addClass("root");
							self._$table.append(root);
							self._$table.treeNode.loadRows(root).render();
							self.loadData(root);
	
						});
	},

	getDictService: function(){
		if(!this.dictService){
			var form = YIUI.FormStack.getForm(this.ofFormID);
			this.dictService = new YIUI.DictService(form);
		}
		return this.dictService;
	},

	loadData: function(root){

		if(	!this.dictFilter){
			var formID = this.ofFormID, form = YIUI.FormStack.getForm(formID);
	        var itemKey = this.itemKey || this.handler.getItemKey(form, this.getMetaObj());
	        var filter = this.handler.getDictFilter(form, this.key, itemKey, this.itemFilters);
			this.dictFilter = filter;
		}

		if(this.isChainDict()) {
	    	var itemKey = this.itemKey;
	    	var maxRows = this.pageSize;
	    	var pageIndicatorCount = this.pageIndicatorCount;
	    	var value = this.getQueryValue();
	    	var self = this;
			self.getDictService().getQueryData(itemKey, 0, maxRows, pageIndicatorCount, value, null, this.dictFilter, null)
			.then(function(data) {
				if( self.isDestroyed ) {
					return;
				}
				self.totalRowCount = data.totalRowCount;
				self.setTotalRowCount(this.totalRowCount);
				var nodes = self.data = data.data;
				nodes = self.convertData(nodes);
				self.addNodes(nodes);
			});
		} else {
	        this.expandNode(root.attr('id'), true);
		}
	},
		
	install: function () {
		
		var _this = this;
		_this._pagination.pageChanges = function(pageNum) {
        	_this.handler.doGoToPage(_this, pageNum);
		};
		
		_this._pagination.content.scroll(function() {
            _this.syncHandleWidths();
        });

		this._$fuzzyBtn.click(function(e){
			var text = _this._$fuzzyText.val();
			_this.handler.doDictViewSearch(_this, text);
			
		});
		
		this._$fuzzyText.keypress(function (event) {
            if (event.keyCode == 13) {
            	var text = _this._$fuzzyText.val();
    			_this.handler.doDictViewSearch(_this, text);
    			_this._$fuzzyText.blur();
            }
        });
		
		$(this.el).delegate(".ui-resizer", 'mousedown', function (e) {
			if(!_this.enable) return false;
			// var resizer = $(".ui-resizer", _this.el);
			var resizer = $(this);
			var resizerLeft = $(this).position().left ;
			resizer.css("left", resizerLeft);
			resizer.addClass("clicked");
			var $leftColumn, leftColOldW, tableWidth ;
			e.preventDefault();
			var startPosition = e.clientX;
			
			// $leftColumn = $(this).parents("th");
			$leftColumn = $("th", _this._$table).eq(resizer.index());
			leftColOldW = $leftColumn.outerWidth();
			// var $spaceColumn = $("th.space", _this._$table);
			// var spaceColW = $spaceColumn.width(), spaceW;
			
			var difference , leftColW, tblWidth;
			$(document).on('mousemove.rc', function (e) {
				difference = e.clientX - startPosition;
				
				var left = resizerLeft + difference;
				if(left < 20) {
				left = 20;
				}
    			resizer.css("left", left);
			});
			return $(document).one('mouseup', function () {
				$(document).off('mousemove.rc');
				leftColW = leftColOldW + difference;
				if(leftColW < 20) {
					leftColW = 20;
				}
				$leftColumn.css("width", leftColW);

				resizer.removeClass("clicked");
				_this.syncHandleWidths();
			});
		});
	},
	
	// private
	createRow : function(rowdata) {

		delete this.loadedNodes[rowdata.id];

		var tr = $('<tr id="'+rowdata.id+'"></tr>'),
			colModel = this.colModel;
		
		if(rowdata.OID != undefined ){
			tr.attr('oid', rowdata.OID);
		}
		
		if(rowdata.pid != undefined ){
			tr.attr('pid', rowdata.pid);
		}
		
		if(rowdata.itemKey != undefined ){
			tr.attr('itemKey', rowdata.itemKey);
		}
		
		if(this.dictType == YIUI.SECONDARYTYPE.COMPDICT) {
			var path = rowdata.path;
			if(!path) {
				path = rowdata.id;
			}
			tr.attr("path", path);
			var $pNode = $("[id=" + rowdata.pid+"]", this.el);
			var comp_Level = parseInt($pNode.attr("comp_Level"));
			var pItemKey = $pNode.attr("itemKey");
			var itemKey = rowdata.itemKey;
			if(itemKey != pItemKey) {
				comp_Level += 1;
			} 
			tr.attr("comp_Level", comp_Level);
			var comp_css = "comp_Level" + comp_Level;
			tr.addClass(comp_css);
		}
			
		if(!this.isChainDict()){
			if(rowdata.NodeType == 1){
				tr.attr('haschild', true);
			}
		}
		
		if(rowdata.previd != undefined){
			tr.attr('previd', rowdata.previd);
		}

		if(rowdata.Enable != undefined){
			tr.attr('enable', rowdata.Enable);
			switch(rowdata.Enable) {
				case -1:
					tr.addClass("invalid");
					break;
				case 0: 
					tr.addClass("disabled");
					break;
				case 1:
//					tr.addClass("invalid");
					break;
			}
		}
		
		var value;
		if(this.dictType == YIUI.SECONDARYTYPE.COMPDICT) {
			value = rowdata["Code"] + " " + rowdata["Name"];
			$('<td>' + value + '</td>').appendTo(tr);
		} else {
			for (var j = 0, len = colModel.length; j < len; j++) {
				value = rowdata[colModel[j].key];
				if(!value){
					value = '';
				}
				$('<td></td>').text(value).appendTo(tr);
				if(j == len - 1) {
					$("<td class='space'></td>").appendTo(tr);
				}
			}
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
	
    setTotalRowCount: function(totalRowCount){
    	this.totalRowCount = totalRowCount == undefined ? this.totalRowCount : totalRowCount;
		this._pagination.setTotalRowCount(this.totalRowCount, this.isResetPageNum);
		this.isResetPageNum = false;
    },
	
	focusNode: function(id){
		var $tr = $('#' + id, this._$table);
		if($tr.length > 0){
			
//			$tr.click();
			
			if(this.selectId){
				$('#' + this.selectId, this._$table).removeClass("sel-row");
			}
	
			$tr.addClass('sel-row');
			if(!$tr.hasClass("selected")) {
				$(".selected", this._$table).removeClass("selected");
				$tr.addClass('selected');
			}
			this.selectId = id;
			
			if(this.hasClick) {
	            var formID = this.ofFormID,
               		rowClick = this.rowClick;
	            this.handler.doOnRowClick(formID, rowClick);
			} else if (this.hasRowChanged) {
	        	var itemData = this.getNodeValue($tr);
	        	var self = this;

        		self.getDictService().getItem(itemData.itemKey , itemData.oid).done(function(item) {
        			self._selectItem = item;
        			self.handler.doOnRowClick(self.ofFormID, self.focusRowChanged);
        		});

				self.isMultiExpand = false;
			}
		}

	},
	
	// 删除节点
	deleteNodes: function(ids) {
		if(ids == undefined) {
			return;
		}
		this._$table.removeNodes(ids);
	},
	
	// 添加节点
	addNodes: function(nodes) {
		if($.isUndefined(nodes)) {
			return;
		}
		
		var html = this.createRowsHtml(nodes);

		this._$table.addChilds(html);
	},

    syncHandleWidths: function() {
		var _this = this;
		var $handleContainer = this.$handleContainer;
        $handleContainer.width(_this._$table.width());
		var resizers = $(".ui-resizer", $handleContainer);
        $handleContainer.find('.ui-resizer').each(function (i, resizer) {
			// var resizer = resizers.eq(i);
			var th = $("th", _this._$table).eq(i);
			return $(resizer).css({
				left: th.outerWidth() + th.position().left,
				height: th.outerHeight()
			});

		});
		
	},
	// private 添加列宽拖动支持
	addColumnResize : function() {

		var colModel = this.colModel,
			row = this.el.find('tr:first-child'),
			cells = row.children(),
			left = 0;
			
		var $handleContainer = this.$handleContainer;
		$("<div class='ui-resizer' />").appendTo($handleContainer);

	},
	
	find: function(id){
		var $tr = $('#' + id, this._$table);
		return $tr.length > 0;
	},
	
	getNode: function(id){
		var $tr = $('#' + id, this._$table);
		return $tr;
	},
	
	expandNode: function(id , reload){
		var $tr = $('#' + id, this._$table);
		
		if(reload){
			this._$table.removeChildren(id);
			delete this.loadedNodes[id];
		}
		return this._$table.expand($tr);
	},

	getSelectedValue: function(colKey){
		var value = null;
		if(this._selectItem){
			colKey = colKey.charAt(0).toLowerCase() + colKey.slice(1);
			if(colKey.toLowerCase() == "nodetype"){
				value = this._selectItem.isExpandNode ? 1 : 0;
			} else if(colKey.toLowerCase() == "oid"){
				value = this._selectItem["oid"];
			} else {
				value = this._selectItem[colKey];
			}
		}
		return value;

	},
	
	getNodeValue: function($node) {
		if($node.length > 0){
			var id = $node.attr('id');
		
       		var index = id.lastIndexOf('_');

			var itemKey = $node.attr("itemkey");
			var oid = $node.attr("oid");
			
		  	var itemData = {};
	    	itemData.oid = oid || 0;
	   		itemData.itemKey = itemKey || this.itemKey; 
			return itemData;
		}
	},
	
	removeNode: function(id){
		this._$table.removeNode(id , true);
		delete this.loadedNodes[id];
		
	},
	
	isChainDict: function(){
		return this.dictType == YIUI.SECONDARYTYPE.CHAINDICT;
	},
	
		// 添加节点
	addNodeByItem: function($pNode, item){
		if(item == undefined){
			return;
		}
		
		var html = this.createRowByItem($pNode, item);

		this._$table.addChilds(html);
	},
	
		// private
	createRowByItem : function($pNode, item) {
		//this._datas[rowdata.id] = rowdata;
		
		var id = item.itemKey +'_'+item.oid;
		
		delete this.loadedNodes[id];
		
		var tr = $('<tr id="'+id+'"></tr>');
		
		if($pNode){
			tr.attr('pid', $pNode.attr('id'));
		}else{
			tr.attr('pid', this.root.id);
		}
		if(!this.isChainDict()){
			if(item.nodeType == 1){
				tr.attr('haschild', true);
			}
		}

		if(item.oid != undefined ){
			tr.attr('oid', item.oid);
		}
		
		if(item.itemKey != undefined ){
			tr.attr('itemKey', item.itemKey);
		}
		
		if(item.enable != undefined){
			tr.attr('enable', item.enable);
			switch(item.enable) {
				case -1:
					tr.addClass("invalid");
					break;
				case 0: 
					tr.addClass("disabled");
					break;
				case 1:
//					tr.addClass("invalid");
					break;
			}
		}
		
		var value;
		for (var j=0,len=this.colModel.length;j<len;j++) {
			value = item.getValue(this.colModel[j].key);
			$('<td></td>').text(value).appendTo(tr);
		}
		return tr;
	},
	
	addNode: function(itemData) {
		var self = this;
        var curID = itemData.itemKey + '_' + itemData.oid;
		//目前 不同字典 是通过重新加载 父节点来实现 刷新的。
        if (this.isChainDict()) {
            self.getDictService().getItem(itemData.itemKey, itemData.oid).done(function(item) {
            	self.addNodeByItem(null, item);
            	self.focusNode(curID);
            });
        } else {
            //获取当前节点所有父节点
            self.getDictService().getParentPath(this.itemKey, itemData).then(function(parents) {
            	if(parents.length > 0) {
            		self.isMultiExpand = true;
            		self._expand(parents[0], curID, 1, true);
            	}
            });
        }
	},
	

	_expand: function(parents, curID, index, isAdd){
		var self = this;

    	var last = parents[parents.length - 1];
    	var id = last.itemKey + '_' + last.oid;
    	//父节点
    	if (self.find(id)) {
    		return self.expandNode(id, true).then(function() {
		    	if(!isAdd) {
		    		var node = self.getNode(curID);
		    		if (node.attr('enable') == 1) {
		    			for (var i = 0; i < parents.length; i++) {
		    				id = parents[i].itemKey + '_' + parents[i].oid;
		    				var parent = self.getNode(id);
		    				parent.attr('enable', 1);
		    				parent.removeClass('invalid').removeClass('disabled');
		            		self.expandNode(id);
		    			}
		    		}
		    	}
		        self.focusNode(curID);
    		});
    	} else {
    		if(index < parents.length){
				var oid = parents[index].oid;
				id = parents[index].itemKey + '_' + parents[index].oid;
				if (self.find(id)) {
					return self.expandNode(id).then(function() {
						self._expand(parents, curID, index + 1, isAdd);
					});
				}
    		}
    	}
    },

	//更新节点　图标　及　显示字段
	refreshNode: function(itemData){
		var self = this;
        var curID = itemData.itemKey + '_' + itemData.oid;
        if (this.isChainDict()) {
            var $tr = $('#' + curID, self._$table);
    		self.handler.refreshNode(self, $tr).then(function() {
    			self.focusNode(curID);
    		});
        } else {
            //删除当前节点的所有子节点并将该节点设置为未展开
        	self.removeNode(curID);
        	
            //获取当前节点所有父节点
            self.getDictService().getParentPath(this.itemKey, itemData).then(function(parents) {
            	
            	if(parents.length > 0) {
            		self.isMultiExpand = true;

            		var parent = parents[0];
            		var p = parent[parent.length - 1];
                    var $tr = $('#' + curID, self._$table);
                    var pid = p.itemKey + "_" + p.oid;
                    if(pid == $tr.attr("pid")) {
                    	self.handler.refreshNode(self, $tr).then(function() {
                			self.focusNode(curID);
                		});
                    } else {
                		self._expand(parent, curID, 1);
                    }
            	}
            });
        }
		
	},
	getQueryValue: function(){
		return this._$fuzzyText.val();
	},
	clearSelection: function(){
		if(this.selectId){
			$('#' + this.selectId, this._$table).removeClass("sel-row");
		}
		this.selectId = null;
		this._selectItem = null;
	},
	dependedValueChange: function(targetField, dependedField){
				//TODO 目前dictview的itemKey非动态

        var formID = this.ofFormID;
        var itemFilters = this.itemFilters;
 		var form = YIUI.FormStack.getForm(formID);
        var itemKey = this.itemKey || this.handler.getItemKey(form, this.getMetaObj());
        var key = this.key;
        var filter = this.handler.getDictFilter(form, key, itemKey, itemFilters);
		
		var isSame = function(filter1 , filter2){
			if(filter2 == null){
				return false;
			}
			
			if(filter1.itemKey != filter2.itemKey){
				return false;
			}
			if(filter1.formKey != filter2.formKey){
				return false;
			}
			if(filter1.fieldKey != filter2.fieldKey){
				return false;
			}
			if(filter1.filterIndex != filter2.filterIndex){
				return false;
			}
			
			if(filter1.values.toString() != filter2.values.toString()){
				return false;
			}
			
			if(filter1.dependency != filter2.dependency){
				return false;
			}
			
			return true;
			
		}
		
		var refresh = false;
		
		if(filter != null && !isSame(filter , this.dictFilter)){
			this.dictFilter = filter;
			refresh = true;
		}else if(filter != null){
			if(this.dictFilter.dependency && this.dictFilter.dependency.toLowerCase().indexOf(dependedField.toLowerCase()) >= 0 ){
				refresh = true;
			}	
		}else if(this.dictFilter != null){
			this.dictFilter = null;
			refresh = true;
		}
		
		if(!refresh){
			return;
		}
		
		if(!this.el){
			return;
		}

		if(this.isChainDict()){
			this.handler.doGoToPage(this, 0, true);
		}else{
			this.expandNode(this.root.id , true);
		}
	}
});

YIUI.reg('dictview', YIUI.Control.DictView);
})();