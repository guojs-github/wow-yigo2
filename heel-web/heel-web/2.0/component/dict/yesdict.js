
/**
 * dict dropdown list control.
 * 
 * 2023.8.25 added by guojs.
 */

/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-3-20
 * Time: 下午4:30
 * To change this template use File | Settings | File Templates.
 */
(function () {
    YIUI.Yes_DictTree = function(options){
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
            /** 半选状态的节点*/
            indeterminatedNodes : null ,
            /** 记录父子关系的集合*/
            _pMap : {},
            /** 根节点 */
            rootNode : null,
            _liwrap : $("<div class = 'liwrap'></div>"),
            _footdiv : $("<div class = 'footdiv'></div>"),
            startRow : 0,
            pageIndicatorCount : 3,
            fuzzyValue : null,
            secondaryType: 0,

            /** 构建树结构 */
            buildTreenode: function(nodes, pNode, level, secondaryType, isNext) {
                if(!nodes || nodes.length == 0) {
                    return;
                }
                
                this.addNodes(nodes, pNode, level, secondaryType, isNext);
            },

            /**
             * 根据父节点 添加子节点
             * @param {} nodes
             * @param {} pNodeKey
             */
            addNodes: function(nodes, pNode, level, secondaryType, isNext) {
                var pNodeKey = pNode.attr("id");
                var selnid = this.selectedNodeId;
                // 无子节点的时候 去掉节点前的+号
                if(nodes.length <= 0) {
                    pNode.children('span:first').removeClass('dt-collapse');
                    return;
                }
                pNode.attr('isLoaded', true);
                
                var node, nid ,oid, itemKey;
                this._pMap[pNodeKey] || (this._pMap[pNodeKey] = []);
                var _pul = pNode.children("ul");
                if(_pul.length == 0){
                    _pul = $("<ul class='dt-ul'></ul>").appendTo(pNode).css("display", "none");
                }

                var p_state = pNode.children('.dt-chk').attr('chkstate');
                var frag = document.createDocumentFragment();   
                for (var i = 0, len = nodes.length; i < len; i++) {
                    node = nodes[i];
                    nid = node.id;
                    oid = node.OID;
                    itemKey = node.itemKey;
                    this._pMap[pNodeKey].push(nid);
                    
                    var _li = document.createElement("li");
                    _li.setAttribute("id", nid);
                    _li.setAttribute("oid", oid);
                    _li.setAttribute("parentid", pNodeKey);
                    _li.setAttribute("itemKey", itemKey);
                    _li.setAttribute("level", level);
                    _li.style.cssText += "; padding-left: 20px";
                    
                    var pItemKey = pNode.attr("itemKey");
                    var comp_Level = parseInt(pNode.attr("comp_Level"));
                    if(itemKey != pItemKey) {
                        comp_Level += 1;
                    } 
                    _li.setAttribute("comp_Level", comp_Level);
                    var comp_css = "comp_Level" + comp_Level;
                    if(node.disableSelect) {
                        comp_css += " disableSelect";
                    }
                    _li.className += " " + comp_css;
                    
                    var _dtWholerow = document.createElement("div");
                    _dtWholerow.className = "dt-wholerow";
                    if(nid == selnid){
                        _dtWholerow.className += " sel";
                    }
                    _li.appendChild(_dtWholerow);

                    var _a = document.createElement("a");
                    _a.className = "dt-anchor";
                    var _ul, _span, _chk;
                    var _explore = document.createElement("span");
                    var css_name = "";
                    if(node.NodeType == 1) {
                        _span = document.createElement("span");
                        // 汇总节点
                        if(node.open) {
                            _span.className = "icon dt-expand";
                            css_name = "branch b-expand";
                        } else {
                            _span.className = "icon dt-collapse";
                            css_name = "branch b-collapse";
                        }
                        _li.appendChild(_span);
                    } else {
                        //明细节点
                        _span = document.createElement("span");
                        _span.className = "icon";
                        _li.appendChild(_span);
                        css_name = "branch";
                    }
                    _a.appendChild(_explore);
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
                    //复选框
                    if(this.showCheckBox){
                        _chk = document.createElement("span");
                        _chk.className = "dt-chk";
                        _li.appendChild(_chk);
                    }

                    var _selectNode = document.createElement("span");
                    _selectNode.className = "b-txt";
                    var caption = !node.caption ? "" : $.htmlEncode(node.caption);
                    _selectNode.innerHTML = caption;
                    _a.appendChild(_selectNode);
                    _li.appendChild(_a);

                    //如果是多选 ，设置复选框的状态
                    if(this.showCheckBox) {
                        var chkstate = 0;
                        
                        if(nid in this.checkedNodes){
                            chkstate = 1;
                        }
                        if (this.indeterminatedNodes == null) {
                             this.indeterminatedNodes = [];
                        }
                        if(!this.independent &&  nid in this.indeterminatedNodes){
                            chkstate = 2;   
                        }
                        //子节点没打勾的情况下， 如果父节点打勾且是父子联动则子节点打勾
                        if(chkstate == 0 && !this.independent && pNode){
                            p_state =  p_state || 0 ;
                            if(p_state == 1){
                                chkstate =1;
                            }
                        }
                        _chk.setAttribute("chkstate", chkstate);
                        _chk.className += " chkstate" + chkstate;
                    }
                    if(node.items && node.items.length > 0) {
                        this.addNodes(node.items, $(_li), level + 1, secondaryType, node.items.length);
                    }
                    frag.appendChild(_li);
                }
                _pul.append(frag);
            },

            /**
             * 当字典树为父子节点联动时， 需要维护节点勾选状态
             * @param {} $node
             * @param {} checkstate
             */
            checkTreeNode: function($node, checkstate){
                var child, _index, _img, Return;
                var tree = this;

                //递归处理子节点
                function checkChildNode($pNode, checkstate){
                    var pChkBox = $pNode.children('.dt-chk');
                    pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
                    pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);

                    //处理子节点时， 是有在选中和未选中时需要做处理
                    if(checkstate != 2){
                        var pNodeKey = $pNode.attr('id');
                        tree._pMap[pNodeKey] || (tree._pMap[pNodeKey] = []);
                        for (var i = 0; i < tree._pMap[pNodeKey].length; i++) {
                            var cId = tree._pMap[pNodeKey][i];
                            var $child = $('#'+cId, tree.dt);
                            if(checkstate == 0){
                                delete tree.checkedNodes[cId];
                            }
                            checkChildNode($child, checkstate);
                        }
                    }
                }
                //处理兄弟节点
                function checkSiblingsNode($node){
                    var siBlingsNodes = $node.siblings();
                    for (var i = 0; i < siBlingsNodes.length; i++){
                        var $sNode = $(siBlingsNodes[i]);
                        var checkState = $sNode.children(".dt-chk").attr('chkstate');
                        if(checkState == "1"){
                            var nId = $sNode.attr("itemkey");
                            var nId = nId + "_" + $sNode.attr("oid");
                            tree.checkedNodes[nId] = tree.getNodeValue( $sNode);
                        }
                    }
                }
                //递归处理父节点
                function checkParentNode($cNode, checkstate){
                    var pId = $cNode.attr('parentid');
                    if(!pId) return;
                    var $pNode = $('#' + pId, tree.dt);
                    checkSiblingsNode($pNode);
                    var pChkBox = $pNode.children('.dt-chk');

                    if(checkstate == 2){
                        pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
                        pChkBox.attr('chkstate', 2).addClass("chkstate"+2);
                        checkParentNode($pNode, 2);
                    }else if(checkstate == 1){
                        //子节点 打勾， 检查父节点对应的子节点是否都打勾了 ，
                        tree._pMap[pId] || (tree._pMap[pId] = []);
                        var diffstate = false;
                        //TODO 待测试 ， 用filter 可能存在性能问题
                        //$("a", tree.el).filter("[parentid = '" + pId + "']").find("span.dt-chk").filter("[chkstate != '"+checkstate+"']").length > 0
                        for (var i = 0; i < tree._pMap[pId].length; i++) {
                            var cId = tree._pMap[pId][i];
                            var $child = $('#'+cId, tree.dt);
                            var check = $child.children('.dt-chk').attr('chkstate') || 0;
                            if(check != checkstate){
                                diffstate = true;
                                break;
                            }
                        }
                        //有一个节点存在和父节点的勾选状态不一致， 父节点就为半勾状态
                        if(diffstate){
                            checkstate = 2;
                        }
                        pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
                        pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
                        checkParentNode($pNode, checkstate);
                    }else {
                        //子节点勾取消， 检查 原本父节点是否打勾 ， 如全勾转为半勾状态， 则其他子节点 需要加入checkedNodes
                        var pChkState =  pChkBox.attr('chkstate') || 0;
                        var curId = $cNode.attr('id');
                        if(pChkState == 1){
                            var len = tree._pMap[pId].length;
                            if(len == 1){
                                checkstate = 0;
                            }else{
                                for (var i = 0; i < tree._pMap[pId].length; i++) {
                                    var cId = tree._pMap[pId][i];
                                    if(cId == curId){
                                        continue;
                                    }
                                    var $child = $('#'+cId, tree.dt);
                                    tree.checkedNodes[cId] = tree.getNodeValue($child);
                                }
                                checkstate = 2;
                            }
                            pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
                            pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
                        } else if(pChkState == 2) {
                            var diffstate = true;
                            for (var i = 0; i < tree._pMap[pId].length; i++) {
                                var cId = tree._pMap[pId][i];
                                var $child = $('#'+cId, tree.dt);
                                var check = $child.children('.dt-chk').attr('chkstate') || 0;
                                if(check != checkstate){
                                    diffstate = false;
                                    break;
                                }
                            }
                            if(diffstate){
                                checkstate = 0;
                                pChkBox.removeClass("chkstate"+pChkBox.attr('chkstate'));
                                pChkBox.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
                            }
                        }
                        checkParentNode($pNode, checkstate);
                    }

                    //记录在选中节点中
                    if(checkstate == 1){
                        tree.checkedNodes[pId] = tree.getNodeValue($pNode);
                    }else{
                        delete tree.checkedNodes[pId];
                    }
                }

                var id = $node.attr('id');
                //记录在选中节点中
                if(checkstate == 1){
                    this.checkedNodes[id] = this.getNodeValue($node);
                }else{
                    delete this.checkedNodes[id];
                }
                if(!this.independent) {
                    checkChildNode($node, checkstate);
                    checkParentNode($node, checkstate);
                    checkSiblingsNode($node);
                }else{
                    // 父子节点不联动， 则仅当前节点打勾
                    var $chk = $node.children('.dt-chk');
                    $chk.removeClass("chkstate"+$chk.attr('chkstate'));
                    $chk.attr('chkstate', checkstate).addClass("chkstate"+checkstate);
                }
            },

            creatMeanDiv: function(dom) {
                // $("<span class = 'sure'>"+YIUI.I18N.getString("CURRENCY_OK","确定")+"</span>").appendTo(dom);
                // if(this.showCheckBox){
                //     $("<span class='quarantine'></span>").appendTo(dom);
                //     $("<span class = 'removeall'>"+YIUI.I18N.getString("CURRENCY_CLEAN","清除")+"</span>").appendTo(dom);
                // }
                // $("<span class='quarantine'></span>").appendTo(dom);
 
                // 新增，全选按钮
                $('<span class = "hw-def-button hw-primary select-all">' + YIUI.I18N.getString('DICT_SELECT_ALL') + '</span>').appendTo(dom);

                // 取消按钮
                $('<span class = "hw-def-button hw-primary reset">' + YIUI.I18N.getString('DICT_CANCEL') + '</span>').appendTo(dom);
            },

            clearCheckedNodes : function(){
                this.checkedNodes = {};
                this.indeterminatedNodes = null;
                $("[chkstate=1],[chkstate=2]").removeClass("chkstate1").removeClass("chkstate2").attr('chkstate', 0).addClass("chkstate0");
            },
            /**
             * 创建根节点
             * @param {} itemKey
             * @param {} nodeKey
             * @param {} name
             */
            createRootNode : function(node, caption, nodeKey, secondaryType, isNext) {
                var _li = $("<li id='"+ nodeKey + "' oid = '"+node.oid+"' itemKey='"+node.itemKey+"'></li>");
                _li.attr("level", -1).attr("comp_Level", 1);
                _li.appendTo(this.dt);
                _li.addClass("root");
                $("<div class='dt-wholerow'/>").appendTo(_li);

                $("<span class='icon dt-expand'/>").appendTo(_li);

                if(this.showCheckBox){
                    $("<span class='dt-chk' />").addClass("chkstate0").attr("chkstate", 0).appendTo(_li);
                }

                var _a = $("<a class='dt-anchor'></a>");

                $("<span class='branch b-expand'/>").appendTo(_a);

                $("<span class='b-txt'>" +caption+ "</span>").appendTo(_a);

                _a.appendTo(_li);

                $("<ul class='dt-ul'></ul>").appendTo(_li);

                this.rootNode = $('#'+nodeKey,this.dt);

                //如果是多选字典 判断根节点打勾状态
                if(this.showCheckBox){
                    if ($(".chainmean", this._footdiv).length == 0){
                        this.dt.wrap(this._liwrap);
                        var _div = $("<div class='chainmean'></div>");
                        this.creatMeanDiv(_div);
                        _div.appendTo(this._footdiv);
                        this.dt.after(this._footdiv);
                    }
                    if(!jQuery.isEmptyObject(this.checkedNodes) && !this.independent){
                        this.rootNode.children('.dt-chk').attr('chkstate',2).addClass("chkstate"+2);
                    }else if(nodeKey in this.checkedNodes){
                        this.rootNode.children('.dt-chk').attr('chkstate',1).addClass("chkstate"+1);
                    }
                }

            },

            showing: function(){
                var def = null;
                var value = this.baseDict.value;

                if(this.baseDict.multiSelect){
                    this.clearCheckedNodes();
                }

                if(value == null){
                    $(".sel", this.baseDict._dropView).removeClass("sel");
                }else{
                    if(this.baseDict.multiSelect){
                        this.setDictTreeCheckedNodes();
                        if(value.length == 1 && value[0].getOID() == 0){
                            var rNode = this.baseDict._dropView.find("#" + this.baseDict.getItemKey() + "_" + value[0].getOID());
                            this.checkTreeNode(rNode, 1);
                        }else{
                            def = this.setMultiSelectionValue(this.baseDict.getItemKey(), value);
                        }
                    } else if(value.getOID() > 0){
                        $(".sel", this.baseDict._dropView).removeClass("sel");
                        def = this.setSelectionValue(this.baseDict.getItemKey(), value);
                    } else {

                    }
                }
                if(!def){
                    def = this.expandNode(this.rootNode);
                }
                return def;
            },

            setMultiSelectionValue: function(itemKey, value) {
                var self = this;
                var _expand = function(tree, parents, index){
                    if(parents){
                        if(index < parents.length){
                            var oid = parents[index].oid;
                            if(parents) {
                                var arg = arguments;

                                var $node = $("[oid='"+oid+"']", self.dt);
                                if($node.length > 0) {
                                    return self.expandNode($node).then(function(){
                                        _expand(self, parents, (index+1));
                                    });
                                }
                            }
                        }
                    }
                    var isChain = self.dt.hasClass("chain");
                    for(var i = 0 , len = value.length; i < len; i++){
                        var node = $("[oid='"+value[i].oid+"']", self.dt);
                        if(node.length == 0) {
                            if(!isChain && !self.independent)
                                self.clearChkNodes = true;
                        } else {
                            self.checkTreeNode(node, 1);
                        }
                    }
                    var d = $.Deferred();
                    d.resolve(true);
                    return d;
                };

                return self.getDictService().getTreePath(itemKey, value)
                    .then(function(paths){

                        var len = paths.length;
                        if(len > 0) {
                            var args = [];

                            for(var i = 0; i < len; i++){
                                args.push(_expand(self, paths[i], 0));
                            }

                            return $.when.apply($.when,args).then(function(){
                                $(".dt-wholerow.sel", self.baseDict._dropView).removeClass("sel");
                                return true;
                            });
                        } else {
                            return self.expandNode(self.rootNode).then(function(){
                                $(".dt-wholerow.sel", self.baseDict._dropView).removeClass("sel");
                                return true;
                            });
                        }
                    });
            },

            setSelectionValue: function(itemKey, value) {
                var self = this;

                var _expand = function(tree, paths, index){

                    var parents = paths[0];
                    if(parents){
                        if(index < parents.length){
                            var oid = parents[index].oid;
                            if(parents) {
                                var arg = arguments;

                                var $node = $("[oid='"+oid+"']", self.dt);
                                if($node.length > 0) {
                                    return self.expandNode($node).then(function(){
                                        _expand(self, paths, (index+1));
                                    });
                                }
                            }
                        }
                    }

                    var $a = $("[oid='"+value.oid+"']", self.dt);
                    if(self.selectedNodeId) {
                        $('#' + self.selectedNodeId).removeClass('sel');
                    }
                    self.selectedNodeId = $a.attr('id');
                    $(".dt-wholerow:first", $a).addClass("sel");
                };


                return self.getDictService().getTreePath(itemKey, value)
                    .then(function(paths){
                        if(paths.length > 0) {
                            _expand(self, paths, 0);
                        } else {
                            self.expandNode(self.rootNode).then(function(){
                                //$(".dt-wholerow.sel", _this._dropView).removeClass("sel");
                            });
                        }
                    });
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

            open: function() { // 初始化下拉界面
                var baseDict = this.baseDict;
                var self = this;
                if (!baseDict.multiSelect){
                    if (baseDict.getSelValue()){
                        self._selectValue = baseDict.getSelValue();
                    }
                }else{
                    baseDict._dropView.addClass("check");
                }
                self.dt.children("li").find("li").addClass("notclick");
                YIUI.PositionUtil.setViewPos(baseDict._textBtn, baseDict._dropView, true); // 定位
                baseDict._dropView.css("width","auto");

                // show dropdown
                baseDict._dropView.show();
                if ($(window).width() - baseDict._textBtn.offset().left < baseDict._dropView.outerWidth()) {
                    baseDict._dropView.animate({left: $(window).width() - baseDict._dropView.outerWidth()+"px"});
                }
                baseDict._dropBtn.removeClass('arrowgif');
                baseDict._dropBtn.addClass('arrow');
                self.dt.children('li').find('li').removeClass('notclick');

                let handler = function(e) {
                    let target = $(e.target);
                    
                    if ((target.closest(baseDict._dropView).length == 0)
                        && (target.closest(baseDict._dropBtn).length == 0)
                        && (target.closest(baseDict._clear_button).length == 0)) {
                        baseDict.hideDictList();
                        baseDict.el.removeClass('focus');
                        baseDict._textBtn.removeClass('noEdit');

                        $(document).off('mousedown', handler);
                        console.log('yesdict offhook when mousedown on document.');
                    }
                };                    
                $(document).on('mousedown', handler);
            },

            /** 设置需要选中的节点 */
            setCheckedNodes : function (nodes){
                this.checkedNodes = nodes;
            },

            /** 设置需要选中的节点 */
            setDictTreeCheckedNodes : function (){
                if(this.baseDict.multiSelect){
                    var checkedNodes = {};
                    if(this.baseDict.value){
                        $.each(this.baseDict.value,function(i){
                            var nodeId = this.itemKey+'_'+this.oid;
                            checkedNodes[nodeId] = this;
                        });
                    }
                    this.setCheckedNodes(checkedNodes);
                }
            },

            render: function (ct) {
                if($(ct).children().length == 0){
                    this.dt.appendTo($(ct));
                    this.dt.addClass('dt');
                }
            },

            /**
             * 收拢节点
             * @param {} node
             */
            collapseNode: function(node) {
                node.children('ul').hide();
                var $arrow = node.children('span:first');
                $arrow.removeClass('dt-expand').addClass('dt-collapse');
                $arrow.next('.dt-anchor').find('.branch').removeClass('b-expand').addClass('b-collapse');
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
                
                var state = $node.children('.dt-chk').attr('chkstate') == 0 ? 1 : 0;
                
                this.checkTreeNode($node, state);

                var nodeKey = $node.attr('id');
                if(state == 1){
                    this.checkedNodes[nodeKey] = this.getNodeValue($node);
                }else{
                    delete this.checkedNodes[nodeKey];
                }
                this.clearChkNodes = false;
            },

            selectNode: function(node) {
                if(this.selectedNodeId) {
                    $('#' + this.selectedNodeId).removeClass('sel');
                }
                this.selectedNodeId = node.attr('id');
                node.addClass('sel');
                this.onSelected(this, node);
            },

            /**
             * 获取选中节点的值
             * @return {}
             */
            getCheckedValues: function(){
                if(this.showCheckBox){
                    var dictTree = this;
                    var values = [];
                    //判断根节点是否打勾
                    if(dictTree.rootNode){
                        var rootId = dictTree.rootNode.attr('id');
                        if(rootId in dictTree.checkedNodes && !dictTree.independent){
                            values.push(dictTree.getNodeValue(dictTree.rootNode));
                            dictTree._showCaption = "";
                            return values;
                        }
                    }

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
                    this.collapseNode(this.rootNode);
                    this.rootNode.children().remove();
                    this.rootNode.removeAttr('isLoaded');
                    this.indeterminatedNodes = null;
                }
            },

            removeCheckValue: function(checkValue,value){
                var index = checkValue.indexOf(value);
                if(index > -1){
                    checkValue.splice(index, 1);
                }
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

            getSecondaryType: function(){
                return this.secondaryType;
            },

            getNodeValue: function($node) {
                if($node.length > 0){
                    var text = "";
                    if($node.attr("oid") >= 0) {
                        text = $node.children('a').text();
                    }
                    var options = {};
                    options.oid = $node.attr('oid') || 0;
                    options.itemKey = $node.attr('itemKey');
                    options.caption = text;
                    var itemData = new YIUI.ItemData(options);
                    return itemData;
                }
            },

            addTreeNodes : function(node, nodes, total){
                var _this = this;
                if(node.attr('isLoaded') != 'true'){
                    if (nodes) {
                        var syncNodes = _this.formatAsyncData(nodes);
                        var isHaveNext = total;

                        _this.buildTreenode(syncNodes, node, parseInt(node.attr("level"))+1, _this.secondaryType, isHaveNext);
                        node.attr('isLoaded',true);
                    }
                }
            },

            getDictChildren: function(node) {
                var _this = this;
                var def;
                if(this.loadType == YIUI.DictLoadType.L2R){
                	def = _this.getDictService().getAllItems2(_this.baseDict.getItemKey(),
                            _this.getNodeValue(node),
                            _this.dictFilter,
                            _this.baseDict.getStateMask(),
                            _this.baseDict.formKey,
                            _this.baseDict.fieldKey).then(function(data){
                            return {data: data};
                            });
                }else{
                	def = _this.getDictService().getDictChildren(_this.baseDict.getItemKey(),
                            _this.getNodeValue(node),
                            _this.dictFilter,
                            _this.baseDict.getStateMask(),
                            _this.baseDict.formKey,
                            _this.baseDict.fieldKey).then(function(data){
                            return {data: data};
                            });
                }
                
                
                return def;
            },

            expandNode: function(node) {
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
                        self.addTreeNodes(node, nodes, total);
                    });
                }else{
                    def = $.Deferred();
                    def.resolve();
                }
                return def.then(function(){
                    node.children('ul').slideDown(100);
                    //不能写在slidedown中，如果没有节点会导致图标不正确
                    var $arrow = node.children('span:first');
                    if($arrow.hasClass('dt-arrowgif')){
                        $arrow.removeClass('dt-arrowgif').addClass('dt-expand');
                        $arrow.next('.dt-anchor').find('.branch').removeClass('b-collapse').addClass('b-expand');
                    }else if ($arrow.hasClass('dt-collapse')){
                        $arrow.removeClass('dt-collapse').addClass('dt-expand');
                        $arrow.next('.dt-anchor').find('.branch').removeClass('b-collapse').addClass('b-expand');
                    }
                });
            },

            beforeExpand: function(tree , treeNode){
                if(this.baseDict.multiSelect && !this.independent && tree.indeterminatedNodes == null){
                    var value = this.getSelValue()
                    this.setDictTreeCheckedNodes();
                    tree.indeterminatedNodes = [];
                    if(value && value.length>0){
                        this.beforeExpand(tree , treeNode);
                    }
                }
            },

            onSelected : function ($tree, $treeNode) {
                this.baseDict.value = $tree.getNodeValue($treeNode);
                if(this.baseDict._hasShow){
                    this.baseDict.hideDictList();
                }
            },
            
            select_all: function() { // 节点全部选中
                let roots = $('> li', this.dt); // 寻找所有1级节点
                
                // select all items
                for (let i=0; i < roots.length; i++) {
                    this.checkTreeNode($(roots[i]), 1); // 选中节点树
                }
            },

            install: function(){
                var self = this;

                // this._footdiv.delegate(".sure", "click", function(){ // 确定按钮
                //     if(self.baseDict.multiSelect){
                //         //取字典树选中的节点
                //         self.baseDict.value = self.getCheckedValues();
                //     }
                //     self.baseDict.hideDictList();
                // });

                // this._footdiv.delegate(".removeall", "click", function(){ // 清除按钮
                //     self.baseDict.value = null;
                //     self.clearCheckedNodes();
                //     self.baseDict.getInput().val("");
                //     self.baseDict.hideDictList();
                // });

                this._footdiv.delegate('.select-all', 'click', function() { // 全选按钮
                    self.select_all();
                    self.baseDict.set_input(self.getCheckedValues());
                });

                this._footdiv.delegate('.reset', 'click', function() { // 取消按钮
                    self.clearCheckedNodes();
                    self.baseDict.set_input(null);
                });
            }

        };

        Return.dt.bind('click', function(e) { // 多选情况下，对字典备选项的选择事件
            var $target = $(e.target);
            var $node;

            // 处理界面事件
            let handler = () => {
                if($target.prop("tagName").toLowerCase() == "li") {
                    $node = $target;
                } else {
                    $node = $target.parents('li:first');
                }
                if($node.hasClass("notclick")){
                    return;
                }
                if($target.hasClass('dt-collapse')) {
    
                    Return.expandNode($node);
                    return;
                }
                if($target.hasClass('dt-expand')) {
                    Return.collapseNode($node);
                    return;
                }
                if($target.hasClass('dt-chk')) {
                    Return.checkboxClick($node);
                    return;
                }

                // 多选，点击项目行   
                if ($target.hasClass('dt-wholerow')) {
                    let item = $target.parent();
                    let checkbox = item.find('> .dt-chk');

                    checkbox.click(); // 模拟点击复选框
                }

                // 多选，点击项目名称和图标   
                if ($target.parent().hasClass('dt-anchor')) {
                    let item = $target.parent().parent();
                    let checkbox = item.find('> .dt-chk');

                    checkbox.click(); // 模拟点击复选框
                }
               
                if($node.hasClass("comp_Level1") && !Return.showCheckBox && !$node.hasClass("disableSelect")) {
                    $(".dt-wholerow:first", $node).addClass("sel");
                }
                if(!Return.showCheckBox && !$node.hasClass("disableSelect")){
                    Return.selectNode($node);
                    return;
                }    
            };
            handler();
            
            if (Return.showCheckBox) { // 多选？
                // 更新值
                Return.baseDict.set_input(Return.getCheckedValues());
            }
        });

        Return.dt.delegate("li", "mouseover", function(e) {
            if($(this).hasClass("notclick")){
                e.stopPropagation();
                return;
            }
            $(".dt-wholerow.hover", Return.dt).removeClass("hover");
            var li = $(".dt-wholerow:first", this);
            if(!li.hasClass("sel") && !$(this).hasClass("disableSelect")) {
                $(".dt-wholerow:first", this).addClass("hover");
            }
            e.stopPropagation();
        }).delegate("li", "mouseleave", function(e) {
            if($(this).hasClass("notclick")){
                return;
            }
            $(".dt-wholerow.hover", Return.dt).removeClass("hover");
            e.stopPropagation();
        });
        Return = $.extend(Return, options);
        Return.install();
        return Return;
    };

})();