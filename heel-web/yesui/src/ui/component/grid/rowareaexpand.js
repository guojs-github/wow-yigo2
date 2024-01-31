(function () {
    YIUI.GridRowAreaExpand = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        makeDimValues: function (areaExpand) {

            var dimValues = [];

            var content = areaExpand.content;

            var cxt = new View.Context(this.form);

            var result = this.form.eval(content, cxt);

            if( !(result instanceof DataDef.DataTable) ) {
                return;
            }

            var value,caption,info;

            result.beforeFirst();
            while (result.next()) {
                var dimValue = new YIUI.MultiDimValue();
                for( var i = 0,size = result.getColumnCount();i < size;i++ ) {
                    info = result.getCol(i);
                    value = YIUI.TypeConvertor.toDataType(info.type, result.getByKey(info.key));
                    dimValue.addValue(new YIUI.MultiDimNode({
                        columnKey: info.key,
                        dataType: info.type,
                        value: value
                    }));
                }
                dimValues.push(dimValue);
            }

            return dimValues;
        },

        expand: function () {
            var metaGrid = this.grid.getMetaObj(),
                targetMetaGrid = $.extend(true, {}, metaGrid),
                expand = targetMetaGrid.areaExpand;

            var dimValues = this.makeDimValues(expand);

            var tempRows = [],
                cloneRows = [];

            var start = expand.start,
                count = expand.count;

            // 找出原始拓展行
            var size = targetMetaGrid.rows.length;
            for( var i = start;i < size && (i - start) < count;i++ ) {
                tempRows.add(targetMetaGrid.rows[i]);
            }

            // 删除行
            targetMetaGrid.rows.splice(start,count);

            var index = start;

            // 克隆区域行
            for( var i = 0,dimValue;dimValue = dimValues[i];i++ ) {
                for( var k = 0,metaRow;metaRow = tempRows[k];k++ ) {
                    //  这里 cloneRow.cells.crossValue 不是深度拷贝
                    var cloneRow = $.extend(true, {}, metaRow);
                    if( k == 0 ) {
                        cloneRow.isAreaHead = true;
                    }
                    cloneRow.isAreaExpand = true;
                    cloneRow.areaIndex = i;
                    cloneRow.dimValue = dimValue;
                    targetMetaGrid.rows.splice(index,0,cloneRow); // 添加克隆行
                    if( k == tempRows.length - 1 ) {
                        cloneRow.isAreaTail = true;
                    }
                    index++;
                }
            }

            // TODO
            var objectArray = targetMetaGrid.rowLayer.objectArray;

            objectArray.length = 0;
            for( var i = 0,size = targetMetaGrid.rows.length;i < size;i++ ) {
                objectArray.push({
                   objectType: YIUI.MetaGridRowObjectType.ROW,
                   rowIndex:i
                });
            }

            this.grid.setMetaObj(targetMetaGrid);
        }
    });

})();