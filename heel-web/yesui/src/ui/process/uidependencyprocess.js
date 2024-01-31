/**
 * Created by 陈瑞 on 2017/3/14 use WebStorm.
 */
YIUI.UIDependencyProcess = (function () {

    var Return = {
        valueChanged:function (form,com) {
            var relations = form.relations,target;
            for (var i = 0,r;r = relations[i];i++) {
                if( r.dependency === com.key ) {
                    target = r.target;
                    var loc = form.getCellLocation(target);
                    if( loc ) {
                        var grid = form.getComponent(loc.key);
                        grid.gridHandler.dependedValueChange(form,grid,target,r.dependency,null);
                    } else {
                        var _com = form.getComponent(target);
                        _com && _com.dependedValueChange(target,r.dependency,null);
                    }
                }
            }
        },

        cellValueChanged:function (form, grid, rowIndex, colIndex, cellKey) {
            var relations = form.relations, target;
            for (var i = 0,r;r = relations[i];i++) {
                if( r.dependency === cellKey ) {
                    target = r.target;
                    var loc = form.getCellLocation(target);
                    if( loc ) {
                        if( loc.key !== grid.key ) {
                            var grid2 = form.getComponent(loc.key);
                            grid2.gridHandler.dependedValueChange(form,grid2,target,r.dependency,null);
                        } else {
                            grid.gridHandler.dependedCellValueChange(form,grid,rowIndex,r.dependency,target,null);
                        }
                    } else {
                        var _com = form.getComponent(target);
                        _com && _com.dependedValueChange(target,r.dependency,null);
                    }
                }
            }
        },

        doCalcOneRow:function (control, rowIndex) {

        }
    }

    return Return;
})();
