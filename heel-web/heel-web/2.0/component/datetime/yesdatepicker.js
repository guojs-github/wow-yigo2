/*
    New style Date picker component
    2023.8.9 created by guojs
*/

(function () {
    YIUI.Yes_DatePicker = function (options) {
        var Return = {
            el: $("<div></div>"),
            id:"",
            dropView: $("<div class='dp-vw'></div>"),
            formatStr: '',
            isOnlyDate: false,
            enable: true,
            editable: true,
            calendars: 1,
            _needShow : false,
            
            init: function () { // 初始化控件
                this.id = this.id || this.el.attr('id');
                // 创建输入框部分
                this._input = $('<input type="text" class="txt">').appendTo(this.el); // 输入框
                this._btn = $('<span class="arrow"></span>').appendTo(this.el); // 输入框右侧图标 
                this._clear_button = $('<div class="clear"><i class="fa-solid fa-xmark"></i></div>').appendTo(this.el); // 新增清除按钮

                this.isOnlyDate = options.isOnlyDate;
                // 确认格式
                if (this.isOnlyDate) {
                    this.formatStr = 'yyyy-MM-dd';
                } else {
                    this.formatStr = 'yyyy-MM-dd HH:mm:ss';
                }
                this.init_date_picker();
                this.temp = '';
            },
		    
            isEnable: function() {
		    	return true;
		    },
            getEl: function () {
                return this.el;
            },
            getInput: function () {
                return this._input;
            },
            focus: function () {
                this._input.focus();
            },
            getBtn: function () {
                return this._btn;
            },

            get_clear_button: function() { // 清空按钮
                return this._clear_button;
            },

            getDropView: function () {
                return  this.dropView;
            },
            getDetailTime: function () {
                return this.detailTime;
            },
            setText: function (text) {
                this._input.val(text);
                this.temp = text;
            },

            getText: function () {
              return this._input.val();
            },

            setOnlyDate: function (isOnlyDate) {
                this.isOnlyDate = isOnlyDate;
            },
            setWidth: function (width) {
                this.el.css('width', width);
                this.getInput().css('width', width);
            },
            setHeight: function (height) {
                this.el.css('height', height);
                this.getInput().css('height', height);
                if ($.browser.isIE) {
                    this.getInput().css('line-height', (height - 3) + 'px');
                }
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
            
            commitValue: $.noop,
            
            doFocusOut: $.noop,

            init_date_picker: function () { // 控件初始化
                this.getInput().attr('id', 'dateInput_' + this.id);
                this.getInput().DateTimeMask({masktype: (this.isOnlyDate? 3: 1)}); // 日期时间掩码
                this.getBtn().attr('id', 'dateImg_' + this.id);
                this.install();
            },
            
            init_drop_view: function() { // 初始化日期时间弹出界面
            	if (!this.dropView.is(":hidden")) { // 如果下拉存在并显示，就删除
            		this.dropView.remove();
            	}

                // 创建下拉界面
                this.dropView = $("<div class='dp-vw'></div>");
                this.dropView.attr("id", this.id + "_datepickerView");
                var self = this;

                // 日期
                var isSelect = false;
                if (self.getInput().val()) { // 输入框有值，说明需要在弹出界面，显示选项
                	isSelect = true;
                }
                this.dropView.DatePicker({ // 初始化日期下拉控件
                    flat: true,
                    select : isSelect, // 日期输入框是否有值
                    format: self.formatStr, // 数据格式，如，yyyy-MM-dd
                    date: [new Date()], // 控件时间，默认为当前日期
                    current: self.getInput().val(), // 当前输入框中的值
                    starts: 7, // ？
                    onChange: function (formatted) { // 接收修改后的日期
                        self.update_input_value(formatted);
                    }
                });

                // 时间
                if (!this.isOnlyDate) { // 日期+时间，追加时间处理元素
                    this.init_drop_view_time();
                }

                // 工具栏
                this.init_drop_view_toolbar();
            },

            update_input_value: function(val) { // 将下拉界面值更新到输入框
                let result = val;

                if (!this.isOnlyDate) { // 如果输入框包括，日期+时间
                    var time = val.split(' ')[1]; // 取参数中的时间部分
                    if (this.getInput().val().split(' ')[1]) { // 如果输入框的时间部分有效，还是取输入框的时间
                        time = this.getInput().val().split(' ')[1];
                    }
                    result = val.split(' ')[0] + ' ' + time;
                    this.getInput().val(result);
                } 

                // 根据界面选择更新输入框数据
                this.getInput().val(result);
            },

            init_drop_view_time: function() { // 初始化下拉的时间显示
                // 创建界面 ///////////////////////////////////
                this.time_picker =  $("<div class='time-picker'></div>");
                this.time_picker.appendTo(this.dropView);
                this.init_hours(); 
                this.init_minutes();
                this.init_seconds();
                this.init_time_event();
                setTimeout(() => { 
                    this.init_locate_time();
                }, 1);
            },

			init_hours : function() { // 初始化小时选择项
				let hours =  $('<div class="hours"></div>');

                // 标题
				$('<div class="hours-title">' + YIUI.I18N.getString('TIMEPICKER_HOURS') + '</div>').appendTo(hours);

                // 选项
				let ul = $('<ul class="ul-h"></ul>');
				ul.appendTo(hours);
				let input_val = this.getInput().val();
				let value = input_val.substring(11, 13);
				let now = new Date();
				for (let i = 0; i < 24; i++) {
					let hour = i < 10? ('0' + i): i; // 显示值
					// 创建选项
                    let li = $('<li class="default"></li>');
					if (value == hour) { // 如果为选定值
						li.addClass('select');
					} else if (value == "" && now.getHours() == hour) { // 如果没有选定值，且当前值匹配当前时间
						li.addClass("times");
					}
					li.text(hour); // 文字
                    // 添加选项
					li.appendTo(ul);
				}

                // 添加
                hours.appendTo(this.time_picker);
			},

			init_minutes: function() {
				let minutes =  $('<div class="minutes"></div>');

                // 标题
				$('<div class="minutes-title">' + YIUI.I18N.getString('TIMEPICKER_MINUTES') + '</div>').appendTo(minutes);
				
                // 选项
                ul = $('<ul class="ul-m"></ul>');
				ul.appendTo(minutes);
				let input_val = this.getInput().val();
				let value = input_val.substring(14, 16);
				let now = new Date();
				for (let i = 0; i < 60; i++) {
					let minute = i < 10? ('0' + i): i; // 显示值
                    // 创建选项
                    let li = $('<li class="default"></li>');
					if (value == minute) {
						li.addClass('select');
					} else if (value == '' && now.getMinutes() == minute) { // 如果没有选定值，且当前值匹配当前时间
						li.addClass('times');
					}
					li.text(minute); // 文字
                    // 添加选项
					li.appendTo(ul);
				}

                // 添加
                minutes.appendTo(this.time_picker);
			},

            init_seconds: function() {
				let seconds =  $('<div class="seconds"></div>');

                // 标题
				$('<div class="seconds-title">' + YIUI.I18N.getString('TIMEPICKER_SECONDES') + '</div>').appendTo(seconds);
				
                // 选项
                ul = $('<ul class="ul-s"></ul>');
				ul.appendTo(seconds);
				let input_val = this.getInput().val();
				let value = input_val.substring(17);
				let now = new Date();
				for (let i = 0; i < 60; i++) {
					let second = i < 10? ('0' + i): i; // 显示值
                    // 创建选项
                    let li = $('<li class="default"></li>');
					if (value == second) {
						li.addClass('select');
					} else if (value == '' && now.getSeconds() == second) { // 如果没有选定值，且当前值匹配当前时间
						li.addClass('times');
					}
					li.text(second); // 文字
                    // 添加选项
					li.appendTo(ul);
				}

                // 添加
                seconds.appendTo(this.time_picker);
			},

            init_time_event: function() { // 添加时间事件处理
                let self = this;

                this.dropView.delegate('li', 'click', function() {
                    // 移除其它标记，本选项添加select标记
                    $(this).addClass("select").siblings().removeClass("select").removeClass("times");

                    // 父节点进行滚动ul-h、ul-m、ul-s进行滚动
                    let parent = $(this).parent();
                    parent.animate({
                        scrollTop: $(this).offset().top - parent.offset().top + parent.scrollTop()
                    }, 300);

                    self.update_input_time();
                });
            },

            update_input_time: function() { // 更新输入框中的时间
                let drop_view = this.dropView;
                let h = drop_view.find('.ul-h li.select').text() == '' ?'00' : drop_view.find('.ul-h li.select').text();
                let m = drop_view.find('.ul-m li.select').text() == '' ?'00' : drop_view.find('.ul-m li.select').text();
                let s = drop_view.find('.ul-s li.select').text() == '' ?'00' : drop_view.find('.ul-s li.select').text();

                if (this.getInput().val().length == 19) { // YYYY-MM-DD HH:MI:SS
                    let val = this.getInput().val();  
                    this.getInput().val(val.substring(0, 10) + ' ' + h + ':' + m + ':' + s);
                }
            },

            init_locate_time: function() { // 初始化显示时间
                if ($('.dp-vw li').hasClass('times')) { // 这个标志是因为input中没有值时候，标记的当前时间
                    this.locate_time('times');
                } else { // 有input值时，此处标记的已选择时间
                    this.locate_time('select');                    
                }
            },

            locate_time: function(style_name) { // 显示时间信息，滚动到顶端
                // 小时
                let hour = $('.dp-vw .ul-h');
                hour.scrollTop($('.dp-vw .ul-h .' + style_name).offset().top - hour.offset().top + hour.scrollTop());
                // 分钟
                let minute = $('.dp-vw .ul-m');
                minute.scrollTop($('.dp-vw .ul-m .' + style_name).offset().top - minute.offset().top + minute.scrollTop());
                // 秒
                let second = $('.dp-vw .ul-s');
                second.scrollTop($('.dp-vw .ul-s .' + style_name).offset().top - second.offset().top + second.scrollTop());
            },

            init_drop_view_toolbar: function() { // 初始化下拉的工具栏                
                let self = this;
                let toolbar = $('<div class="toolbar"></div>');

                // 清空按钮
                $('<span class="removeall hw-def-button hw-primary">' + YIUI.I18N.getString('CURRENCY_CLEAN', 'CLEAR') + '</span>').click(function() {
                    // console.log('on click remove all.');
                    self.getInput().val(''); // 清空输入框
                    self.hide_date_view();
                }).appendTo(toolbar);
                
                // 今天按钮
                let button_text = this.isOnlyDate? YIUI.I18N.getString('DATE_TODAY'): YIUI.I18N.getString('TIMEPICKER_NOW');
                $('<span class="today hw-def-button hw-primary">' + button_text + '</span>').click(function() {
                    // console.log('on click today.');
                    self.getInput().val((new Date()).Format(self.formatStr));
                    self.hide_date_view();
                }).appendTo(toolbar);

                toolbar.appendTo(this.dropView);
            },
                     
            hide_date_view: function() { // 收起弹出界面
				this.dropView.slideUp(200, () => {
                    this.dropView.remove();
                    this._input.removeClass("focus");
                    if (this.getInput().val()) {
                        var inputValue = this.getInput().val();
                            var change = this.commitValue(inputValue);
                        if(!change){
                            this.getInput().val(this.temp);
                        }
                    }else{
                        this.commitValue(null);
                    }
                    this.hasShow = false;
                });

            },

            install_drop_view: function () { // 创建下拉界面
                let self = this;

                // 已经显示则隐藏
                if (self.hasShow) {
                    self.hide_date_view();
                    return;
                }
                
                // 初始化下拉界面
                self.init_drop_view();
                $(document.body).append(self.dropView);
                
                var tables = self.dropView.find('tr:first').find('table');
                for (var i = 0; i < tables.length; i++) {
                    if (!tables.eq(i).hasClass("datepickerViewDays")) {
                        tables.eq(i).attr("class", "datepickerViewDays");
                    }
                }

                if (self.getInput().val()) { // 输入框有值
                    self.dropView.DatePickerSetDate(self.getInput().val(), true); // 显示输入框中的值
                } else {
                    self.dropView.DatePickerSetDate((new Date()).Format(self.formatStr)); // 显示当前日期时间
                }

                // 显示下拉界面
                YIUI.PositionUtil.setViewPos(self.getInput(), self.dropView, false); // 设置弹出位置
                self.dropView.css('z-index', $.getZindex(self.getInput()) + 1);
                self.dropView.show();

				// 监控下拉失去操作焦点的情况
				let handler = function(e) {
                    let target = $(e.target);

                    if ((target.closest(self.dropView).length == 0)
                        && (target.closest(self.getInput()).length == 0)
                        && (target.closest(self.getBtn()).length == 0) 
                        && (target.closest(self.get_clear_button()).length == 0)) {
                        self.hide_date_view();
                        $(document).off('mousedown', handler);
                        console.log('yesdatepicker offhook when mousedown on document.');
                    }
                };
                $(document).on('mousedown', handler);

                // 设置状态
                self.hasShow = true;
                self._needShow = false;
            },
            
            install: function () { // 控件设置
                var self = this;

                this.getBtn().mousedown(function(e){
                    self._needShow = !self._hasShow ? true : false; // 标记是否要显示？
                }).click(function (event) {
                    if (!self.isEnable()) { // 已禁用
                        return;
                    }

                    // 设置焦点
                    self._input.addClass("focus");
                    self.getInput().focus();

                    // 阻止事件冒泡
                    event.stopPropagation();
                });

                // 失去焦点，可能是正在选择，也可能正在转向其它组件
                this.getInput().blur(function(e) {
                    // Check
                    if (!self.isEnable()) {
                        return;
                    }
                    if(self._needShow){
                        return;
                    }           
                    if(self.hasShow){
                        return;
                    }

                	var text = self.getInput().val();
         
               	    if(text != self.temp) {
                    	var value = null;
                    	self.temp = text;
                    	if(!text.isEmpty()) {
                        	if(self.isOnlyDate) {
                        		text += " 00:00:00";
                        	}
                            text = text.replace(/-/g, "/");
                        	value = new Date(text);
                    	}
                    	self.commitValue(value);
                    }
                    self.doFocusOut();
                }).focus(function (e) { // 输入框获得焦点
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
            }
        };

        Return = $.extend(Return, options); // 将配置项与当前控件配置项合并
        if (!options.isPortal) {
        	Return.init();
        }
        return Return;
    }
})();