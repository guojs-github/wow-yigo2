YIUI.DictViewHandler = (function () {
    var Return = {
        
        doOnRowClick: function (formID, rowClick) {
            if (rowClick) {
                var form = YIUI.FormStack.getForm(formID);
                var cxt = new View.Context(form);
                form.eval(rowClick, cxt, null);
            }
        },

        doOnFocusRowChange: function (formID, rowChanged) {
        	if (rowChanged) {
                var form = YIUI.FormStack.getForm(formID);
                var cxt = new View.Context(form);
                form.eval(rowChanged, cxt, null);
            }
        },

        doOnRowDblClick: function (formID, dblClick) {
            if (dblClick) {
                var form = YIUI.FormStack.getForm(formID);
                var cxt = new View.Context(form);
                form.eval(dblClick, cxt, null);
            }
        },

       	doGoToPage: function(dictView, index, isResetPageNum){
        	var itemKey = dictView.itemKey;
        	var maxRows = dictView.pageRowCount;
        	var pageIndicatorCount = dictView.pageIndicatorCount;
        	var value = dictView.getQueryValue();
        	
        	var startRow = index <= 0 ? 0 : dictView.pageRowCount * index; 
        		
        	new YIUI.DictService().getQueryData(itemKey,
                                          startRow,
                                          maxRows,
                                          pageIndicatorCount,
                                          value,
                                          null,
                                          dictView.dictFilter,
                                          null)
                            .then(function(result){
                                        if (result) {
                                            //清空数据
                                            dictView.isResetPageNum = isResetPageNum;
                                            $('tr:gt(1)',dictView._$table).remove()
                                            var nodes = result.data;
                                            var len = nodes.length;
                                            if(len > 0){
                                                var pId = dictView.root.id;
                                                
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
                                            
                                                dictView.addNodes(nodes);
                                                dictView.setTotalRowCount(startRow + result.totalRowCount);
                                                dictView.focusNode(nodes[0].id);
                                            } else {
                                                dictView.setTotalRowCount(len);
                                            }

                                        }
                                    });
		},
		
        doDictViewSearch: function (dictView) {
			this.doGoToPage(dictView, 0, true);
        },
        
        getDictFilter: function(form, key, itemKey, itemFilters){
            var filter = null;
            var dictFilter = null;
            var cxt = new View.Context(form);
            if (itemFilters) {
                var itemFilter = itemFilters[itemKey] || itemFilters[''];
                if(itemFilter) {
                    for(var i = 0, len = itemFilter.length; i < len; i++){
                        var cond = itemFilter[i].cond;
                        if (cond && cond.length > 0) {
                            var ret = form.eval(cond, cxt, null);
                            if (ret == true) {
                                filter = itemFilter[i];
                                break;
                            }
                        } else {
                            filter = itemFilter[i];
                            break;
                        }
                    }
                }
            }
            //取 filter的值
            if (filter) {
              var filterVal,paras = [], value;
              if (filter.filterVals) {
                for (var j = 0, len = filter.filterVals.length; j < len; j++) {
                  filterVal = filter.filterVals[j];
                  switch (filterVal.type) {
                    case YIUI.FILTERVALUETYPE.CONST:

                      value = filterVal.refVal;
                      break;
                    case YIUI.FILTERVALUETYPE.FORMULA:
                    case YIUI.FILTERVALUETYPE.FIELD:
                      var cxt = new View.Context(form);

                      value = form.eval(filterVal.refVal, cxt, null);
                      break;
                  }
                  if( filterVal.dataType == YIUI.DataType.DATE ||
                    filterVal.dataType == YIUI.DataType.DATETIME ) {
                    if( value instanceof Date ) {
                      value = value.getTime();
                    }
                  }
                  paras.push(value);
                }
              }
                var dictFilter = {};
                dictFilter.itemKey = itemKey;
                dictFilter.formKey = form.formKey;
                dictFilter.sourceKey = key;
                dictFilter.fieldKey = key;
                dictFilter.filterIndex = filter.filterIndex;
                dictFilter.values = paras;
                dictFilter.dependency = filter.dependency;
                dictFilter.typeDefKey = filter.typeDefKey;
               	//dictView.dictFilter = dictFilter;

            }
            
            return dictFilter;
        },
        
        getItemKey: function(form, meta) {
            var cxt = new View.Context(form);
            var formula = meta.formulaItemKey;
            var itemKey = form.eval(formula, cxt);
            return itemKey;
        },

        getDVInfo: function(form, meta) {
            var itemKey = this.getItemKey(form, meta);

            var self = this;
            return new YIUI.MetaService(form).getDataObject(itemKey).then(function(data){
                var obj = new DataDef.DataObject();
                obj.fromJSON(data);
                return obj;
            });
        },
        
       	refreshNode : function(dictView, $tr) {
       		var id = $tr.attr("id");
       		var index = id.lastIndexOf('_');
			var itemKey = id.substring(0,index);
			var oid = id.substring(index+1);
			return new YIUI.DictService().getItem(itemKey, oid).then(function(item) {
				if (item.nodeType == 1) {
					$tr.attr('haschild', true);
				}
				if (item.enable != undefined) {
					$tr.attr('enable', item.enable);
					$tr.removeClass('invalid').removeClass('disabled');
					switch (item.enable) {
						case -1 :
							$tr.addClass("invalid");
							break;
						case 0 :
							$tr.addClass("disabled");
							break;
						case 1 :
							// tr.addClass("invalid");
							break;
					}
				}
				var value;
				for (var j = 0, len = dictView.colModel.length; j < len; j++) {
					value = item.getValue(dictView.colModel[j].key);
                    value = !value ? '' : $.htmlEncode(value);

					var $td = $tr.children('td').eq(j);
					if($td.children().length > 0) {
						var child = $td.children();
						$td.empty();
						$td.append(child).append(value);
					} else {
						$td.html(value);
					}
				}
			});
		}
    };
    Return = $.extend({},YIUI.Handler, Return);
    return Return;
})();
