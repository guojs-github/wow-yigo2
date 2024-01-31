YIUI.PrintGridUtil = (function () {
    var Return = {
        toJSONSection: function (form, grid) {
            var ts = grid.el[0],
            $firstRow = $("tr.ygfirstrow", ts.grid.bDiv);//行头保存有宽度
            
            var section = {}, cls = $("td", $firstRow), colSize = 0;
            section.columns = [];
        	section.rows = [];
            
            for (var i = 0, cl; cl = cls[i]; i ++ ) {
            	if (cl.style.display != "none") {
            		var column = {};
            		column.width = parseInt(cl.style.width.replace("px", "")) * 72.0 / 97.0;
            		column.visible = true;
                	section.columns.push(column);
                	colSize ++;
            	}        	
            }
            
            this.toJSONColumn(grid, section, colSize);
            
            this.toJSONRow(grid, section);
            
            return section;
        },
        
        toJSONColumn : function (grid, section, colSize) {
        	var ts = grid.el[0],
            $colheader = $("tr.ui-ygrid-columnheader", ts.grid.hDiv),// 顶端
            $headers = $("tr.ui-ygrid-headers", ts.grid.hDiv);// 扩展列的行
        	
        	if ($colheader.length > 0) {
            	var ths = $("th", $colheader), row = {}, cells = [];

            	for (var i = 0, th; th = ths[i]; i ++) {
            		if (th.style.display != "none") {
            			var cell = this.getDefJSONCell();
            			cell.text = th.title;
                		cell.mergedRowSpan = th.rowSpan;
                		if (th.rowSpan > 1) {
                			cell.isMerged = true;
                			cell.isMergedHead = true;
                		}                		
                		cell.mergedColumnSpan = th.colSpan;
                		if (th.colSpan > 1) {
                			cell.isMerged = true;
                			cell.isMergedHead = true;
                		}
                		cells.push(cell);
                		
                		if (th.colSpan > 1) {
                			for (var j = 1 ; j < th.colSpan; j++) {
                				cells.push({
                					isMerged : true,
                					mergedColumnSpan : 1,
                					mergedRowSpan: 1
                				});
                			}
                		}
            		}        		
            	}
            	row.cells = cells;
            	row.height = (30 * 72.0) / 97.0;
            	section.rows.push(row);
            }
            
            // Section中的行,表格中的列
            var index = 0, vcol = 0;
            for (var i = 0 ; i < $headers.length; i ++) {
            	var ths =  $("th", $headers[i]), row = {}, cells = [];

            	for (var i = 0, th; th = ths[i]; i ++) {       		
            		if (th.style.display != "none") {
            			
            			for (var j = index; j < th.getAttribute("colIndex") - vcol; j++) {
            				cells.push({
            					isMerged : true,
            					mergedColumnSpan : 1,
            					mergedRowSpan: 1
            				});
            				
            			}
            			
            			index = parseInt(th.getAttribute("colIndex")) + 1;
            			
            			var cell = this.getDefJSONCell();
            			cell.text = th.title;
                		cell.mergedRowSpan = th.rowSpan;
                		if (th.rowSpan > 1) {
                			cell.isMerged = true;
                			cell.isMergedHead = true;
                		}                		
                		cell.mergedColumnSpan = th.colSpan;
                		if (th.colSpan > 1) {
                			cell.isMerged = true;
                			cell.isMergedHead = true;
                		}
                		
                		cells.push(cell);
            		} else {
            			vcol ++;
            		}        		
            	}
            	
        		for (var m = cells.length; m < colSize; m++ ) {
        			cells.push({
        				isMerged : true,
        				mergedColumnSpan : 1,
        				mergedRowSpan: 1
    				});
        		}
            	
            	row.cells = cells;
            	row.height = ( 30 * 72.0 )/ 97.0;
            	section.rows.push(row);
            }
        },
        
        toJSONRow : function (grid, section) {
        	// 表格中的行
        	var ts = grid.el[0];
        	
            var rownum = grid.showRowHead ? 1 : 0;
            var metaObj = grid.getMetaObj(),
            	rowData,
            	metaRow,
            	metaCell;
            var _this = this;
            $(".ygrow",ts.grid.bDiv).each(function (n) {
                var tds = $("td",this), row = {}, cells = [];
                rowData = grid.getRowDataAt(n);
                metaRow = metaObj.rows[rowData.metaRowIndex];

                for (var i = 0, td; td = tds[i]; i ++ ) {
                	if (td.style.display != "none") {
                		
                		if ( i== 0 && grid.showRowHead) {
                        	var cell = _this.getDefJSONCell();
                        	cell.text = td.textContent;

                    		cell.mergedRowSpan = td.rowSpan;
                    		if (td.rowSpan > 1) {
                    			cell.isMerged = true;
                    			cell.isMergedHead = true;
                    		}
                    		
                    		cell.mergedColumnSpan = td.colSpan;
                    		if (td.colSpan > 1) {                			
                    			cell.isMerged = true;
                    			cell.isMergedHead = true;
                    		}
                    		cells.push(cell);
                		} else {
                			metaCell = metaRow.cells[i - rownum];
                        	var cell = _this.getDefJSONCell();
                        	cell.text = td.textContent;

                    		cell.isMerged = metaCell.merge;
                			cell.isMergedHead = metaCell.mergeHead;
                    		
                			cell.mergedRowSpan = td.rowSpan;
                			cell.mergedColumnSpan = td.colSpan;
                    		cells.push(cell);
                		}            		            	
                	}
                	
                }
                
                row.cells = cells;
            	row.height = (parseInt(this.style.height.replace("px", "")) * 72.0) / 97.0;
            	section.rows.push(row);                
            });      	
        },
        
        getDefJSONCell : function () {
        	var cell = {};
        	var color = {
                	r: 0,
                	g: 0,
                	b: 0
                };
            
            var display = {
                font : {
                	name: "Microsoft YaHei",
                	size: 12,
                	underlineStyle: -1
                },
                border: {
                	topColor: color,
                	leftColor: color,
                	rightColor: color,
                	bottomColor: color,
                	leftStyle: 1,
                	topStyle: 1,
                	rightStyle: 1,
                	bottomStyle: 1
                },
                verticalAlignment: 1,
                horizontalAlignment: 1
            };
        	
            cell.type = 0;
    		cell.display = display;
    		cell.foreColor = color;
    		cell.overflowType = 1;
            
            return cell;
        }
    };
    return Return;
})();