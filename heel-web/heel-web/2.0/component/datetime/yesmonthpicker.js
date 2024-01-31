/**
 * New style month picker control.
 * 
 * 2023.8.29 added by guojs.
 */

(function(){
	YIUI.Yes_MonthPicker = function(options){
		var Return = {
			el: $("<div></div>"),
			formatStr: "yyyy-MM",
			id: "",
			dropView: $("<div class='mp-vw'></div>"),
			enable: true,
			commitValue : $.noop,
			doFocusOut: $.noop,
			selectValue: null,
			_hasShow : false,
			_needShow : false,

			init : function() { // 初始化界面
				this.id = this.id || this.el.attr("id");
				this._input = $("<input type='text' class='txt'>").appendTo(this.el);
		        this._btn = $("<span class='arrow'></span>").appendTo(this.el);
                this._clear_button = $('<div class="clear"><i class="fa-solid fa-xmark"></i></div>').appendTo(this.el); // 新增清除按钮
		        this.initMonthPicker();
		        this.temp = "";
			},

			isEnable : function(){
				return true;
			},
			getEl: function() {
                return this.el;
            },
			getInput : function() {
                return this._input;
            },
            getBtn : function() {
                return this._btn;
            },

            get_clear_button: function() { // 清空按钮
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
            focus : function(){
            	this._input.focus();
            },
			initMonthPicker : function(){
				this.getInput().attr("id","mpInput_"+this.id);
				this.getInput().DateTimeMask({masktype: 6});
				this.getBtn().attr("id","mpImg_"+this.id);
				this.install();
			},

			install_drop_view: function() { // 初始化下拉界面
				let self = this;

				// 下拉显示，则隐藏
				if(this._hasShow){
					this.hide_date_view();
					return;
				}

				// 创建下拉界面
				this.initDropView();
				$(document.body).append(this.dropView);
				YIUI.PositionUtil.setViewPos(this.getInput(), this.dropView, false); // 定位

				// 初始化选择值
				if (this.getInput().val()) {
					this.dropView.MonthPickerSetDate(this.getInput().val(), true);
				} else {
					this.dropView.MonthPickerSetDate((new Date()).Format(this.formatStr));
				}

				// 显示下拉
				this.dropView.slideDown(200, function() {
					// 监控下拉失去操作焦点的情况
					let handler = function(e) {
						let target = $(e.target);

						if ((target.closest(self.dropView).length == 0) 
							&& (target.closest(self.getBtn()).length == 0) 
							&& (target.closest(self.getInput()).length == 0)
							&& (target.closest(self.get_clear_button()).length == 0)) {
							self.hide_date_view();
							$(document).off('mousedown', handler);
							console.log('yesmonthpicker offhook when mousedown on document.');
						}
					};

					$(document).on('mousedown', handler);
				});

				// 设置状态
				this._hasShow = true;
				this._needShow = false;
			},

			install: function() { // 初始化
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
						self.commitValue(text.replace(/-/g,""));
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

			setValue: function(value){
				this.selectValue = value;
            },
			setWidth : function(width){
				this.el.css('width', width);
				this.getInput().css('width', width);
			},
			setHeight : function(height){
				this.el.css("height", height);
				this.getInput().css("height", height);
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
				this.dropView = $("<div class='mp-vw'></div>");
                this.dropView.attr("id", this.id + "_monthPickerView");
                this.dropView.html("");
                var self = this;
                this.dropView.MonthPicker({
                    flat: true,
                    format: self.formatStr,
                    date: [new Date()],
                    current: self.getInput().val(),
                    starts: 7,
                    onChange: function (formated, selectValue) {
                    	self.selectValue = Number(selectValue);
                        self.getInput().val(formated);
                        self.hide_date_view();
                    }
                });
			},

			hide_date_view : function() { // 隐藏下拉界面
				this.dropView.slideUp(200, () => {
					this.dropView.remove();
					this._input.removeClass("focus");
					this._hasShow = false;
				});
			}
		};
		Return = $.extend(Return, options);
		if(!options.isPortal) {
        	Return.init();
        }
        return Return;
	}
})();