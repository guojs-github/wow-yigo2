/*
 * jQuery treeTable Plugin 3.0.0
 * http://ludo.cubicphuse.nl/jquery-treetable
 *
 * Copyright 2013, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function() {
	var $, Node, Tree, methods;

	$ = jQuery;

	Node = (function() {
		function Node(row, tree, settings) {
			var parentId;
			this.row = row;
			this.tree = tree;
			this.settings = settings;
			// TODO Ensure id/parentId is always a string (not int)
			this.id = this.row.attr(this.settings.nodeIdAttr);
			// TODO Move this to a setParentId function?
			parentId = this.row.attr(this.settings.parentIdAttr);
			if (parentId != null && parentId !== "") {
				this.parentId = parentId;
			}

			this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
			this.expander = $(this.settings.expanderTemplate);
			this.indenter = $(this.settings.indenterTemplate);
			this.children = [];
			this.initialized = false;
			this.treeCell.prepend(this.indenter);
		}

		Node.prototype.addChild = function(child) {
			return this.children.push(child);
		};

		Node.prototype.ancestors = function() {
			var ancestors, node;
			node = this;
			ancestors = [];
			while (node = node.parentNode()) {
				ancestors.push(node);
			}
			return ancestors;
		};

		Node.prototype.collapse = function() {
			this._hideChildren();
			this.row.removeClass("expanded").addClass("collapsed");
			this.expander.attr("title", this.settings.stringExpand);

			if (this.initialized && this.settings.onNodeCollapse != null) {
				this.settings.onNodeCollapse.apply(this);
			}
			return this;
		};

		// TODO destroy: remove event handlers, expander, indenter, etc.
		Node.prototype.expand = function() {
			var def = $.Deferred();
			this.row.removeClass("collapsed").addClass("expanded");
			if (this.initialized && this.settings.beforeExpand != null) {
				var _this = this;
				this.settings.beforeExpand(this.row).then(function() {
					_this._showChildren();
					_this.expander.attr("title", _this.settings.stringCollapse);
					def.resolve(true);
				});
			}
			this._showChildren();
			this.expander.attr("title", this.settings.stringCollapse);
			return def.promise();
		};

		Node.prototype.expanded = function() {
			return this.row.hasClass("expanded");
		};

		Node.prototype.hide = function() {
			this._hideChildren();
			this.row.hide();
			return this;
		};

		Node.prototype.isBranchNode = function() {
			if(this.children.length > 0 || this.row.data(this.settings.branchAttr) === true) {
				return true;
			} else {
				return false;
			}
		};

		Node.prototype.level = function() {
			return this.ancestors().length;
		};

		Node.prototype.parentNode = function() {
			if (this.parentId != null) {
				return this.tree[this.parentId];
			} else {
				return null;
			}
		};

		Node.prototype.removeChild = function(child) {
			var i = $.inArray(child, this.children);
			return this.children.splice(i, 1);
		};
    
		Node.prototype.removeChildren = function() {
			this.children = [];
			return this.children;
		};

		Node.prototype.render = function() {
			var settings = this.settings, target;
			
			if ((settings.expandable === true && this.isBranchNode()) || this.row.attr("haschild") == "true") {
				this.indenter.html(this.expander);
				target = settings.clickableNodeNames === true ? this.treeCell : this.expander;
				/*  target.unbind("click.treetable").bind("click.treetable", function(event) {
          $(this).parents("table").treetable("node", $(this).parents("tr").attr(settings.nodeIdAttr)).toggle();
          return event.preventDefault();
        }); */
			} else if(this.row.attr("haschild") != "true") {
				this.indenter.addClass("noChild");
			}
			if(this.row.hasClass("root")) {
				this.expand();
			} else if (settings.expandable === true && settings.initialState === "collapsed") {
				this.collapse();
			}  
			var level = 0;
			if(settings.levelMinus) {
				level = this.level() > 0 ? this.level() - 1 : 0;
			} else {
				level = this.level();
			}
			this.indenter[0].style.paddingLeft = "" + (level * settings.indent) + "px";
			this.indenter[0].style.width = "" + (level * settings.indent + settings.firstIndent) + "px";
			return this;
		};

		Node.prototype.reveal = function() {
			if (this.parentId != null) {
				this.parentNode().reveal();
			}
			return this.expand();
		};

		Node.prototype.setParent = function(node) {
			if (this.parentId != null) {
				this.tree[this.parentId].removeChild(this);
			}
			this.parentId = node.id;
			this.row.attr(this.settings.parentIdAttr, node.id);
			return node.addChild(this);
		};

		Node.prototype.show = function() {
			if (!this.initialized) {
				this._initialize();
			}
//      var td = $("td", this.row).first();
//	  var span = $("span", td).last();
//	  if(this.children.length > 0) {
//		span.addClass(this.settings.strFolder);
//	  } else {
//		span.addClass(this.settings.strFile);
//	  }
			this.row.show();
			if (this.expanded()) {
				this._showChildren();
			}
			return this;
		};

		Node.prototype.toggle = function() {
			if (this.expanded()) {
				this.collapse();
			} else {
				this.expand();
			}
			return this;
		};

		Node.prototype._hideChildren = function() {
			var child, _i, _len, _ref, _results;
			_ref = this.children;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				child = _ref[_i];
				_results.push(child.hide());
			}
			return _results;
		};

		Node.prototype._initialize = function() {
			this.render();
			if (this.settings.onNodeInitialized != null) {
				this.settings.onNodeInitialized.apply(this);
			}
			return this.initialized = true;
		};

		Node.prototype._showChildren = function() {
			var child, _i, _len, _ref, _results;
			_ref = this.children;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				child = _ref[_i];
				_results.push(child.show());
			}
			return _results;
		};

		return Node;
	})();
	
	Tree = (function() {
		function Tree(table, settings) {
			this.table = table;
			this.settings = settings;
			this.tree = {};
			
			// Cache the nodes and roots in simple arrays for quick access/iteration
			this.nodes = [];
			this.roots = [];
		}

	    Tree.prototype.collapseAll = function() {
	    	var node, _i, _len, _ref, _results;
	    	_ref = this.nodes;
	    	_results = [];
	    	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	    		node = _ref[_i];
	    		_results.push(node.collapse());
	    	}
	    	return _results;
	    };
	
		Tree.prototype.expandAll = function() {
			var node, _i, _len, _ref, _results;
			_ref = this.nodes;
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				node = _ref[_i];
				_results.push(node.expand());
			}
			return _results;
	    };
	
	    Tree.prototype.loadRows = function(rows) {
	    	var node, row, i;
	    	if (rows != null) {
	    		for (i = 0; i < rows.length; i++) {
	    			row = $(rows[i]);
	    			if (row.attr(this.settings.nodeIdAttr) != null) {
	    				node = new Node(row, this.tree, this.settings);
	    				this.nodes.push(node);
	    				this.tree[node.id] = node;
	    				if (node.parentId != null) {
	    					this.tree[node.parentId].addChild(node);
	    				} else {
	    					this.roots.push(node);
	    				}
	    			}
	    		}
	    	}
	    	return this;
		};
	
		Tree.prototype.move = function(node, destination) {
			// Conditions:
			// 1: +node+ should not be inserted as a child of +node+ itself.
			// 2: +destination+ should not be the same as +node+'s current parent (this
			//    prevents +node+ from being moved to the same location where it already
			//    is).
			// 3: +node+ should not be inserted in a location in a branch if this would
			//    result in +node+ being an ancestor of itself.
	    	if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
	    		node.setParent(destination);
	    		this._moveRows(node, destination);
	
	        // Re-render parentNode if this is its first child node, and therefore
	        // doesn't have the expander yet.
	        if (node.parentNode().children.length === 1) {
	        	node.parentNode().render();
	        	}
	    	}
	    	return this;
	    };
	
	    Tree.prototype.render = function() {
	    	var root, _i, _len, _ref;
	    	_ref = this.roots;
	    	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	    		root = _ref[_i];
	
	    		// Naming is confusing (show/render). I do not call render on node from
	    		// here.
	    		root.show();
	      }
	      return this;
	    };
	
	    Tree.prototype._moveRows = function(node, destination) {
	    	var child, _i, _len, _ref, _results;
	    	node.row.insertAfter(destination.row);
	    	node.render();
	    	_ref = node.children;
	    	_results = [];
	    	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	    		child = _ref[_i];
	    		_results.push(this._moveRows(child, node));
	    	}
	    	return _results;
	    };
	
	    Tree.prototype.unloadBranch = function(node) {
	    	var child, children, i;
	    	for (i = 0; i < node.children.length; i++) {
	    		child = node.children[i];
	    		// Recursively remove all descendants of +node+
	    		this.unloadBranch(child);
	    		// Remove child from DOM (<tr>)
	    		child.row.remove();
	    		// Clean up Tree object (so Node objects are GC-ed)
	    		delete this.tree[child.id];
	    		this.nodes.splice($.inArray(child, this.nodes), 1)
	    	}
	    	// Reset node's collection of children
	    	node.children = [];
	    	return this;
	    };
	    return Tree;
	})();

	// jQuery Plugin
	methods = {
		init: function(options) {
			var settings;
			settings = $.extend({
		        branchAttr: "ttBranch",
		        clickableNodeNames: false,
		        column: 0,
		        columnElType: "td", // i.e. 'td', 'th' or 'td,th'
		        expandable: false,
		        expanderTemplate: "<a href='#'>&nbsp;</a>",
		        indent: 27,
		        firstIndent: 31,
		        indenterTemplate: "<span class='indenter'></span>",
		        initialState: "collapsed",
		        nodeIdAttr: "id", // maps to id
		        parentIdAttr: "pid", // maps to pid
		        stringExpand: "Expand",
		        stringCollapse: "Collapse",
				strFolder: "folder",
				strFile: "file",
				levelMinus: false,
		        // Events
		        onInitialized: null,
		        onNodeCollapse: null,
		        beforeExpand: null,
		        onNodeInitialized: null,
				onSelect: $.noop
			}, options);
	
			this.each(function() {
		        var el, tree;
		        tree = new Tree(this, settings);
		        tree.loadRows(this.rows).render();
		        el = $(this).addClass("treetable").addClass("tree_table").data("treetable", tree);
		        if (settings.onInitialized != null) {
		        	settings.onInitialized.apply(tree);
		        }
				el.delegate("tr", "click",  $.debounce(200, true, function(event) {
					var $target = $(event.target);
					if($target.hasClass("indenter") || $target.parent().hasClass("indenter")) {
						el.treetable("node", $(this).attr(settings.nodeIdAttr)).toggle();
						return event.preventDefault();
					}
					if(el.attr("enable") == "false") return;
					$("tr.selected", el).removeClass("selected");
					$(this).addClass("selected");
					var $target = $(event.target);
					settings.el.target = $target;
					settings.onSelect(settings.el, $(this));
				}));

				if(settings.doubleClick){
					el.delegate("tr", "dblclick",  $.debounce(200, true, function(event) {
						var $target = $(event.target);
						if($target.hasClass("indenter") || $target.parent().hasClass("indenter")) {
							el.treetable("node", $(this).attr(settings.nodeIdAttr)).toggle();
							return event.preventDefault();
						}
						if(el.attr("enable") == "false") return;
						$("tr.selected", el).removeClass("selected");
						$(this).addClass("selected");
						var $target = $(event.target);
						settings.el.target = $target;
						settings.doubleClick(settings.el, $(this));
					}));	
				}

				settings.el = el;
				el.treeNode = tree;
		//		el.tree = tree.tree;
				el.renderAll = true;
				el.addChilds = methods.addChilds;
				el.removeNode = methods.removeNode;
				el.removeNodes = methods.removeNodes;
				el.removeAll = methods.removeAll;
				el.removeChildren = methods.removeChildren;
				el.expand = methods.expand;
				el.setEnable = methods.setEnable;
			});
			return settings.el;
	    },
	    
	    setEnable: function(enable) {
	    	this.attr("enable", enable);
	    },
	    
	    addChilds: function(html) {
	    	var rows = $(html), row, pid, previd, prevrow, prow;
			var el = this;
			var tree = this.treeNode;
	    	for (var i = 0, len = rows.length; i < len; i++) {
				row = rows.eq(i);
				pid = row.attr("pid");
				previd = row.attr("previd");
				prow = $("#" + pid, el);
	
				var pnode = tree.tree[pid];
				var expanded = pnode.expanded();
				if(!expanded) {
					pnode.expand();
				}
				if(previd) {
					prevrow = $("#" + previd, el);
					var $tr = $("[pid=" + previd+"]", el).last();
					if($tr.length > 0) {
						$tr.after(row);
					} else {
						prevrow.after(row);
					}
				} else {
					var lastRow = $("[pid="+pid+"]", el).last();
					if(lastRow.length > 0) {
						row.attr("previd", lastRow.attr("id"));
						lastRow.after(row);
					} else {
						prow.after(row);
					}
				}
			}
	    	$(this).each(function() {
	            tree.loadRows(rows).render();
	            el.tree = tree.tree;
	            el.data("treetable", tree);
	//            if (settings.onInitialized != null) {
	//              settings.onInitialized.apply(tree);
	//            }
	            
	    	});
	    },
	    
	    removeChildren: function(obj) {
	    	var node;
	    	if($.isString(obj)) {
	    		var tree = this.treeNode.tree;
	    		node = tree[obj];
	    	} else if(obj instanceof Node) {
	    		node = obj;
	    	}
	    	var children = node.children;
	    	if(!children || children.length == 0) return;
	    	for (var i = 0, len = children.length; i < len; i++) {
				this.removeChildren(children[i].id);
			}
	    	node.removeChildren();
	    	$("[pid="+node.id+"]", this).remove();
	    },
	    
	    removeNodes: function(ids) {
	    	for (var i = 0, len = ids.length; i < len; i++) {
				this.removeNode(ids[i]);
			}
	    },
	    
	    removeAll: function() {
	    	var roots = this.treeNode.roots;
	    	if(roots) {
	    		for (var i = 0, len = roots.length; i < len; i++) {
					this.removeNode(roots[i].id);
				}
	    	}
	    },
	    
	    removeNode: function(id) {
	    	var tree = this.treeNode.tree;
	    	var node = tree[id];
	    	if(!node) return;
	    	var $treeTable = node.settings.el;
	    	if(node.children.length > 0) {
	    		for (var i = 0, len = node.children.length; i < len; i++) {
	    			var child = node.children[i];
	    			var cid = child.id;
	    			this.removeChildren(child);
	    			child.row.remove();
	    			delete tree[cid];
	            }
	    	}
	    	var pnode = tree[node.parentId];
	    	if(pnode && pnode.children.length > 0) {
	    		for (var i = 0, len = pnode.children.length; i < len; i++) {
	    			if(pnode.children[i].id == id) {
	    				pnode.removeChild(pnode.children[i]);
	    				break;
	    			}
	            }
	    	}
			delete tree[id];
			var $tr = $('#' + id, $treeTable);
			var previd = $tr.attr("previd");
			var tr = $("[previd='"+id+"']", $treeTable);
			if(tr.length > 0) {
				if(previd) {
					tr.attr("previd", previd);
				} else {
					tr.removeAttr("previd");
				}
			}
	        $('#' + id, $treeTable).remove();
	    },
	
	    expand: function($tr) {
	    	var id = $tr.attr("id");
	    	var tree = this.treeNode.tree;
	    	var node = tree[id];
	    	return node.expand();
	    },
	    
	    destroy: function() {
	    	return this.each(function() {
	    		return $(this).removeData("treetable").removeClass("treetable");
	    	});
	    },
	
	    collapseAll: function() {
	    	this.data("treetable").collapseAll();
	    	return this;
	    },
	
	    collapseNode: function(id) {
	    	var node = this.data("treetable").tree[id];
	
	    	if (node) {
	    		node.collapse();
	    	} else {
	    		throw new Error("Unknown node '" + id + "'");
	    	}
	
	    	return this;
	    },
	
	    expandAll: function() {
	    	this.data("treetable").expandAll();
	    	return this;
	    },
	
	    expandNode: function(id) {
	    	var node = this.data("treetable").tree[id];
	    	if (node) {
	    		node.expand();
	    	} else {
	    		throw new Error("Unknown node '" + id + "'");
	    	}
	    	return this;
	    },
	
	    loadBranch: function(node, rows) {
	    	rows = $(rows);
	    	rows.insertAfter(node.row);
	    	this.data("treetable").loadRows(rows);
	    	return this;
	    },
	
	    move: function(nodeId, destinationId) {
	    	var destination, node;
	    	node = this.data("treetable").tree[nodeId];
	    	destination = this.data("treetable").tree[destinationId];
	    	this.data("treetable").move(node, destination);
	    	return this;
	    },
	
	    node: function(id) {
	    	return this.data("treetable").tree[id];
	    },
	
	    reveal: function(id) {
	    	var node = this.data("treetable").tree[id];
	    	if (node) {
	    		node.reveal();
	    	} else {
	    		throw new Error("Unknown node '" + id + "'");
	    	}
	    	return this;
	    },
	
	    unloadBranch: function(node) {
	    	this.data("treetable").unloadBranch(node);
	    	return this;
	    }
	};

	$.fn.treetable = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			return $.error("Method " + method + " does not exist on jQuery.treetable");
		}
	};
	
	  // Expose classes to world
	this.TreeTable || (this.TreeTable = {});
	this.TreeTable.Node = Node;
	this.TreeTable.Tree = Tree;
}).call(this);
