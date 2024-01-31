/**
 * Created by 陈瑞 on 2017/3/1.
 */
var YIUI = YIUI || {};
(function () {
    YIUI.AbstractUIProcess = YIUI.extend({
        form : null,
        convertor: YIUI.TypeConvertor,

        init : function(form) {
            this.form = form;
        },

        getFormEnable : function(){
            return this.form.operationState == YIUI.Form_OperationState.New ||
                this.form.operationState == YIUI.Form_OperationState.Edit;
        },

        initTree:function (item) {
            var $this = this;
            item.items.forEach(function (o) {
                if( o.content ) {
                    o.syntaxTree = $this.form.getSyntaxTree(o.content);
                }
            });
            item.treeInit = true;
        },

        calcFormulaValue:function (item, context) {
            var result = null;
            if( !item.treeInit ) {
                this.initTree(item);
            }
            try {
                if( item.syntaxTree ) {
                    result = this.form.evalByTree(item.syntaxTree, context);
                } else if ( item.defaultValue ) {
                    result = item.defaultValue;
                }
            } catch (e) {
                result = "#DIV/0";
            }
            return result;
        },

        calcEnable:function (item, context, defaultValue) {
            if( !this.checkEnableRights(item) ) {
                return false;
            }
            if( item.items.length == 0 ) {
               return defaultValue;
            }
            if( !item.treeInit ) {
                this.initTree(item);
            }
            for( var i = 0,o;o = item.items[i];i++ ) {
                if( o.syntaxTree && !this.convertor.toBoolean(this.form.evalByTree(o.syntaxTree, context))) {
                  return false;
                }
            }
            return true;
        },

      checkEnableRights: function (item) {
            if( item.type == YIUI.UIEnableProcess.Operation ) {
                return this.form.hasOptRight(item.target);
            }
            return this.form.hasEnableRight(item.target);
      },

      calcVisible:function (item,context,defaultValue) {
            if( !this.checkVisibleRights(item) ) {
                return false;
            }
            if( item.items.length == 0 ) {
                return defaultValue;
            }
            if( !item.treeInit ) {
                this.initTree(item);
            }
            for( var i = 0,o;o = item.items[i];i++ ) {
               if( o.syntaxTree && !this.convertor.toBoolean(this.form.evalByTree(o.syntaxTree, context))) {
                 return false;
              }
            }
            return true;
      },

      checkVisibleRights: function (item) {
        if( item.type == YIUI.UIEnableProcess.Operation ) {
          return this.form.hasOptRight(item.target);
        }
        return this.form.hasVisibleRight(item.target);
      },

        calcCheckRule:function (item,context) {
          if( !item.treeInit ) {
            this.initTree(item);
          }
          for( var i = 0,o;o = item.items[i];i++ ) {
              if( !o.syntaxTree ) continue;
              var result = this.form.evalByTree(o.syntaxTree, context);
              if( result != null ) {
                 if( typeof result == 'boolean' && !result ) return result;
                 if( typeof result == 'string' && result ) return result;
              }
          }
          return true;
        },

        moveError:function (com) {
            if( !com.isVisible() && (com.isError() || com.isRequired()) ) {
                if( com.isError() ) {
                    this.form.setError(true, com.getErrorMsg(), com.key);
                }
                if( com.isRequired() ) {
                    this.form.setError(true, com.caption + " " + YIUI.I18N.getString("CONTROL_REQUIRED","-必须填写-"), com.key);
                }
            } else {
                if( this.form.error[com.key] ){
                    this.form.setError(false, null, com.key);
                }
            }
        },

        moveCellError: function (grid,rowData,rowIndex,colIndex) {
            var cellData = rowData.data[colIndex],
                column = grid.getColumnAt(colIndex),
                editOpt = grid.getCellEditOpt(rowIndex,colIndex);
            if( column.hidden && (cellData[4] || cellData[3]) ) {
                if( cellData[4] ) {
                    grid.setRowError(rowIndex, true, cellData[5], editOpt.key);
                }
                if( cellData[3] ) {
                    grid.setRowError(rowIndex, true, editOpt.caption + " " + YIUI.I18N.getString("CONTROL_REQUIRED","-必须填写-"), editOpt.key);
                }
            } else {
                if( rowData.error[editOpt.key] ) {
                    grid.setRowError(rowIndex, false, null, editOpt.key);
                }
            }
        },

        extractIndexes: function (cxt,grid,rowIndex,indexes) {
            var colIndex = cxt.getColIndex();
            if( colIndex != -1 ) {
                var rowData = grid.getRowDataAt(rowIndex),
                    metaRow = grid.getMetaObj().rows[rowData.metaRowIndex];

                var metaCell = metaRow.cells[colIndex];
                if( !metaCell.isColExpand ) {
                    return indexes;
                }

                var indexes2 = [].concat(indexes),
                    v1 = metaCell.crossValue,
                    v2,
                    metaCell2;

                for( var c = 0,length = indexes.length;c < length;c++ ) {
                    metaCell2 = metaRow.cells[indexes[c]];
                    v2 = metaCell2.crossValue;

                    if( !v1.contains(v2) ) {
                        indexes2.splice(c,1,-1);
                    }
                }
                return indexes2;
            }
            return indexes;
        }

    })
})();