/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-3-20
 * Time: 下午4:30
 * To change this template use File | Settings | File Templates.
 */
(function () {
	YIUI.Yes_DictTree = function(options){
		var Return = {

			/** HTML默认创建为label */
			el: $("<div></div>"),
			
		    /** 父子节点是否关联 */
		    independent: true,
		    /** 是否可勾选 */
		    showCheckBox: false,
		    
		    /** 选中的节点 */
		    checkedNodes : {},
		    
		    /** 半选状态的节点*/
		    indeterminatedNodes : null ,
		    
		    /** 记录父子关系的集合*/
		    _pMap : {},
		    
		    /** 根节点 */
		    rootNode : null,
		    
		    _liwrap : $("<div class = 'liwrap'></div>"),
		    
		    _searchdiv : $("<div class = 'chainsearch'></div>"),
		    
		    _footdiv : $("<div class = 'footdiv'></div>"),
		    
		    _footMean : $("<div class = 'footmean'></div>"),
		    /**总页数*/
		    allPageNum : null,
		    
		    startRow : 0,
	        pageIndicatorCount : 3,
	        fuzzyValue : null,

	        showSuggest : false,
	        isFinishExp: false,
		    
		    /** 构建树结构 */
		    buildTreenode: function(nodes, pNodeKey, level, secondaryType, isNext) {
		    	if(!nodes) {
		    		return;
		    	}
		    	if(!nodes.length) {
		    		nodes = $(nodes);
		    	}
		    	
		    	this.addNodes(nodes, pNodeKey, level, secondaryType, isNext);
		    
		    },
		    
		    /**
		     * 根据父节点 添加子节点
		     * @param {} nodes
		     * @param {} pNodeKey
		     */
		    addNodes: function(nodes, pNodeKey, level, secondaryType, isNext) {
		    	
		    	var selectNodeId = this.selectedNodeId;
		    	var selnid = selectNodeId;
		    	
		    	
		    	var $pNode = $('#' + pNodeKey, this.el);
		    	allPageNum = Math.ceil(isNext/10);
		    	this._footdiv.find(".pageinfo").attr("maxnum",allPageNum);
		    				
		    	// 无子节点的时候 去掉节点前的+号
		    	if(nodes.length <= 0  && secondaryType != 5) {
		    		$pNode.children('span:first').removeClass('dt-collapse');
		    		return;
		    	}
		    	
		    	//如果下一页的item不为0，点击下一页的时候删除当前页的item
		    	if (secondaryType == 5) {
		    		
		    		if (isNext != 0) {
			    		this.reset();	
			    	}
			    	var _pageInfo = $("<span class = 'pageinfo'></span>");
			    	if (this.startRow == 0) {
			    		if (this._footdiv.find(".pageinfo").length != 0) {
			    			this._footdiv.find(".pageinfo").children("span").remove();
			    			_pageInfo = this._footdiv.find(".pageinfo");
			    		}
			    		
			    		_pageInfo.attr("maxnum", allPageNum);
			    		var btnNum = allPageNum >= 3 ? 3 : allPageNum;
			    		for ( var i = 0; i < btnNum;i++) {
			    			if (i == 0) {
			    				$("<span class='pagenum nowitem'>"+(i + 1)+"</span>").appendTo(_pageInfo);
			    			} else {
			    				$("<span class='pagenum'>"+(i + 1)+"</span>").appendTo(_pageInfo);
			    			}
				    		
				    	}
			    		if(btnNum == 1)
			    			$(".next", this._footMean).addClass("disable");
				    	this._footMean.find(".prev").after(_pageInfo);
			    		
			    	}
			    	
		    		
		    	}
		    	
				var node, nid ,oid, itemKey;
				
				this._pMap[pNodeKey] || (this._pMap[pNodeKey] = []);
			
				for (var i = 0, len = nodes.length; i < len; i++) {
					node = nodes[i];
					nid = node.id;
					oid = node.OID;
					itemKey = node.itemKey;
		
					this._pMap[pNodeKey].push(nid);
					
					var _li = $("<li id='"+ nid + "' oid = '"+oid+"'parentid='"+pNodeKey+"' itemKey='"+itemKey+"'></li>");
					if (secondaryType != 5) {
						_li.attr("level", level).css("padding-left", 15);
					}
					if (secondaryType == 5) {
						_li.attr("level", level).css("padding-left", 2);
						if(nid == selnid){
							_li.addClass("sel");
						}
					}

					var pItemKey = $pNode.attr("itemKey");
					var comp_Level = parseInt($pNode.attr("comp_Level"));
					if(itemKey != pItemKey) {
						comp_Level += 1;
					} 
					_li.attr("comp_Level", comp_Level);
					var comp_css = "comp_Level" + comp_Level;
					_li.addClass(comp_css);
					
					if (secondaryType != 5 || this.showCheckBox){
						$("<div class='dt-wholerow'/>").appendTo(_li);
					}
					
					
					var _pul = $pNode.children("ul");
					
					if(_pul.length == 0){
						_pul = $("<ul class='dt-ul'></ul>").appendTo($pNode).css("display", "none");
						
					}
					
					if (secondaryType == 5 && !this.showCheckBox){
						if($('.rootli', _pul).length == 0){
							var _rootLi = $("<li class = 'rootli'><span class = 'code'>"+YIUI.I18N.getString("DICT_CODE","代码")+"</span><span class='chainname'>名称</span></li>");
							_rootLi.appendTo(_pul);
						}
					}
					_li.appendTo(_pul);
		
					var _a = $("<a class='dt-anchor'></a>");
		
			        var _ul, _span, _chk;
			        
			        if(node.NodeType == 1) {
			        	// 汇总节点
			            if(node.open) {
			            	_span = $("<span class='icon dt-expand'/>").appendTo(_li);           	  
			            	_explore = $("<span class='branch b-expand'/>").appendTo(_a);
			            }
			            else {
			            	_span = $("<span class='icon dt-collapse'/>").appendTo(_li);
			            	_explore = $("<span class='branch b-collapse'/>").appendTo(_a);
			            }
			            
			        } else {
			        	//明细节点

			        	_span = $("<span class='icon'/>");

			        	_explore = $("<span class='branch'/>");
			        	
			        	if (secondaryType == 5 && !this.showCheckBox){
			        		var msg = node.caption.split(" ");
			        		var _code = $("<span class='code'></span>");
			        		var _chainname = $("<span class='chainname'></span>");
			        		_chainname.html(msg[1]);
			        		_explore = $("<span class='branch'/>");
			        		var code = $("<span>"+ msg[0] + "</sapn>");
			        		_span.appendTo(_code);
			        		_explore.appendTo(_code);
			        		code.appendTo(_code);
			        		_code.appendTo(_li);
			        		_chainname.appendTo(_li);
			        		
			        	} else {
			        		_span.appendTo(_li);
			        		_explore.appendTo(_a);
			        	}
			        }

			        switch(node.Enable) {
				        case YIUI.DictState.Enable: 
				        	_explore.addClass("enable");
				        	break;
				        case YIUI.DictState.Disable: 
				        	_explore.addClass("disable");
				        	break;
				        case YIUI.DictState.Discard: 
				        	_explore.addClass("discard");
				        	break;
			        }
			        //复选框
		        	if(this.showCheckBox){
		           		_chk = $("<span class='dt-chk' />");
				        _span.after(_chk);
		        	}
					_a.appendTo(_li);
					var _selectNode;
			       if (secondaryType != 5 || this.showCheckBox){
			    	    _selectNode = $("<span class='b-txt'>" + node.caption + "</span>").appendTo(_a);
			       }
			       
			        
			        secondaryType == 5 ? $pNode.attr('isLoaded', false) : $pNode.attr('isLoaded', true);
				}
				
				
				//如果是多选 ，设置复选框的状态
			    if(this.showCheckBox) {
					for (var i = 0, len = nodes.length; i < len; i++) {
						node = nodes[i];
						nid = node.id;
			
			        	var chkstate = 0;
			        	if(secondaryType == 5){
			        		var nidArr = nid.split("_");
			        		var pnid = nidArr[0] +"_"+ nidArr[2];
			        		if(pnid in this.checkedNodes){
			        			chkstate = 1;
			        		}
			        	}
			        	if(nid in this.checkedNodes){
			        		chkstate = 1;
			        	}
			        	if (pNodeKey in this.checkedNodes){
			        		chkstate = 1;
			        	}
			        	
			        	if (this.indeterminatedNodes == null) {
			        		 this.indeterminatedNodes = []
			        	}
			        	
			        	if(!this.independent &&  nid in this.indeterminatedNodes){
			        		chkstate = 2;	
			        	}
			        	
			        	//子节点没打勾的情况下， 如果父节点打勾且是父子联动则子节点打勾
			        	if(chkstate == 0 && !this.independent && $pNode){
			        		var pChkstate =  $pNode.children('.dt-chk').attr('chkstate') || 0 ;
			        		if(pChkstate == 1){
			        			chkstate =1;
			        		}
			        	}
			        	
			        	var $node = $('#'+nid,this.el);
			        	
			        	$node.children('.dt-chk').attr('chkstate', chkstate).addClass("chkstate"+chkstate);
			        }
				}
		    },
		   
		    /**
		     * 当字典树为父子节点联动时， 需要维护节点勾选状态
		     * @param {} $node
		     * @param {} checkstate
		     */
		    checkTreeNode: function($node, checkstate){
		    	var child, _index, _img, Return
				
		    	var tree = this;
		    	
		    	//递归处理子节点
		    	function checkChildNode($pNode, checkstate){
		    		var pChkBox = $pNode.children('.dt-chk');
		    		pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
		    		pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
		    		
		    		//处理子节点时， 是有在选中和未选中时需要做处理
		    		if(checkstate != 2){
			    		var pNodeKey = $pNode.attr('id');
			    		
			    		tree._pMap[pNodeKey] || (tree._pMap[pNodeKey] = []);
			    		
			    		for (var i = 0; i < tree._pMap[pNodeKey].length; i++) {
			                var cId = tree._pMap[pNodeKey][i];
							var $child = $('#'+cId, tree.el);
					      	if(checkstate == 0){
				        		delete tree.checkedNodes[cId];
				        	}   
							checkChildNode($child, checkstate);
			            }
		    		}
		    	}
		    	
		    	//递归处理父节点
		    	function checkParentNode($cNode, checkstate){
		    		var pId = $cNode.attr('parentid');
		    		if(!pId) return;
		    		var $pNode = $('#' + pId, tree.el);
		    		var pChkBox = $pNode.children('.dt-chk');   		
		    		
		    		if(checkstate == 2){
		    			pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
		    			pChkBox.attr('chkstate', 2).addClass("chkstate"+2);
			            checkParentNode($pNode, 2);
		    		}else if(checkstate == 1){
		    			//子节点 打勾， 检查父节点对应的子节点是否都打勾了 ， 
		    			tree._pMap[pId] || (tree._pMap[pId] = []);
			    		var diffstate = false;
			    		//TODO 待测试 ， 用filter 可能存在性能问题 
			    		//$("a", tree.el).filter("[parentid = '" + pId + "']").find("span.dt-chk").filter("[chkstate != '"+checkstate+"']").length > 0
			    		for (var i = 0; i < tree._pMap[pId].length; i++) {
			                var cId = tree._pMap[pId][i];
							var $child = $('#'+cId, tree.el);
							var check = $child.children('.dt-chk').attr('chkstate') || 0;
							if(check != checkstate){
								diffstate = true;
								break;
							}
			            }
			            //有一个节点存在和父节点的勾选状态不一致， 父节点就为半勾状态
			            if(diffstate){
			            	checkstate = 2;
			            }
			            pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
			            pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
		            	checkParentNode($pNode, checkstate);
		    		}else {
		    			//子节点勾取消， 检查 原本父节点是否打勾 ， 如全勾转为半勾状态， 则其他子节点 需要加入checkedNodes

		    			var pChkState =  pChkBox.attr('chkstate') || 0;
		    			var curId = $cNode.attr('id');
		    			if(pChkState == 1){
		    				var len = tree._pMap[pId].length;
		    				if(len == 1){
		    					checkstate = 0;
		    				}else{
		    					for (var i = 0; i < tree._pMap[pId].length; i++) {
					                var cId = tree._pMap[pId][i];
					                if(cId == curId){
					                	continue;
					                }
					                var $child = $('#'+cId, tree.el);
					                tree.checkedNodes[cId] = tree.getNodeValue($child);
					
					            }
					            checkstate = 2;
		    				}
	    					pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
				            pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
		    			} else if(pChkState == 2) {
		    				var diffstate = true;
		    				for (var i = 0; i < tree._pMap[pId].length; i++) {
				                var cId = tree._pMap[pId][i];
								var $child = $('#'+cId, tree.el);
								var check = $child.children('.dt-chk').attr('chkstate') || 0;
		    					if(check != checkstate){
									diffstate = false;
									break;
								}
				            }
	    					if(diffstate){
				            	checkstate = 0;
				            	pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
				            	pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
				            }
		    			}
		    			checkParentNode($pNode, checkstate);

		    		}
		    		
		    		//记录在选中节点中
			      	if(checkstate == 1){
		        		tree.checkedNodes[pId] = tree.getNodeValue($pNode);
		        	}else{
		        		delete tree.checkedNodes[pId];
		        	}   
		    	}

	    		var id = $node.attr('id');

	    		//记录在选中节点中
		      	if(checkstate == 1){
		      		this.checkedNodes[id] = this.getNodeValue($node);
	        	}else{ 
	        		delete this.checkedNodes[id];
	        	}   

		    	if(!this.independent) {
		    		checkChildNode($node, checkstate);
		            checkParentNode($node, checkstate);	
		    	}else{
		    		// 父子节点不联动， 则仅当前节点打勾
		    		var $chk = $node.children('.dt-chk');
		    		$chk.removeClass("chkstate"+$chk.attr('chkstate'));
		    		$chk.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
		    	}
		    }, 
		
		    /** 设置需要选中的节点 */
		    setCheckedNodes : function (nodes){
		    	if(this.showCheckBox){   
		    		var tree = this;
		    		
		    		this.clearCheckedNodes();
			        this.checkedNodes = nodes;
			        this.indeterminatedNodes = null;
			        
			     	if(this.rootNode){
			       		var rootId = this.rootNode.attr('id');
			       		if(rootId in this.checkedNodes){
				       		this.rootNode.find('.dt-chk').attr('chkstate',1).addClass("chkstate"+1);
				       	}else if(!jQuery.isEmptyObject(this.checkedNodes) && !this.independent){
				       		this.rootNode.children('.dt-chk').attr('chkstate',2).addClass("chkstate"+2);
				       	}
			     	}
		
			    }
		    },
		    /**
		     * 创建查找框
		     */
		    creatSearchInput: function(dom) {
		    	$("<input type = 'text' class = 'findinput'/>").appendTo(dom);
                $("<span class = 'findspan'>"+YIUI.I18N.getString("DICT_QUERY","查询")+"</span>").appendTo(dom);
		    },
		    /**
		     * 创建根菜单
		     */
		    creatFootDiv: function(dom, isNext) {
		    	
                $("<span class = 'prev disable'>《</span>").appendTo(dom);
                $("<span class = 'next'>》</span>").appendTo(dom);
		    },
		    
		    /**
		     * 创建foot按钮
		     * */
		    
		    creatFootBtn: function(dom) {
		    	var footBtn = $("<div class = 'footbtn'></div>");
		    	$("<span class='footbtn-reset'>"+YIUI.I18N.getString("DICT_CANCEL","取消")+"</span>").appendTo(footBtn);
		    	$("<span class='footbtn-sure'>"+YIUI.I18N.getString("CURRENCY_OK","确定")+"</span>").appendTo(footBtn);
		    	
		    	footBtn.appendTo(dom);
		    },
		    
		    clearCheckedNodes : function(){
		    	this.checkedNodes = {};
		    	this.indeterminatedNodes = null;
		    	$("[chkstate=1],[chkstate=2]").removeClass("chkstate1").removeClass("chkstate2").attr('chkstate', 0).addClass("chkstate0");
		    },
		    /**
		     * 创建根节点
		     * @param {} itemKey
		     * @param {} nodeKey
		     * @param {} name
		     */
		    createRootNode : function(node, caption, nodeKey, secondaryType, isNext) {
		    	
		    	
		    	var _li = $("<li id='"+ nodeKey + "' oid = '"+node.oid+"' itemKey='"+node.itemKey+"'></li>");
		    	_li.attr("level", -1).attr("comp_Level", 1);
		    	_li.appendTo(this.el);
		    	_li.addClass("root");
		    	if(secondaryType != 5 ) {
		    		$("<div class='dt-wholerow'/>").appendTo(_li);
			    	var _a = $("<a class='dt-anchor'></a>");
			
			    	
			    	$("<span class='icon dt-expand'/>").appendTo(_li);
			    	
			    	if(this.showCheckBox){
			    		$("<span class='dt-chk' />").addClass("chkstate0").attr("chkstate", 0).appendTo(_li);
			    	}
			    	
			    	$("<span class='branch b-expand'/>").appendTo(_a);
			        
			    	$("<span class='b-txt'>" +caption+ "</span>").appendTo(_a);
			    	
			    	_a.appendTo(_li);
			    	
			    	$("<ul class='dt-ul'></ul>").appendTo(_li);
		    		
		    	}
		    	var footDivLen = this._footdiv.children().length;
		    	var searchDivLen = this._searchdiv.children().length;
		    	if (secondaryType == 5 && footDivLen == 0 && searchDivLen == 0) {
		    		this.el.addClass("chain");
		    		$("<ul class='dt-ul'></ul>").appendTo(_li);
			    	this.el.wrap(this._liwrap);
			    	var $searchWrap = $("<div class = 'dt-searchwrap'></div>");
		    		this.creatSearchInput($searchWrap);
		    		$searchWrap.appendTo(this._searchdiv);
		    		this.el.before(this._searchdiv);
		    		this.creatFootDiv(this._footMean, isNext);
		    		this._footMean.appendTo(this._footdiv);
		    		this.creatFootBtn(this._footdiv);
		    		this.el.after(this._footdiv);
		    	}
		    	
		    	this.rootNode = $('#'+nodeKey,this.el);
		    	
		    	//如果是多选字典 判断根节点打勾状态
				if(this.showCheckBox){    
					
					if(!jQuery.isEmptyObject(this.checkedNodes) && !this.independent){
			       		this.rootNode.children('.dt-chk').attr('chkstate',2).addClass("chkstate"+2);
			       	}else if(nodeKey in this.checkedNodes){
			       		this.rootNode.children('.dt-chk').attr('chkstate',1).addClass("chkstate"+1);
			       	}
				}
		    		
		    },
		
		    render: function (ct) {
		    	this.el.appendTo($(ct));
		    	this.el.addClass('dt');
		    },
		
		    /**
		     * 收拢节点
		     * @param {} node
		     */
		    collapseNode: function(node) {
				node.children('ul').hide();
				var $arrow = node.children('span:first');
				$arrow.removeClass('dt-expand').addClass('dt-collapse');
				$arrow.next('.dt-anchor').find('.branch').removeClass('b-expand').addClass('b-collapse');
//				$arrow.next('.branch').removeClass('b-expand').addClass('b-collapse');
			},
		    
			/**
			 * 展开节点
			 * @param {} node
			 */
			expandNode: $.noop,
			doSuggest: $.noop,
			
			   
			/**
			 * 复选框勾选事件
			 * @param {} $node
			 */
			checkboxClick: function($node) {
				if(this.clearChkNodes) {
					this.checkedNodes = {};
				}
				var state = $node.children('.dt-chk').attr('chkstate') == 0 ? 1 : 0;
				this.checkTreeNode($node, state);
				this.callback.onChecked(this,$node);
				
				var nodeKey = $node.attr('id');
				if(state == 1){
					this.checkedNodes[nodeKey] = this.getNodeValue($node);
				}else{
					delete this.checkedNodes[nodeKey];
				}	
				this.clearChkNodes = false;
			},
			
			selectNode: function(node) {
				if(this.selectedNodeId) {
					$('#' + this.selectedNodeId).removeClass('sel');
				}
				if(node){
					this.selectedNodeId = node.attr('id');
					node.addClass('sel');
					this.callback.onSelected(this, node);
				}
				
			},
			
			getNodeValue: function($node){
			
			},
			
			/**
			 * 获取选中节点的值
			 * @return {}
			 */
			getCheckedValues: function(){
				if(this.showCheckBox){
					var dictTree = this;
					var values = [];
					var caption = "";
					
					//判断根节点是否打勾	            
		            if(dictTree.rootNode){
			       		var rootId = dictTree.rootNode.attr('id');
			       		if(rootId in dictTree.checkedNodes && !dictTree.independent){
			       			values.push(dictTree.getNodeValue(dictTree.rootNode));
			       			dictTree._showCaption = "";
			       			return values;
			       		}
		            }
		            
		            
					$.each(dictTree.checkedNodes , function(key,val){
						
						var $node = $('#'+key , dictTree.el);
												
						if(!dictTree.independent) {
		
							var pId = $node.attr('parentid');
							var $pNode = $('#'+pId , dictTree.el);
							
							if($pNode){
								var chkstate = $pNode.children('.dt-chk').attr('chkstate') || 0;
								if(chkstate == 1){
									
								}else{
									values.push(val);	
								}
							}else{
								values.push(val);	
							}
						}else{
							values.push(val);	
						}
					});
					if(values.length == 0){
						values == null;
					}
					return values;
				
			    }
			},
			
			/**
			 * 转换节点数据
			 * @param {} treeNodes
			 * @return {}
			 */
			formatAsyncData: function(treeNodes){
		    	return treeNodes;
		    },
			
		    /**
		     * 移除根节点外的所有节点 
		     */
		    reset: function (){
		    	if(this.rootNode){
		    		this._pMap = {};
		    		this.collapseNode(this.rootNode);
		    		this.rootNode.children('.dt-ul').children().remove();
		    		this.rootNode.removeAttr('isLoaded');
		    		this.indeterminatedNodes = null;
		    	}
		    }
		
		};
		
		Return.callback = $.extend({
			beforeExpand: $.noop,
			onSelected: $.noop,
			onChecked: $.noop
    	});
    	Return.clickEvent = {

		};
    	var timer = null
    	Return.el.bind('dblclick', function(e) {
    		clearTimeout(timer);
    		if (Return.el.hasClass("chain")){
    			if (Return.isFinishExp){
        			return;
        		}
        		var $target = $(e.target);
        		var $node;
        		if($target.prop("tagName").toLowerCase() == "li") {
        			$node = $target;
        		} else {
            		$node = $target.parents('li:first');
        		}
        		if($target.hasClass('dt-collapse')) {
        			
        			Return.expandNode($node);
        			return;
        		}
        		if($target.hasClass('dt-expand')) {
        			Return.collapseNode($node);
        			return;
        		}
        		if($target.hasClass('dt-chk')) {
        			Return.checkboxClick($node);
        			return;
        		}
        		$(".dt-wholerow.sel", this).removeClass("sel");
        		if($node.hasClass("comp_Level1") && !Return.showCheckBox) {
        			$(".dt-wholerow:first", $node).addClass("sel");
        		}
        		if(!Return.showCheckBox){
        			Return.selectNode($node);
        			return;
        		}else{
        			return;
        		}
    		} else {
    			return false;
    		}
    		
    		
    	});
    	Return.el.bind('click', function(e) {
    		clearTimeout(timer);//处理与双击事件的冲突
    		if (Return.isFinishExp){
    			return;
    		}
    		var $target = $(e.target);
    		var $node;
    		if($target.prop("tagName").toLowerCase() == "li") {
    			$node = $target;
    		} else {
        		$node = $target.parents('li:first');
    		}
    		if($target.hasClass('dt-collapse')) {
    			
    			Return.expandNode($node);
    			return;
    		}
    		if($target.hasClass('dt-expand')) {
    			Return.collapseNode($node);
    			return;
    		}
    		if($target.hasClass('dt-chk')) {
    			Return.checkboxClick($node);
    			return;
    		}
    		$(".dt-wholerow.sel", this).removeClass("sel");
    		$(".sel", this).removeClass("sel");
    		if($node.hasClass("comp_Level1") && !Return.showCheckBox) {
    			if (Return.el.hasClass("chain")){
    				$node.addClass("sel");
    			}else {
    				$(".dt-wholerow:first", $node).addClass("sel");
    			}
    			
    		}
    		if(!Return.showCheckBox){
    			var el = Return.el;
    			if(el.hasClass("chain")){
    				Return.nowSelectNode = $node;
	    			return;
    			}else{
	    			Return.selectNode($node);
	    			return;
    			}
	    			
    		}
    	});

    	Return.el.delegate("li", "mouseover", function(e) {
    		$(".dt-wholerow.hover", Return.el).removeClass("hover");
    		var li = $(".dt-wholerow:first", this);
    		if(!li.hasClass("sel")) {
    			$(".dt-wholerow:first", this).addClass("hover");
    		}
    		e.stopPropagation();
    	}).delegate("li", "mouseleave", function(e) {
    		$(".dt-wholerow.hover", Return.el).removeClass("hover");
    		e.stopPropagation();
    	});
    	Return = $.extend(Return, options);
		return Return;
	};

	YIUI.Yes_Dict = function(options){
		var Return = {
		    _hasShow : false,

		    el: $("<div></div>"),

		    /**
		     * 是否多选字典
		     * @type Boolean
		     */
		    multiSelect :  false,
		    
		    rootNode : null,

		    id: "",
		    
		    //字典控件的下拉按钮
		    _dropBtn : $('<div/>'),

		    _textBtn : $('<input type="text" />'),

		    _dropView : $('<div/>'),
		    
		    $suggestView : $('<div class="dt-autovw dt-vw"/>'),
		    
		    /**
		     * 多选字典，选择模式
		     */
		    checkBoxType :   YIUI.Control.DICT_CKBOXTYPE_NORMAL_SELECT,

		    /** 父子节点是否关联 */
		    independent : true,
		    
		    /**
		     * 字典itemKey
		     */
		    itemKey : null,
		    
		    dictTree: null,
		    
		    _resetTree : true,

            //字典状态
            stateMask: YIUI.DictStateMask.Enable,

		    needRebuild: true,
		    
		    editable: true,

			secondaryType: 0,
			

			
			init: function() {
			    this.id = this.el.attr("id");
				this._textBtn.attr("id", this.id+"_textbtn").addClass('txt').appendTo(this.el);
				this._dropBtn.attr("id", this.id+"_dropbtn").addClass('arrow').appendTo(this.el);
				this._dropView.attr("id", this.id+"_dropview").addClass('dt-vw');
				$(document.body).append(this._dropView);
				$(document.body).append(this.$suggestView);
			},
			
			setEditable: function(editable) {
		    	this.editable = editable;
		    	var el = this._textBtn;
		    	if(this.editable) {
					el.removeAttr('readonly');
				} else {
					el.attr('readonly', 'readonly');
				}
		    },
		    
		    getEl: function() {
		    	return this.el;
		    },

		    setMultiSelect: function(multiSelect) {
				//TODO 这个地方设置属性是错误的， 因为dicttree已经 创建了 需要改变的是dicttree的多选属性，
				//另 一般情况 字典控件要么多选， 要么单选， 不会动态变化
				this.multiSelect = multiSelect;
			},
			
			setDictTree: function(dictTree) {
				this.dictTree = dictTree;
			},
            getDictTree: function (dictTree) {
                return this.dictTree;
            },
			
			setBackColor: function(backColor) {
				this.backColor = backColor;
				this._textBtn.css({
					'background-image': 'none',
					'background-color': backColor
				})
			},

			setForeColor: function(foreColor) {
				this.foreColor = foreColor;
				this._textBtn.css('color', foreColor);
			},
			
		    setFormatStyle: function(cssStyle) {
				this._textBtn.css(cssStyle);
			},
			
		    setDropViewTop: function() {
		    	var cityObj = this._textBtn;
			    var cityOffset = this._textBtn.offset();
			
			    var bottom = $(window).height() - cityOffset.top - this.el.height();
		        var top = cityOffset.top + cityObj.outerHeight();
		        if(bottom < this._dropView.outerHeight()) {
		        	this._dropView.addClass("toplst");
		        	this.el.addClass("toplst");
		        	top = "auto";
		        	bottom = $(window).height() - cityOffset.top;
		        } else {
		        	this._dropView.removeClass("toplst");
		        	this.el.removeClass("toplst");
		        	bottom = "auto";
		        }
		        if(top != "auto") {
		        	this._dropView.css("top", top + "px");
		        	this._dropView.css("bottom", "auto");
		        }
		        if(bottom != "auto") {
		        	this._dropView.css("bottom", bottom + "px");
		        	this._dropView.css("top", "auto");
		        }
		        this._dropView.css("width", cityObj.outerWidth()+"px");
		        $(".pageinfo").css("border", "0px");
		    },
		    
		    setDropViewLeft: function() {
		    	var cityObj = this._textBtn;
			    var cityOffset = this._textBtn.offset();
			
		    	var right = $(window).width() - cityOffset.left;
		        var left = $(window).width() - this._dropView.outerWidth();
		        if(right < this._dropView.outerWidth()) {
		        	left = "auto";
		        	right = $(window).width() - cityOffset.left - cityObj.outerWidth();
		        } else {
		        	left = cityOffset.left;
		        	right = "auto";
		        }
		        if(left != "auto") {
		        	this._dropView.css("left", left + "px");
		        	this._dropView.css("right", "auto");
		        }
		        if(right != "auto") {
		        	this._dropView.css("right", right + "px");
		        	this._dropView.css("left", "auto");
		        }
		    },
		    
		    /** 设置控件真实值，对应于数据库中存储的值 */
		    setSelValue: function (value) {
		        this.value = value;

		        if(this.multiSelect){

		        }else{
		        	
		        }
		    },
		    
		    /** 设置需要选中的节点 */
		    setDictTreeCheckedNodes : function (){
		    	if(this.multiSelect){
		    		var checkedNodes = {};
		    		var dictType = this.secondaryType;
		    		if(this.value){
				 		$.each(this.value,function(i){
				 			if(dictType == 5){
				 				var nodeId = this.itemKey+'_0_'+this.oid;
				 			} else {
				 				var nodeId = this.itemKey+'_'+this.oid;
				 			}
				 			
					 		checkedNodes[nodeId]=this;
					 	});
		    		}
			    	this.dictTree.setCheckedNodes(checkedNodes);
			    }
		    },
		    
		    /** 获取控件真实值 */
		    getSelValue: function () {
		    	// TODO 这处为临时处理
//			    	if(this.value && this.value.length > 0){
		        if(this.value){
		            //this.value.caption = this._textBtn.val();
		            return this.value;
		    	}else{
		    		return null;
		    	}
		    },
		    
		    setWidth: function(width) {
		    	this.el.css('width', width);
		    	this._textBtn.css('width', width);
		        this._dropBtn.css("left", this._textBtn.outerWidth() - 26 + "px");
		    },
		    
		    setHeight: function(height) {
		    	this.el.css('height', height+'px');
		    	this._textBtn.css('height', height+'px');
		    	if($.browser.isIE) {
		    		this._textBtn.css('line-height',(height-3)+'px');
		    	}
		        this._dropBtn.css("top", (this._textBtn.outerHeight() -16) /2 + "px");
		    },
		    
		    setValue: function(value) {
		    	this.value = value;
		    	if(this.multiSelect){
		    		this.setDictTreeCheckedNodes ();   			
		    	}
		    },
		   
		    setText: function (text) {
		        this._textBtn.val(text);
		    }, 
		    
		    getText: function () {
		        return this._textBtn.val();
		    },
		    
		    getInput: function() {
		    	return this._textBtn;
		    },
		    
		    checkDict: $.noop,
		    
		    isEnable: function() {
		    	return true;
		    },

		    //TODO 删除hiding
		    hiding: $.noop,
		    
		    getItemKey: $.noop,
		    
		    commitValue: $.noop,

		    doFocusOut: $.noop,

		    showing: function() {
    	    	var def = null;
    	    	if(this.value == null){
    	    		//def.resolve();
    	    	}else{
    	    		if(this.multiSelect){
	    	    		if(this.value.length == 1 && this.value[0].getOID() == 0){
							//def.resolve();
	    	    		}else{
	    	    			def = this.setMultiSelectionValue(this.getItemKey(), this.value);
	    	    		}
	    	    	} else if(this.value.getOID() > 0){
		    			$(".sel", this._dropView).removeClass("sel");
	    	    		def = this.setSelectionValue(this.getItemKey(), this.value);
	    	    	} else {
				   		//def.resolve();
	    	    	}
    	    	}
    	    	if(!def){
    	    		def = this.dictTree.expandNode(this.dictTree.rootNode);
    	    	}
    	    	// var _this = this;
    	    	// def.then(function(data){
    	    	// 	_this._dropView.slideDown("fast");
    	    	// });
    	    	return def;
    	    },

		    setMultiSelectionValue: function(itemKey, value) {
		    	var tree = this.dictTree;
		    	var paths = this.getDictService().getTreePath(itemKey, value);

		    	if(!paths){
		    		return this.dictTree.expandNode(this.rootNode);
		    	}
		    	var _this = this;
		    	_this.getDictService().getTreePath(itemKey, value)
		    					.then(function(paths){
					   				if(paths.length > 0) {
  										_expand(tree, paths, 0);
							    	} else {
							    		tree.expandNode(_this.rootNode).then(function(){
							    			$(".dt-wholerow.sel", _this._dropView).removeClass("sel");
											def.resolve(true);
										});
							    		
							    	} 
								});
		    	var def = $.Deferred(),
				_expand = function(tree, paths, index){

								var parents = paths[0];
								if(parents){
									if(index < parents.length){
										var oid = parents[index].oid;
										if(parents) {
											var arg = arguments;

											var $node = $("[oid='"+oid+"']", tree.el);
											if($node.length > 0) {
												console.log('--------------------------------'+index);
												return tree.expandNode($node).then(function(){
													_expand(tree, paths, (index+1));
												});
											}
										}
									}
								}
								var isChain = tree.el.hasClass("chain");
								for(var i = 0 , len = value.length; i < len; i++){
									var node = $("[oid='"+value[i].oid+"']", tree.el);
									if(node.length == 0) {
										if(!isChain)
										tree.clearChkNodes = true;
									} else {
										tree.checkTreeNode(node, 1);
									}
								}

								def.resolve(true);
				    	    };	
	 			return def.promise();
		    },

		    setSelectionValue: function(itemKey, value) {
		    	var tree = this.dictTree;

		    	var paths = this.getDictService().getTreePath(itemKey, value);

		    	if(!paths){
		    		return this.dictTree.expandNode(this.rootNode);
		    	}

		    	var _this = this;

		    	_this.getDictService().getTreePath(itemKey, value)
		    					.then(function(paths){
					   				if(paths.length > 0) {
  										_expand(tree, paths, 0);
							    	} else {
							    		tree.expandNode(_this.rootNode).then(function(){
							    			$(".dt-wholerow.sel", _this._dropView).removeClass("sel");
											def.resolve(true);
										});
							    		
							    	}
								});
 				var def = $.Deferred(),
			   	_expand = function(tree, paths, index){

								var parents = paths[0];
								if(parents){
									if(index < parents.length){
										var oid = parents[index].oid;
										if(parents) {
											var arg = arguments;

											var $node = $("[oid='"+oid+"']", tree.el);
											if($node.length > 0) {
												return tree.expandNode($node).then(function(){
													_expand(tree, paths, (index+1));
												});
											}
										}
									}
								}
										
								var $a = $("[oid='"+value.oid+"']", tree.el);
								if(_this.selectedNodeId) {
									$('#' + _this.selectedNodeId).removeClass('sel');
								}
								_this.selectedNodeId = $a.attr('id');
								$(".dt-wholerow:first", $a).addClass("sel");

								def.resolve(true);
				    	    };	
				return def.promise();
		    },
		    
		    setSecondaryType: function (type) {
       			this.secondaryType = type;
    		} , 
    		

    	    destroy: function() {
    	        this._dropView.remove();
    	        this.$suggestView.remove();
    	    },
    	    
    
		    hideDictList : function (ignore){
		        this._dropView.hide();
		        this._hasShow = false;
		        this.dictTree.isFinishExp = false;
		        if(!ignore){
	 		        this.commitValue(this.value);	
	 		    }	

		    	$(document).off("mousedown");
	
		    },
		    
		    hideSuggestView : function (){
		    	this.$suggestView.hide();
		    	$(document).off("mousedown");
		    },
		    
		    getEditor : function(){
		    	return this._textBtn;
		    },
		    
		    addTreeNodes : function(node, nodes){
		    	var _this = this;
		    	if(node.attr('isLoaded') != 'true'){
	                if (nodes) {
	                    var nodeId = node.attr('id');
	                    var syncNodes = _this.getDictTree().formatAsyncData(nodes);
	                    var isHaveNext = nodes.totalRowCount;
	                    nodes = _this.secondaryType == 5 ? nodes.data :nodes;
	                    
	                    for(var i=0, len=nodes.length; i<len; i++) {
	                        
	                        if(_this.type == YIUI.CONTROLTYPE.COMPDICT || _this.secondaryType == 5) {
	                            var path = nodeId + "_" + nodes[i].OID;
	                            nodes[i].id = path;
	                        }
	                    }
	                    syncNodes = _this.secondaryType == 5 ? nodes :syncNodes;
	                    _this.getDictTree().buildTreenode(syncNodes , nodeId, parseInt(node.attr("level"))+1, _this.secondaryType, isHaveNext);
	                    _this.secondaryType == 5 ? node.attr('isLoaded',false) : node.attr('isLoaded',true);
	                }
	            }
		    },

    	    getDictChildren: function(node) {
    	    	console.log('getDictChildren...');
    	    	var _this = this;

    	    	var def;
    	    	if (_this.secondaryType != 5) {
                    def = _this.getDictService().getDictChildren(_this.getItemKey(), 
                                                     _this.getDictTree().getNodeValue(node), 
                                                     _this.getDictTree().dictFilter,
                                                     _this.getStateMask());

    	    	} else {
    	    		if (pageMaxNum == null) {
    	    			pageMaxNum = 10;
    	    		}
        	    	def = _this.getDictService().getQueryData(_this.getItemKey(),
        	    								  _this.getDictTree().startRow,
        	    								  pageMaxNum,
        	    								  _this.getDictTree().pageIndicatorCount,
        	    								  _this.getDictTree().fuzzyValue,
        	    								  _this.getStateMask(),
        	    								  _this.getDictTree().dictFilter,
        	    								  _this.getDictTree().getNodeValue(node));
 
    	    	}
    	    	return def;
    	    },

    		beforeExpand: function(tree , treeNode) {
			
				
    		},

		    install: function() {
		        var self = this;
		        var dictTreeNode = self.dictTree;
		        dictTreeNode.startRow = 0;
		        dictTreeNode.pageIndicatorCount = 3;
		        dictTreeNode.fuzzyValue = null;

		        //下拉按钮绑定下拉事件
		        this._dropBtn.mousedown(function(e){
		        	self.oldNodes = self.dictTree.getCheckedValues();
		        	console.log("dict_btn mouse down ");
		        	dictTreeNode.startRow = 0;
			        dictTreeNode.pageIndicatorCount = 3;
			        dictTreeNode.fuzzyValue = null;
			        $(".findinput", dictTreeNode._searchdiv).val("");
		        	if(!self.isEnable()) {
		        		return;
		        	}
		        	if (self.dictTree.isFinishExp){
		        		return;
		        	}
		        	self.dictTree.isFinishExp = true;
		        	if (dictTreeNode.startRow == 0) {
		        		self.dictTree._footMean.find(".prev").addClass("disable");
		        		self.dictTree._footMean.find(".next").removeClass("disable");
		        	}
		        	if (!self._hasShow) {
		        		$(this).removeClass("arrow");
		        		$(this).addClass("arrowgif");
		        	}
		        	
                    self._textBtn.focus();
				    
				    if(self._hasShow){
				    	self.hideDictList();
				        return;
				    }
				    self.oldSelectNode = self.dictTree.nowSlectNode;
				   	self._hasShow = true;
				    self.checkDict().then(function(change){
					    self.setDropViewTop();
					    self.setDropViewLeft();
						return self.showing();
				    }, function(error){
						self._hasShow = false;
				    }).then(function(data){
				    	if(self.secondaryType == 5){
					    	self.dictTree._footdiv.show();
					    	self.dictTree._searchdiv.show();
			        	}
					    if (self.secondaryType != 5) {
					    	self.dictTree._footdiv.hide();
					    	self.dictTree._searchdiv.hide();
					    }
				    	if(self. _textBtn.val() == ""){
			        		$("li", dictTreeNode.el).removeClass("sel");
			        	}
		    	    	self._dropView.slideDown(300, function(){
		    	    		self._dropBtn.removeClass("arrowgif");
			    			self._dropBtn.addClass("arrow");
			    			self.dictTree.isFinishExp = false;
			    			$(document).on("mousedown",function(e){
						    	if(self.dictTree.isFinishExp){
						    		return;
						    	}
						        var target = $(e.target);
						        if((target.closest(self._dropView).length == 0)
						            &&(target.closest(self._dropBtn).length == 0)){
							        if(self.multiSelect){
							        	//取字典树选中的节点
							        	self.value = self.dictTree.getCheckedValues();
							        }
						        	self.hideDictList(!self.multiSelect);
						        }
						    });
		    	    	});
	
					    
				    },function(error){
				    	self._hasShow = false;
				    });
				    //e.stopPropagation();
				});

		    	var self = this;
		    	var index = -1;
		    	var hideDictView = function() {
		    		self.$dictView && self.$dictView.hide();
					self.selLi = null;
					$(".selected", self.$dictView).removeClass("selected");
					self.setText(self.text);
			    	index = -1;
		    	};
		    	
		    	this._textBtn.bind("keyup", function(e){
		    		if(self.multiselect) return;
		    		var keyCode = e.keyCode;
		    		if(keyCode == 13) {
		    			if(self.selLi) {
		    				$(".b-txt", self.selLi).click();
		    			} else {
		    				$(this).blur();
		    			}
		    			return;
		    		}
		    		var value = $(this).val();
		
		    		$(document).on("mousedown", function (e) {
		    			var target = $(e.target);
		    			if (target.closest(self.$suggestView).length == 0) {
		    				if(self.selLi && self.selLi.length > 0) {
		                    	self.selLi.click();
		                    }
		    				self.isSuggest = false;
		    				$(document).off("mousedown");
		    				self.$suggestView.hide();
		    			} else {
		    				self.isSuggest = true;
		    			}
		    			self.selLi = null;
		            	index = -1;
		    		});
		    		
		        	if(keyCode == 38 || keyCode == 40 || keyCode == 9) return;
		        	if(keyCode == 13 && self.selLi) {
				    	index = -1;
		        		self.selLi.click();
		        		return;
		        	}
		        	self._dropView.hide();
					
					if(!self.showSuggest){
						return;
					}
		        	
		        	var $view = self.$suggestView;
		        	if(value) {
		        		self.checkDict()
		        			.then(function(viewItems) {
				                    if (viewItems.length == 0) {
				                    	$view.empty().hide();
				                        return;
				                    }
				                    var list = $('<ul/>'), _li, item, _a;
				                    $view = $view.html(list);
				                    for (var i = 0, len = viewItems.length; i < len; i++) {
				                        item = viewItems[i];
				                        _li = $('<li oid=' + item.oid + ' itemkey = ' + item.itemKey + '></li>');
				        				$("<div class='dt-wholerow'/>").appendTo(_li);
				                        _a = $("<a class='dt-anchor'></a>").appendTo(_li);
				                        _spanIcon = $("<span class='branch'></span>").appendTo(_a);
				                        if (item.NodeType == 0) {
				                            _spanIcon.addClass("p_node");
				                        }
				                        _spanText = $("<span class='b-txt'></span>").text(item.caption).appendTo(_a);
				                        list.append(_li);
				                    }
				                    var cityObj = $("input", self.el);
				                    var cityOffset = cityObj.offset();
				                    $view.css({
				                        width: cityObj.outerWidth(),
				                        top: cityOffset.top + cityObj.outerHeight(),
				                        left: cityOffset.left
				                    })
				                    $view.show();
				    			});
		        	} else {
		        		$view.empty().hide();
		        	}
		
		    	});
		
		    	this._textBtn.bind("keydown", function(e){
		    		var keyCode = e.keyCode;
		            var $suggestView = self.$suggestView, $dictView, isAutoView = false;
		            
		            if(!$suggestView.is(":hidden") || (self._dropView.is(":hidden") && (keyCode != 40))) {
		            	$dictView = $suggestView;
		            	isAutoView = true;
		            } else {
		            	$dictView = self._dropView;
		            }
		            self.$dictView = $dictView;
		            var maxLen = $("li[level != '-1']", $dictView).length;
		            //keyCode == 38 ---> UP Arrow  keyCode == 40 ---> DW Arrow
		            if(keyCode == 38) {
		            	if(!isAutoView && self._dropView.is(":hidden")) {
		            		return;
		            	}
		            	index--;
		            	if(index == -1) index = maxLen - 1;
		            } else if(keyCode == 40) {
		            	if(!isAutoView && self._dropView.is(":hidden")) {
		            		self.isDictView = true;
		            		self._dropBtn.click();
		            		var $li_s = $("li .dt-wholerow.sel", self._dropView);
		            		$li_s.removeClass("sel");
		            		var $li = $li_s.parents("li").eq(0);
		            		index = $li.index();
		            	}
		            	index++;
		            	if(index == maxLen) index = 0;
		            } else if(keyCode == 9 || keyCode === 13 || keyCode === 108) {
		                //self.focusManager.requestNextFocus(self);
		                if (keyCode == 9 && !self._dropView.is(":hidden")) {
		                    $(document).mousedown();
		                }
		                e.preventDefault();
		            } else {
		                return;
		            }
		            if (index == -1) return;
		            if(self.selLi) {
		            	self.selLi.removeClass("selected").removeClass("sel");
		            	$(".dt-wholerow", self.selLi).removeClass("sel");
		            }
		            var li = $dictView.find("li[level != '-1']:eq("+index+")");
		            li.addClass("selected");
		            self.selLi = li;
		            self.autoSel = true;
		            $(".dt-wholerow", li).eq(0).addClass("sel");
		            var scrollHeight = self._dropView.outerHeight() - self._dropView[0].clientHeight;
		            var scrollTop = li.position().top - self._dropView.height() + li.height() + scrollHeight;
		            self._dropView.scrollTop(scrollTop < 0 ? 0 : scrollTop);
		            
		            if(!isAutoView) {
		            	self._textBtn.val($(".b-txt", li).eq(0).text());
		            }
		        	
		    	});

				var temp;
				this._textBtn.focus(function() {
					temp = $(this).val();
					//$(this).oldValue = text;
			    }).blur(function(e) {
			    	//判断是否为dropDownBtn mouseDown
			    	if(self._hasShow){
			    		return;
			    	}

		    		index = -1;
			    	var text = $(this).val();

			    	if(text != temp) {

			    		if($.isEmptyObject(text)) {
			    			// self.doLostFocus(text);
			    			self.commitValue(null);
			    		} else {
			    			self.checkDict().then(function(change) {
				  				//精确匹配
			                    var rootValue = null;
			                    if (self.getDictTree().rootNode != null) {
			                        rootValue = self.getDictTree().getNodeValue(self.getDictTree().rootNode);
			                    }
		
		                        self.getDictService().locate2(self.getItemKey(),
		                        						 'Code',
		                        						 text,
		                        						 self.getDictTree().dictFilter,
		                        						 rootValue,
		                        						 self.stateMask)
		                                        .then(function(data) {
		                                        	if(data) {
		                                                var value = new YIUI.ItemData(data);
		                                                var change = self.commitValue(value, true, true);
		                                                //值未改变时 还原Text
		                                                if(!change){
		                                                	self.setText(text); 
		                                                }
		                                        	} else {
		                                                var options = {
		                                                		fuzzyValue: text,
								                                itemKey: self.getItemKey(),
								                                caption: self.caption,
								                                rootValue: rootValue,
								                                stateMask: self.stateMask,
								                                dictFilter: self.getDictTree().dictFilter,
								                                displayCols: self.displayCols,
								                                startRow: 0,
								                                maxRows: 5,
								                                pageIndicatorCount: 3,
								                                columns: self.displayColumns,
								                                textInput: $('input', self.el),
								                                callback: function (itemData) {
								                                    if (itemData) {
								                                    	self.commitValue(itemData);
								                                    } else {
								                                        self.setText(temp); 
								                                    }
								                                    //$this.isShowQuery = false;
								                                }
		                                                };
							                            var dictquery = new YIUI.DictQuery(options);
							                            YIUI.PositionUtil.setViewPos(self._textBtn, dictquery, true);
							                            dictquery.doLayout();
		                                            }
		                                        });
								});
			    		}		    		
			    	}

			    	self.doFocusOut();	
			    });
		    	
		        //查询按钮绑定事件
		        this.dictTree._searchdiv.delegate(".findspan", "click", function(){
		        	var value = $(this).prev().val();
		        	if (value != null) {
		        		$(this).parent().parent().parent().find(".next").removeClass("disable");
		        		dictTreeNode.fuzzyValue = value;
		        		dictTreeNode.startRow = 0;
		        		self.dictTree.expandNode(self.dictTree.rootNode).then(function(){
		        			var len = self.dictTree._footMean.children(".pageinfo").children().length;
				        	if(len == 1 || len == 0) {
				        		self.dictTree._footMean.find(".next").addClass("disable");
				        		self.dictTree._footMean.find(".prev").addClass("disable");
				        	}
		        		});
			        	
		        	}
		        });
		        
		        //查询框回车查找
		        this.dictTree._searchdiv.delegate(".findinput","keydown",function(e){
		        	var which = e.which;
		        	var val = $(this).val();
		        	if (val != null && which == 13) {
		        		$(this).parent().parent().parent().find(".next").removeClass("disable");
		        		dictTreeNode.fuzzyValue = val;
		        		dictTreeNode.startRow = 0;
		        		self.dictTree.expandNode(self.dictTree.rootNode).then(function(){
		        			var len = self.dictTree._footMean.children(".pageinfo").children().length;
				        	if(len == 1 || len == 0) {
				        		self.dictTree._footMean.find(".next").addClass("disable");
				        		self.dictTree._footMean.find(".prev").addClass("disable");
				        	}
		        		});
			        	
		        	}
		        });
		        
		        //下一页按钮点击事件
		        this.dictTree._footdiv.delegate(".next", "click", function(){
		        	if($(this).hasClass("disable"))
		        		return;
		        	var allpage = $(".pageinfo span",dictTreeNode._footMean).length;
		        	if ( allpage == 1 ) {
		        		return;
		        	}
		        	self.oldItem = self.dictTree.el.html();
		        	$(this).parent().find(".prev").removeClass("disable");
		        	dictTreeNode.startRow = dictTreeNode.startRow + 10;
		        	self.dictTree.expandNode(self.dictTree.rootNode).then(function(){
		        		var oldItem = self.oldItem;
		        		var newItem = self.dictTree.el.html();
			        	var pNumBtn = $(".nowitem", self.dictTree._footdiv);
			        	var pBtnNumIndex =  $(".pageinfo span",dictTreeNode._footMean).index($(".pageinfo .nowitem",dictTreeNode._footMean));
			        	var maxNum = $(".pageinfo",self.dictTree._footdiv).attr("maxnum"); 
			        	var pageNum = $(self.dictTree._footdiv.find(".pagenum"));
			        	var indexPage = pNumBtn.html();
			        	if (oldItem == newItem) {
			        		dictTreeNode.startRow = dictTreeNode.startRow - 10;
			        	}
			        	if (pBtnNumIndex == 2 && +maxNum >= 1) {
			        		pNumBtn.html(+pNumBtn.html() + 1);
			        		var prevAll = pNumBtn.prevAll();
			        		prevAll.eq(0).html(+prevAll.eq(0).html() + 1);
			        		prevAll.eq(1).html(+prevAll.eq(1).html() + 1);
			        	}
			        	
			        	if (+maxNum == 1 ) {
			        		$(".next",dictTreeNode._footMean).addClass("disable");
			        	}
			        	var pBtnLen = pNumBtn.next().length;
			        	if (oldItem != newItem && pBtnLen != 0) {
			        		pNumBtn.removeClass("nowitem");
			        		pNumBtn.next().addClass("nowitem");
			        		pBtnNumIndex = +pBtnNumIndex + 1
			        	}
			        	if (pageNum.length == 2 && pBtnNumIndex == 1) {
			        		$(".next",dictTreeNode._footMean).addClass("disable");
			        	}
		        		
		        	});
		        });
		        
		        this.dictTree._footdiv.delegate(".footbtn-sure", "click", function(){
		        	if(!self.multiSelect){
		        		var nowSelectNode = self.dictTree.nowSelectNode;
			        	self.dictTree.selectNode(nowSelectNode);
		        	} else {
		        		self.value = self.dictTree.getCheckedValues();
		        		self.hideDictList();
		        		
		        	}
		        	
		        })
		        
		        this.dictTree._footdiv.delegate(".footbtn-reset", "click", function(){
		        	if(!self.multiSelect){
		        		var oldSelectNode = self.oldSelectNode;
		        		var selNodeId = self.dictTree.selectedNodeId;
		        		var _selectNode = $("#"+ selNodeId);
		        		$(".dt-ul li", self.dictTree.el).removeClass("sel");
			        	if(oldSelectNode != null){
			        		self.dictTree.selectNode(oldSelectNode);
			        	} else {
			        		self._dropView.hide();
			        	}
		        	} else {
		        		var  oldNodes = self.oldNodes;
		        		if (oldNodes.length == 0){
		        			oldNodes = {};
		        			self.dictTree.setCheckedNodes(oldNodes);
		        		}else{
		        			var oldCheckNodes= {};
		        			for (var i = 0; i < oldNodes.length; i++){
		        				oldCheckNodes[oldNodes[i].itemKey + "_0_" + oldNodes[i].oid] = oldNodes[i]
		        			}
		        			self.dictTree.setCheckedNodes(oldCheckNodes);
		        		}
			            
			            self.hideDictList();
		        		
		        	}
		        	
		        	
		        })
		        
		        //上一页按钮点击事件
		        this.dictTree._footdiv.delegate(".prev", "click", function(){
		        	if($(this).hasClass("disable"))
		        		return;
		        	var allpage = $(".pageinfo span",dictTreeNode._footMean).length;
		        	if ( allpage == 1 ) {
		        		return;
		        	}
		        	dictTreeNode.startRow = dictTreeNode.startRow - 10;
		        	self.oldItem = self.dictTree.el.html();
		        	$(this).parent().find(".next").removeClass("disable");
		        	self.dictTree.expandNode(self.dictTree.rootNode).then(function(){
		        		var olditem = self.oldItem;
		        		var newitem = self.dictTree.el.html();
			        	var pNumBtn = $(".nowitem", self.dictTree._footdiv);
			        	var indexPage = pNumBtn.html();
			        	var pBtnNumIndex =  self.dictTree._footdiv.find($(".pageinfo span")).index($(".nowitem"));
			        	if (indexPage != 1) {
			        		if (pBtnNumIndex == 0) {
			        			pNumBtn.html(+pNumBtn.html() - 1);
			        			var nextAll = pNumBtn.nextAll();
				        		nextAll.eq(0).html(+nextAll.eq(0).html() - 1);
				        		nextAll.eq(1).html(+nextAll.eq(1).html() - 1);
			        		}
			        		var pBtnLen = pNumBtn.prev().length;
			        		if (pBtnLen != 0) {
			        			pNumBtn.removeClass("nowitem");
				        		pNumBtn.prev().addClass("nowitem");
			        		}
			        	}
			        	if (olditem == newitem) {
			        		dictTreeNode.startRow = dictTreeNode.startRow + 10;
			        	}
			        	if (+indexPage == 1) {
			        		$(".prev",dictTreeNode._footMean).addClass("disable");
			        	}
		        	});
		        	
		        });
		        
		        //页码点击事件 
		        this.dictTree._footdiv.delegate(".pagenum", "click", function(){
		        	if($(this).hasClass("nowitem"))
		        		return;
		        	var $this = $(this);
		        	var index = $this.html();
		        	self.oldItem = self.dictTree.el.html();
		        	dictTreeNode.startRow = (index - 1)*10;
		        	self.dictTree.expandNode(self.dictTree.rootNode).then(function (){
		        		var olditem = self.oldItem
		        		var newitem = self.dictTree.el.html();
			        	var pageNum = $(self.dictTree._footdiv.find(".pagenum"));
			        	var clickBtn =  pageNum.index($this);
			        	var maxnum = $this.parent().attr("maxnum");
			        	if(clickBtn == 0 && $this.html() == 1) {
			        		pageNum.removeClass("nowitem");
			        		$this.addClass("nowitem");
			        		$(".next", self.dictTree._footdiv).removeClass("disable");
			        		$(".prev", self.dictTree._footdiv).addClass("disable");
			        	}
			        	if(clickBtn == 1 && pageNum.length == 3) {
			        		pageNum.removeClass("nowitem");
			        		$this.addClass("nowitem");
			        		$this.parent().parent().find(".next").removeClass("disable");
			        		$this.parent().parent().find(".prev").removeClass("disable");
			        	}
			        	if (clickBtn == 1 && pageNum.length == 2) {
			        		pageNum.removeClass("nowitem");
			        		$this.addClass("nowitem");
			        		$this.parent().parent().find(".next").addClass("disable");
			        		$this.parent().parent().find(".prev").removeClass("disable");
			        	}
			        	
			        	if ($this.html() == 1) {
			        		self.dictTree._footMean.children(".prev").addClass("disable");
			        		self.dictTree._footMean.children(".next").removeClass("disable");
			        	}
			        	if(clickBtn == 2) {
			        		pageNum.removeClass("nowitem");
			        		if(maxnum > 1) {
			        			$this.html(+$this.html() + 1);
				        		var prevAll = $this.prevAll();
				        		$(prevAll[0]).html(+$(prevAll[0]).html() + 1);
				        		$(prevAll[1]).html(+$(prevAll[1]).html() + 1);
				        		$(prevAll[0]).addClass("nowitem");
				        		pageNum.find(".next").addClass("nowitem");	
			        		} else {
			        			$this.addClass("nowitem");
			        			$this.parent().parent().find(".next").addClass("disable");
			        			$this.parent().parent().find(".prev").removeClass("disable");
			        		}
		
			        	}
			        	
			        	if(clickBtn == 0 && $this.html() != 1) {
			        		pageNum.removeClass("nowitem");
			        		$this.html(+$this.html() - 1);
			        		var nextAll = $this.nextAll();
			        		$(nextAll).eq(0).html(+$(nextAll[0]).html() - 1);
			        		$(nextAll).eq(1).html(+$(nextAll[1]).html() - 1);
				        	pageNum.eq(1).addClass("nowitem");
				        	$this.parent().parent().children().eq(0).removeClass("disable");
				        	$this.parent().parent().children().eq(1).removeClass("disable");
			        	}
		        	});
		        	
		        });
		        
		        this.$suggestView.delegate("li", "click", function() {
		        	if (self.isFinishExp){
		        		return;
		        	}
		        	var options = {
	        			oid: $(this).attr("oid"),
	        			itemKey: $(this).attr("itemkey"),
	        			caption: $(this).text()
		        	};
		        	var itemData = new YIUI.ItemData(options);
		        	self.setSelValue(itemData);
		        	self.commitValue(itemData, true, true);
		        	self.hideSuggestView();
		        });
		    
		    }

		};

    	Return = $.extend(Return, options);
    	Return.init();
		
		var dictTree = new YIUI.Yes_DictTree({
            //dataSource : Return.dataSource ,

            showCheckBox :  Return.multiSelect,

            independent: Return.independent,
            
			formatAsyncData: function(datas){
				$.each(datas,function(i,val){
					var id = val.itemKey+'_'+val.OID;
					val.id = id;
				});
       			return datas;
			},
            getNodeValue: function($node) {
           		if($node.length > 0){
			   		var text = "";
			   		if($node.attr("oid") >= 0) {
                    	text = $node.children('a').text();
                    }
				  	var options = {};
				  	options.oid = $node.attr('oid') || 0;
				  	options.itemKey = $node.attr('itemKey');
				  	options.caption = text;
			   		var itemData = new YIUI.ItemData(options);
					return itemData;
           		}
            },

            expandNode: function(node) {
				if(!node){
					node = this.rootNode;
				}
				var $arrow = node.children('span:first');
				if($arrow.hasClass('dt-collapse')){
					$arrow.removeClass('dt-collapse').addClass('dt-arrowgif');
				}
				var def ;
				//未加载过的情况下 加载子节点
				if(node.attr('isLoaded') == "false" || node.attr('isLoaded')== undefined) {
				
					//this.callback.beforeExpand(this , node);
					
					/*var nodeId = node.attr('id');
					var success = function(msg) {
						if (msg) {
							var syncNodes = Return.formatAsyncData(msg.data);
							Return.buildTreenode(syncNodes , nodeId, parseInt(node.attr("level"))+1);
							node.attr('isLoaded',true);
						}
					}*/     

					

					def = Return.getDictChildren(node).then(function(nodes){
								var $arrow = node.children('span:first');
								nodes.length == 0 && $arrow.removeClass('dt-arrowgif').addClass('dt-collapse');
								Return.addTreeNodes(node, nodes);
							});
				}else{
					def = $.Deferred();
					def.resolve();
				}

				return def.then(function(){
								node.children('ul').slideDown(300, function(){
									var $arrow = node.children('span:first');
									if($arrow.hasClass('dt-arrowgif')){
										$arrow.removeClass('dt-arrowgif').addClass('dt-expand');
										$arrow.next('.dt-anchor').find('.branch').removeClass('b-collapse').addClass('b-expand');
										//$arrow.next('.branch').removeClass('b-collapse').addClass('b-expand');
									}else if ($arrow.hasClass('dt-collapse')){
										$arrow.removeClass('dt-collapse').addClass('dt-expand');
										$arrow.next('.dt-anchor').find('.branch').removeClass('b-collapse').addClass('b-expand');
										//$arrow.next('.branch').removeClass('b-collapse').addClass('b-expand');
									}
								});
								// $(".icon",node).removeClass("dt-arrowgif");
								// $(".icon",node).addClass("dt-collapse4");
								
				
								// 维护汇总节点的+号
								
						});
			},	

            callback : {
            	beforeExpand: function(tree , treeNode){
					if(Return.multiSelect && !Return.independent && tree.indeterminatedNodes == null){
						var value = Return.getSelValue()
						Return.setDictTreeCheckedNodes();							
						tree.indeterminatedNodes = [];

						     	
						if(value && value.length>0){
		            		Return.beforeExpand(tree , treeNode);
						}
					}

    			},
    			
    			onSelected : function ($tree, $treeNode) {
                    Return.value = $tree.getNodeValue($treeNode);

                    if(Return._hasShow){
                    	Return.hideDictList();
                    }
                    
                },

                onChecked : function($tree, $treeNode) {
                }
            }
        });

		Return.setDictTree(dictTree);
        Return._dropView.hide();
        Return._textBtn.val(this.text);
        dictTree.render(Return._dropView);
    	//Return.hideDictList();
    	Return.install();
		return Return;
		
	}
})();