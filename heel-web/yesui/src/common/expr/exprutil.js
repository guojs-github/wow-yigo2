YIUI.ExprUtil = (function () {
    var Return = {
        getImplValue: function (form, key, cxt, obj) {
            var value = null;
            if ( !obj ) {
                var loc = form.getCellLocation(key);
                // 如果存在单元位置，那么是一个集合组件
                if (loc) {
                    var key = loc.key,
                        rowLoc = cxt.getLoc(key);

                    var row = -1;

                    // 纵向行区域拓展编号
                    var areaIndex = cxt.getAreaIndex();
                    if( areaIndex == -1 ) {
                        row = loc.row;
                    } else {
                        row = loc.rows[areaIndex];
                    }
                    // 如果不是固定行,取上下文中的行信息
                    row = row == -1 ? rowLoc.getRow() : row;

                    var column = -1;

                    // 横向列拓展区域编号
                    var expandIndex = cxt.getExpandArea();
                    if( loc.expand ) {
                        if( expandIndex != -1 ) {
                            column = loc.columns[expandIndex];
                        } else {
                            column = rowLoc.getColumn();
                        }
                    } else {
                        column = loc.column;
                    }

                    //如果是固定行的单元格,取自己的位置信息
                    value = form.getCellValByIndex(key, row, column);
                } else {
                    // 头控件
                    var com = form.getComponent(key);
                    if ( com == null ) {
                        throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                            YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
                    }
                    value = com.getValue();
                }
                value = this.convertValue(value);
            } else {
                var gd = form.getGrid(obj);
                var lv = form.getListView(obj);
                var doc = form.getDocument();
                var table = doc.getByKey(obj);

                if( gd || lv ) {
                    var key = gd ? gd.key : lv.key,
                        loc = cxt.getLoc(key),
                        rowIndex = loc.getRow(),rowData;
                    if( lv ) {
                        rowData = lv.data[rowIndex];
                    } else if ( gd ) {
                        rowData = gd.getRowDataAt(rowIndex);
                    }
                    var bkmkRow = rowData.bkmkRow;
                    if( bkmkRow ) {
                        table.setByBkmk(bkmkRow.getBookmark());
                        value = table.getByKey(key);
                    }
                } else {
                    if ( table ) {
                        value = table.getByKey(key);
                    }
                }
            }
            return value;
        },
        setImplValue: function(form, key, value, cxt) {
            var cmp = form.getComponent(key);
            if( cmp ) {
                form.setComponentValue(key, value, true);
            } else {
                var loc = form.getCellLocation(key);
                if ( !loc ) {
                    throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
                }
                var locInfo = cxt.getLoc(loc.key);

                // 如果是固定行,取固定行行号,否则取上下文行号
                var rowIndex = loc.row;
                rowIndex = rowIndex == -1 ? locInfo.getRow() : rowIndex;

                form.setCellValByIndex(loc.key, rowIndex, loc.column, value, true);
            }
        },

        convertValue: function(value) {
        	if (value && value instanceof YIUI.ItemData) {
                value = value.getOID();
            }
    		return value;
    	},
        getJSONValue: function (form, key, cxt) {
          var comp = form.getComponent(key);
          if (comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
          }

          var value = comp.getValue(), reValue;

          switch(comp.type) {
          case YIUI.CONTROLTYPE.DICT:
          case YIUI.CONTROLTYPE.DYNAMICDICT:
          case YIUI.CONTROLTYPE.COMPDICT:
            if (value instanceof YIUI.ItemData) {
              reValue = value.toJSON();
            } else if ($.isArray(value)) {
              reValue = new Array();
              for(var i = 0 ; i < value.length;i++){
                reValue[i] = value[i].toJSON();
              }
            }
          }
          return reValue;
        }
    };
    return Return;
})();