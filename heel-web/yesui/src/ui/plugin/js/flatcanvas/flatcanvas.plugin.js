/**
 * Created by chenbinbin on 17-9-25.
 */

(function(){
    Array.prototype.remove = function(dx) {
        if(isNaN(dx) || dx>this.length ) return false;
        return this.splice(dx, 1);
    };

    Array.prototype.add = function(obj) {
        return this.push(obj);
    };

    Array.prototype.clear = function() {
        return this.length = 0;
    };

    $.fn.getVariables = function(str) {
        //定义正则表达式对象，\表示转义字符,原点表示任意字符，+表示出现次数至少1次，igm表示忽略大小写，且全局匹配
        //pattern =new RegExp("\\{(.| )+?\\}","igm");
        var result = str.match(/([^\{\}]+)(?=\})/g);
        return result;
    };

    $.fn.isExp = function(str) {
        if (str) {
            return str.indexOf(")") > 0 || str.indexOf(">")> 0 || str.indexOf("<")> 0 || str.indexOf("=")> 0
                || str.indexOf("+")> 0|| str.indexOf("-")> 0|| str.indexOf("*")> 0|| str.indexOf("/")> 0;
        } else {
            return false;
        }
    };

    $.fn.hasVariables = function(str) {
        if (str) {
            return str.indexOf("{") >= 0 && str.indexOf("}") > 0;
        } else {
            return false;
        }
    }
})();

