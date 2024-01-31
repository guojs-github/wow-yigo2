/**
 * 拆分面板。
 * 参考splitlayout.js。
 */
YIUI.Panel.SplitPanel = YIUI.extend(YIUI.Panel, {
    /** 使用SplitLayout来实现 */
    layout: 'SplitLayout',
    
    /** 是否是上下拆分，默认为是(vertical)；左右拆分为：'horizontal' */
    orientation: "vertical",
    
    /** 
     * 分割的各个面板的宽度或高度 
     * TODO：是否需要？ 
     * TODO: 添加lock标记
     * 形式：[{size:100px,resizable:true,lock:false},...]
     */
    splitSizes: null,
    
    init : function(options) {
    	this.base(options);
        var sizes = [];
        var splitSizes = options.splitSizes;
        for (var i = 0, len = splitSizes.length; i < len; i++) {
            var size = splitSizes[i];
            var obj = {
                size: size.size,
                lock: size.lock
            };
            sizes.push(obj);
        }

        this.splitSizes = sizes;
    },
    
    afterAdd: function (comp) {
        var items = this.items,
        	index = items.length - 1;
        if(this.orientation == 'vertical') {
        	if(!comp.width) {
            	comp.width = '100%';
        	}
        } else {
        	if(!comp.height) {
        		comp.height = '100%';
        	}
        }
    },
    
    setOrientation: function(orientation) {
    	this.orientation = orientation;
    },
    
    onRender: function(ct) {
    	this.base(ct);
    	this.el.addClass("ui-spl");
    	this.orientation && this.setOrientation(this.orientation);
    },

    install : function() {
    	var target = this.getRenderTarget();
    	target.children(".spl-resizer").off('mousedown').on('mousedown', null, this, resizeStart);
	}
	
});
YIUI.reg("splitpanel", YIUI.Panel.SplitPanel);


//鼠标按下，开始拖动
  function resizeStart(event) {
  	event.preventDefault();

  	var layout = event.data.layout,
  		ct = event.data,
  		splitter = $(this),
  		region = parseInt(splitter.attr('region')),
  		firstItem = ct.items[region],
  		secondItem = ct.items[region + 1],
  		resize = layout.resize,
  		vertical = ct.orientation !== 'horizontal'; // 是否是上下拆分
  	
  	layout.container = ct;
  	
  	// 判断此分隔条是否允许拖动
  	if(ct.splitSizes && (ct.splitSizes[region].resizable === false || ct.splitSizes[region+1].resizable === false)) {
  		return;
  	}
  	
  	firstItem.el.after($("<div class='spl-mask' />"));
  	secondItem.el.after($("<div class='spl-mask' />"));

  	// 存储分隔条最初的位置、鼠标最初的位置
  	resize.splitter = splitter;
  	resize.startPos = splitter.cssNum(!vertical ? 'left' : 'top', 0);
  	resize.startMouse = !vertical ? event.screenX : event.screenY;

  	// 添加position，以动态移动分隔条
  	splitter.addClass('r-moving');

  	// 监听鼠标拖动、鼠标松开事件
  	$(document).off('mousemove').off('mouseup.splitter')
  		.on('mousemove', null, layout, resizeMove)
  		.on('mouseup.splitter', null, layout, resizeStop);
  }

  //鼠标拖拽过程
  function resizeMove(event) {
  	event.preventDefault();

  	var layout = event.data,
  		ct = layout.container,
  		resize = layout.resize,
  		splitter = resize.splitter,
  		region = parseInt(splitter.attr('region')),
  		els = ct.getRenderTarget().children('.spl-item'),
  		first = $(els[region]),
  		second = $(els[region + 1]),
  		vertical = ct.orientation !== 'horizontal',
  		current = !vertical ? event.screenX : event.screenY,
  		delta = current - resize.startMouse,
  		minSize = layout.regionMinSize;

  	// 计算，保证各面板不会被拖动地太小
  	if(vertical) {
  		if(first.height() + delta < minSize) {
  			delta = minSize - first.height();
  		} else if(second.height() - delta < minSize) {
  			delta = second.height() - minSize;
  		}
  	} else {
  		if(first.width() + delta < minSize) {
  			delta = minSize - first.width();
  		} else if(second.width() - delta < minSize) {
  			delta = second.width() - minSize;
  		}
  	}

  	// 记录实际应该拖动的大小，在resizeStop中使用
  	resize.delta = delta;

  	// 实时的移动分隔条
  	splitter.css(!vertical?'left':'top', resize.startPos + delta);
  }

  //鼠标松开，重新设置各分区大小
  function resizeStop(event) {
  	event.preventDefault();
  	var layout = event.data,
  		ct = layout.container,
  		resize = layout.resize,
  		splitter = resize.splitter,
  		region = parseInt(splitter.attr('region')),
  		el = ct.getRenderTarget(),
  		els = el.children('.spl-item'),
  		first = $(els[region]),
  		second = $(els[region + 1]),
  		firstItem = ct.items[region],
  		secondItem = ct.items[region + 1],
  		vertical = ct.orientation !== 'horizontal',
  		minSize = layout.regionMinSize,
  		delta = resize.delta || 0,
  		panelWidth = ct.getWidth(),
  		panelHeight = ct.getHeight();

  	$(".spl-mask", el).remove();
  	// 解除监听鼠标事件
  	$(document).off('mousemove', resizeMove).off('mouseup.splitter', resizeStop);

  	if(delta !== 0) {
  		// 重设受影响的面板大小
  		if(vertical) {
  			first.height(first.height() + delta);
  			second.height(second.height() - delta);
			firstItem.setHeight($.getReal("100%", first.height()));
			secondItem.setHeight($.getReal("100%", second.height()));
  			panelHeight -= ct.layout.getPlaceholderHeight();
			ct.splitSizes[region].size = first.height();
			ct.splitSizes[region + 1].size = "100%";
  		} else {
  			first.width(first.width() + delta);
  			second.width(second.width() - delta);
			firstItem.setWidth($.getReal("100%", first.width()));
			secondItem.setWidth($.getReal("100%", second.width()));
  			panelWidth -= ct.layout.getPlaceholderWidth();
			ct.splitSizes[region].size = first.width();
			ct.splitSizes[region + 1].size = "100%";
  		}
  		if(firstItem.hasLayout){
  			firstItem.doLayout(firstItem.getWidth(), firstItem.getHeight());
  		}
  		if(secondItem.hasLayout){
  			secondItem.doLayout(secondItem.getWidth(), secondItem.getHeight());
  		}
  		
  	}
  	// 大小修改完毕后，删除分隔条的position样式
  	splitter.removeClass('r-moving');
  	splitter.css(!vertical?'left':'top', 0);

  	// 清空中间结果，以供下次拖动使用
  	$.destroy(resize);
  }