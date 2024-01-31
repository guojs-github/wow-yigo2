/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-3-20
 * Time: 下午4:30
 * To change this template use File | Settings | File Templates.
 */
YIUI.DictTree = YIUI.extend(YIUI.Control, {

	/** HTML默认创建为label */
	autoEl: '<div></div>',
	
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
    
    /** 访问后台的url*/
    url : null,
    
    /** 参数*/
    params : {},
    
    /** 根节点 */
    rootNode : null,
    
    init: function(options) {
    	this.base(options);
    	var self = this;

    	self.results = [];

    	self.callback = $.extend({
			beforeExpand: $.noop,
			onSelected: $.noop,
			onChecked: $.noop
    	}, options.callback);
    	self.clickEvent = {

		};
		
		this.rootNode = null;
	 	this.indeterminatedNodes = null;
    },
    
    /** 构建树结构 */
    buildTreenode: function(nodes, pNodeKey, level) {
    	if(!nodes) {
    		return;
    	}
    	if(!nodes.length) {
    		nodes = $(nodes);
    	}
    	
    	this.addNodes(nodes, pNodeKey, level);
    
    },
    
    /**
     * 根据父节点 添加子节点
     * @param {} nodes
     * @param {} pNodeKey
     */
    addNodes: function(nodes, pNodeKey, level) {
    	
    	var $pNode = $('#' + pNodeKey, this.el);
    				
    	// 无子节点的时候 去掉节点前的+号
    	if(nodes.length <= 0) {
    		$pNode.children('span:first').removeClass('tree-collapse');
    		return;
    	}
    	
		var node, nid ,oid, itemKey;
		
		this._pMap[pNodeKey] || (this._pMap[pNodeKey] = []);
	
		for (var i = 0, len = nodes.length; i < len; i++) {
			node = nodes[i];
			nid = node.id;
			oid = node.oid;
			itemKey = node.itemKey;

			this._pMap[pNodeKey].push(nid);
			
			var _li = $("<li id='"+ nid + "' class='dictTree tree-node' oid = '"+oid+"'parentid='"+pNodeKey+"' itemKey='"+itemKey+"'></li>");
			_li.attr("level", level).css("padding-left", 15);
			var _pul = $pNode.children("ul");
			
			if(_pul.length == 0){
				_pul = $("<ul class='tree-ul'></ul>").appendTo($pNode);
			}
			
			
			_li.appendTo(_pul);

			var _a = $("<a class='tree-anchor'></a>");

	        var _ul, _span, _chk;
	        
	        if(node.isParent) {
	        	// 汇总节点
	            if(node.open) {
	            	_li.addClass('selected');
	            	_span = $("<span class='dictTree-icon tree-expand'/>").appendTo(_li);           	  
	            	_explore = $("<span class='tree-explore tree-explore-expand'/>").appendTo(_a);
	            }
	            else {
	            	_span = $("<span class='dictTree-icon tree-collapse'/>").appendTo(_li);
	            	_explore = $("<span class='tree-explore tree-explore-collapse'/>").appendTo(_a);
	            }
	            
	        } else {
	        	//明细节点
	        	_span = $("<span class='dictTree-icon'/>").appendTo(_li);
	        	_explore = $("<span class='tree-explore'/>").appendTo(_a);
	        }
	        switch(node.stateMask) {
		        case YIUI.DictStateMask.Enable: 
		        	_span.addClass("enable");
		        	break;
		        case YIUI.DictStateMask.Disable: 
		        	_span.addClass("disable");
		        	break;
		        case YIUI.DictStateMask.Discard: 
		        	_span.addClass("discard");
		        	break;
	        }
	        //复选框
        	if(this.showCheckBox){
           		_chk = $("<span class='tree-checkbox' />");
		        _span.after(_chk);
        	}
			_a.appendTo(_li);
	        
	       
	        var _selectNode = $("<span class='treenode-name'>" + node.name + "</span>").appendTo(_a);
	        
     		$pNode.attr('isLoaded', true);
		}
		
		
		//如果是多选 ，设置复选框的状态
	    if(this.showCheckBox) {
			for (var i = 0, len = nodes.length; i < len; i++) {
				node = nodes[i];
				nid = node.id;
	
	        	var chkstate = 0;
	        	
	        	if(nid in this.checkedNodes){
	        		chkstate = 1;
	        	}else if(!this.independent &&  nid in this.indeterminatedNodes){
	        		chkstate = 2;
	        	}
	        	
	        	//子节点打勾的情况下 ，如果父节点没有打勾 且是父子联动 则 父节点半勾
//	        	if(chkstate > 0 && ! this.independent && $pNode){
//	        		var pstate = $pNode.children('.tree-checkbox').attr('checkstate') || 0;
//	        		if(pstate == 0){
//	        			$pNode.children('.tree-checkbox').attr('checkstate', 2).addClass("checkstate"+2);
//	        		}
//	        	}
//	        	
	        	//子节点没打勾的情况下， 如果父节点打勾且是父子联动则子节点打勾
	        	if(chkstate == 0 && !this.independent && $pNode){
	        		var pChkstate =  $pNode.children('.tree-checkbox').attr('checkstate') || 0 ;
	        		if(pChkstate == 1){
	        			chkstate =1;
	        		}
	        	}
	        	
	        	var $node = $('#'+nid,this.el);
	        	
	        	$node.children('.tree-checkbox').attr('checkstate', chkstate).addClass("checkstate"+chkstate);
	        }
		}
    },
   
    /**
     * 当字典树为父子节点联动时， 需要维护节点勾选状态
     * @param {} $node
     * @param {} checkstate
     */
    checkTreeNode: function($node, checkstate){
    	var child, _index, _img, self
		
    	var tree = this;
    	
    	//递归处理子节点
    	function checkChildNode($pNode, checkstate){
    		var cbNode = $pNode.children('.tree-checkbox');
    		cbNode.removeClass("checkstate"+cbNode.attr('checkstate'));
    		cbNode.attr('checkstate', checkstate).addClass("checkstate"+checkstate);
    		
    		//处理子节点时， 是有在选中和未选中时需要做处理
    		if(checkstate != 2){
	    		var pNodeKey = $pNode.attr('id');
	    		
	    		tree._pMap[pNodeKey] || (tree._pMap[pNodeKey] = []);
	    		
	    		for (var i = 0; i < tree._pMap[pNodeKey].length; i++) {
	                var cId = tree._pMap[pNodeKey][i];
					var $child = $('#'+cId, tree.el);
					checkChildNode($child, checkstate);
	            }
    		}
    	}
    	
    	//递归处理父节点
    	function checkParentNode($cNode, checkstate){
    		var pId = $cNode.attr('parentid');
    		if(!pId) return;
    		var $pNode = $('#' + pId, tree.el);
    		var cbNode = $pNode.children('.tree-checkbox');
    		cbNode.removeClass("checkstate"+cbNode.attr('checkstate'));
    		
    		if(checkstate == 2){
    			cbNode.attr('checkstate', 2).addClass("checkstate"+2);
	            checkParentNode($pNode, 2);
    		}else{
	    		tree._pMap[pId] || (tree._pMap[pId] = []);
	    		var diffstate = false;
	    		//TODO 待测试 ， 用filter 可能存在性能问题 
	    		//$("a", tree.el).filter("[parentid = '" + pId + "']").find("span.tree-checkbox").filter("[checkstate != '"+checkstate+"']").length > 0
	    		for (var i = 0; i < tree._pMap[pId].length; i++) {
	                var cId = tree._pMap[pId][i];
					var $child = $('#'+cId, tree.el);
					var check = $child.children('.tree-checkbox').attr('checkstate') || 0;
					if(check != checkstate){
						diffstate = true;
						break;
					}
	            }
	            //有一个节点存在和父节点的勾选状态不一致， 父节点就为半勾状态
	            if(diffstate){
	            	checkstate = 2;
	            }
	            cbNode.attr('checkstate', checkstate).addClass("checkstate"+checkstate);
            	checkParentNode($pNode, checkstate);
    		}
    		
    		//记录在选中节点中
	      	if(checkstate == 1){
        		tree.checkedNodes[pId] = tree.getNodeValue($pNode);
        	}else{
        		delete tree.checkedNodes[pId];
        	}
	            	
		
    	}
    
    	
    	if(!this.independent) {
    		checkChildNode($node, checkstate);
            checkParentNode($node, checkstate);	
    	}else{
    		// 父子节点不联动， 则仅当前节点打勾
    		$node.children('.tree-checkbox').attr('checkstate', checkstate).addClass("checkstate"+checkstate);
    	}
    }, 

    /** 设置需要选中的节点 */
    setCheckedNodes : function (nodes){
    	if(this.showCheckBox){   
    		var tree = this;
    		
    		this.clearCheckedNodes();
	        this.checkedNodes = nodes;
	        this.indeterminatedNodes = null;
	        
			//for(var nId in nodes){
			//	var node = $('#'+nId, tree.el);
			//	if(node){
			//		tree.checkTreeNode(node,1);
			//	}
			//}
	        
	     	if(this.rootNode){
	       		var rootId = this.rootNode.attr('id');
		       	if(!jQuery.isEmptyObject(this.checkedNodes) && !this.independent){
		       		this.rootNode.children('.tree-checkbox').attr('checkstate',2).addClass("checkstate"+2);
		       	}else if(rootId in this.checkedNodes){
		       		this.rootNode.children('.tree-checkbox').attr('checkstate',1).addClass("checkstate"+1);
		       	}
	     	}

	    }
    },
    
    clearCheckedNodes : function(){
    	this.checkedNodes = {};
    	this.indeterminatedNodes = null;
    	$("[checkstate=1],[checkstate=2]").removeClass("checkstate1").removeClass("checkstate2").attr('checkstate', 0).addClass("checkstate0");
    },
    /**
     * 创建根节点
     * @param {} itemKey
     * @param {} nodeKey
     * @param {} name
     */
    createRootNode : function(node , nodeKey) {
    	
    	var _li = $("<li id='"+ nodeKey + "'class='dictTree tree-node' oid = '"+node.oid+"' itemKey='"+node.itemKey+"'></li>");
    	_li.attr("level", -1);
    	_li.appendTo(this.el);
    	var _a = $("<a class='tree-anchor'></a>");

    	
        _li.addClass('selected');
    	_a.addClass('curSelectedNode');

    	$("<span class='dictTree-icon tree-expand'/>").appendTo(_li);
    	
    	if(this.showCheckBox){
    		$("<span class='tree-checkbox' />").addClass("checkstate0").appendTo(_li);
    	}
    	
    	$("<span class='tree-explore tree-explore-expand'/>").appendTo(_a);
        
    	$("<span class='treenode-name'>" +node.name+ "</span>").appendTo(_a);
    	
    	_a.appendTo(_li);
    	
    	$("<ul class='tree-ul'></ul>").appendTo(_li);
    	
    	this.rootNode = $('#'+nodeKey,this.el);
    	
    	//如果是多选字典 判断根节点打勾状态
		if(this.showCheckBox){    
			if(!jQuery.isEmptyObject(this.checkedNodes) && !this.independent){
	       		this.rootNode.children('.tree-checkbox').attr('checkstate',2).addClass("checkstate"+2);
	       	}else if(nodeKey in this.checkedNodes){
	       		this.rootNode.children('.tree-checkbox').attr('checkstate',1).addClass("checkstate"+1);
	       	}
		}
    		
    },

    onRender: function (ct) {
    	this.base(ct);
    	this.el.addClass('dictTree dictTree-content');
    	var id = this.el.attr('id');
    	
        this.buildTreenode(this.dataSource, null, 0);
    },

    /**
     * 收拢节点
     * @param {} node
     */
    collapseNode: function(node) {
		node.children('ul').hide();
		var $arrow = node.children('span:first');
		$arrow.removeClass('tree-expand').addClass('tree-collapse');
		$arrow.next('.tree-explore').removeClass('tree-explore-expand').addClass('tree-explore-collapse');
		node.children('a').removeClass('curSelectedNode');
		node.removeClass('selected');
	},
    
	/**
	 * 展开节点
	 * @param {} node
	 */
	expandNode: function(node) {
		if(!node){
			node = this.rootNode;
		}
	
		var self = this;
		//未加载过的情况下 加载子节点
		if(!node.attr('isLoaded')) {
		
			this.callback.beforeExpand(this , node);
			
			/*var nodeId = node.attr('id');
			var success = function(msg) {
				if (msg) {
					var syncNodes = self.formatAsyncData(msg);
					self.buildTreenode(syncNodes , nodeId, parseInt(node.attr("level"))+1);
					node.attr('isLoaded',true);
				}
			}*/
			
			YIUI.Service.getDictChildren(this , node);
			//Svr.Request.getSyncData(self.url, self.params, success);

		}
	
		node.children('ul').show();
		
		// 维护汇总节点的+号
		var $arrow = node.children('span:first');
		if($arrow.hasClass('tree-collapse')){
			$arrow.removeClass('tree-collapse').addClass('tree-expand');
			$arrow.next('.tree-explore').removeClass('tree-explore-collapse').addClass('tree-explore-expand');
			node.children('a').addClass('curSelectedNode');
			node.addClass('selected');
			
		}
	},
	   
	/**
	 * 复选框勾选事件
	 * @param {} $node
	 */
	checkboxClick: function($node) {
		var state = $node.children('.tree-checkbox').attr('checkstate') == 0 ? 1 : 0;
		this.checkTreeNode($node, state);
		this.callback.onChecked(this,$node);
		
		var nodeKey = $node.attr('id');
		if(state == 1){
			this.checkedNodes[nodeKey] = this.getNodeValue($node);
		}else{
			delete this.checkedNodes[nodeKey];
		}	
	},
	
	selectNode: function(node) {
		if(this.selectedNodeId) {
			$('#' + this.selectedNodeId).removeClass('clicked');
		}
		this.selectedNodeId = node.attr('id');
		node.addClass('clicked');
		this.callback.onSelected(this, node);
	},
	
	getNodeValue: function($node){
	
	},
	
    install : function() {
    	var self = this;
    	if(!this.showCheckBox){
	    	self.el.bind('click', function(e) {
	    		var $target = $(e.target);
	    		var $node = $target.parents('li:first');
	    		
	    		if($target.hasClass('tree-collapse')) {
	    			
	    			self.expandNode($node);
	    			//self.clickEvent.expandNode(e, self, null);
	    			return;
	    		}
	    		if($target.hasClass('tree-expand')) {
	    			self.collapseNode($node);
	    			//self.clickEvent.collapse(e, self, null);
	    			return;
	    		}
	    		if($target.hasClass('tree-checkbox')) {
	    			self.checkboxClick($node);
	    			return;
	    		}
	    		if($target.hasClass('treenode-name')) {
	    			self.selectNode($node);
	    			return;
	    		}
	    	});
    	}
	},
	
	/**
	 * 获取选中节点的值
	 * @return {}
	 */
	getCheckedValues: function(){
		if(this.showCheckBox){
			//var nodes = this.el.find("[checkstate = '1']").parent();
			var dictTree = this;
			var values = [];
			
			$.each(dictTree.checkedNodes , function(key,val){
				
				var $node = $('#'+key , dictTree.el);
										
				if(!this.independent) {

					var pId = $node.attr('parentid');
					var $pNode = $('#'+pId , dictTree.el);
					
					if($pNode){
						var chkstate = $pNode.children('.tree-checkbox').attr('checkstate') || 0;
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
	
    afterRender: function () {
        this.base();
    },
    
    /**
     * 移除根节点外的所有节点 
     */
    reset: function (){
    	if(this.rootNode){
    		this._pMap = {};
    		this.collapseNode(this.rootNode);
    		this.rootNode.children('.tree-ul').children().remove();
    		this.rootNode.removeAttr('isLoaded');
    		this.indeterminatedNodes = null;
    	}
    }
});
YIUI.reg('dicttree', YIUI.DictTree);
