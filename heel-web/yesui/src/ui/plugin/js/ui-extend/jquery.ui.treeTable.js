/**
* 树表组件
* @author benzhan (詹潮江)
* @version 1.4.2
* @lastUpdateDate 2011-09-03
* @mail zhanchaojiang@qq.com
*/
(function ($) {
    $.fn.treeTable = function (opts) {
        opts = $.extend({
            theme: 'default',
            expandLevel: 1,
            column: 0,
            enable: true,
            onSelect: function($treeTable, $tr){},
            beforeExpand: function($treeTable, $tr){},
            doubleClick:null
        }, opts);

        var $treeTable = this;
        $treeTable.addClass('tree_table');

        var css = {
            'N' : opts.theme + '_node',
            'AN' : opts.theme + '_active_node',
            'O' : opts.theme + '_open',
            'LO' : opts.theme + '_last_open',
            'S' : opts.theme + '_shut',
            'LS' : opts.theme + '_last_shut',
            'HO' : opts.theme + '_hover_open',
            'HS' : opts.theme + '_hover_shut',
            'HLO' : opts.theme + '_hover_last_open',
            'HLS' : opts.theme + '_hover_last_shut',
            'L' : opts.theme + '_leaf',
            'LL' : opts.theme + '_last_leaf',
            'B' : opts.theme + '_blank',
            'V' : opts.theme + '_vertline'
        };

        var pMap = this.pMap = {}, cMap = this.cMap = {};
        var $trs = $treeTable.find('tr');
        initRelation($trs, true);    

        $treeTable.click(function (event) {
            var $target = $(event.target);
            if(!opts.enable) return;
            
            if ($target.attr('arrow')) {
                var className = $target.attr('class');
                if (className == css['AN'] + ' ' + css['HLO'] || className == css['AN'] + ' ' + css['HO']) {
                	var $tr = $target.parents('tr[haschild]').eq(0);
                    //var id = $tr.id;
  
                    $target.attr('class', css['AN'] + " " + (className.indexOf(css['HO']) != -1 ?  css['HS'] : css['HLS']));
                    $target.next().removeClass('icon_open').addClass('icon_close');
                    
                    //关闭所有孩子的tr
                    shut($tr.attr('id'));
					return;
                } else if (className == css['AN'] + ' ' + css['HLS'] || className == css['AN'] + ' ' + css['HS']) {
                	var $tr = $target.parents('tr').eq(0);
                    //var id = $tr.id;
                    $target.attr('class', css['AN'] + " " + (className.indexOf(css['HS']) != -1 ? css['HO'] : css['HLO']));
                    $target.next().removeClass('icon_close').addClass('icon_open');
                    
                    opts.beforeExpand($treeTable, $tr);
                    //展开所有直属节点，根据图标展开子孙节点
                    open($tr.attr('id'));
                    

            		selectNode($tr);
            	
					return;
                }
            }else{
            	$treeTable.target = $target;
            	var $tr = $target.parents('tr').eq(0);
            	selectNode($tr);
            }
            
		

        });
		
        if(opts.doubleClick){
        	$treeTable.dblclick(function(event){
        		var $target = $(event.target);
            
            
	            if ($target.attr('arrow')) {
	            	
	            }else{
	                var $tr = $target.parents('tr').eq(0);
            		doubleClick($tr);	
	            }
        	});	
        }
        function doubleClick($tr){
        	if($tr){
        		if(opts.doubleClick && opts.doubleClick($treeTable , $tr) === false){ return; }
        	}
        }
        
        function selectNode($tr) {
        	//var $tr = $target.parents('tr')[0];
        	if($tr){
                if (opts.onSelect && opts.onSelect($treeTable, $tr) === false) { return; }
        	}
        }
        
        
		$treeTable.mouseover(hoverActiveNode).mouseout(hoverActiveNode);

        function hoverActiveNode(event) {
            var $target = $(event.target);

            if ($target.attr('controller')) {
                $target = $target.parents('tr[haschild]').find('[arrow]');
            }

            if ($target.attr('arrow')) { 
                var className = $target.attr('class');
                if (className && !className.indexOf(css['AN'])) {
                    var len = opts.theme.length + 1;
                    className = className.split(' ')[1].substr(len);
                    if (className.indexOf('hover_') === 0) {
                        className = opts.theme + '_' + className.substr(6);
                    } else {
                        className = opts.theme + '_hover_' + className;
                    }
                    
                    $target.attr('class', css['AN'] + ' ' + className);
                    return;
                }
            } 
        }
        
        /** 初始化节点关系　*/
        function initRelation($trs, hideLevel) {
            //构造父子关系
            $trs.each(function (i) {
            	if (!this.id) { return; }
                var pId = $(this).attr('pid') || -99999999;
                pMap[pId] || (pMap[pId] = []);
                pMap[pId].push(this.id);
                cMap[this.id] = pId;
                
                //给这个tr增加类为了提高选择器的效率
                $(this).addClass(pId);
            }).find('[controller]').css('cursor', 'pointer');

            //标识父节点是否有孩子、是否最后一个节点
            $trs.each(function (i) {
                if (!this.id) { return; }
                var $tr = $(this);
                
                /*pMap[this.id] && $tr.attr('haschild', true);
                var pArr = pMap[cMap[this.id]];
                if (pArr[0] == this.id) {
                    $tr.attr('isfirstone', true);
                } else {
                    var previd = 0;
                    for (var i = 0; i < pArr.length; i++) {
                        if (pArr[i] == this.id) { break; }
                        previd = pArr[i];
                    }
                    if(previd != 0){
                    	$tr.attr('previd', previd);
                    }
                }*/

                //pArr[pArr.length - 1] == this.id && $tr.attr('isLastOne', true);

                var depth = getDepth(this.id);
                $tr.attr('depth', depth);

                //格式化节点
				//formatNode(this);

                //判断是否要隐藏限制的层次
                if (hideLevel) {
                    depth > opts.expandLevel && $tr.hide();
                    //判断是否小于深度，如果小于深度则要换成展开的图标
                    if ($tr.attr('haschild') && $tr.attr('depth') < opts.expandLevel) {
                        var className = $tr.attr('islastone') ? css['LO'] : css['O'];
                        $tr.find('.' + css['AN']).attr('class', css['AN'] + ' ' + className);
                        $tr.find('.icon_close').removeClass('icon_close').addClass('icon_open');
                    }
                }               
            });
            
            $trs.each(function (i) {
                if (!this.id) { return; }
                var $tr = $(this);
                //格式化节点
                formatNode($tr);      
            });
            
            
            //递归获取深度
            function getDepth(id) {
                if (cMap[id] == undefined || cMap[id] == -99999999) { return 1; } 
                var $parentDepth = getDepth(cMap[id]);
                return $parentDepth + 1; 
            }
        }

        //递归关闭所有的孩子
        function shut(id) {
            if (!pMap[id]) { return false; }
            for (var i = 0; i < pMap[id].length; i++) {
                shut(pMap[id][i]);
            }
//            $tr.hide();
            $('tr.' + id, $treeTable).hide();
        }

        //根据历史记录来展开节点
        function open(id) {
            $('tr.' + id, $treeTable).show();
            if (!pMap[id]) { return false; }
            for (var i = 0; i < pMap[id].length; i++) {
                var cId = pMap[id][i];
                if (pMap[cId]) {
                    var className = $('#' + cId, $treeTable).find('.' + css['AN']).attr('class');
                    //如果子节点是展开图表的，则需要展开此节点
                    (className == css['AN'] + ' ' + css['O'] || className == css['AN'] + ' ' + css['LO']) && open(cId);
                }
            }
        }

        function formatNode($cur) {
            //var $cur = $(tr);
            var id = $cur.attr('id');
			if($cur.children('td').eq(opts.column).find('.prev_span').length > 0){
				return $cur;
			}
            //-------------下面一大段都是获取$preSpan---------
            if (cMap[id] == -99999999) {
                //如果是顶级节点，则没有prev_span
                var $preSpan = $('<span class="prev_span"></span>');
            } else {
                //先判断是否有上一个兄弟节点
                if (!$cur.attr('isfirstone')) {
                	
                	var pre = formatNode($('#' + $cur.attr('previd'), $treeTable));
                	var $preSpan = pre.children('td').eq(opts.column).find('.prev_span').clone();
                    //var $preSpan = $('#' + $cur.attr('previd'), $treeTable).children("td").eq(opts.column).find('.prev_span').clone();
                } else {
                    var $parent = $('#' + cMap[id], $treeTable);
                    //没有上一个兄弟节点，则使用父节点的prev_span
                    var $preSpan = $parent.children("td").eq(opts.column).find('.prev_span').clone();

                    //如果父亲后面没有兄弟，则直接加空白，若有则加竖线
                    if ($parent.attr('islastone')) {
                        $preSpan.append('<span class="' + css['N'] + ' ' + css['B'] + '"></span>');
                    } else {
                        $preSpan.append('<span class="' + css['N'] + ' ' + css['V'] + '"></span>');
                    }
                }
            }
            //------------------------------------------------
		
            var isLeaf = !$cur.attr('haschild');
            var className, iconCss;
            
            if (!isLeaf) {
                //如果有下一个节点，并且下一个节点的父亲与当前节点的父亲相同，则说明该节点不是最后一个节点
            	className = $cur.attr('islastone') ? css['LS'] : css['S'];
                className = css['AN'] + ' ' + className;
                iconCss = 'icon_close';
            } else {
                className = css['N'] + ' ' + ($cur.attr('islastone') ? css['LL'] : css['L']);
                iconCss = 'icon_leaf';
            }

            var $tds = $cur.children("td");
            var $td;
            
            for(var i=0,len=$tds.length;i<len;i++) {
            	$td = $($tds[i]);
            	$td.html('<span class="tree_table_text">' + $td.html() + '</span>');
            }
            $td = $tds.eq(opts.column);
            $td.prepend('<span class="default_node '+iconCss+'"></span>').prepend('<span arrow="true" class="' + className + '"></span>').prepend($preSpan);
            return $cur;
        };
        
        $treeTable.setEnable = function(enable) {
        	opts.enable = enable;
        };
                
        $treeTable.addChilds = function(trsHtml) {
            var $trs = $(trsHtml);
            if (!$trs.length) { return false; }
            
           // var pId = $($trs[0]).attr('pId');
           // if (!pId) { return false; }
            
            //插入到最后一个孩子后面，或者直接插在父节点后面
			// var insertId = pMap[pId] && pMap[pId][pMap[pId].length - 1] || pId;
			// $('#' + insertId, $treeTable).after($trs);
          	var getChildrenCount = function(id){
 				var child = $('tr.' + id, $treeTable);
 				var count = child.length;
 				if(count == 0){
 					return count;
 				}
 				for(var i = 0 ; i < child.length ; i++){
 					var childID = child[i].id;
 					count += getChildrenCount(childID);
 				}
 				return count;
          	};
          	
            var addtr = function($tr){
            	
               if (!$tr.attr('id')) { return; }
               var pId = $tr.attr('pid');
               if(!pId){ return false;}
               
               var previd = $tr.attr('previd') || pId;
               if (previd) {
					//指定上一节点时
					var preTr = $('#' + previd, $treeTable);
					if (preTr.length > 0) {
						//var count = getChildrenCount(previd);
						if ($tr.attr('previd') && $('tr.'+previd).length > 0) {
							var depth = preTr.attr('depth');
							var last = preTr.nextUntil('tr[depth=' + depth
									+ ']').last();
							if (last) {
								last.after($($tr));
							} else {
								preTr.after($($tr));
							}
						} else {
							preTr.after($($tr));
						}
				

						var broTrs = $("tr[pid=" + pId + "]", $treeTable)
						var _index = broTrs.index($tr) + 1;
						var _len = broTrs.length;
						if (_index == 1) {
							broTrs.filter("[isfirstone='true']")
									.removeAttr("isfirstone").attr('previd',$tr.attr('id'));
							$tr.attr("isfirstone", "true");
							if (_len == 1)
								$tr.attr("islastone", "true");
						} else if (_index > 1) {
							$($tr).removeAttr("isfirstone");
							if (_index == _len) {
								broTrs.filter("[islastone='true']").removeAttr("islastone");
								$tr.attr("islastone", "true");
							} else {
								$tr.removeAttr("islastone");
							}
						}
					} else {
						preTr = $trs.filter("tr[id=" + previd + "]");
						if (preTr.length > 0) {
							addtr(preTr.eq(0));
							addtr($tr);
						}
					}
				} else {
					// 如果是第一个节点
					if ($tr.attr('isfirstone')) {
						var pTr = $('#' + pId, $treeTable);
						pTr.after($($tr));

						var broTrs = $("tr[pid=" + pId + "]", $treeTable)

						var _len = broTrs.length;

						if (_len > 1) {
							broTrs.filter("[isfirstone='true']")
									.removeAttr("isfirstone").attr('previd',$tr.attr('id'));
							$tr.attr("isfirstone", "true");
						}
						if (_len == 1)
							$tr.attr("islastone", "true");

					} else {
						
						
			
//						var last = $("tr[pid=" + pId + "][islastone='true']",
//								$treeTable)
//						if (last.length > 0) {
//							var lastId = last.attr('id');
//							$('tr.' + lastId).after($($tr));
//							last.removeAttr("islastone");
//							$tr.attr('previd', lastId)
//									.attr("islastone", "true");
//						}
					}
				}
           };
            
            var updateTrClass = function($tr){
               if (!$tr.attr('id')) { return; }
               var pId = $tr.attr('pid');
               if(!pId){ return false;}
               
               var previd = $tr.attr('previd') || pId;
               var preTr = $('#' + previd, $treeTable);
               if(preTr.length > 0){     
	                var $arrow =  $('#' + pId, $treeTable).find('[arrow="true"]');
	 				var className = $arrow.attr('class');
	 		
		            if (className == css['AN'] + ' ' + css['S'] || className == css['AN'] + ' ' + css['LS']) {
		                $arrow.attr('class', css['AN'] + " " + (className.indexOf(css['S']) != -1 ? css['O'] : css['LO']));
		                $arrow.next().removeClass('icon_close').addClass('icon_open');
		            }
               }
            };
            
           
           	for(var i = 0 ; i < $trs.length ; i ++){
           		var $tr = $trs.eq(i);
     			addtr($tr);
           	}
            initRelation($trs);
            
            // 如果性能问题， 则 在上面的循环中把 所有的pId 全部取出 再做样式变化
            for(var i = 0 ; i < $trs.length ; i ++){
           		var $tr = $trs.eq(i);
     			updateTrClass($tr);
           	}
            
//            $.each($trs,function(i){
//            //$trs.each(function (i) {
//            	if (!this.id) { return; }
//                var pId = $(this).attr('pId') || -99999999;
//                
//                var previd = $(this).attr('prevId') || pId;
//                
//                $('#' + previd, $treeTable).after($(this));
//                
//                var $arrow =  $('#' + pId, $treeTable).find('[arrow="true"]');
// 				var className = $arrow.attr('class');
//	            if (className == css['AN'] + ' ' + css['S']) {
//	                $arrow.attr('class', css['AN'] + " " + (className.indexOf(css['S']) != -1 ? css['O'] : css['LO']));
//	                $arrow.next().removeClass('icon_close').addClass('icon_open');
//	            }
//            });
                      
    
        };

        var refreshTreeClass = function($cur){
        	            //var $cur = $(tr);
            var id = $cur.attr('id');
            var $td = $cur.children('td').eq(opts.column);
            var prev_span = $td.find('.prev_span');
			if(prev_span.length > 0){
				prev_span.remove();
				
				if (cMap[id] == -99999999) {
	                //如果是顶级节点，则没有prev_span
	                var $preSpan = $('<span class="prev_span"></span>');
	            } else {
	                //先判断是否有上一个兄弟节点
	                if (!$cur.attr('isfirstone')) {
	                	
	                	var pre = formatNode($('#' + $cur.attr('previd'), $treeTable));
	                	var $preSpan = pre.children('td').eq(opts.column).find('.prev_span').clone();
	                    //var $preSpan = $('#' + $cur.attr('previd'), $treeTable).children("td").eq(opts.column).find('.prev_span').clone();
	                } else {
	                    var $parent = $('#' + cMap[id], $treeTable);
	                    //没有上一个兄弟节点，则使用父节点的prev_span
	                    var $preSpan = $parent.children("td").eq(opts.column).find('.prev_span').clone();
	
	                    //如果父亲后面没有兄弟，则直接加空白，若有则加竖线
	                    if ($parent.attr('islastone')) {
	                        $preSpan.append('<span class="' + css['N'] + ' ' + css['B'] + '"></span>');
	                    } else {
	                        $preSpan.append('<span class="' + css['N'] + ' ' + css['V'] + '"></span>');
	                    }
	                }
	            }
	            $td.prepend($preSpan);
	            
	            
		        var isLeaf = !$cur.attr('haschild');
	            var className, iconCss;
	            
	            if (!isLeaf) {
	                //如果有下一个节点，并且下一个节点的父亲与当前节点的父亲相同，则说明该节点不是最后一个节点
	            	className = $cur.attr('islastone') ? css['LS'] : css['S'];
	                className = css['AN'] + ' ' + className;
	            } else {
	                className = css['N'] + ' ' + ($cur.attr('islastone') ? css['LL'] : css['L']);
	            }
            
             	var $arrow =  $cur.find('[arrow="true"]');
             	$arrow.removeClass().addClass(className);

				return $cur;
			}else{
				return formatNode($cur);
			}
        };
           	
        $treeTable.deleteChilds = function(ids) {
        	
        	$.each(ids,function(i,id){
        		var $tr = $('#' + id, $treeTable);
        		
        		if(id == 'Material_75583'){
        			var a = 1;
        			a = a+1;
        		}
        		var pId =  $tr.attr('pid') || -99999999;
        		if($tr.attr("islastone") == "true") {
        			//找上一个兄弟 设置为last
					var $prev = $('#'+$tr.attr('previd'), $treeTable);
        			if($prev.length > 0){
        				$prev.attr('islastone','true');
        				refreshTreeClass($prev);
        			}
        			//$tr.prev() && $tr.prev().attr("islastone", "true");
        		} 
        		if($tr.attr("isfirstone") == "true") {
        			var $next = $($("tr[previd='"+id+"']", this._$table));
					if($next.length > 0){
						$next.attr('isfirstone',true);
						//refreshTreeClass($next);
					}
        			//$tr.next() && $tr.next().attr("isfirstone", "true");
        		}
        		$tr.remove();
        		var index;
        		index = pMap[pId].indexOf(''+id);
        		
        		pMap[pId].splice(index,1);
        		delete cMap[id];
        		
  				var $pTr = $('#' + pId, $treeTable);
  				if(pMap[pId].length == 0){
  					var $arrow =  $('#' + pId, $treeTable).find('[arrow="true"]');
  					var className = $arrow.attr('class');
  					if(className == css['AN'] + ' ' + css['O']){
  						$arrow.attr('class', css['AN'] + " " + (className.indexOf(css['O']) != -1 ? css['S'] : css['LS']));
  						$arrow.next().removeClass('icon_open').addClass('icon_close');
  					}
  				}
  				
        	});
        };
         
        $treeTable.expand = function($tr) {
        	                    //var id = $tr.id;
//            $target.attr('class', css['AN'] + " " + (className.indexOf(css['HS']) != -1 ? css['HO'] : css['HLO']));
//            $target.next().removeClass('icon_close').addClass('icon_open');
            
            opts.beforeExpand($treeTable, $tr);
            //展开所有直属节点，根据图标展开子孙节点
            open($tr.attr('id'));
        };
        
        $treeTable.clearAll = function() {
	    //	$("tr", $treeTable).remove();
	    //	pMap = {}, cMap = {};
        	var i = 0;
        	  	$("tr[pid]",$treeTable).remove();
        	  	pMap = {}, cMap = {};
        };
        
        
        $treeTable.removeChildren = function(id) {
			if(pMap[id]){
				var len = pMap[id].length;
				for (var i = 0; i < len; i++) {
	                $treeTable.removeNode(pMap[id][i]);
	            }
			}
        };
        
        $treeTable.formatNode = formatNode;
        
        $treeTable.removeNode = function(id , css) {
        	if(pMap[id]){
	            for (var i = 0; i < pMap[id].length; i++) {
	                $treeTable.removeNode(pMap[id][i]);
	            }
	            delete pMap[id];
        	}
			delete cMap[id];
			if(css){
				var $tr = $('#' + id, $treeTable);
				var first = $tr.index();
				
				var isfirst = $tr.attr('isfirstone');
				var islast = $tr.attr('islastone');
				
				if(isfirst && islast){
					//父节点只有1个子节点	
					var pId = $tr.attr('pid');
					var $arrow =  $('#' + pId, $treeTable).find('[arrow="true"]');
  					var className = $arrow.attr('class');
  					if(className == css['AN'] + ' ' + css['O']){
  						$arrow.attr('class', css['AN'] + " " + (className.indexOf(css['O']) != -1 ? css['S'] : css['LS']));
  						$arrow.next().removeClass('icon_open').addClass('icon_close');
  					}
				}else if(isfirst){
					//找第一个兄弟节点 设置为first
					var $next = $($("tr[previd='"+id+"']", this._$table));
					if($next.length > 0){
						$next.attr('isfirstone',true);
						//refreshTreeClass($next);
					}
				}else if(islast){
					//找上一个兄弟 设置为last
					var $prev = $('#'+$tr.attr('previd'), $treeTable);
        			if($prev.length > 0){
        				$prev.attr('islastone','true');
        				refreshTreeClass($prev);
        			}
				}else {
					var previd = $tr.attr('previd');
					var bro = $tr.prev().attr('previd',previd);
					
				}
			}
            $('#' + id, $treeTable).remove();
        };
        
        
        
        
        return $treeTable;
    };
})(jQuery);

