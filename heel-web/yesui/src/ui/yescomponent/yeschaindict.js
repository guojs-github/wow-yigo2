/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-3-20
 * Time: 下午4:30
 * To change this template use File | Settings | File Templates.
 */
(function () {
    YIUI.Yes_ChainDictTree = function(options){
        var Return = {

            /** HTML默认创建为label */
            el: $("<div></div>"),

            dt: $("<div></div>"),

            /** 父子节点是否关联 */
            independent: true,
            /** 是否可勾选 */
            showCheckBox: false,

            /** 选中的节点 */
            checkedNodes : {},

            /** 记录父子关系的集合*/
            _pMap : {},

            /** 根节点 */
            rootNode : null,

            _liwrap : $("<div class = 'liwrap'></div>"),

            _searchdiv : $("<div class = 'chainsearch'></div>"),

            _footdiv : $("<div class = 'footdiv'></div>"),

            _footMean : $("<div class = 'footmean'></div>"),

            _body : $("<div class='body'></div>"),

            _bodyTable : $("<table class='body-table' cellspacing='0' cellpadding='0'></table>"),

            _optionShow : $("<div class='optionShow'></div>"),

            _optionul : $("<ul class='optionul'></ul>"),

            _chainmean : $("<div class='chainmean'></div>"),

            /**单选链式字典选中值,保存值*/
            _selectValue: null,

            /**复选链式字典选中ID，以便于全部选中展示*/
            _checkId: [],

            columns: null,

            startRow : 0,
            pageIndicatorCount : 3,
            fuzzyValue : null,

            secondaryType: 0,

            /** 构建树结构 */
            buildNode: function(nodes, pNode, level, secondaryType, isNext) {
                if(!nodes || nodes.length == 0) {
                    this.reset();
                }

                if(this.showCheckBox){
                    if(this._checkId){
                        this._optionul.children().remove();
                        var checkId = this._checkId;
                        var self = this;
                        for (var i = 0; i < checkId.length; i++) {
                            if(this.checkedNodes[checkId[i]].caption == undefined){
                                var itemKey = this.checkedNodes[checkId[i]].itemKey;
                                var oid = this.checkedNodes[checkId[i]].oid;
                                new YIUI.DictCacheProxy().getItem(itemKey,oid).then(function(data){
                                    var key = data.itemKey + "_" + data.oid;
                                    if(self.checkedNodes[key].caption == undefined){
                                        self.checkedNodes[key].caption = data.caption;
                                    }
                                    self.creatOptionli(self.checkedNodes[key], key);
                                    $(".number").html(self._optionul.children().length);
                                });
                            }else{
                                this.creatOptionli(this.checkedNodes[checkId[i]], checkId[i]);
                            }
                        }
                    }
                    $(".number").html(this._optionul.children().length);
                }
                this.addChildNodes(nodes, pNode, level, secondaryType, isNext);
            },

            /**
             * 根据父节点 添加子节点
             * @param {} nodes
             * @param {} pNodeKey
             */
            addChildNodes: function(nodes, pNode, level, secondaryType, isNext) {
                var pNodeKey = pNode.attr("id");
                var allPageNum = Math.ceil(isNext/10);
                this._footdiv.find(".pageinfo").attr("maxnum",allPageNum);
                pNode.attr('isLoaded', false);

                //如果下一页的item不为0，点击下一页的时候删除当前页的item
                if (isNext != 0) {
                    this.reset();
                }
                var _pageInfo = $("<span class = 'pageinfo'></span>");
                if (this.startRow == 0) {
                    if (this._footdiv.find(".pageinfo").length != 0) {
                        this._footdiv.find(".pageinfo").children("span").remove();
                        _pageInfo = this._footdiv.find(".pageinfo");
                    }
                    _pageInfo.attr("maxnum", allPageNum);
                    var btnNum = allPageNum >= 3 ? 3 : allPageNum;
                    for ( var i = 0; i < btnNum;i++) {
                        if (i == 0) {
                            $("<span class='pagenum nowitem'>"+(i + 1)+"</span>").appendTo(_pageInfo);
                        } else {
                            $("<span class='pagenum'>"+(i + 1)+"</span>").appendTo(_pageInfo);
                        }
                    }
                    if(btnNum == 0){
                        $("<span class='pagenum now'>1</span>").appendTo(_pageInfo);
                    }
                    if(btnNum == 1 || btnNum == 0){
                        $(".prev", this._footMean).addClass("disable");
                        $(".next", this._footMean).addClass("disable");
                    }else{
                    	$(".next", this._footMean).removeClass("disable");
                    }
                    this._footMean.find(".prev").after(_pageInfo);
                }
                
                var node, nid ,oid, itemKey;
                this._pMap[pNodeKey] || (this._pMap[pNodeKey] = []);
                var _pul = pNode.children("ul");

                var p_state = pNode.children('.dt-chk').attr('chkstate');
                var frag = document.createDocumentFragment();
                var bodyTable = this._bodyTable.get(0);

                var titlie = $("<tr class='thead'></tr>");
                if(this._bodyTable.find("tr").length == 0){
                    titlie.appendTo(this._bodyTable);
                    for (var i = 0; i < this.columns.length; i++) {
                        $("<th>"+this.columns[i].caption+"</th>").appendTo(titlie);
                    }
                }

                for (var i = 0, len = nodes.length; i < len; i++) {
                    node = nodes[i];
                    nid = node.id;
                    oid = node.OID;
                    itemKey = node.itemKey;
                    this._pMap[pNodeKey].push(nid);

                    var bodyTr = document.createElement("tr");
                    bodyTr.setAttribute("id", nid);
                    bodyTr.setAttribute("oid", oid);
                    bodyTr.setAttribute("parentid", pNodeKey);
                    bodyTr.setAttribute("itemKey", itemKey);
                    bodyTr.setAttribute("level", level);
                    if(i == 9 || i > 5 && i == len - 1){
                        bodyTr.setAttribute("class", "last");
                    }
                    bodyTable.appendChild(bodyTr);

                    //如果是多选 ，设置复选框的状态
                    if(this.showCheckBox) {
                        var _chk = document.createElement("span");
                        _chk.className = "dt-chk";

                        var chkstate = 0;
                        var pnid = itemKey +"_"+ oid;
                        if(pnid in this.checkedNodes){
                            chkstate = 1;
                        }
                        
                        if(nid in this.checkedNodes){
                            chkstate = 1;
                        }
                        _chk.setAttribute("chkstate", chkstate);
                        _chk.className += " chkstate" + chkstate;
                    }

                    var pItemKey = pNode.attr("itemKey");
                    var comp_Level = parseInt(pNode.attr("comp_Level"));
                    if(itemKey != pItemKey) {
                        comp_Level += 1;
                    }

                    var comp_css = "comp_Level" + comp_Level;
                    if(node.disableSelect) {
                        comp_css += " disableSelect";
                    }

                    var _a = document.createElement("a");
                    _a.className = "dt-anchor";

                    var _explore = document.createElement("span");
                    var css_name = "branch";
                    
                    switch(node.Enable) {
                        case YIUI.DictState.Enable:
                            css_name += " enable";
                            break;
                        case YIUI.DictState.Disable:
                            css_name += " disable";
                            break;
                        case YIUI.DictState.Discard:
                            css_name += " discard";
                            break;
                    }
                    _explore.className = css_name;
                    _a.appendChild(_explore);

                    var _selectNode = document.createElement("span");
                    _selectNode.className = "b-txt";
                    _a.appendChild(_selectNode);

                    var display = this.columns;
                    for (var s = 0,length = display.length; s < length; s++) {
                        var td = document.createElement("td");
                        var txtDiv = document.createElement("div");
                        td.className = display[s].key;
                        txtDiv.className = "txt";
                        td.appendChild(txtDiv);
                        node[display[s].key] == null ? node[display[s].key] = " " : node[display[s].key];
                        txtDiv.innerText = node[display[s].key];
                        if(s == 0){
                            td.className += " frist";
                            txtDiv.innerText = " ";
                            _selectNode.innerText = node[display[s].key];
                            if(this.showCheckBox) {
                                txtDiv.appendChild(_chk);
                            }
                            txtDiv.appendChild(_a);
                        }
                        bodyTr.appendChild(td);
                    }

                    if(!this.showCheckBox){
                        var pnid = itemKey +"_"+ oid;
                        if(this._selectValue != null){
                            var id = this._selectValue.itemKey + "_" + this._selectValue.oid;
                            if(pnid == id){
                                bodyTr.className += " sel";
                            }
                        }
                        
                    }
                    
                    frag.appendChild(bodyTable);
                    
                    if(node.items && node.items.length > 0) {
                        this.addChildNodes(node.items, $(_li), level + 1, secondaryType, node.items.length);
                    }
                }
                this._body.append(frag);
            },

            /**
             * 当字典树为父子节点联动时， 需要维护节点勾选状态
             * @param {} $node
             * @param {} checkstate
             */
            checkNode: function($node, checkstate){
                var id = $node.attr('id');
                //记录在选中节点中
                if(checkstate == 1){
                    this.checkedNodes[id] = this.getNodeValue($node);
                    this.creatOptionli(this.checkedNodes[id], id);
                    this._checkId.push(id);
                }else  if(checkstate == 0){
                    delete this.checkedNodes[id];
                    this._optionul.children("#"+id).remove();
                    this.removeCheckValue(this._checkId, id);
                }
                $(".number").text(this._optionul.children().length);
                this.setDropViewWidth();

                // 父子节点不联动， 则仅当前节点打勾
                var $chk = $node.children().find('.dt-chk');
                $chk.removeClass("chkstate"+$chk.attr('chkstate'));
                $chk.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
            },
            
            /**
             * 创建查找框
             */
            creatSearchInput: function(dom) {
                $("<input type = 'text' class = 'findinput' placeholder='"+YIUI.I18N.getString("DICT_KEYWORD","请输入关键字") + "'/>").appendTo(dom);
                $("<span class = 'findspan'></span>").appendTo(dom);
            },
            /**
             * 清空搜索框
             */
            clearSearchInput: function(){
                var txt = $('.findinput',this._searchdiv);
                txt && txt.val('');
                this.fuzzyValue = null;
            },
            /**
             * 创建根菜单
             */
            creatFootDiv: function(dom, isNext) {
                $("<span class = 'prev disable'></span>").appendTo(dom);
                $("<span class = 'next'></span>").appendTo(dom);
            },
            creatMeanDiv: function(dom) {
                $("<span class = 'sure'>"+YIUI.I18N.getString("CURRENCY_OK","确定")+"</span>").appendTo(dom);
                if(this.showCheckBox){
                    $("<span class='quarantine'></span>").appendTo(dom);
                    $("<span class = 'removeall'>"+YIUI.I18N.getString("CURRENCY_CLEAN","清除")+"</span>").appendTo(dom);
                }
                $("<span class='quarantine'></span>").appendTo(dom);
                $("<span class = 'reset'>"+YIUI.I18N.getString("DICT_CANCEL","取消")+"</span>").appendTo(dom);
            },

            creatOption: function(dom){
                $("<span class='optiontitle'>"+YIUI.I18N.getString("DICT_SELECTED","已选")+
                	" <span class='number'>0</span> "+YIUI.I18N.getString("DICT_ITEM","项")+"</span>").appendTo(dom);
            },

            creatOptionli: function(checkedNodes, id){
                var li = $("<li class='option'></li>");
                li.attr("title", checkedNodes.caption);
                li.attr("id",id);
                li.appendTo(this._optionul);
                var txt = $("<span class='o-txt'></span>").text(checkedNodes.caption);
                var clear = $("<span class='clear'></span>");
                txt.appendTo(li);
                clear.appendTo(li);
                this.setDropViewWidth();
            },

            setDropViewWidth: function(){
            	var dropView = this.baseDict._dropView,dpWidth;
            	var borderWidth = dropView.outerWidth() - dropView.width();
                dropView.css("width","auto");
            	if(this.baseDict.multiSelect){
                    this._optionShow.find(".optiontitle").css("width", this._optionul[0].offsetWidth);
                    //右侧展示区宽度
                    var osWidth = this._optionShow[0].getBoundingClientRect().width;
                    //右侧展示区margin-right宽度
                    var osMRight = this._optionShow.outerWidth(true) - this._optionShow.width() - borderWidth;
                    //右侧展示区总宽度：widht + border + margin
                    var osOuterWidth = osWidth + osMRight + borderWidth;
                    dpWidth = dropView.find(".leftdiv").outerWidth(true) + osOuterWidth + borderWidth;
            	}else{
            		dpWidth = dropView.find(".leftdiv").outerWidth(true) + borderWidth;
            	}
            	dropView.css("width",dpWidth);
            },

            clearCheckedNodes : function(){
                this.checkedNodes = {};
                this._checkId = [];
                $("[chkstate=1],[chkstate=2]").removeClass("chkstate1").removeClass("chkstate2").attr('chkstate', 0).addClass("chkstate0");
            },
            /**
             * 创建根节点
             * @param {} itemKey
             * @param {} nodeKey
             * @param {} name
             */
            createRootNode : function(node, caption, nodeKey, secondaryType, isNext) {
                var footDivLen = this._footdiv.children().length;
                var searchDivLen = this._searchdiv.children().length;

                var countDiv = $("<div class='countdiv'></div>");
                var leftDiv = $("<div class='leftdiv'></div>");
                leftDiv.appendTo(countDiv);
                countDiv.appendTo(this._liwrap);

                if(!this.dt.parents(".liwrap").hasClass("liwrap")){
                    this.dt.wrap(this._liwrap);
                }
                

                if(this.showCheckBox){
                    this.dt.parents(".leftdiv").before(this._optionShow);
                    this.creatOption(this._optionShow);
                    this._optionul.appendTo(this._optionShow);
                }
               
                
                if(searchDivLen == 0){
                    var $searchWrap = $("<div class = 'dt-searchwrap'></div>");
                    this.creatSearchInput($searchWrap);
                    $searchWrap.appendTo(this._searchdiv);
                }
                this.dt.before(this._searchdiv);

                this.columns = this.getDictService().getDisplayCols(node.itemKey);

                this._body.appendTo(this.dt);
                this._bodyTable.appendTo(this._body);
                this._bodyTable.attr("id", nodeKey);
                this._bodyTable.attr("oid",node.oid);
                this._bodyTable.attr("itemKey",node.itemKey);
                this._bodyTable.attr("level", -1);
                this._bodyTable.attr("comp_Level", 1);
                this._bodyTable.addClass("root");

                if(footDivLen == 0){
                    this.creatFootDiv(this._footMean, isNext);
                    this._footMean.appendTo(this._footdiv);
                }
                this.dt.after(this._footdiv);
                
                if(this.dt.parents(".countdiv").next().length == 0){
                    this.creatMeanDiv(this._chainmean);
                    this.dt.parents(".countdiv").after(this._chainmean);
                }

                this.rootNode = $('#'+nodeKey,this.dt);
            },

            showing: function() {
                var def = null;
                var value = this.baseDict.value;
                
                this.clearSearchInput();

                if(this.baseDict.multiSelect){
                    this.clearCheckedNodes();
                }

                if(value == null){
                    $(".sel", this.baseDict._dropView).removeClass("sel");
                    if(!this.baseDict.multiSelect){
                        this.selectValue(value);
                    }
                }else{
                    if(this.baseDict.multiSelect){
                        this.setDictCheckedNodes();
                        if(value.length == 1 && value[0].getOID() == 0){
                            var rNode = this.baseDict._dropView.find("#" + this.baseDict.getItemKey() + "_" + value[0].getOID());
                            this.checkNode(rNode, 1);
                        }else{
                            def = this.loadData(this.rootNode);
                            this._selectValue = value;
                        }
                    } else if(value.getOID() > 0){
                        $(".sel", this.baseDict._dropView).removeClass("sel");
                        def = this.loadData(this.rootNode);
                        this._selectValue = value;
                    }
                }
                if(!def){
                    def = this.loadData(this.rootNode);
                }
                return def;
            },

            removeNode: function(secondaryType, tree){
                if (this.rootNode != null) {
                    if(secondaryType == YIUI.SECONDARYTYPE.CHAINDICT){
                        var length = this.rootNode.children().length;
                        if(length > 0){
                            this.rootNode.children().remove();
                        }
                        if(this.dt.hasClass("dt")){
                            this.baseDict._dropView.children().remove();
                        }
                    }else{
                        if(this.dt.hasClass("dt")){
                            this.dt.children().remove();
                        }else if(this.dt.hasClass("chain-dt")){
                            this.baseDict._dropView.children().remove();
                        }
                        this.baseDict._dropView.removeClass("chain");
                    }
                    if(this.secondaryType != secondaryType){
                        this.baseDict.setDictTree(tree);
                    }
                    
                }

                if (this.itemKey != this.baseDict.itemKey) {
                    this.fuzzyValue = null;
                    this.startRow = 0;
                    if(secondaryType == YIUI.SECONDARYTYPE.CHAINDICT){
                        this._searchdiv.find(".findinput").val("");
                        this._footdiv.find(".next").removeClass('disable');
                    }
                }
            },

            open: function(){
                var baseDict = this.baseDict;
                var self = this;
                baseDict._textBtn.addClass("noEdit");
                baseDict._dropView.addClass("chain");
                if(baseDict.multiSelect){
                    baseDict._dropView.addClass("check");
                }else{
                    if (baseDict.getSelValue()){
                        self._selectValue = baseDict.getSelValue();
                    }
                }

                baseDict._dropView.find("input").attr("readonly", true);
                YIUI.PositionUtil.setViewPos(baseDict._textBtn, baseDict._dropView, true);
                baseDict._dropView.css("width","auto");
                baseDict._dropView.slideDown(200, function(){
                	self.setDropViewWidth();
                    var wWidth = $(window).width();
                    if(wWidth - baseDict._textBtn.offset().left < baseDict._dropView.outerWidth()){
                        baseDict._dropView.animate({left: wWidth - baseDict._dropView.outerWidth()+"px"});
                    }
                    baseDict._dropBtn.removeClass("arrowgif");
                    baseDict._dropBtn.addClass("arrow");
                    baseDict._dropView.find("input").attr("readonly", false);
                    $(document).on("mousedown",function(e){
                        var target = $(e.target);
                        if((target.closest(baseDict._dropView).length == 0)
                            &&(target.closest(baseDict._dropBtn).length == 0)){
                            baseDict.hideDictList();
                            baseDict.el.removeClass("focus");
                            baseDict._textBtn.removeClass("noEdit");
                            
                            self._checkId = [];
                            self._optionul.children().remove();
                            if(!baseDict.multiSelect){
                                self.selectValue(baseDict.value);
                            }
                            self.setDropViewWidth();
                        }
                    });
                    self._searchdiv.find("input").focus();
                });

            },

            render: function (ct) {
                if($(ct).children().length == 0){
                    this.dt.appendTo($(ct));
                    this.dt.addClass('chain-dt');
                }
                
            },

            /**
             * 展开节点
             * @param {} node
             */
            expandNode: $.noop,
            doSuggest: $.noop,

            /**
             * 复选框勾选事件
             * @param {} $node
             */
            checkboxClick: function($node) {
                if($node.hasClass("disableSelect")) return;
                if(this.clearChkNodes) {
                    this.checkedNodes = {};
                }
                
                var state = $node.children().find('.dt-chk').attr('chkstate') == 0 ? 1 : 0;
                
                this.checkNode($node, state);

                var nodeKey = $node.attr('id');
                if(state == 1){
                    this.checkedNodes[nodeKey] = this.getNodeValue($node);
                }else{
                    delete this.checkedNodes[nodeKey];
                }
                this.clearChkNodes = false;
            },

            /** 设置需要选中的节点 */
            setCheckedNodes : function (nodes){
                this.checkedNodes = nodes;
            },

            /**
             * 获取选中节点的值
             * @return {}
             */
            getCheckedValues: function(){
                if(this.showCheckBox){
                    var dictTree = this;
                    var values = [];
                    var caption = "";

                    $.each(dictTree.checkedNodes , function(key,val){

                        var $node = $('#'+key , dictTree.dt);

                        if(!dictTree.independent) {

                            var pId = $node.attr('parentid');
                            var $pNode = $('#'+pId , dictTree.dt);

                            if($pNode){
                                var chkstate = $pNode.children('.dt-chk').attr('chkstate') || 0;
                                if(chkstate == 1){

                                }else{
                                    values.push(val);
                                }
                            }else{
                                values.push(val);
                            }
                        }else{
                            values.push(val);
                        }
                    });
                    return values;

                }
            },

            removeCheckValue: function(checkValue,value){
                var index = checkValue.indexOf(value);
                if(index > -1){
                    checkValue.splice(index, 1);
                }
            },

            /** 设置需要选中的节点 */
            setDictCheckedNodes : function (){
                if(this.baseDict.multiSelect){
                    var checkedNodes = {};
                    var checkId = [];
                    if(this.baseDict.value){
                        $.each(this.baseDict.value,function(i){
                            var nodeId = this.itemKey+'_'+this.oid;
                            checkedNodes[nodeId]=this;
                            checkId.push(nodeId);
                        });
                    }
                    this.setCheckedNodes(checkedNodes);
                    this._checkId = checkId;
                }
            },

            /**
             * 转换节点数据
             * @param {} treeNodes
             * @return {}
             */
            formatAsyncData: function(treeNodes){
                return treeNodes;
            },

            /**
             * 移除根节点外的所有节点
             */
            reset: function (){
                if(this.rootNode){
                    this._pMap = {};
                    this.rootNode.children().remove();
                    this.rootNode.removeAttr('isLoaded');
                }
            },

            selectValue : function(str){
                this._selectValue = str;
            },

            getSecondaryType: function(){
                return this.secondaryType;
            },

            formatAsyncData: function(datas){
                var _this = this;
                $.each(datas,function(i,val){
                    var id = val.itemKey+'_'+val.OID;
                    val.id = id;
                    if(val.items && val.items.length > 0) {
                        _this.formatAsyncData(val.items);
                    }
                });
                return datas;
            },
            getNodeValue: function($node) {
                if($node.length > 0){
                    var text = "";
                    if($node.attr("oid") >= 0) {
                        var columns = this.columns;
                        var caption = [];
                        for (var i = 0; i < columns.length; i++) {
                            if(i == 0){
                                caption.push($node.children('td.'+columns[i].key).find(".b-txt").text());
                            }else{
                                caption.push($node.children('td.'+columns[i].key).text());
                            }
                        }
                        text = caption.join(" ");
                    }
                    var options = {};
                    options.oid = $node.attr('oid') || 0;
                    options.itemKey = $node.attr('itemKey');
                    options.caption = text;
                    var itemData = new YIUI.ItemData(options);
                    return itemData;
                }
            },

            addNodes : function(node, nodes, total){
                var _this = this;
                if(node.attr('isLoaded') != 'true'){
                    if (nodes) {
                        var syncNodes = _this.formatAsyncData(nodes);
                        var isHaveNext = total;

                        _this.buildNode(syncNodes, node, parseInt(node.attr("level"))+1, _this.secondaryType, isHaveNext);
                        node.attr('isLoaded',false);
                    }
                }
            },

            getDictChildren: function(node) {
                var _this = this;
                var def;
                
                var pageMaxNum = _this.baseDict.pageMaxNum;
                if (pageMaxNum == null) {
                    pageMaxNum = 10;
                }
                def = _this.getDictService().getQueryData(_this.baseDict.getItemKey(),
                    _this.startRow,
                    pageMaxNum,
                    _this.pageIndicatorCount,
                    _this.fuzzyValue,
                    _this.baseDict.getStateMask(),
                    _this.dictFilter,
                    _this.getNodeValue(node),
                    _this.baseDict.formKey,
                    _this.baseDict.fieldKey);
                
                return def;
            },

            loadData: function(node) {
                if(!node){
                    node = this.rootNode;
                }
                var $arrow = node.children('span:first');
                if($arrow.hasClass('dt-collapse')){
                    $arrow.removeClass('dt-collapse').addClass('dt-arrowgif');
                }
                var def ;
                var self = this;
                //未加载过的情况下 加载子节点
                if(node.attr('isLoaded') == "false" || node.attr('isLoaded')== undefined) {
                    def = this.getDictChildren(node).then(function(data){
                        var nodes = data.data, total = data.totalRowCount;
                        var $arrow = node.children('span:first');
                        nodes.length == 0 && $arrow.removeClass('dt-arrowgif').addClass('dt-collapse');
                        self.addNodes(node, nodes, total);
                    });
                }else{
                    def = $.Deferred();
                    def.resolve();
                }
                return def.then(function(){
                    node.children('ul').slideDown(100);
                });
            },

            install: function(){
                var self = this;
                //查询按钮绑定事件
                this._searchdiv.delegate(".findspan", "click", function(){
                    var _li = self.dt.children("li").find("li");
                    if (_li.hasClass("notclick")){
                        return;
                    }
                    var value = $(this).prev().val();
                    if (value != null) {
                        $(this).parent().parent().parent().find(".next").removeClass("disable");
                        self.fuzzyValue = value;
                        self.startRow = 0;
                        self.loadData(self.rootNode).then(function(){
                            var len = self._footMean.children(".pageinfo").children().length;
                            var nowitem = self._footMean.children(".pageinfo").find(".nowitem").text();
                            nowitem = parseInt(nowitem);
                            if(len == 1 || len == 0) {
                                self._footMean.find(".next").addClass("disable");
                                self._footMean.find(".prev").addClass("disable");
                            }else if(nowitem == 1){
                                self._footMean.find(".prev").addClass("disable");
                            }
                            self.setDropViewWidth();
                        });

                    }
                });

                //查询框回车查找
                this._searchdiv.delegate(".findinput","keydown",function(e){
                    var which = e.which;
                    var val = $(this).val();
                    if (val != null && which == 13) {
                        $(this).parent().parent().parent().find(".next").removeClass("disable");
                        self.fuzzyValue = val;
                        self.startRow = 0;
                        self.loadData(self.rootNode).then(function(){
                            var len = self._footMean.children(".pageinfo").children().length;
                            var nowitem = self._footMean.children(".pageinfo").find(".nowitem").text();
                            nowitem = parseInt(nowitem);
                            if(len == 1 || len == 0) {
                                self._footMean.find(".next").addClass("disable");
                                self._footMean.find(".prev").addClass("disable");
                            }else if(nowitem == 1){
                                self._footMean.find(".prev").addClass("disable");
                            }
                            self.setDropViewWidth();
                        });
                    }
                });

                //下一页按钮点击事件
                this._footdiv.delegate(".next", "click", function(){
                    if($(this).hasClass("disable"))
                        return;
                    var allpage = $(".pageinfo span",self._footMean).length;
                    if ( allpage == 1 ) {
                        return;
                    }

                    $(this).parent().find(".prev").removeClass("disable");
                    self.startRow = self.startRow + 10;
                    self.loadData(self.rootNode).then(function(){

                        var pNumBtn = $(".nowitem", self._footdiv);
                        var pBtnNumIndex =  $(".pageinfo span",self._footMean).index($(".pageinfo .nowitem",self._footMean));
                        var maxNum = $(".pageinfo",self._footdiv).attr("maxnum");
                        var pageNum = $(self._footdiv.find(".pagenum"));
                        var indexPage = pNumBtn.text();

                        if (pBtnNumIndex == 2 && +maxNum >= 1) {
                            pNumBtn.text(+pNumBtn.text() + 1);
                            var prevAll = pNumBtn.prevAll();
                            prevAll.eq(0).text(+prevAll.eq(0).text() + 1);
                            prevAll.eq(1).text(+prevAll.eq(1).text() + 1);
                        }

                        if (+maxNum == 1 ) {
                            $(".next",self._footMean).addClass("disable");
                        }
                        var pBtnLen = pNumBtn.next().length;
                        if (pBtnLen != 0) {
                            pNumBtn.removeClass("nowitem");
                            pNumBtn.next().addClass("nowitem");
                            pBtnNumIndex = +pBtnNumIndex + 1
                        }
                        if (pageNum.length == 2 && pBtnNumIndex == 1) {
                            $(".next",self._footMean).addClass("disable");
                        }
                        self.setDropViewWidth();
                    });
                });

                this._chainmean.delegate(".sure", "click", function(){
                    if(self.baseDict.multiSelect){
                        //取字典树选中的节点
                        self.baseDict.value = self.getCheckedValues();
                        self._optionul.children().remove();
                        self.setDropViewWidth();
                    }
                    if(!self.baseDict.multiSelect){
                        self.baseDict.value = self._selectValue;
                    }
                    self.baseDict.hideDictList();
                });

                this._chainmean.delegate(".removeall", "click", function(){
                    self.baseDict.value = null;
                    self.clearCheckedNodes();
                    self._optionul.children().remove();
                    self._checkId = [];
                    $(".number").text(self._optionul.children().length);
                    self.baseDict.getInput().val("");
                    self.setDropViewWidth();
                    self.baseDict.hideDictList();
                });

                this._chainmean.delegate(".reset", "click", function(){
                    self.clearCheckedNodes();
                    self._checkId = [];
                    self._optionul.children().remove();
                    if(!self.baseDict.multiSelect){
                       self.selectValue(self.baseDict.value);
                    }
                    self.setDropViewWidth();
                    self.baseDict.hideDictList();
                });

                //上一页按钮点击事件
                this._footdiv.delegate(".prev", "click", function(){
                    if($(this).hasClass("disable"))
                        return;
                    var allpage = $(".pageinfo span",self._footMean).length;
                    if ( allpage == 1 ) {
                        return;
                    }
                    self.startRow = self.startRow - 10;

                    $(this).parent().find(".next").removeClass("disable");
                    self.loadData(self.rootNode).then(function(){
                        var pNumBtn = $(".nowitem", self._footdiv);
                        var indexPage = pNumBtn.text();
                        var pBtnNumIndex =  self._footdiv.find($(".pageinfo span")).index($(".nowitem"));
                        if (indexPage != 1) {
                            if (pBtnNumIndex == 0) {
                                pNumBtn.text(+pNumBtn.text() - 1);
                                var nextAll = pNumBtn.nextAll();
                                nextAll.eq(0).text(+nextAll.eq(0).text() - 1);
                                nextAll.eq(1).text(+nextAll.eq(1).text() - 1);
                            }
                            var pBtnLen = pNumBtn.prev().length;
                            if (pBtnLen != 0) {
                                pNumBtn.removeClass("nowitem");
                                pNumBtn.prev().addClass("nowitem");
                            }
                        }

                        if (+indexPage == 1) {
                            $(".prev",self._footMean).addClass("disable");
                        }
                        self.setDropViewWidth();
                    });
                });

                //页码点击事件
                this._footdiv.delegate(".pagenum", "click", function(){
                    if($(this).hasClass("nowitem") || $(this).hasClass("now"))
                        return;
                    var $this = $(this);
                    var index = $this.text();

                    self.startRow = (index - 1)*10;
                    self.loadData(self.rootNode).then(function (){

                        var pageNum = $(self._footdiv.find(".pagenum"));
                        var clickBtn =  pageNum.index($this);
                        var maxnum = $this.parent().attr("maxnum");
                        if(clickBtn == 0 && $this.text() == 1) {
                            pageNum.removeClass("nowitem");
                            $this.addClass("nowitem");
                            $(".next", self._footdiv).removeClass("disable");
                            $(".prev", self._footdiv).addClass("disable");
                        }
                        if(clickBtn == 1 && pageNum.length == 3) {
                            pageNum.removeClass("nowitem");
                            $this.addClass("nowitem");
                            $(".next", self._footdiv).removeClass("disable");
                            $(".prev", self._footdiv).removeClass("disable");
                        }
                        if (clickBtn == 1 && pageNum.length == 2) {
                            pageNum.removeClass("nowitem");
                            $this.addClass("nowitem");
                            $(".next", self._footdiv).addClass("disable");
                            $(".prev", self._footdiv).removeClass("disable");
                        }

                        if ($this.text() == 1) {
                            $(".prev", self._footdiv).addClass("disable");
                            $(".next", self._footdiv).removeClass("disable");
                        }
                        if(clickBtn == 2) {
                            pageNum.removeClass("nowitem");
                            $(".prev", self._footdiv).removeClass("disable");
                            if(maxnum > 1) {
                                $this.text(+$this.text() + 1);
                                var prevAll = $this.prevAll();
                                $(prevAll[0]).text(+$(prevAll[0]).text() + 1);
                                $(prevAll[1]).text(+$(prevAll[1]).text() + 1);
                                $(prevAll[0]).addClass("nowitem");
                                pageNum.find(".next").addClass("nowitem");
                            } else {
                                $this.addClass("nowitem");
                                $(".next", self._footdiv).addClass("disable");
                                $(".prev", self._footdiv).removeClass("disable");
                            }

                        }
                        if(clickBtn == 0 && $this.text() != 1) {
                            pageNum.removeClass("nowitem");
                            $this.text(+$this.text() - 1);
                            var nextAll = $this.nextAll();
                            $(nextAll).eq(0).text(+$(nextAll[0]).text() - 1);
                            $(nextAll).eq(1).text(+$(nextAll[1]).text() - 1);
                            pageNum.eq(1).addClass("nowitem");
                            $(".next", self._footdiv).removeClass("disable");
                            $(".prev", self._footdiv).removeClass("disable");
                        }
                        self.setDropViewWidth();
                    });
                });

                this._optionul.delegate(".clear","click",function(){
                    var id = $(this).parent("li").attr("id");
                    tr = $("#"+id,self._bodyTable);
                    self.checkboxClick(tr);
                    delete self.checkedNodes[id];
                    self.removeCheckValue(self._checkId, id);
                    $(this).parent("li").remove();
                    $(".number").text(self._optionul.children().length);
                    self.setDropViewWidth();
                });
            }

        };

        Return.dt.bind('click', function(e) {
            var $target = $(e.target);
            var $node;

            if($target.prop("tagName").toLowerCase() == "tr") {
                $node = $target;
            } else {
                if($target.prop("tagName").toLowerCase() == "th"){
                    return;
                }
                $node = $target.parents('tr:first');
            }

            if($node.hasClass("notclick")){
                return;
            }
            
            if($target.hasClass('dt-chk')) {
                Return.checkboxClick($node);
                return;
            }

            if(!Return.showCheckBox){
                $node.addClass("sel").siblings().removeClass("sel");
                
                var str = Return.getNodeValue($node);
                Return.selectValue(str);
            }
            
            if(!Return.showCheckBox && !$node.hasClass("disableSelect")){
                return;
            }
        });

        Return = $.extend(Return, options);
        Return.install();
        return Return;
    };
    
})();