(function($) {
   var HAlignment = {
        LEFT: -1,
        CENTER: 0,
        RIGHT: 1
    };

   var VAlignment = {
        TOP: -1,
        CENTER: 0,
        BOTTOM: 1
   };

    var jClass = (function() {
        // 当前是否处于创建类的阶段
        var initializing = false;
        var jCls = function(baseClass, prop) {
            // 只接受一个参数的情况 - jClass(prop)
            if (typeof (baseClass) === "object") {
                prop = baseClass;
                baseClass = null;
            }
            // 本次调用所创建的类（构造函数）
            function F() {
                // 如果当前处于实例化类的阶段，则调用init原型函数
                if (!initializing) {
                    // 如果父类存在，则实例对象的baseprototype指向父类的原型
                    // 这就提供了在实例对象中调用父类方法的途径
                    if (baseClass) {
                        this.baseprototype = baseClass.prototype;
                    }
                    this.init.apply(this, arguments);
                }
            }

            // 如果此类需要从其它类扩展
            if (baseClass) {
                initializing = true;
                F.prototype = new baseClass();
                F.prototype.constructor = F;
                initializing = false;
            }

            // 覆盖父类的同名函数
            for (var name in prop) {
                if (prop.hasOwnProperty(name)) {
                    // 如果此类继承自父类baseClass并且父类原型中存在同名函数name
                    if (baseClass &&
                        typeof (prop[name]) === "function" &&
                        typeof (F.prototype[name]) === "function") {
                        // 重定义函数name -
                        // 首先在函数上下文设置this.base指向父类原型中的同名函数
                        // 然后调用函数prop[name]，返回函数结果
                        // 注意：这里的自执行函数创建了一个上下文，这个上下文返回另一个函数，
                        // 此函数中可以应用此上下文中的变量，这就是闭包（Closure）。
                        // 这是JavaScript框架开发中常用的技巧。
                        F.prototype[name] = (function(name, fn) {
                            return function() {
                                this.base = baseClass.prototype[name];
                                return fn.apply(this, arguments);
                            };
                        })(name, prop[name]);

                    } else {
                        F.prototype[name] = prop[name];
                    }
                }
            }
            return F;
        };
        return jCls;
    })();

    function NodeSelection(paper) {
        //this.paper = paper;
        var selectNodes = [];

        function _removeSymbo(node) {
            node.setUnFocusedStyle();
            var symbo = node.selectSymbo;
            if (symbo) {
                symbo.remove();
            }
            delete node.selectSymbo;
        };


        function _addOneNode(node) {
            selectNodes.push(node);
            _mark(node);
        };

        /**
         * 	0     1      2
         *  #     #      #
         * 	# 7          #3
         * 	#     #      #
         *  6     5      4
         */
        function _mark (node) {
            var ct = node.getBox();
            var box = ct.getBBox();
            var bs = 6;
            var x = box.x - bs/2 , y = box.y - bs/2;
            var w = box.width;
            var h = box.height;
            var handle = [];
            handle[0] = paper.rect(x, y, bs, bs);
            handle[1] = paper.rect(x + w/2, y, bs, bs);
            handle[2] = paper.rect(x + w, y, bs, bs);
            handle[3] = paper.rect(x + w, y + h/2, bs, bs);
            handle[4] = paper.rect(x + w, y + h, bs, bs);
            handle[5] = paper.rect(x + w/2, y + h, bs, bs);
            handle[6] = paper.rect(x, y + h, bs, bs);
            handle[7] = paper.rect(x, y + h/2, bs, bs);
            var g = paper.g();
            for (var i=0; i<handle.length; i++) {
                handle[i].attr("class","fc-handler");
                g.add(handle[i]);
            }
            node.selectSymbo = g;
            node.setFocusedStyle();
        };

        return {
            add: function (node) {
                this.clear();
                _addOneNode(node);
            },

            clear: function() {
                for (var i = selectNodes.length-1; i >= 0; i--) {
                    _removeSymbo(selectNodes[i]);
                }
                selectNodes = [];
            },

            contains: function(node) {
                return selectNodes.indexOf(node) > -1;
            }
        };
    }

   function Drawer(board) {
        var paper = board.paper;
        var svgTypeMap = {};
        var extOpt ={
            circle: function(attrs) {
                if (!attrs.cx) {
                    attrs.cx = attrs.x;
                }
                if (!attrs.cy) {
                    attrs.cy = attrs.y;
                }
            }
        }
        return {
            draw: function(cmd, attrs) {
                if (paper[cmd]) {
                    if (extOpt[cmd]) {
                        extOpt[cmd](attrs);
                    }
                    return paper.el(cmd).attr(attrs);
                } else {
                    return this.svg(attrs);
                }
            },

            drawText: function(attrs) {
                return paper.el('text').attr($.extend({}, attrs, attrs.Font));
            },

            svg: function(attrs) {
                var type = attrs.type;
                if (!svgTypeMap[type]) {
                    if (board.contextHandler) {
                        var paras = {cmd: "getUserSVGFile", service:"FlatCanvas", type: type}
                        var content = board.contextHandler.queryData(paras);
                        var fragment = Snap.parse(content);
                        var template = fragment.select('svg');
                        paper.append(fragment);
                        svgTypeMap[type] = template.toDefs();
                    }
                }
                var userDef = svgTypeMap[type];
                var u = userDef.use().attr({x: attrs.x, y: attrs.y});
                return u;
            }
        }
    }


    var Graph = jClass({

        init: function(paperHandle, options) {
            $.extend(this, options);
            this.paperHandle = paperHandle;
            this.paper = paperHandle.getPaper();
            this.initGroup();
            this.els = [];
            this.__classes__ = [];
            this.focusedClass = "focused";
            this.mouseoverClass = "mouseover";
        },

        initGroup: function() {
            this.group = this.paper.g();
            this.group.attr('id', this.id);
            this.bindDefaultEvents();
        },

        getGroup: function() {
            return this.group;
        },

        getBox: function() {
            return this.group;
        },

        getBBox: function() {
            return this.group.getBBox();
        },

        addNode: function(node) {
            this.group.add(node);
            this.els.push(node);
        },

        moveTo:function(x, y) {
            this.getBox().attr({
                x: x,
                y: y
            });
        },

        isSelected: function() {
            return this.paperHandle.isSelected(this);
        },

        select: function() {
            this.paperHandle.select(this);
        },

        getNodeEdges: function() {
            return this.paperHandle.getNodeEdges(this);
        },

        bindEvents: function(target, events) {
            var self = this;
            if (events) {
                for (var key in events) {
                    target[key](function() {
                        //if (self.selectionHandler) {
                        //self.selectionHandler.select(self);
                        //}
                        //alert(events[key]);
                    });
                }
            }
        },

        bindDefaultEvents: function() {
            var self = this;
            var box = this.getBox();
            if (box) {
                box.mouseover(function() {
                    !self.isSelected() && self.setMouseoverStyle();
                });

                box.mouseout(function() {
                    !self.isSelected() && self.setMouseoutStyle();
                });

                box.mousedown(function() {
                    !self.isSelected() && self.select();
                });
            }
        },

        setUnFocusedStyle: function() {
            this.removeClass(this.focusedClass, true);
        },

        setFocusedStyle: function() {
            this.removeClass(this.mouseoverClass + " " + this.focusedClass, true);
            this.addClass(this.focusedClass, true);
        },

        setMouseoverStyle: function() {
            if (!this.getBox().hasClass(this.focusedClass)) {
                this.removeClass(this.mouseoverClass + " " + this.focusedClass, false);
                this.addClass(this.mouseoverClass, false);
                var edges = this.getNodeEdges();
                for (var i=0; i<edges.length ; i++) {
                    edges[i].setMouseoverStyle();
                }
            }
        },

        setMouseoutStyle: function() {
            if (!this.getBox().hasClass(this.focusedClass)) {
                this.removeClass(this.mouseoverClass, true);
                var edges = this.getNodeEdges();
                for (var i=0; i<edges.length ; i++) {
                    edges[i].setMouseoutStyle();
                }
            }
        },

        addClass: function(cls, includeLinks) {
            this.getBox().addClass(cls);
            this._addClass(this.els, cls);
            if (includeLinks) {
                var edges = this.getNodeEdges();
                for (var i=0; i<edges.length ; i++) {
                    edges[i].addClass(cls, false);
                }
            }
        },

        removeClass: function(cls, includeLinks) {
            this.getBox().removeClass(cls);
            this._removeClass(this.els, cls);
            if (includeLinks) {
                var edges = this.getNodeEdges();
                for (var i=0; i<edges.length ; i++) {
                    edges[i].removeClass(cls, false);
                }
            }
        },

        _addClass: function (els, cls) {
            var add = function(el, cls) {
                el && el.addClass(cls);
            };

            if (els) {
                if (Snap.is(els, "Array")) {
                    for (var i=0; i<els.length; i++) {
                        add(els[i], cls);
                    }
                } else add(els, cls);
            }
        },

        _removeClass: function (els, cls) {
            var remove = function(el, cls) {
                el && el.removeClass(cls);
            };

            if (els) {
                if (Snap.is(els, "Array")) {
                    for (var i=0; i<els.length; i++) {
                        remove(els[i], cls);
                    }
                } else remove(el, cls);
            }
        }
    });

    var Section = jClass(Graph, {
        captionHAlign: 0,

        captionVAlign: 1,

        isCaptionOutShape: true,

        init: function(meta, paperHandle) {
            this.base(paperHandle, meta);
            this.meta = meta;
            $.extend(this, meta.Graph);
            $.extend(this, meta.DataBind);
            this.drawer = paperHandle.getDrawer();
            this.draw();
            if ("polyline" != meta.Graph.type) {
                this.setCaption(meta.caption);
            }
            //if (this.maxamount) {
            //    this._maxamount = Number(this.maxamount);
           // }
            this.children = [];
        },

        draw: function() {
            var graph = this.meta.Graph;
            this.node = this.drawer.draw(graph.type, graph);
            if (this.node) {
                this.addNode(this.node);
                var that = this;
                this.node.dblclick(function(e) {
                    var handler = that.paperHandle.getContextHandler();
                    if (handler) {
                        handler.fireDBClick(e, that.ondblclick);
                    }
                });
                this.node.click(function(e) {
                    var handler = that.paperHandle.getContextHandler();
                    if (handler && handler.fireClick) {
                        handler.fireClick(e, that.onclick);
                    }
                });
            }

            var texts = graph.TextCollection;
            if (texts) {
                for (var i = 0; i<texts.length; i ++) {
                    if (!$.fn.hasVariables(texts[i].text) && !$.fn.isExp(texts[i].text)) {
                        this.drawer.drawText(texts[i]);
                    }
                }
            }
        },

        addSection: function(section) {
            this.children.push(section);
        },

        getSignKey: function() {
            return this.signkey;
        },

        setAmount: function(amount) {
            this.amount = amount;
        },

        isTableSection: function() {
            return this.tablekey && this.tablekey.length > 0 ;
        },

        loadTextData: function(setting, dataTable) {
            var evalHandler = this.paperHandle.getContextHandler();
            var graph = this.meta.Graph;
            graph.x = parseInt(graph.x);
            graph.y = parseInt(graph.y);
            var texts = graph.TextCollection;
            if (texts) {
                for (var j = 0; j<texts.length; j ++) {
                    var metaText = $.extend(true, {}, texts[j]) ;
                    var text = metaText.text;
                    text = evalHandler.eval(text, dataTable);
                    metaText.text = text;
                    metaText.x = parseInt(metaText.x);
                    metaText.y = parseInt(metaText.y);
                    if (metaText.offsetX) {
                        metaText.x = graph.x + metaText.offsetX;
                    }
                    if (metaText.offsetY) {
                        metaText.y = graph.y + metaText.offsetY;
                    }
                    this.drawer.drawText(metaText);
                }
            }
            this.updateStatus(setting, dataTable);
        },

        loadData: function(setting, dataTable) {
            if (this.signvalue && setting && setting.rowmap ) {
                var evalHandler = this.paperHandle.getContextHandler();
                var signValue = evalHandler ? evalHandler.eval(this.signvalue, dataTable) : this.signvalue;
                var pos = setting.rowmap[signValue];
                if (pos) dataTable.setPos(pos);
                this.loadTextData(setting, dataTable);
               /* for (var i=0; i<dataTable.rows.length; i++ ) {
                    dataTable.setPos(i);
                    var evalHandler = this.paperHandle.getContextHandler();
                    var signValue = evalHandler ? evalHandler.eval(this.signvalue, dataTable) : this.signvalue;
                    if (dataTable.getByKey(setting.signkey) == signValue) {
                        this.loadTextData(setting, dataTable);
                    }
                }*/
            }

            for (var i=0; i<this.children.length; i++ ) {
                var child = this.children[i];
                child.loadData(setting, dataTable);
            }
        },

        updateStatus: function(setting, dataTable) {
            var evalHandler = this.paperHandle.getContextHandler();
            var fillExp = this.statusfill || (setting && setting.statusfill);
            if (fillExp && evalHandler) {
                var fill =  evalHandler.eval(fillExp, dataTable);
                this.node.attr('fill', fill);
            }
            /*if (this.amount && this._maxamount) {
                if (this.amount == 0) {
                    this.node.attr('fill', '#ffffff');
                } else if (this.amount > 0 && this.amount < this._maxamount) {
                    this.node.attr('fill', '#666666');
                } else if (this.amount >= this._maxamount) {
                    this.node.attr('fill', '#f00');
                }
            }*/
        },

        getBounds: function() {
            return this.getBox().getBBox();
        },

        setCaption: function(caption) {
            if (!!caption) {
                var attrs = {text: caption};
                var text = this.drawer.drawText(attrs);
                this.showcaption &&  YIUI.TypeConvertor.toBoolean(this.showcaption) && this.updateCaptionPos(text, HAlignment.CENTER, VAlignment.BOTTOM, true);
            }
        },

        updateCaptionPos: function(text, hAlign, vAlign, isCaptionOutShape) {
            var bounds = this.getBounds();
            var minX = bounds.x, minY = bounds.y;
            var w = bounds.width, h = bounds.height;
            var maxX = minX + w, maxY = minY + h;
            var captionWidth = text.getBBox().width;
            var captionHeight = text.getBBox().height;

            var captionX = 0, captionY = 0;
            switch (hAlign) {
                case HAlignment.LEFT:
                    captionX = minX;
                    if (isCaptionOutShape) {
                        captionX -= 2 * captionWidth;
                    }
                    break;
                case HAlignment.CENTER:
                    captionX = (minX + maxX - captionWidth)/ 2 ;
                    break;
                case HAlignment.RIGHT:
                    captionX = maxX - captionWidth - 5;
                    if (this.isCaptionOutShape) {
                        captionX += captionWidth + 5;
                    }
                    break;
            }

            switch (vAlign) {
                case VAlignment.TOP:
                    captionY = minY;
                    if (isCaptionOutShape) {
                        captionY -= 2 * captionHeight;
                    }
                    break;
                case VAlignment.CENTER:
                    captionY = (minY + maxY - captionHeight) / 2;
                    break;
                case VAlignment.BOTTOM:
                    captionY = maxY - captionHeight - 2;
                    if (isCaptionOutShape) {
                        captionY += captionHeight + 15;
                    }
                    break;
            }

            text.attr({x:captionX, y: captionY});
        }
    });


   function FlatCanvas(w, h) {
        this.width = w;
        this.height = h;
        this.board = Snap(w, h);
        this.$el = $(this.board.node);
        this.paper = this.board.paper;
        this.selection = new NodeSelection(this.paper);
        var self = this;
        this.paperHandle = {
            getPaper: function() {
                return self.paper;
            },
            select: function(node) {
                self.selection.add(node);
            },
            getNodeEdges: function(node) {
                var allEdges = self.edges;
                var edges = [];
                for (var i = allEdges.length - 1; i >= 0; i--) {
                    var edge = allEdges[i];
                    if(edge.from == node  || edge.to == node){
                        edges.push(edge);
                    }
                };
                return edges;
            },
            isSelected: function(node) {
                return self.selection.contains(node);
            },
            getDrawer: function() {
                return self.drawer;
            },
            getContextHandler: function() {
                return self.contextHandler;
            }
        };
        this.nodesMap = {};
        this.nodes = [];
        this.edges = [];
        this.drawer = new Drawer(this);
        this.root = new Section({Graph:{type:'text', x: 0, y:0}}, this.paperHandle);
        this.sectionViews = {};
        this.tableSections = [];

        var fillGrid = function(){
            //M10-5-10,15M15,0,0,15M0-5-20,15
            var p = self.paper.path(Snap.format("M0,0V{height}M0,0H{width}", {
                    width: self.width,
                    height: self.height
                })).attr({
                    fill: "none",
                    stroke: "#beceeb",
                    strokeWidth: 1
                }).pattern(0, 0, 10, 10);

            self.paper.rect(0, 0, self.width, self.height).attr({
                fill: p
            });
        };
        fillGrid();

        var isVisible = function(section, dataTable) {
            var visible = true;
            if (section.visible) {
                var a = 1;
            }
            if (section.visible && self.contextHandler) {
                visible = YIUI.TypeConvertor.toBoolean(self.contextHandler.eval(section.visible, dataTable));
            }
            return visible;
        };
        var _loadSections = function(metaSection, parent) {
            if (isVisible(metaSection)) {
                var metaChildSections = metaSection.SectionCollection;
                if (metaChildSections) {
                    for (var i=0; i<metaChildSections.length; i++) {
                        var metaChildSection = metaChildSections[i];
                        var section = new Section(metaChildSection, self.paperHandle);
                        parent.addSection(section);
                        self.sectionViews[section.key] = section;
                        if (section.isTableSection()) {
                            self.tableSections.push(section);
                        }
                        _loadSections(metaChildSection, section);
                    }
                }
            }
        };

        var _loadTree = function(data, tempMeta, level, parent) {
            self.levels = self.levels || {};
            self.levels[level] = self.levels[level] || 0;
            var pos = self.levels[level];


            var children = data["__children__"];
            if (!children) {
                return;
            }

            for (var i=0; i<children.length; i++ ) {
                tempMeta.Graph.x = 100 * (level + 1);
                self.levels[level] += 70;
                tempMeta.Graph.y = this.levels[level];
                var section = new Section(tempMeta, self.paperHandle);
                section.addSection(section);
                if (parent) {
                    var edge = new Edge(self.paperHandle, {
                        from: parent,
                        to: section,
                        label: ""
                    });
                    self.edges.push(edge);
                    edge.draw();
                }
                this._loadTree(children[i], tempMeta, level + 1, section);
            }
        };

        var _calcChildOffSet = function(metaSection) {
           var parentGraph = metaSection.Graph;
           //计算相对偏移量
           var texts = parentGraph.TextCollection;
           if (texts) {
               for (var j = 0; j<texts.length; j ++) {
                   texts[j].x = parseInt(texts[j].x);
                   texts[j].y = parseInt(texts[j].y);
                   texts[j].offsetX = texts[j].x - parentGraph.x;
                   texts[j].offsetY = texts[j].y - parentGraph.y;
               }
           }
           var childSections = metaSection.SectionCollection;
           if (childSections) {
               for (var i=0; i<childSections.length; i++) {
                   //计算相对偏移量
                   var metaChildSection = childSections[i];
                   var graph = metaChildSection.Graph;
                   graph.x = parseInt(graph.x);
                   graph.y = parseInt(graph.y);
                   graph.offsetX = graph.x - parentGraph.x;
                   graph.offsetY = graph.y - parentGraph.y;
                   _calcChildOffSet(metaChildSection);
               }
           }
       };

        var _calcSignRowMap = function (dataTable, signkey) {
            if (!dataTable || !signkey) return;
            var rowmap = {};
            for (var i=0; i<dataTable.rows.length; i++ ) {
                dataTable.setPos(i);
                var signValue = dataTable.getByKey(signkey);
                rowmap[signValue] = i;
            }
            return rowmap;
        };

        var dataLoader = {
            row : function(tableSection, dataTable) {

                var rowmap = _calcSignRowMap(dataTable, tableSection.signkey);
                tableSection.loadData(
                        {
                            signkey: tableSection.signkey, statusfill: tableSection.statusfill, rowmap: rowmap
                        },
                        dataTable);
            },

            table: function(tableSection, dataTable) {
                if (!isVisible(tableSection, dataTable)) return;
                if (!tableSection.children || !tableSection.children[0]) return;

                var box = tableSection.getBBox();
                var template = tableSection.children[0];

                var tempMeta = $.extend(true, {}, template.meta);
                var graph = tempMeta.Graph;
                var startX = graph.x,
                     width = parseInt(tempMeta.Graph.width),
                     height = parseInt(tempMeta.Graph.height),
                     maxWidth = tableSection.width;
                _calcChildOffSet(tempMeta);
                if (template) {
                    for (var i=0; i<dataTable.rows.length; i++ ) {
                        dataTable.setPos(i);
                        if (!isVisible(tempMeta, dataTable)) continue;
                        var childSection = new Section(tempMeta, self.paperHandle);
                        var setting = {
                            signkey: tableSection.signkey, statusfill: tableSection.statusfill
                        };
                        childSection.loadTextData( setting , dataTable);
                        tableSection.addSection(childSection);
                        this._loadChildSection(tempMeta, childSection, dataTable, setting);

                        graph.x = graph.x + width + 5;
                        if (graph.x + width + 5  > maxWidth) {
                            graph.x = startX;
                            graph.y = graph.y + height + 5;
                        }
                    }
                }
            },

            _loadChildSection: function(metaParent, parent, dataTable, setting) {
                var parentGraph = metaParent.Graph;
                var childSections = metaParent.SectionCollection;
                if (childSections) {
                    for (var i=0; i<childSections.length; i++) {
                        var jsonChild = childSections[i];
                        if (!isVisible(jsonChild, dataTable)) continue;
                        jsonChild.Graph.x = parentGraph.x +  jsonChild.Graph.offsetX;
                        jsonChild.Graph.y = parentGraph.y +  jsonChild.Graph.offsetY;
                        var section = new Section(jsonChild, self.paperHandle);
                        section.loadTextData(setting, dataTable);
                        parent.addSection(section);
                        if (jsonChild) {
                            this._loadChildSection(jsonChild, section, dataTable);
                        }
                    }
                }
            }
        };

        return {
            setContextHandler: function(contextHandler) {
                self.contextHandler = contextHandler;
            },

            loadView: function(meta) {
                var jsonSections = meta;
                _loadSections(meta, self.root);
            },

            loadDocData: function(doc) {
                for (var i=0; i<self.tableSections.length; i++) {
                    var section = self.tableSections[i];
                    var tablekey = section.tablekey;
                    var tableData = doc.getByKey(tablekey);//data[tablekey];
                    dataLoader[section.standfor](section, tableData);
                }
            },

/*            loadSvgData: function(doc) {
                for (var i=0; i<self.tableSections.length; i++) {
                    var section = self.tableSections[i];
                    var tablekey = section.tablekey;
                    var tableData = doc.getByKey(tablekey);//data[tablekey];
                    section.loadData(
                        {
                            signkey: section.signkey, amountkey: section.amountkey
                        },
                        tableData);
                }
            },

            loadTableData: function(data) {
                for (var i=0; i<self.tableSections.length; i++) {
                    var section = self.tableSections[i];
                    var box = section.getBBox();
                    var template = section.children[0];
                    var tempbox = template.getBBox();

                    var tablekey = section.tablekey;
                    var tableData = data[tablekey];

                    var tempMeta = $.extend({}, template.meta)
                    var startX = tempMeta.Graph.x;

                    if (template) {
                        var colIndex = 0, rowIndex =0;
                        for (var i=0; i<tableData.length; i++ ) {
                            tempMeta.caption = tableData[i].code;
                            var section = new Section(tempMeta, self.paperHandle);

                            section.addSection(section);
                            tempMeta.Graph.x = parseInt(tempMeta.Graph.x) + 60;
                            colIndex ++;
                            if (colIndex >= 10) {
                                colIndex = 0;
                                tempMeta.Graph.x = startX;
                                rowIndex ++;
                                tempMeta.Graph.y = parseInt(tempMeta.Graph.y) + 70;
                            }
                        }
                    }

                }
            },
 */
            loadTreeData: function(data) {
                for (var i=0; i<self.tableSections.length; i++) {
                    var section = self.tableSections[i];
                    var box = section.getBBox();
                    var treeRoot = section.children[0];
                    var rootBox = treeRoot.getBBox();

                    var tablekey = section.tablekey;
                    var tableData = data[tablekey];

                    if (treeRoot) {
                        treeRoot.meta.Graph.x = 120;
                        self._loadTree(tableData, treeRoot, 1, treeRoot);
                    }
                }
            },

            select: function(x, y) {
                var section = self.hitSection(x, y);
                if (section) {
                    self.selection.add(section);
                } else {
                    self.selection.clearAll();
                }
            },

            hitSection: function(x , y) {
                var selectedSection;
                var tempForests = Number.MAX_SAFE_INTEGER;

                for(var key in self.sectionViews){
                    var sectionView = self.sectionViews[key];
                    var bounds = sectionView.getBounds();
                    if (x > bounds.x && y > bounds.y
                        && x < bounds.x2 && y < bounds.y2) {
                        var forests = bounds.width * bounds.height;
                        if (forests < tempForests) {
                            selectedSection = sectionView;
                            tempForests = forests;
                        }
                    }
                }
                return selectedSection;
            },

            getSection: function(key) {
                return self.sectionViews[key];
            },

            loadData: function(data) {
                var dataNodes = data.nodes;
                for (var i=0; i<dataNodes.length ; i++) {
                    var nd = dataNodes[i] || {};
                    var node = new Node(self.paperHandle, nd);
                    self.nodesMap[nd.id] = node;
                    self.nodes.push(node);
                }

                var dataEdges = data.edges;
                for (var i=0; i<dataEdges.length ; i++) {
                    var ed = dataEdges[i];
                    var edge = new Edge(self.paperHandle, {
                        from: self.nodesMap[ed.from],
                        to: self.nodesMap[ed.to],
                        label: ed.text
                    });
                    self.edges.push(edge);
                }
            },

            render: function($parent) {
                $parent.append(self.$el);
            }

        };
   }

   Snap.plugin(function (Snap, Element, Paper, glob) {
        glob.win.FlatCanvas = FlatCanvas;
   });
})(jQuery);

