
var Class = function(properties){
    var _class = function(){return (arguments[0] !== null && this.initialize && typeof(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;}; 
    _class.prototype = properties; 
    return _class; 
};
var Resize = new Class({
    initialize: function(obj) {
        this.obj = obj.length > 0 ? obj[0] : obj; 
        this.resizeelm = null; 
        this.fun = null; //记录触发什么事件的索引 
        this.original = []; //记录开始状态的数组 
        this.width = null; 
        this.height = null; 
        this.fR = this.bindAsEventListener(this,this.resize); 
        this.fS = this.bind(this,this.stop);     
		
    }, 
	css: function(e,o) {
		for(var i in o) 
		e.style[i] = o[i]; 
	},
	bind: function(object, fun) {
		var args = Array.prototype.slice.call(arguments).slice(2); 
		return function() { 
			return fun.apply(object, args); 
		} 
	},
    addListener: function(element, e, fn) {
        element.addEventListener?element.addEventListener(e, fn, false) : element.attachEvent("on" + e, fn); 
    },
    removeListener: function(element, e, fn) {
        element.removeEventListener?element.removeEventListener(e, fn, false) : element.detachEvent("on" + e, fn) 
    },
	bindAsEventListener: function(object, fun) {
		var args = Array.prototype.slice.call(arguments).slice(2); 
		return function(event) { 
			return fun.apply(object, [event || window.event].concat(args)); 
		} 
	},
    currentStyle: function(element) {
        return element.currentStyle || document.defaultView.getComputedStyle(element, null); 
    },
    set: function(elm, direction) {
        if(!elm)return; 
		if(elm.length > 0) {
			elm = elm[0];
		}
        this.resizeelm = elm; 
        this.addListener(this.resizeelm, 'mousedown', this.bindAsEventListener(this, this.start, this[direction])); 
        return this; 
    }, 
    start: function(e, fun) {
        this.fun = fun; 
        this.original = [parseInt(this.currentStyle(this.obj).width), parseInt(this.currentStyle(this.obj).height), parseInt(this.currentStyle(this.obj).left), parseInt(this.currentStyle(this.obj).top)];
        this.width = (this.original[2]||0) + this.original[0]; 
        this.height = (this.original[3]||0) + this.original[1]; 
        this.addListener(document,"mousemove", this.fR); 
        this.addListener(document,'mouseup', this.fS); 
    }, 
    resize: function(e) {
        this.fun(e); 
        $.browser.isIE ? (this.resizeelm.onlosecapture=function(){this.fS()}) : (this.resizeelm.onblur=function(){this.fS()}) 
    }, 
    stop: function() {
        this.removeListener(document, "mousemove", this.fR); 
        this.removeListener(document, "mousemove", this.fS); 
        //window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();     
    }, 
    up: function(e) {
//        this.height>e.clientY?this.css(this.obj,{top:e.clientY + "px",height:this.height-e.clientY + "px"}):this.turnDown(e); 
    	var height = this.height - e.clientY;
    	if(height > 100) {
    		this.css(this.obj, {top: e.clientY + "px", height: height + "px"});
    	}
    }, 
    down: function(e) {
//        e.clientY>this.original[3]?this.css(this.obj,{top:this.original[3]+'px',height:e.clientY-this.original[3]+'px'}):this.turnUp(e);    
    	var height = e.clientY-this.original[3];
    	if(height > 100) {
    		this.css(this.obj, {top: this.original[3] + 'px', height: height + 'px'});
    	}
    }, 
    left: function(e) {
//        e.clientX<this.width?this.css(this.obj,{left:e.clientX +'px',width:this.width-e.clientX + "px"}):this.turnRight(e);         
    	var width = this.width - e.clientX;
    	if(width > 200) {
    		this.css(this.obj, {left: e.clientX +'px', width: width + "px"});
    	}
    }, 
    right: function(e) {
//        e.clientX>this.original[2]?this.css(this.obj,{left:this.original[2]+'px',width:e.clientX-this.original[2]+"px"}):this.turnLeft(e); 
    	var width = e.clientX - this.original[2];
    	if(width > 200) {
    		this.css(this.obj, {left: this.original[2] + 'px', width: width + "px"});
    	}
    }, 
    change: function() {
    	console.log("change...");
    },
    leftUp: function(e) {
        this.up(e);
        this.left(e); 
        this.change();
    }, 
    leftDown: function(e) {
        this.left(e);
        this.down(e); 
        this.change();
    }, 
    rightUp: function(e) {
        this.up(e);
        this.right(e); 
        this.change();
    }, 
    rightDown: function(e) {
        this.right(e);
        this.down(e); 
        this.change();
    },                 
    turnDown: function(e) {
        this.css(this.obj, {top: this.height+'px', height: e.clientY - this.height + 'px'}); 
    }, 
    turnUp: function(e) {
        this.css(this.obj, {top: e.clientY +'px', height : this.original[3] - e.clientY + 'px'}); 
    }, 
    turnRight: function(e) {
        this.css(this.obj, {left: this.width+'px', width: e.clientX- this.width + 'px'}); 
    }, 
    turnLeft: function(e) {
        this.css(this.obj, {left: e.clientX +'px', width:this.original[2] - e.clientX + 'px'}); 
    }         
}); 