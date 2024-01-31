YIUI.Panel.WizardPanel = YIUI.extend(YIUI.Panel, {
	   layout: 'WizardLayout',
	   
	   funcMap: {},

	   onRender: function(ct) {
	    	this.base(ct);
	    	this.el.addClass("ui-wizard");
	    	$("<div class = 'ui-wizard-warp'></div>").appendTo(this.el);
	    	this.body = $("<div class = 'body'></div>").appendTo(this.el);
	    },
	    afterRender : function(){
	    	this.base();
	    	var splwidth = this.el.children();
	    	var index = splwidth.length;
    		var itemlength = $(splwidth.get(0)).width();
    		var pad = this.el.css('padding');
    		var childpad = this.el.children().css('padding');
    		pad = parseInt(pad.substring(0,pad.length-2));
    		childpad = parseInt(childpad.substring(0,childpad.length-2));
    		itemlength = itemlength  + childpad*2;
	    	$('.ui-wizard-warp').width(itemlength);
	    	
	    	var divleft = $('<div class="wizard-btn left"><span class="btn-left"></span><span class="prev">'+YIUI.I18N.getString("WIZARDPANEL_PREVIOUSSTEP","上一步")+'</span></div>');
	    	var divright = $('<div class="wizard-btn right"><span class="btn-right"></span><span class="next">'+YIUI.I18N.getString("WIZARDPANEL_NEXTSTEP","下一步")+'</span><span class="finish">'+YIUI.I18N.getString("WIZARDPANEL_COMPLETE","完成")+'</span></div>');
	    	var pageinfo = $('<div class="paginfo"></div>');
	    	divleft.appendTo($('.ui-wizard-warp'));
	    	divright.appendTo($('.ui-wizard-warp'));
	    	pageinfo.appendTo($('.ui-wizard-warp'));
	    	
	    },
	    
	    install: function () {
	    	var self = this;
			
	    	$('.ui-wizard-warp .btn-left', this.el).click(function(){
	    		$(".ui-wizard-warp .prev", self.el).click();
	    	});
		
	    	$('.ui-wizard-warp .btn-right', this.el).click(function(){
	    		if($(".ui-wizard-warp", self.el).hasClass("last")) {
	    			$(".ui-wizard-warp .finish", self.el).click();
	    		} else {
		    		$(".ui-wizard-warp .next", self.el).click();
	    		}
	    	});
			var form = YIUI.FormStack.getForm(self.ofFormID);
            var cxt = new View.Context(form);
	    	$(".ui-wizard-warp .next", this.el).click(function(){
	    		if(!self.enable) return false;
	    		var next_div = self.selectItem.next();
	    		if(next_div.length == 0) return;
	    		var key = self.selectItem.attr("key");
	    		var item = self.funcMap[key];
	    		var form = YIUI.FormStack.getForm(self.ofFormID);
    			if(item) {
    				var check = item.check;
    				var ret = true;
    				if(check) {
    					ret = form.eval(check, cxt);
    				}
    				if(!ret){
    					return;
    				}
    			}
			   	var right = (parseInt(self.body.css("right")) || 0) + self.getWidth();
			   	self.body.animate({right: right+"px"},"slow");
			   	
			   	if(item) {
			   		var leave = item.leave;
			   		if(leave) {
			   			form.eval(leave, cxt);
			   		}
			   	}
	    		var next_key = next_div.attr("key");
	    		var next_item = self.funcMap[next_key];
	    		if(next_item) {
	    			var next_active = next_item.active;
	    			if(next_active) {
	    				form.eval(next_active, cxt);
	    			}
	    		}
	    		var warp = $(".ui-wizard-warp", self.el);
	    		if(warp.hasClass("first")) {
	    			warp.removeClass("first");
	    		}
	    		if(next_div.index() == self.items.length - 1) {
	    			warp.addClass("last");
	    		}
	    			
	    		self.selectItem = next_div;
	    	});
	    	$(".ui-wizard-warp .prev", this.el).click(function(){
	    		if(!self.enable) return false;
	    		var prev_div = self.selectItem.prev();
	    		if(prev_div.length == 0) return;
	    		var key = self.selectItem.attr("key");
	    		var item = self.funcMap[key];
	    		var form = YIUI.FormStack.getForm(self.ofFormID);
			   	if(item) {
			   		var leave = item.leave;
			   		if(leave) {
			   			form.eval(leave, cxt);
			   		}
			   	}
    			
			   	var right = (parseInt(self.body.css("right")) || 0) - self.getWidth();
			   	self.body.animate({right: right+"px"},"slow");
	    		
	    		var prev_key = prev_div.attr("key");
	    		var prev_item = self.funcMap[prev_key];
	    		if(prev_item) {
	    			var prev_active = prev_item.active;
	    			if(prev_active) {
	    				form.eval(prev_active, cxt);
	    			}
	    		}
	    		self.selectItem = prev_div;
	    		var warp = $(".ui-wizard-warp", self.el);
	    		if(warp.hasClass("last")) {
	    			warp.removeClass("last");
	    		}
    			if(prev_div.index() == 0) {
	    			warp.addClass("first");
	    		}
	    	});
	    	$(".ui-wizard-warp .finish", this.el).click(function(){
	    		var finish = self.finish;
	    		if(finish) {
	    			form.eval(finish, cxt);
	    		}
	    	});
	    }
});
YIUI.reg('wizardpanel', YIUI.Panel.WizardPanel);