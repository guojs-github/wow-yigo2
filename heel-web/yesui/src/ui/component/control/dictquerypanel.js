(function() {
	YIUI.DictQuery = function(options) {
		options = $.extend(true, {
			startRow: 0, 
			maxRows: 5, 
			pageIndicatorCount: 3, 
			fuzzyValue: "",
			columns: [ {
    			key: "Name",
    			caption: YIUI.I18N.getString("CURRENCY_NAME","名称"),
    			visible: true,
    			enable: true
    		}, {
    			key: "Code",
    			caption: YIUI.I18N.getString("DICT_CODE","代码"),
    			visible: true,
    			enable: true
    		}]
		}, options);
		var columns = options.getDictService().getQueryCols(options.itemKey);
		if(columns) {
			options.columns = columns;
		}
		var dictQuery = $("<div></div>").attr("id", options.dt_id + "dict_dialog").addClass("dtquery").addClass(options.cssClass);
		
		var html = "<div class='content dict_dialog'>" +
						"<table class='tbl' border='0' cellpadding='0' cellspacing='0'>" +
							"<tbody>" +
								"<tr row='0' class='tr-first'>" +
									"<td col='0' colspan='1' rowspan='1'>" +
										"<span class='search fuzzy'>" +
											"<input type='text' placeholder="+YIUI.I18N.getString("DICT_KEYWORD","请输入关键字")+" value='"+$.htmlEncode(options.fuzzyValue)+"'/>" +
                                            "<button class='btn search'></button>" +
										"</span>" +
									"</td>" +
									"<td col='1' colspan='1' rowspan='1'>" +
									"</td>" +
								"</tr>" +
								"<tr row='1' class='view' >" +
									"<td col='0' colspan='2' rowspan='1'>" +
									
									"</td>" +
								"</tr>" +
								"<tr row='2' class='tr-last'>" +
									"<td col='0' colspan='1' rowspan='1'>" +
										"<button class='btn ok'>"+YIUI.I18N.getString("CURRENCY_OK","确定")+"</button>" +
                                        "<span class='quarantine'>|</span>" +
                                        "<button class='btn cancel'>"+YIUI.I18N.getString("DICT_CANCEL","取消")+"</button>" +
									"</td>" +
									"<td col='1' colspan='1' rowspan='1'>" +
									"</td>" +
								"</tr>" +
							"</tbody>" +
						"</table>" +
					"</div>";

		dictQuery.modalDialog(null, {title: options.caption || " ", showClose: false, showCloseIcon: false, isResize: false, width: "500px", height: "345px", className: "dict"});
		dictQuery.dialogContent().append(html);

		// 弹出框后带入焦点
		$("input", dictQuery.dialogContent()).focus();

    	var listView = new YIUI.Control.ListView({
			metaObj: {
				visible: true,
				pageRowCount: options.maxRows,
				columnInfo: options.columns
			},
			pageIndicatorCount: options.pageIndicatorCount,
			showPageDetail: false,
			showFirstButton: false,
			showLastButton: false
    	});

    	listView.addDataRow = function(data){
        	var $tbody = $(".tbl-body tbody", listView.$table);
        	var hasFirst = $("tr.first", $tbody).length == 0 ? false : true;
        	if(listView.$table && data !== undefined) {
            	var $tbody = $(".lv-tb .lv-body tbody", this.el);
            	$("tr.space", $tbody).remove();
            	if($("tr.data", $tbody).length == 0 || $("label.empty", $tbody).length == 0) {
            		$("label.empty", $tbody).remove();
                    $(".lv-body",this.el).removeClass("empty");
            	}
            	var $tr , value , $td;
            	$.each(data , function(i , row){
            		$tr = $('<tr></tr>').addClass("data");
            		if(!hasFirst && i == 0) {
            			$tr.addClass("first");
            		}
        			var seq = $tbody.children().length+1;
            		if((seq & 1) == 0) {
            			$tr.addClass("even");
            		}
            		$.each(listView.columnInfo , function(i , column){
            			$td = $('<td></td>');
            			if(i == 0) {
            				var span = $("<span/>").addClass("dict_icon").appendTo($td);
            				if(row.NodeType == 1) {
            					span.addClass("p_node");
            				}
                            if(row.Enable == 0) {
                                span.addClass("disabled");
                            } else if(row.Enable == -1) {
                                span.addClass("invalid");
                            }
            			}

        				value = $.htmlEncode(row[column.key]);
                        $td.append(value);
            			if(column.visible) {
            				$tr.append($td);
            			}
            		});
            		$tr.data("caption", row["caption"]);
            		$tr.data("itemKey", row["itemKey"]);
            		$tr.data("oid", row["oid"]);
            		$tbody.append($tr);
            	});
        	}
            var bodyWidth = $(".tbl-body",this.el).width();
            var lvWidth = parseInt(this.el.css("max-width"));
            if(bodyWidth > lvWidth){
                this.$table.css("width", lvWidth);
            }else{
                this.$table.css("width", bodyWidth);
            }
            $(".tbl-head", this.el).css("width", bodyWidth);
            listView.onSetWidth();
        };

        listView.addEmptyRow = function() {
        	var $body = $(".lv-tb .lv-body", this.el);
    		var $tbl = $(".tbl-body", $body);
        	$("tr.space", $tbl).remove();
    		if($("tr.data", $tbl).first().length == 0) {
        		var lbl = $("tbody label.empty", $tbl);
    			if(lbl.length == 0) {
    				lbl = $("<label class='empty'>"+YIUI.I18N.getString("ATTACHMENT_NOCONTENT","表中无内容")+"</label>");
    				$("tbody", $tbl).append(lbl);
                    $body.addClass("empty");
    			}
    			var width = $("tr.first", $tbl).width() - 1;
    			var top = ($body.height() - lbl.height()) / 2;
    			lbl.width(width).css("top", top + "px");
    			return;
    		}

    		var tr_h = $("tr.data", $tbl).first().outerHeight();
    		var body_h = $(".tbl-body", $body).outerHeight();
    		if(!body_h) {
    			var len = $("tr.data", $tbl).length;
    			body_h = 0;
    			for (var i = 0; i < len; i++) {
    				body_h +=  $("tr.data", $tbl).eq(i).outerHeight();
    			}
    		}
    		var total_h = (($body[0].clientHeight || $body.height()) - body_h);
    		var count = Math.ceil( total_h / tr_h);
    		var last_h = total_h - (count - 1) * tr_h;
    		if(count <= 0) return;
    		for (var i = 0; i < count; i++) {
    			var $tr = $("<tr></tr>").addClass("space").appendTo($tbl);
    			var index = $tr.index() + 1;
    			//判断index是否为偶数
    			if((index & 1) == 0) {
    				$tr.addClass("even");
    			}
        		$.each(this.columnInfo , function(i , column){
        			var $td = $('<td></td>');
        			if(column.visible) {
        				$tr.append($td);
        			}
        		});
    			if(i == count - 1) {
    				$tr.addClass("last");
    				$("td", $tr).height(last_h);
    				var h = $body.height() - $tbl.height();
    				if(h > 0 && h < tr_h) {
    					$("td", $tr).height(last_h + h);
    				}
    			} else {
    				$tr.outerHeight(tr_h);
    			}
    		}

    	};
        listView.createColumnHead = function(){
        	var $thead = $(".tbl-head thead", this.$table);
        	var $tbody = $(".tbl-body tbody", this.$table);
        	if(this.columnInfo && this.columnInfo.length > 0 ){
    			var $tr = $('<tr></tr>'),$th;
    			var $tr_b = $('<tr class="first"></tr>'),$td;
    			for( var i = 0, len = this.columnInfo.length; i < len; i ++){
    				$th = $('<th><label>' + this.columnInfo[i].caption + '</label></th>').attr("colIndex", i);
    			    $("label", $th).css("overflow", "hidden").css("text-overflow", "ellipsis").css("display", "block");
                    $td = $('<td></td>').attr("colIndex", i);
    			    $td.css("height", "0px");

    			    if(this.columnInfo[i].visible != false) {
    			    	$tr.append($th);
    			    	$tr_b.append($td);
    			    }
    			}
        	}
    		$thead.append($tr);
    		$tbody.append($tr_b);
        };
        listView.onSetWidth = function(width) {
    		var $ths = $("th", this.$table), 
    			$tds = $("tr.first td", this.$table),
    			$th, $td;
    		var tblW = 0;
    		for (var i = 0, len = this.columnInfo.length; i < len; i++) {
    			$th = $("[colindex="+i+"]", this.$table);
    			$td = $tds.eq($th.index());
    			if(!this.columnInfo[i].visible) continue;
                $th.css("width", $td.outerWidth());
    		   }
    		
    		this.syncHandleWidths();
    	};
    	
    	listView.render($("tr.view td", dictQuery));
		
		$(".dialog-close", dictQuery).click(function() {
            options.callback();
            options.textInput.focus();
		});


    	$(".btn.search", dictQuery).click(function(event) {
    		getDictData( $(".search input", dictQuery).val(), 0, true, true);
    	});

    	$(".btn.ok", dictQuery).click(function(e){
    		var itemData = listView.itemData;
    		if (!itemData) return false;
    		dictQuery.close();
    		options.callback(itemData);
            options.textInput.removeClass("select");
    	});
    	$(".btn.cancel", dictQuery).click(function(e){
    		listView.itemData = null;
    		options.callback();
            options.textInput.focus();
    		dictQuery.close();
            options.textInput.removeClass("select");
    	});
        $(".btn.ok", dictQuery).addClass("dqp-surebtn");
        $(".search input", dictQuery).keypress(function (event) {
            if (event.keyCode == 13) {
            	$(".btn.search", dictQuery).click();
                $(".search input", dictQuery).blur();
            }
        });
    	listView._pagination.pageChanges = function(pageNum) {
    		getDictData($(".search input", dictQuery).val(), pageNum*options.maxRows);
        };
        
		var getDictData = function(fuzzyValue, startRow, isResetPageNum, isQuery) {
			options.getDictService().getQueryData(
                        options.itemKey,
                        startRow,
                        options.maxRows,
                        options.pageIndicatorCount,
                        fuzzyValue,
                        options.stateMask,
                        options.dictFilter,
                        options.rootValue,
                        options.formKey,
                        options.fieldKey)
					.done(function(data) {
						// if(startRow == 0 && data.totalRowCount < options.maxRows) {
						// 	listView._pagination.hidePagination();
						// } else if(data.totalRowCount && isQuery) {

                        if(startRow == 0 && data.totalRowCount == 0) {
                            listView._pagination.hidePagination();
                        } else if(data.totalRowCount && isQuery) {

							listView._pagination.setTotalRowCount(data.totalRowCount + startRow, isResetPageNum || false);
                            listView._pagination.pageRender();

                            var $body = $(".lv-tb .lv-body", listView.el);

                        } else if(startRow != 0){
                            listView._pagination.setTotalRowCount(data.totalRowCount + startRow, false);
                        }
						listView.data = data.data;
						listView.clearDataRow();
						listView.addDataRow(listView.data);
						listView.addEmptyRow();
					});
		};
		var timer = null
		listView.$table.undelegate();
		listView.$table.delegate(".tbl-body tr", "dblclick", this.doubleClick == null ? function(event) {
			clearTimeout(timer);
			if(!listView.enable || $(this).attr("enable") == "false") return;
        	var colIndex = $(event.target).index();
            var rowIndex = $(event.target).parent().index();
            var caption = $(this).data("caption"),
            	itemKey = $(this).data("itemKey"),
            	oid = $(this).data("oid"),
            	paras = {};
            paras.oid = oid || 0;
            paras.itemKey = itemKey;
            paras.caption = caption;
	   		var itemData = new YIUI.ItemData(paras);
	   		
            options.callback(itemData);
            dictQuery.close();

            options.textInput.focus();
            event.stopPropagation();
            
        } : this.doubleClick);
		
		listView.$table.delegate(".tbl-body tr", "click",function(event){
			clearTimeout(timer);
			$(".tbl-body tr", listView.$table).removeClass("active");
			$(this).addClass("active");
			var caption = $(this).data("caption"),
	        	itemKey = $(this).data("itemKey"),
	        	oid = $(this).data("oid"),
	        	paras = {};
	        paras.oid = oid || 0;
	        paras.itemKey = itemKey;
	        paras.caption = caption;
	   		var itemData = new YIUI.ItemData(paras);
			listView.itemData = itemData;
			event.stopPropagation();
		});
		$(".btn.search").click();
		dictQuery.doLayout = function() {
			var content = dictQuery.dialogContent();
			var h = $("table tr.tr-first", dictQuery).outerHeight() + $("table tr.tr-last", dictQuery).outerHeight();
			var width = $(".content", content).width();
			var height = $(".content", content).height();
			$(".search.fuzzy").width(width - $(".btn.search", dictQuery).outerWidth() - 5);
			
			var lv_w = width - parseInt(listView.el.css("padding-left")) - parseInt(listView.el.css("padding-right"));
			var lv_h = height - h - parseInt(listView.el.css("padding-top")) - parseInt(listView.el.css("padding-bottom"));
			listView.setWidth(lv_w);
			listView.setHeight(lv_h);
            options.textInput.addClass("select");
		};
		return dictQuery;
	}
})();

