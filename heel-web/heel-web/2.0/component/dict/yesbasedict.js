/**
 * dict input control.
 * 
 * 2023.8.25 added by guojs.
 */

(function(){
	YIUI.Yes_BaseDict = function(options){
        var Return = {
            //dropView是否显示
            _hasShow : false,
            _needShow : false,

            el: $("<div></div>"),
            /**
             * 是否多选字典
             * @type Boolean
             */
            multiSelect :  false,
            rootNode : null,
            id: "",
            //字典控件的下拉按钮
            _dropBtn : $('<div/>'),
            _clear_button: $('<div class="clear"><i class="fa-solid fa-xmark"></i></div>'), // 新增清除按钮 
            _textBtn : $('<input type="text" />'),
            _dropView : $('<div/>'),
            $suggestView : $('<div class="dt-autovw dt-vw" tabindex="0"/>'),
            /**
             * 多选字典，选择模式
             */
            checkBoxType :   YIUI.Control.DICT_CKBOXTYPE_NORMAL_SELECT,
            /** 父子节点是否关联 */
            independent : true,
            /**
             * 字典itemKey
             */
            itemKey : null,
            dictTree: null,
            isValue: false,
            //字典状态
            stateMask: YIUI.DictStateMask.Enable,
            editable: true,
            secondaryType: 0,
            startRow: 0,
            pageMaxNum: 10,
            promptText: null,
            maxNum: 10,
            //模糊联想
            promptData: false,
            _suggestViewShow: false,

            /** 设置输入提示 */
            setPromptText: function (promptText) {
                this.promptText = promptText;
                this._textBtn.placeholder(this.promptText);
            },

            /** 初始化创建界面 */
            init: function() {
                this.id = this.id || this.el.attr("id");
                this._textBtn.attr("id", this.id+"_textbtn").addClass('txt').appendTo(this.el);
                this._textBtn.attr("autocomplete","off");
                this._dropBtn.attr("id", this.id+"_dropbtn").addClass('arrow').appendTo(this.el);
                this._clear_button.appendTo(this.el); // 添加清除按钮
                this._dropView.attr("id", this.id+"_dropview").addClass('dt-vw');
                $(document.body).append(this._dropView);
                $(document.body).append(this.$suggestView);
                this._dropView.addClass(this.cssClass);
                this.$suggestView.addClass(this.cssClass);
            },

            setEditable: function(editable) {
                this.editable = editable;
                var el = this._textBtn;
                if(this.editable) {
                    el.removeAttr('readonly');
                } else {
                    el.attr('readonly', 'readonly');
                }
                if(this.multiSelect)
                    this._textBtn.attr("readonly","true");
            },

            getEl: function() {
                return this.el;
            },

            setMultiSelect: function(multiSelect) {
                //TODO 这个地方设置属性是错误的， 因为dicttree已经 创建了 需要改变的是dicttree的多选属性，
                //另 一般情况 字典控件要么多选， 要么单选， 不会动态变化
                this.multiSelect = multiSelect;
            },

            setPromptData: function(promptData){
                this.promptData = promptData;
            },

            setDictTree: function(dictTree) {
                this.dictTree = dictTree;
            },
            getDictTree: function (dictTree) {
                return this.dictTree;
            },

            setBackColor: function(backColor) {
                this.backColor = backColor;
                this._textBtn.css({
                    'background-image': 'none',
                    'background-color': backColor
                })
            },

            setForeColor: function(foreColor) {
                this.foreColor = foreColor;
                this._textBtn.css('color', foreColor);
            },

            setFormatStyle: function(cssStyle) {
                this._textBtn.css(cssStyle);
            },

            focus: function () {
                this._textBtn.focus();
            },

            /** 设置控件真实值，对应于数据库中存储的值 */
            setSelValue: function (value) {
                this.value = value;
            },

            /** 获取控件真实值 */
            getSelValue: function () {
                if(this.value){
                    return this.value;
                }else{
                    return null;
                }
            },

            setWidth: function(width) {
                this.el.css('width', width);
                this._textBtn.css('width', width);
                var left = width - 26 > 0 ? width - 26 : 0;
            },

            setHeight: function(height) {
                this.el.css('height', height+'px');
                this._textBtn.css('height', height+'px');
                if($.browser.isIE) {
                    this._textBtn.css('line-height',(height-3)+'px');
                }

            },

            setText: function (text) {
                this._textBtn.val(text);
                this._temp = text;
            },

            setInputText: function (text) {
                this._textBtn.val(text);
            },

            getText: function () {
                return this._textBtn.val();
            },

            getInput: function() {
                return this._textBtn;
            },

            isEnable: function() {
                return true;
            },

            checkDict: $.noop,

            //TODO 删除hiding
            hiding: $.noop,

            getItemKey: $.noop,

            commitValue: $.noop,

            doFocusOut: $.noop,

            getDictService: $.noop,

            setSecondaryType: function (type) {
                this.secondaryType = type;
            },

            destroy: function() {
                this._dropView.remove();
                this.$suggestView.remove();
            },

            hideDictList : function (){
                console.log('hideDictList()');

                this._dropView.slideUp(200, () => {
                    this.el.removeClass("focus");
                    this._textBtn.removeClass("noEdit");
                    this._hasShow = false;
                    this.commitValue(this.value);
                    // $(document).off("mousedown");
                });
            },

            hideSuggestView : function (hide){
                this.$suggestView.empty();
                this.$suggestView.hide();
                this._suggestViewShow = false;
                $(document).off("mousedown");
                if(hide){
                    this.autoComplete(this, this._textBtn.val());
                }
            },

            getData: function(result, self){
                var rootCaption = result.rootCaption;
                var rootItem = result.root;
                var tree = null;
                if(result.secondaryType == YIUI.SECONDARYTYPE.CHAINDICT){
                    tree = new YIUI.Yes_ChainDictTree();
                }else{
                    tree = new YIUI.Yes_DictTree();
                }
                tree.getDictService = this.getDictService;
                
                if(this.dictTree != null){
                    this.getDictTree().removeNode(result.secondaryType, tree);
                }else{
                    this.setDictTree(tree);
                }
                
                if(this.isValue){
                	this.getDictTree()._selectValue = null;
                }

                this.getDictTree().showCheckBox = this.multiSelect;
                this.getDictTree().itemKey = this.itemKey;
                this.getDictTree().startRow = this.startRow;
                this.getDictTree().independent = this.independent;
                this.getDictTree().dictFilter = result.dictFilter;
                this.getDictTree().secondaryType = result.secondaryType;
                this.getDictTree().loadType = result.loadType;
                this.getDictTree().baseDict = self;
                this.getDictTree().render(this._dropView);
                this.getDictTree().createRootNode(rootItem, rootCaption, rootItem.itemKey + '_' + rootItem.oid, result.secondaryType);    
            },

            reset_input: function() { // 清除用户输入
                this._textBtn.val(''); // 清空输入框value
                this.set_input(null); // 清除选中项目
            },

            set_input: function(val) { // 更新用户即时输入
                this.value = val;
                this.commitValue(this.value); // 设置控件中的真实值
            },

            install_dict_list: function() { // 创建下拉界面
                let self = this;

                this.el.addClass('focus');
                if (!this._hasShow) { // 如果尚未显示下拉
                    $(this).removeClass('arrow');
                    $(this).addClass('arrowgif');
                } else {
                    this.hideDictList();
                    return;
                }
                
                // 更新状态
                this._hasShow = true;
                this._needShow = false;

                this.checkDict().then(function(result) {
                    if (result) {
                        self.getData(result,self);
                    }

                    return self.getDictTree().showing();
                }, function(error) {
                    self._hasShow = false;
                }).then(function(data) {
                    // 实际创建并显示下拉
                    self.getDictTree().open();
                }, function(error) {
                    self._dropBtn.removeClass('arrowgif');
                    self._dropBtn.addClass('arrow');
                    self._hasShow = false;
                });
            },
            
            install: function() { // 初始化
                var self = this;

                //下拉按钮绑定下拉事件
                this._dropBtn.mousedown(function(e){
                    self._needShow =  !self._hasShow ? true : false;
                }).click(function(e) {
                    // check
                    if(!self.isEnable()) {
                        return;
                    }

                    self._textBtn.focus();

                    e.stopPropagation();
                });

                // 点击清除按钮
                this._clear_button.click(function(e) {
                    self.reset_input();
                    self.hideDictList();
                });

                var timer,currentSelIndex = -1;

                this._textBtn.bind("keyup", function(e){
                    //e = e || window.event;
                    if(!self.isEnable() || self.multiSelect) {
                        return;
                    }
                    var keyCode = e.keyCode;
                    var value = $(this).val();

                    if(self.promptData){
                        if( keyCode == 9 || keyCode == 13 || keyCode == 108 ){
                            return;
                        }

                        var liLen = self.$suggestView.find("li").length;
                        if(keyCode == 38){
                            self.$suggestView.focus();
                            currentSelIndex = liLen - 1;
                            $("#li_"+currentSelIndex, self.$suggestView).addClass("focus").siblings().removeClass("focus");
                            return;
                        }else if(keyCode == 40){
                            self.$suggestView.focus();
                            currentSelIndex = 0;
                            $("#li_"+currentSelIndex, self.$suggestView).addClass("focus").siblings().removeClass("focus");
                            return;
                        }

                        var text = $(this).val();
                        if(text == self._temp){
                            return;
                        }

                        if(timer){
                            clearTimeout(timer);
                        }
                            
                        timer = setTimeout(function(){
                            var $view = self.$suggestView;
                            if(value) {
                                self.checkDict().then(function(viewItems) {
                                    if(viewItems){
                                        self.getData(viewItems);
                                        self.getDictTree().baseDict = self;
                                    }
                                    var rootValue = null;
                                    if (self.getDictTree().rootNode != null) {
                                        rootValue = self.getDictTree().getNodeValue(self.getDictTree().rootNode);
                                    }

                                    self.getDictService().getQueryData(
                                        self.getItemKey(),
                                        0,
                                        self.maxNum,
                                        3,
                                        value,
                                        self.getStateMask(),
                                        self.getDictTree().dictFilter,
                                        rootValue,
                                        self.formKey,
                                        self.fieldKey
                                    ).then(function(result){
                                        self._suggestViewShow = true;
                                        self.createRootNodes(result.data);
                                        self.createNodes(result.data, $view.children("ul"));
                                        if(self.dictQuery == undefined || (self.dictQuery && self.dictQuery.css("display") == "")){
                                            $view.slideDown(200, function(){
                                                currentSelIndex = -1;
                                                $(document).on("mousedown",function(e){
                                                    var target = $(e.target);
                                                    if (target.closest(self.$suggestView).length == 0) {
                                                        var node = $(".focus", self.$suggestView);
                                                        //如有选中值，则文本框无焦点，需弹出模糊搜索框
                                                        if(node.length > 0){
                                                            self.hideSuggestView(true);
                                                        }else{
                                                            self.hideSuggestView();
                                                        }
                                                        
                                                    }
                                                });
                                            });
                                            
                                        }
                                    }, function(error){
                                        self.hideSuggestView();
                                    });
                                }, function(error){
                                    self.hideSuggestView();
                                });
                            } else {
                                $view.empty().hide();
                            }
                        }, 250);
                        e.stopPropagation();
                    }
                    
                });

                this.$suggestView.on("click",function(e){
                    var $target = $(e.target);
                    if($target.hasClass("empty")){
                        self.hideSuggestView();
                        self.setText(self._temp);
                        self._textBtn.removeClass("focus");
                        return;
                    }
                    var $node = $target.parents("li:first");
                    $node.addClass("sel").siblings().removeClass("sel");
                    self.getDictTree()._selectValue = self.value = self.getNodeValues($node);
                    self.commitValue(self.value);
                    var change = self.commitValue(self.value);
                    if(!change){
                        self.setText(self._temp);
                    }
                    self.hideSuggestView();
                    self._textBtn.removeClass("focus");
                }).on("mousedown", function(){
                    self.$suggestView.focus();
                }).on("keydown", function(e){
                    var keyCode = e.keyCode;
                    var liLen = self.$suggestView.find("li").length;
                    if(keyCode == 9){
                        if(self._suggestViewShow){
                            self.hideSuggestView(true);
                        }
                    }else if(keyCode == 13 || keyCode == 108){
                        if(self._suggestViewShow){
                            var node = $(".focus", self.$suggestView);
                            if(node.length > 0){
                                self.getDictTree()._selectValue = self.value = self.getNodeValues(node);
                                self.commitValue(self.value);
                                var change = self.commitValue(self.value);
                                if(!change){
                                    self.setText(self._temp);
                                }
                                self.hideSuggestView();
                                self._textBtn.removeClass("focus");
                                self.el.removeClass("focus");
                            }else{
                                self.hideSuggestView(true);
                            }
                        }
                    }else if(keyCode == 38){
                        if(currentSelIndex == -1){
                            currentSelIndex = liLen - 1;
                        }else{
                            currentSelIndex -= 1;
                            if(currentSelIndex < 0){
                                currentSelIndex = liLen - 1;
                            }
                        }
                        $("#li_"+currentSelIndex, self.$suggestView).addClass("focus").siblings().removeClass("focus");
                    }else if(keyCode == 40){
                        if(currentSelIndex == liLen - 1){
                            currentSelIndex = 0;
                        }else{
                            currentSelIndex += 1;
                            if(currentSelIndex > liLen - 1){
                                currentSelIndex = 0;
                            }
                        }
                        $("#li_"+currentSelIndex, self.$suggestView).addClass("focus").siblings().removeClass("focus");
                    }
                });

                this._textBtn.focus(function() { // 输入框获得焦点
                    self.install_dict_list();
                }).blur(function(e) {
                    var text = $(this).val();
                    self.autoComplete(self, text);
                }).keydown(function(e) { // 输入框按键
					// console.log('input key code=' + e.which);

					// 如果即将失去焦点，则收回下拉
					if (myApi.keys.is_tab(e.which) || myApi.keys.is_enter(e.which)) {
						self.hideDictList();
					}
				});
            },

            createRootNodes: function(data){
                var list = $('<ul/>'),$view = this.$suggestView;
                if(data.length == 0){
                    $view = $view.html($("<label class='empty'>"+YIUI.I18N.getString("YESCOMBOBOX_NOTHING","无")+"</label>"));
                    $view.addClass("empty");
                }else{
                    $view = $view.html(list);
                    $view.hasClass("empty") ? $view.removeClass("empty") : $view;
                }

                var cityObj = $("input", this.el);
                var cityOffset = cityObj.offset();
                $view.css({
                    top: cityOffset.top + cityObj.outerHeight(),
                    left: cityOffset.left
                });
            },

            createNodes: function(data, parent){
                var _li, item, _a;
                for (var i = 0, len = data.length; i < len; i++) {
                    item = data[i];
                    _li = $('<li id='+'li_'+i+' oid=' + item.oid + ' itemkey = ' + item.itemKey + '></li>');
                    $("<div class='dt-wholerow'/>").appendTo(_li);
                    _a = $("<a class='dt-anchor'></a>").appendTo(_li);
                    var _spanIcon = $("<span class='branch'></span>").appendTo(_a);
                    if(item.NodeType == 1) {
                        _spanIcon.addClass("p_node");
                    }
                    if(item.Enable == 0) {
                        _spanIcon.addClass("disabled");
                    } else if(item.Enable == -1) {
                        _spanIcon.addClass("invalid");
                    }
                    
                    $("<span class='b-txt'></span>").text(item.caption).appendTo(_a);
                    parent.append(_li);
                }
            },

            autoComplete: function(self, text){
                if(!self.isEnable() || self._suggestViewShow) {
                    return;
                }
                
                if(self.promptData){
                    self.hideSuggestView();
                }
                self._textBtn.removeClass("focus");
                self.el.removeClass("focus");
                if(self._needShow || YIUI.DictQuery.willshow){
                    self.setText(self._temp);
                    return;
                }
                if(self.multiSelect){
                    self.doFocusOut();
                    return;
                }
                //判断是否为dropDownBtn mouseDown
                if(self._hasShow){
                    return;
                }

                if(text != self._temp) {

                    if(text.isEmpty()) {
                        self.commitValue(null);
                        if(self.dictTree != null){
                            self.dictTree._selectValue = null;
                        }
                        self.isValue = true;
                    } else {
                        YIUI.DictQuery.willshow = true;
                        self.checkDict().then(function(change) {
                            if(change){
                                self.getData(change);
                                self.getDictTree().baseDict = self;
                            }
                            
                            //精确匹配
                            var rootValue = null;
                            if (self.getDictTree().rootNode != null) {
                                rootValue = self.getDictTree().getNodeValue(self.getDictTree().rootNode);
                            }

                            self.getDictService().getQueryData(
                                self.getItemKey(),
                                0,
                                10,
                                3,
                                text,
                                self.getStateMask(),
                                self.getDictTree().dictFilter,
                                rootValue,
                                self.formKey,
                                self.fieldKey
                            ).then(function(data){
                                var items = data.data;
                                if (items.length == 1){

                                    var itemData = new YIUI.ItemData(items[0]);
                                    var change = self.commitValue(itemData, true, true);
                                    //值未改变时 还原Text
                                    if(!change){
                                        self.setText(self._temp);
                                    }

                                }else{
                                    var options = {
                                        fuzzyValue: text,
                                        itemKey: self.getItemKey(),
                                        caption: self.caption,
                                        rootValue: rootValue,
                                        stateMask: self.getStateMask(),
                                        dictFilter: self.getDictTree().dictFilter,
                                        displayCols: self.displayCols,
                                        startRow: 0,
                                        maxRows: 6,
                                        pageIndicatorCount: 3,
                                        columns: self.displayColumns,
                                        textInput: self._textBtn,
                                        formKey: self.formKey,
                                        fieldKey: self.fieldKey,
                                        dt_id: self.id,
                                        cssClass: self.cssClass,
                                        callback: function (itemData) {
                                            if (itemData) {
                                                var change = self.commitValue(itemData);
                                                //值未改变时 还原Text
                                                if(!change){
                                                    self.setText(self._temp);
                                                }
                                            } else {
                                                self.setText(self._temp);
                                            }
                                        },
                                        getDictService: function(){
                                            return self.getDictService();
                                        }
                                    };
                                    var dictquery = new YIUI.DictQuery(options);
                                    YIUI.PositionUtil.setViewPos(self._textBtn, dictquery, true);
                                    dictquery.doLayout();
                                    self.dictQuery = dictquery;
                                }
                                YIUI.DictQuery.willshow = false;
                            });
                        });
                    }
                } else {
                    self.doFocusOut();// 值未改变,触发离焦事件
                }
            },

            getNodeValues: function($node){
                if($node.length > 0){
                    var text = "";
                    if($node.attr("oid") >= 0) {
                        text = $node.find('span.b-txt').text();
                    }
                    var options = {};
                    options.oid = $node.attr('oid') || 0;
                    options.itemKey = $node.attr('itemKey');
                    options.caption = text;
                    var itemData = new YIUI.ItemData(options);
                    return itemData;
                }
            }

        };

        Return = $.extend(Return, options);
        Return.init();

        Return._dropView.hide();
        Return._textBtn.val(this.text);
        Return.install();
        return Return;   
    }
})();