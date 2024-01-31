(function($) {
var nodeid = 1;
function getNodeId() {
	return 'treemenubar_node_' + nodeid++;
}; 
YIUI.Component.TreeMenuBar = YIUI.extend(YIUI.Component, {
	
	/** 节点数据 */
	nodes : null,
	/**
	 * 颜色主题，默认为Orange。
	 * 可选值：Orange、Blue、Gray、Green、Red
	 */
	theme : 'Orange',

    isDataBinding: function() {
        return false;
	},
	
	onRender : function(ct) {
		this.base(ct);
		
		this.el.addClass('treemenubar');
		
		if(this.nodes) {
			var nodes = this.nodes,
				node,parentNode, parentEl;
			for(var i=0,len=nodes.length;i<len;i++) {
				node = nodes[i];
				node.id = node.id || getNodeId();
				if(!parentNode) {
					parentNode = node;
				}
				if(node.pId != parentNode.id) {
					parentNode = node;
					var el = $('<ul class="group"><li>'+node.name+'</li><ul></ul></ul>').appendTo(this.el);
					parentEl = $(el.children()[1]);
				} else {
					parentEl.append($('<li>'+node.name+'</li>'));
				}
			}
			this.el.treemenubar({
				header : '> ul > li',
				collapsible : true,
				heightStyle : 'content'
			});
		}
	}
});
YIUI.reg("treemenubar", YIUI.Component.TreeMenuBar);
})(jQuery);
