/*
    New style time picker component
    2023.8.9 created by guojs
*/

(function(){
	YIUI.Yes_TimePicker = function(options){
		var Return = {
			el : $("<div></div>"),
			id : "",
			dropView: $("<div class='tp-vw'></div>"),
			format : "HH:mm:ss",
			isSecond : false,
			enable: true,
			commitValue : $.noop,
			doFocusOut: $.noop,
			selectValue: null,
			_hasShow : false,
			_needShow : false,
			init : function(){
				this.id = this.id || this.el.attr("id");
				this._input = $("<input type='text' class='txt'>").appendTo(this.el);
		        this._btn = $("<span class='arrow'></span>").appendTo(this.el);
                this._clear_button = $('<div class="clear"><i class="fa-solid fa-xmark"></i></div>').appendTo(this.el); // 新增清除按钮
		        this.initTimePicker();
		        this.temp = "";
			},
			isEnable : function(){
				return true;
			},
			getEl: function() {
                return this.el;
            },
			getInput: function() {
                return this._input;
            },
            getBtn: function() {
                return this._btn;
            },

			get_clear_button: function() { // 清除按钮
				return this._clear_button;
			},

            getDropView : function() {
                return  this.dropView;
            },
            setText : function(value){
            	this._input.val(value);
            	this.el.attr("title", value);
            	this.temp = value;
            },
            getText: function () {
                return this._input.val();
            },
            setBackColor: function (backColor) {
                this.backColor = backColor;
                console.log(this._input);
                this._input.css({
                    'background-image': 'none',
                    'background-color': backColor
                })
            },
            setValue: function(value){
            	this.selectValue = value;
            	
            },
            focus : function(){
            	this._input.focus();
            },
            initTimePicker : function(){
				this.getInput().attr("id","tpInput_"+this.id);
				this.getInput().DateTimeMask({masktype: this.isSecond ? 5 : 4});
				this.getBtn().attr("id","tpImg_"+this.id);
				this.install();				
			},

			install_drop_view: function() { // 创建下拉界面
				let self = this;

				// 已经显示的，则隐藏					
				if (this._hasShow) {
					this.hide_date_view();
					return;
				}

				// 创建
				this.initDropView();
				$(document.body).append(this.dropView);
				// 定位
				YIUI.PositionUtil.setViewPos(this.getInput(), this.dropView, false);
				// 显示下拉
				this.dropView.show(1, () => {
					// 显示选中情况
					if ($('li', self.dropView).hasClass('times')){
						self.location('times');
					} else {
						self.location('select');
					}					
				}); 

				// 监控下拉失去操作焦点的情况
				let handler = function(e) {
					let target = $(e.target);

					if ((target.closest(self.dropView).length == 0) 
						&& (target.closest(self.getBtn()).length == 0) 
						&& (target.closest(self.getInput()).length == 0) 
						&& (target.closest(self.get_clear_button()).length == 0)) {
						self.hide_date_view();
						$(document).off('mousedown', handler);
						console.log('yestimepicker offhook when mousedown on document.');
					}
				}
				$(document).on('mousedown', handler);
				// 设置状态				
				self._hasShow = true;
				self._needShow = false;				
			},

			install: function(){
				var self = this;
				this.getBtn().mousedown(function(e){
					self._needShow =  !self._hasShow ? true : false; 
				}).click(function(e){
					if(!self.isEnable()){
						return;
					}
					self._input.addClass("focus");
					self.getInput().focus();

					e.stopPropagation();
				});
				
				// 失去焦点，可能是正在选择，也可能正在转向其它组件
				this.getInput().blur(function(e) {
					if(!self.isEnable() || self._needShow || self._hasShow){
						return;
					}

					var text = self.getInput().val();
					if(text != self.temp){
						self.temp = text;
						self.commitValue(text.replace(/:/g, ""));
					}
					
					self.doFocusOut();
				}).focus(function(e) { // 输入框获得焦点
					// 创建下拉窗口
					self.install_drop_view();
                }).keydown(function(e) { // 输入框按键
					// console.log('input key code=' + e.which);

					// 如果即将失去焦点，则收回下拉
					if (myApi.keys.is_tab(e.which) || myApi.keys.is_enter(e.which)) {
						self.hide_date_view();
					}
				});

                // 点击清除按钮
                this.get_clear_button().click(function(e) {
                    let value = null;
                    self.getInput().val(value);
                    self.commitValue(value);
					self.hide_date_view();
                });
			},

			setWidth : function(width){
				this.el.css('width',width);
				this.getInput().css('width',width);
			},
			setHeight : function(height){
				this.el.css('height',height);
				this.getInput().css('height', height);
			},
			setEditable: function (editable) {
                this.editable = editable;
                var el = this.getInput();
                if (this.editable) {
                    el.removeAttr('readonly');
                } else {
                    el.attr('readonly', 'readonly');
                }
            },
			initDropView : function(){
				this.dropView = $("<div class='tp-vw'></div>")
                this.dropView.attr("id", this.id + "_timePickerView");
                this.dropView.html("");
                this.initHours();
                this.initMinutes();
                if(this.isSecond){
                	this.initSeconds();
                }else{
                	this.dropView.addClass("time");
                }
                
                this.initBtn();
                this.getValue();
               
			},
			initHours : function(){
				var hours =  $("<div class='hours'></div>");
				$("<span class='hours-title'>"+YIUI.I18N.getString("TIMEPICKER_HOURS","时")+"</span>").appendTo(hours);
				var ul = $("<ul class='ul-h'></ul>");
				ul.appendTo(hours);
				var h;
				var str = this.getInput().val();
				var value = str.substring(0,2);
				var date = new Date();
				for (var i = 0; i < 24; i++) {
					h = i<10 ? ("0"+i) : i;
					var li = $("<li class='default'></li>");
					if(value == h){
						li.addClass("select");
					}else if(value == "" && date.getHours() == h){
						li.addClass("times");
					}
					li.text(h);
					li.appendTo(ul);
				}
				this.dropView.append(hours);
			},
			initMinutes : function(){
				var minute =  $("<div class='minutes'></div>");
				$("<span class='minutes-title'>"+YIUI.I18N.getString("TIMEPICKER_MINUTES","分")+"</span>").appendTo(minute);
				var ul = $("<ul class='ul-m'></ul>");
				ul.appendTo(minute);
				var m;
				var str = this.getInput().val();
				var value = str.substring(3,5);
				var date = new Date();
				for (var i = 0; i < 60; i++) {
					m = i<10 ? ("0"+i) : i;
					var li = $("<li class='default'></li>");
					if(value == m){
						li.addClass("select");
					}else if(value == "" && date.getMinutes() == m){
						li.addClass("times");
					}
					li.text(m);
					li.appendTo(ul);
				}
				this.dropView.append(minute);
			},
			initSeconds : function(){
				var second =  $("<div class='seconds'></div>");
				$("<span class='seconds-title'>"+YIUI.I18N.getString("TIMEPICKER_SECONDES","秒")+"</span>").appendTo(second);
				var ul = $("<ul class='ul-s'></ul>");
				ul.appendTo(second);
				var s;
				var str = this.getInput().val();
				var value = str.substring(6,8);
				var date = new Date();
				for (var i = 0; i < 60; i++) {
					s = i<10 ? ("0"+i) : i;
					var li = $("<li class='default'></li>");
					if(value == s){
						li.addClass("select");
					}else if(value == "" && date.getSeconds() == s){
						li.addClass("times");
					}
					li.text(s);
					li.appendTo(ul);
				}
				this.dropView.append(second);
			},

			initBtn : function() { // 初始化按钮界面
				var btn =  $('<div class="tp-btn"></div>');
				// $("<span class = 'sure'>"+YIUI.I18N.getString("CURRENCY_OK","确定")+"</span>").appendTo(btn);
		    	// $("<span class='quarantine'></span>").appendTo(btn);
		    	$('<span class="now hw-def-button hw-primary">' + YIUI.I18N.getString('TIMEPICKER_NOW', '现在') + '</span>').appendTo(btn);
		    	// $("<span class='quarantine'></span>").appendTo(btn);
		    	$('<span class="removeall hw-def-button hw-primary">' + YIUI.I18N.getString('CURRENCY_CLEAN', '清除') + '</span>').appendTo(btn);
		    	this.dropView.append(btn);
			},

			hide_date_view : function() { // 隐藏下拉界面
				this.dropView.slideUp(200, () => {
					this.dropView.remove();
					this._input.removeClass("focus");
					this._hasShow = false;
				});
			},

			getValue : function(){
				var self = this;
				this.dropView.delegate(".sure","click",function(){
					if($(".tp-vw li").hasClass("select")){
						var h = $(".ul-h .select").text() == "" ? "00" :$(".ul-h .select").text();
						var m = $(".ul-m .select").text() == "" ? "00" :$(".ul-m .select").text();
						var s = $(".ul-s .select").text() == "" ? "00" :$(".ul-s .select").text();
						if(self.isSecond){
							self.getInput().val(h + ":" + m + ":" + s);
							self.selectValue = Number(h + m + s);
						}else{
							self.getInput().val(h + ":" + m);
							self.selectValue = Number(h + m);
						}
					}else{
						self.getInput().val();
						self.selectValue = null;
					}
					
					self.hide_date_view();
				});
				
				this.dropView.delegate(".removeall","click",function(){
					self.getInput().val("");
					self.selectValue = null;
					self.hide_date_view();
				});
				
				this.dropView.delegate(".now","click",function(){
					var date = new Date();
					var hours = date.getHours();
					var minutes = date.getMinutes();
					var seconds = date.getSeconds();
					hours = hours<10 ? "0"+hours : hours;
					minutes = minutes<10 ? "0"+minutes : minutes;
					seconds = seconds<10 ?"0"+seconds : seconds;
					if(self.isSecond){
						self.getInput().val(hours + ":" + minutes+ ":" + seconds);
						self.selectValue = Number("" + hours + minutes + seconds);
					}else{
						self.getInput().val(hours + ":" + minutes);
						self.selectValue = Number("" + hours + minutes);
					}
					
					self.hide_date_view();
				});
				
				 this.dropView.delegate("li","click",function(){
	                $(this).addClass("select").siblings().removeClass("select").removeClass("times");
	                var parent = $(this).parent();
	                parent.animate({scrollTop: 
	                	$(this).offset().top - parent.offset().top + parent.scrollTop()}, 300);
	                var h = $(".ul-h .select").text() == "" ? "00" :$(".ul-h .select").text();
					var m = $(".ul-m .select").text() == "" ? "00" :$(".ul-m .select").text();
					
					if(self.isSecond){
						var s = $(".ul-s .select").text() == "" ? "00" :$(".ul-s .select").text();
						self.getInput().val(h + ":" + m + ":" + s);
					}else{
						self.getInput().val(h + ":" + m );
					}
				});
				
			},

			location : function(style){ // 将时间当前值，滚动显示出来
				console.log('style=' + style);

				if ($('.ul-h .' + style, this.dropView).length == 1) { // 滚动小时
					$('.ul-h', this.dropView).scrollTop(
						$('.ul-h .' + style, this.dropView).offset().top - $('.ul-h', this.dropView).offset().top + $('.ul-h', this.dropView).scrollTop()
					);
				}

				if ($('.ul-m .' + style, this.dropView).length == 1) { // 滚动分钟
					$('.ul-m', this.dropView).scrollTop(
						$('.ul-m .' + style, this.dropView).offset().top - $('.ul-m', this.dropView).offset().top + $('.ul-m', this.dropView).scrollTop()
					);
				}

				if (this.isSecond && ($('.ul-s .' + style, this.dropView).length == 1)) { // 滚动秒
					$('.ul-s', this.dropView).scrollTop(
						$('.ul-s .' + style, this.dropView).offset().top - $('.ul-s', this.dropView).offset().top + $('.ul-s', this.dropView).scrollTop()
					);
				}
			}	
		};

		Return = $.extend(Return, options);
		if(!options.isPortal) {
        	Return.init();
        }
        return Return;
	}
})();