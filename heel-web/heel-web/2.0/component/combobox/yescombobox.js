/*
    Updated yes combobox component

    2023.8.25 added by guojs
*/

(function () {
    YIUI.Yes_Combobox = function (options) {
        var Return = {
            id:"",
            _hasShow: false,
            _needShow : false,
            el: $("<div></div>"),
            _textBtn: $('<input type="text" />'),
            _dropBtn: $('<div/>'),
            _clear_button: $('<div class="clear"><i class="fa-solid fa-xmark"></i></div>'), // 新增清除按钮 
            _selIndex: -1,
            _dropView: $('<div><ul></ul></div>'),
            $suggestView: $('<div/>'),
            _footdiv : $("<div class='footdiv'></div>"),
            _div : $("<div class='chainmean'></div>"),
            itemval : 0,
            promptText: null,

            /**
             * 是否展开完全
             * */
            isFinishExp: false,

            /** 初始化界面 */
            init: function () { 
                this.id = this.id || this.el.attr("id");
                this._textBtn.addClass('txt').appendTo(this.el);
                this._dropBtn.addClass('arrow').appendTo(this.el);
                this._clear_button.appendTo(this.el); // 添加清除按钮
                this._dropView.addClass('cmb-vw').attr("id", this.id + "_view").appendTo($(document.body));
                this.$suggestView.addClass('cmb-autovw cmb-vw').appendTo($(document.body));
                this._dropView.addClass(this.cssClass);
                this.$suggestView.addClass(this.cssClass);
                if(this.multiSelect) {
                    this.createMenu();
                }
                this.temp = "";
            },


            /** 下拉项*/
            items: [],

            /** 是否多选*/
            multiSelect: false,

            /**  是否可编辑 */
            editable: false,

            getEl: function () {
                return this.el;
            },

            setEditable: function (editable) {
                this.editable = editable;
            },

            setFormatStyle: function (cssStyle) {
                this._textBtn.css(cssStyle);
            },

            getEditor: function () {
                return this._textBtn;
            },

            /** 设置输入提示 */
            setPromptText: function (promptText) {
                this.promptText = promptText;
                this._textBtn.placeholder(this.promptText);
            },

            setWidth: function (width) {
                this.el.css('width', width + 'px');
                this._textBtn.css('width', width + 'px');
            },

            setHeight: function (height) {
                this.el.css('height', height + 'px');
                this._textBtn.css('height', height + 'px');
                if ($.browser.isIE) {
                    this._textBtn.css('line-height', (height - 3) + 'px');
                }
            },

            focus: function () {
                this._textBtn.focus();
            },

            destroy: function () {
                this._dropView.remove();
                this.$suggestView.remove();
            },

            commitValue: $.noop,

            doSuggest: $.noop,

            doFocusOut: $.noop,

            isEnable: function() {
                return true;
            },

            hide_combolist: function() { // 隐藏下拉控件
                this._dropView.slideUp(200, () => {
                    this._hasShow = false;
                    this.isFinishExp = false;
                    $('li.selected', this._dropView).removeClass('selected');
                    // $(document).off('mousedown');
                    this.el.removeClass('focus');
                    this.commitValue(this.value);
                });
            },

            /**
             * 设置下拉内容
             * @param {} items
             */
            setItems: function (items) {
                this.items = items || [];

                var ul = this._dropView.children("ul").empty(),_li,val,caption;

                for (var i = 0, len = this.items.length; i < len; i++) {
                    val = items[i].value == undefined ? "" : items[i].value;
                    caption = items[i].caption == null ? "" : $.htmlEncode(items[i].caption);
                    if (this.multiSelect) {
                        _li = $('<li title="'+caption+'"><span class="chk"  itemValue="' + val + '"></span><span class="option">' + caption + '</span></li>');
                    } else {
                        _li = $('<li itemValue="' + val + '" title="' + caption+ '">' + caption + '</li>');
                    }
                    ul.append(_li);
                }
                
                if(this.items.length != 0){
                	ul.addClass("cmb-ul");
                }

                var li = this._dropView.children().children("li").length;
                if(this.multiSelect){
                    if(li == 0) {
                        this._dropView.children(".footdiv").hide();
                        this._dropView.children("ul").height("auto");
                    } else {
                        this._dropView.children(".footdiv").show();
                    }
                }
            },

            getItems: function(){
                return this.items;
            },
            
            createMenu : function(){
                // 确认按钮
                // $("<span class = 'sure'>"+YIUI.I18N.getString("CURRENCY_OK","确定")+"</span>").appendTo(this._div);
                // $("<span class='quarantine'></span>").appendTo(this._div);

                // 清除按钮
                // $("<span class = 'removeall'>"+YIUI.I18N.getString("CURRENCY_CLEAN","清除")+"</span>").appendTo(this._div);
                // $("<span class='quarantine'></span>").appendTo(this._div);

                // 新增，全选按钮
                $('<span class = "hw-def-button hw-primary select-all">' + YIUI.I18N.getString('DICT_SELECT_ALL') + '</span>').appendTo(this._div);

                // 取消按钮
                $('<span class = "hw-def-button hw-primary reset">' + YIUI.I18N.getString('DICT_CANCEL') + '</span>').appendTo(this._div);

                this._div.appendTo(this._footdiv);
                this._dropView.append(this._footdiv);
            },

            /**
             * 勾选节点
             * @param {} value
             */
            checkItem: function (value) {
                if ( this.multiSelect ) {
                    var cbs = this._dropView.find('span.chk');
                    cbs.removeClass("checked");
                    cbs.parent().removeClass("select");
                    if( value ) {
                        var arr = value.split(","),v;
                        for (var i = 0,cb; cb = cbs[i]; i++) {
                            v = $(cb).attr("itemValue");
                            if( arr.indexOf(v) != -1 ) {
                                cb.checked = true;
                                $(cb).addClass("checked");
                            }
                        }
                    }
                }
            },

            setSelValue: function (value) { // 选择改变时，此处可以做出记录
                this.value = value;
                if( value == null ) {
                    this._selIndex = -1;
                }
            },

            getSelValue: function () {
                return this.value;
            },

            setText: function (text) {
                this.text = text;
                this._textBtn.val(this.text);
                this.temp = text;
            },
            getText: function () {
                return this._textBtn.val();
            },

            getInput: function() {
                return this._textBtn;
            },

            reset_input: function() { // 清除用户输入
                this._textBtn.val(''); // 清空输入框value
                this.set_input(null); // 清除选中项目
            },

            set_input: function(val) { // 更新用户即时输入
                this.setSelValue(val);
                this.commitValue(this.value); // 设置控件中的真实值
            },

            install_combolist: function() { // 初始化下拉
                let self = this;
                let getSelIndex = function () {
                    for( var i = 0,size = self.items.length;i < size;i++ ) {
                        if( self.items[i].value == self.value ) {
                            return i;
                        }
                    }

                    return -1;
                }                

                // 准备显示下拉，修改输入框样式
                if (self._hasShow == false) {
                    $(this).addClass('arrowgif');
                    $(this).removeClass('arrow');
                }
                self.el.addClass('focus');

                // 如果已经显示则隐藏
                if (this._hasShow) {
                    this.itemval = 0;
                    this.hide_combolist();
                    return;
                }

                // 更新窗台
                this._hasShow = true;
                this._needShow = false;

                this.checkItems().then(function(data) {
                    self.checkItem(self.getSelValue());

                    YIUI.PositionUtil.setViewPos(self._textBtn, self._dropView, true);
                    self._dropView.css('width', 'auto');

                    // 显示下拉
                    self._dropView.show();
                    self._dropBtn.removeClass('arrowgif');
                    self._dropBtn.addClass('arrow');
                    self.isFinishExp = false;

                    var $ul = self._dropView.children('ul');

                    if ($ul.children().length == 0) {
                        $ul.addClass('empty');
                        $ul.html(YIUI.I18N.getString('YESCOMBOBOX_NOTHING'));
                    } else {
                        $ul.removeClass('empty');
                    }

                    if (!self.multiSelect) { // 单选
                        if (self._selIndex == -1 && self.value != null) {
                            self._selIndex = getSelIndex();
                        }

                        // 处理选中项
                        if (self._selIndex != -1) {
                            var $li = $('li:eq(' + self._selIndex + ')', self._dropView);

                            if (!$li.hasClass('sel')) {
                                $li.addClass('sel');
                            }

                            var clientHeight = $ul[0].clientHeight, scrollTop = $ul.scrollTop();

                            var pos = $li.position(), height = $li.outerHeight();

                            if (pos.top + height > clientHeight + scrollTop) {
                                $ul.scrollTop( pos.top + height - clientHeight);
                            }
                        } else {
                            $('li', $ul).removeClass('sel');
                        }
                    }

                    // 监控下拉失去操作焦点的情况
                    let handler = function(e) {
                        // check
                        if (self.isFinishExp) return;

                        let target = $(e.target);

                        if ((target.closest(self._dropView).length == 0 || $("ul li", self._dropView).length == 0)
                            && (target.closest(self._dropBtn).length == 0)
                            && (target.closest(self._textBtn).length == 0)
                            && (target.closest(self._clear_button).length == 0)) {
                            self.itemval = 0;
                            self.hide_combolist();
							$(document).off('mousedown', handler);
							console.log('yescombobox offhook when mousedown on document.');
                        }
                    };
                    $(document).on('mousedown', handler); 

                }, function(error) {
                    self._hasShow = false;
                });
            },

            install: function() { // 初始化控件
                var self = this;

                this._dropBtn.mousedown(function(e) {
                    self._needShow = !self._hasShow;
                }).click(function(e) { // 点击下拉图标，展开或者收起下拉界面
                    // Check
                    if (!self.isEnable()) {
                        return;
                    }
                    if (self.isFinishExp){
                        return;
                    }
                    self.isFinishExp = true;

                    self._textBtn.focus();

                    e.stopPropagation();
                });

                // 点击清除按钮
                this._clear_button.click(function(e){
                    self.reset_input();
                    self.hide_combolist();
                });

                // var self = this;
                var hideCombView = function() {
                    self.$combView && self.$combView.hide();
                    self.selLi = null;
                    var val = self._textBtn.val();
                    if(val != ""){
                        self.setText(self.temp);
                    }
                    $(".selected", self.$combView).removeClass("selected");
                };

                this._textBtn.bind("keyup", $.debounce(200, function(e){
                    if(!self.isEnable()) {
                        return false;
                    }

                    if (self._hasShow || !$(this).is(":focus")) {
                        // e.stopPropagation();
                        return false;
                    }
                    if(self.multiSelect) return;
                    var value = $(this).val();
                    var keyCode = e.keyCode;

                    var items = self._dropView.find("li");
                    items.removeClass("sel");
                    self._selIndex = -1;
                    if (keyCode != 13) {
                        self.itemval = 0;
                        if (self._hasShow && value != "") {
                            findItem(value, items);
                            // e.stopPropagation();
                            return false;
                        }
                    }

                    if(keyCode == 27) {
                        hideCombView();
                        return;
                    }

                    $(document).on("mousedown", function (e) {
                        var target = $(e.target);
                        if(self.selLi && self.selLi.length > 0) {
                            self.selLi.mouseup();
                        } else if (target.closest(self.$suggestView).length == 0
                            && target.closest(self._textBtn).length == 0) {
                            hideCombView();
                            $(document).off("mousedown");
                        }
                        self.selLi = null;
                    });

                    if(keyCode == 38 || keyCode == 40 || keyCode == 9) return;
                    if(keyCode == 13) {
                        if(self.selLi) {
                            self.selLi.mouseup();
                        }
                        return;
                    }
                    var $view = self.$suggestView;
                    if(value) {
                        self.doSuggest(value).then(function(viewItems) {
                            if (viewItems.length == 0) {
                                $view.empty().hide();
                                return;
                            }
                            var list = $('<ul/>'), _li;
                            $view = $view.html(list);
                            for (var i = 0, len = viewItems.length; i < len; i++) {
                                _li = $('<li itemValue="' + viewItems[i].value + '">' + viewItems[i].caption + '</li>');
                                list.append(_li);
                            }
                            var cityObj = $("input", self.el);
                            var cityOffset = cityObj.offset();
                            $view.css({
                                width: cityObj.outerWidth(),
                                top: cityOffset.top + cityObj.outerHeight(),
                                left: cityOffset.left
                            })
                            self.$combView = $view;
                            $view.show();
                        });
                    } else {
                        $view.empty().hide();
                    }

                }));

                this._textBtn.bind("keydown", function(e){
                    if(!self.isEnable() || self.multiSelect) { // 多选,不编辑
                        return false;
                    }

                    var $combView;

                    if( !self.$suggestView.is(":hidden") ) {
                        $combView = self.$suggestView;
                    }

                    if( !$combView && !self._dropView.is(":hidden") ) {
                        $combView = self._dropView;
                    }

                    if( !$combView )
                        return;

                    self.$combView = $combView;

                    var maxLen = $("li", $combView).length,
                        li = $("li.selected", $combView),
                        idx = -1;

                    if(maxLen>6){
                        self._dropView.children("ul").css("height", "180px");
                    }
                    var li = $("li.selected", $combView);
                    if( li.length > 0 ) {
                        idx = li.index();
                    } else {
                        li = $("li.sel", $combView);
                        if( li.length > 0 ) {
                            idx = li.index();
                        }
                    }

                    switch (e.keyCode){
                        case 38:  // up
                            idx--;
                            if( idx < 0 )
                                idx = 0;
                            break;
                        case 40: // down
                            idx++;
                            if( idx >= maxLen )
                                idx = 0;
                            break;
                        case 13: // enter
                            if( self.selLi ) {
                                var value = self.selLi.attr("itemValue");
                                self.setSelValue(value);
                                self.commitValue(value);
                            }
                            hideCombView();
                            e.stopPropagation();
                            e.stop = true;
                            break;
                        case 9: // tab
                            $(document).mousedown();
                            break;
                        default:
                            return;
                    }

                    if (idx == -1) {
                        return;
                    }

                    var li = $combView.find("li:eq("+idx+")");
                    li.addClass("selected").siblings("li").removeClass("selected");

                    self.selLi = li;
                });

                this._textBtn.blur(function(e) {
                    if(self._hasShow || self._needShow || !self.$suggestView.is(":hidden")){
                        return;
                    }

                    if(self.multiSelect) {
                        return self.doFocusOut();
                    }

                    var _this = $(this);
                    var integerVal = self.integerValue;
                    var editable = self.editable;

                    var val = self._textBtn.val();
                    if(val == self.temp){
                        return self.doFocusOut();
                    }

                    if( val == "" ) {
                        self.commitValue("");
                    } else {
                        self.checkItems().then(function(data){
                            var tempVal;
                            var items = self.items;

                            for (var i = 0; i < items.length; i++) {
                                var _caption = self.items[i].caption;
                                if (_caption != "" && _caption == val) {
                                    tempVal = self.items[i].value;
                                    self.commitValue(tempVal);
                                    return;
                                }
                            }

                            if ( editable && val != self.value ) {
                                self.commitValue(val);
                            } else {
                                self.setText(self.temp);
                            }

                            self.doFocusOut();
                        });
                    }
                }).focus(function(e) { // 输入框获取焦点
                    self.install_combolist();
                }).keydown(function(e) { // 输入框按键
					// console.log('input key code=' + e.which);

					// 如果即将失去焦点，则收回下拉
					if (myApi.keys.is_tab(e.which) || myApi.keys.is_enter(e.which)) {
						self.hide_combolist();
					}
				});

                //节点绑定事件
                this._dropView.delegate("li", "click", function (e) {
                    $(this).parent().find("li").removeClass("sel");
                    if (self.multiSelect) {
                        return;
                    }
                    if (self.isFinishExp) {
                        return;
                    }
                    if (self._selIndex >= 0) {
                        $("li:eq(" + self._selIndex + ")", self._dropView).removeClass("sel");
                    }

                    $(this).addClass("sel");
                    self._selIndex = $(this).index();

                    var value = $(e.target).attr("itemValue");
                    self.setSelValue(value);
                    self.hide_combolist();
                    self.commitValue(self.value);
                });

                //节点绑定事件
                this.$suggestView.delegate("li", "click", function (e) {
                    var v = $(e.target).attr("itemValue");
                    self.$suggestView.hide();
                    self.commitValue(v);
                    $(document).off("mousedown");
                });

                function checkedboxValue(){
                    var checkedBoxes = self._dropView.find('span.chk');
                    var caption = checkedBoxes.filter('span.checked').map(function () {
                        return $(this).next().html();
                    }).get().join(',');
                   
                    var value = checkedBoxes.filter('span.checked').map(function () {
                        return $(this).attr("itemValue");
                    }).get().join(',');
                    if(caption == "" && value == ""){
                        $(this).removeClass("checked");
                    }
                    return value;
                };

                //查询全部
                function findItem(val,items) {
                    var itemval = self.itemval;
                    var len = items.length;
                    if (len != 0) {
                        $.each(items,function(index,elem) {
                            $(elem).parent().find("li").removeClass("sel");
                            if($(elem).find("span").length == 0 && val != "" && $(elem).html().indexOf(val) != -1) {
                                if (itemval == 0) {
                                    $(this).parent().parent().scrollTop(index*26);
                                    $(elem).addClass('sel');
                                    itemval = index;
                                    self.itemFlag = index;
                                    return false;
                                }
                            }
                            if ($(elem).find("span").length != 0 && $(elem).find("span").html().indexOf(val) != -1) {
                                if (itemval == 0) {
                                    $(this).parent().parent().scrollTop(index*26);
                                    $(elem).addClass('sel');
                                    itemval = index;
                                    self.itemFlag = index;
                                    return false;

                                }
                            }
                        });
                    }
                };
                //回车遍历查找
                function enterFindNext(val,items){
                    var flag = self.itemFlag;
                    for (var i = flag + 1; i < items.length; i++) {
                        var $item = $(items[i]);
                        if ($item.find("span").length == 0) {
                            var isExist = $item.html().indexOf(val) != -1;
                            //isUse = isExist;
                            if (isExist) {
                                $item.parent().parent().scrollTop((i)*26);
                                $item.parent().find("li").removeClass("sel");
                                $item.addClass('sel');
                                self.itemFlag = i;
                                break;
                            }
                        }
                        if ($item.find("span").length != 0 ) {
                            var isExist = $item.find("span").html().indexOf(val) != -1;
                            //isUse = isExist;
                            if (isExist) {
                                $item.parent().parent().scrollTop((i)*26);
                                $item.parent().find("li").removeClass("sel");
                                $item.addClass('sel');
                                self.itemFlag = i;
                                break;
                            }
                        }
                    }
                }

                //多选下拉 CheckBox绑定事件
                if (this.multiSelect) {
                    this._dropView.delegate("span.chk", "click", function (e) { // 多选选择或者取消
                        if($(this).hasClass("checked")){
                            $(this).removeClass("checked");
                        }else{
                            $(this).addClass("checked");
                        }

                        // 立即更新值
                        self.set_input(checkedboxValue());

                        // 阻止冒泡
                        e.stopPropagation();
                    });

                    this._dropView.delegate('li', 'click', function (e) { // 点击多选项行
                        let el = $(this);
                        let checkbox = el.find('> span.chk');

                        checkbox.click(); // 模拟点击复选框
                    });

                    this._dropView.delegate('.select-all', 'click', function() { // 全选按钮
                        self._dropView.find('span.chk').addClass('checked');
                        let value = checkedboxValue();
                        self.set_input(value);
                    });

                    this._dropView.delegate('.reset', 'click', function() { // 取消按钮
                        self._dropView.find('span.chk.checked').removeClass('checked');
                        let value = checkedboxValue();
                        self.set_input(value);
                    });
                    
                    // this._dropView.delegate(".removeall", "click", function(){ // 清除按钮
                    //     $("span.checked").removeClass("checked");
                    //     self.commitValue("");
                    //     self.hideComboList();
                    // });
                    
                    // this._dropView.delegate(".sure", "click", function(){ // 确认按钮
                    //      var value = checkedboxValue();
                    //      self.set_input(value);
                    //      self.hideComboList();
                    // });
                }

            }
        };

        Return = $.extend(Return, options);
        Return.recent = new heelWeb.component.combobox.recent(Return); // 创建最近访问
        if(!options.isPortal) {
            Return.init();

            Return.recent.init();
        }
        Return.install();
        return Return;
    }
})();