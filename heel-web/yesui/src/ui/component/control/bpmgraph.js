YIUI.Control.BPMGraph = YIUI.extend(YIUI.Control, {
    /**
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div></div>',
    paper: null,
    nodes: null,
    mX: null,
    mY: null,
    transitions: null,
    swims: null, //泳道
    elements: {},
    nodeElements: {},
    circle_R: 20,//圆半径
    isSourceTop: false,
    isSourceLeft: false,
    transPath: null,
    init: function (option) {
        this.base(option);
    },

    isDataBinding: function() {
        return false;
	},
    isTransPathLine: function (transition) {
        if (this.transPath) {
            var step, srcNode = this.nodeElements[transition.source], tgtNode = this.nodeElements[transition.target];
            for (var i = 0; i < this.transPath["steps"].length; i++) {
                step = this.transPath["steps"][i];
                if (step.source == srcNode.id && step.target == tgtNode.id) {
                    return true;
                }
            }
        }
//        return false;
    	return transition.inpath;
    },

    isPastNodeInPath: function (node) {
        if (this.transPath) {
            for (var i = 0; i < this.transPath["steps"].length; i++) {
                var step = this.transPath["steps"][i];
                if (step.source == node.id) {
                    return true;
                }
            }
        }
        return false;
    },

    isLastNodeInPath: function (node) {
        if (this.transPath) {
//            var lastStep = this.transPath["steps"][this.transPath["steps"].length - 1];
//            if (lastStep && node.id == lastStep.target) {
//                return true;
//            }
            for (var i = 0; i < this.transPath["last"].length; i++) {
                var step = this.transPath["last"][i];
                if (step == node.id) {
                    return true;
                }
            }
        }
//        return false;
    	return node.last;
    },
    //判断是否为IE浏览器
    isIE: function () {
        return $.browser.isIE;
    },

    textFormat: function (text) {
        text.attr("font-style", "normal");
        text.attr("font-weight", "normal");
        text.attr("font-size", "12px");
    },


    onSetHeight: function (height) {
        this.base(height);
//        if (this.hasWidth && this.paper == null) {
//            this.createGraph();
//        }
        this.hasHeight = true;
    },
    onSetWidth: function (width) {
        this.base(width);
        this.el.css("overflow", "auto");
//        if (this.hasHeight && this.paper == null) {
//            this.createGraph();
//        }
        this.hasWidth = true;
    },

    onRender: function (ct) {
        this.base(ct);
        this.createGraph();
    },

    refreshGraph: function() {
    	this.el && this.createGraph();
    },
    
    createGraph: function () {
    	if (!this.paper) {
            this.paper = Raphael(this.id);
        }else{
            this.paper.clear();
        }
        if (this.nodes && this.transitions) {
            var firestNode = this.nodes[0];
            var minX = firestNode.x, maxX = firestNode.x, minY = firestNode.y, maxY = firestNode.y;
            for (var index = 1 , len = this.nodes.length; index < len; index++) {
                var node = this.nodes[index];
                if (node.x < minX) {
                    minX = node.x;
                }
                if (node.x + node.width > maxX) {
                    maxX = node.x + node.width;
                }
                if (node.y < minY) {
                    minY = node.y;
                }
                if (node.y + node.height > maxY) {
                    maxY = node.y + node.height;
                }
            }
//            this.mX = (maxX - minX) / 2 - this.el.width() / 2 + 50;
            this.mX = minX - 20;
            this.mY = minY - 20;
            this.paper.setSize(maxX + Math.abs(this.mX) + 40, maxY + 40);
            for (var index in this.nodes) {
                var node = this.nodes[index];
                var el = this.createNode(node);
                this.elements[node.key] = el;
                this.nodeElements[node.key] = node;
            }

            for (var index in this.transitions) {
                var transition = this.transitions[index];
                var sourceNode = this.nodes[transition.source];
                this.createLine(transition);
            }
        }

        if (this.swims) {
            for (var index in this.swims) {
                var swim = this.swims[index];
                this.createSwim(swim);
            }
        }
        this.hasWidth = false;
        this.hasHeight = false;
    },

    getStrLength: function (str) {
        var cArr = str.match(/[^\x00-\xff]/ig);
        return str.length + (cArr == null ? 0 : cArr.length);
    },

    createSwim: function (swim) {
        var direction = swim.direction;
        if (direction != undefined) {
            if (direction == "Vertical") {
                var swimGraph = this.paper.rect(swim.x, swim.y, swim.width, swim.height, 0);
                swimGraph.toBack();
                swimGraph.attr("stroke", "gray");
                var lt = this.paper.path("M" + swim.x + " " + (swim.y + 2 * this.circle_R) + "L" + (swim.x + swim.width) + " " + (swim.y + 2 * this.circle_R));
                lt.toBack();
                lt.attr("stroke", "gray");
                var text = this.paper.text(swim.x + swim.width / 2, swim.y + this.circle_R, swim.caption);
                if (this.isIE()) {
                    this.textFormat(text);
                }
                text.attr("font-size", "25px");
                if (this.isIE()) {
                    this.textFormat(text);
                }
            } else {
                var swimGraph = this.paper.rect(swim.x, swim.y, swim.height, swim.width, 0);
                swimGraph.toBack()
                swimGraph.attr("stroke", "gray");
                var lt = this.paper.path("M" + (swim.x + 2 * this.circle_R) + " " + swim.y + "L" + (swim.x + 2 * this.circle_R) + " " + (swim.y + swim.width));
                lt.toBack();
                lt.attr("stroke", "gray");
                var text = this.paper.text(swim.x + this.circle_R, (swim.y + swim.width / 2), swim.caption);
                text.attr("font-size", "20px");
                if (this.isIE()) {
                    this.textFormat(text);
                }
            }
        }
    },

    createLine: function (transition) {
        var lineStyle = transition.lineStyle;
        switch (lineStyle) {
            case BPMLineType.STEAIGHT_LINE:
                return this.createSteaightLine(transition);
            case BPMLineType.CHAMFER_CURVE_H_ONE:
                return this.chamferCurveHOne(transition);
            case BPMLineType.CHAMFER_CURVE_V_ONE:
                return this.chamferCurveVOne(transition);
            case BPMLineType.CHAMFER_CURVE_H_TWO:
                return this.chamferCurveHTwo(transition);
            case BPMLineType.CHAMFER_CURVE_V_TWO:
                return this.chamferCurveVTwo(transition);
            case BPMLineType.FILLET_CURVE_H_ONE:
                return this.filletCurveHOne(transition);
            case BPMLineType.FILLET_CURVE_V_ONE:
                return this.filletCurveVOne(transition);
            case BPMLineType.FILLET_CURVE_H_TWO:
                return this.filletCurveHTwo(transition);
            case BPMLineType.FILLET_CURVE_V_TWO:
                return this.filletCurveVTwo(transition);
            case BPMLineType.OBKIQUE_CURVE_H_TWO:
                return this.obkiqueCurveHTwo(transition);
            case BPMLineType.OBKIQUE_CURVE_V_TWO:
                return this.obkiqueCurveVTwo(transition);
            default:
                return null;
        }
    },

    obkiqueCurveVTwoBase: function (sourcePoint, targetPoint, my1, my2, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (sourcePoint.x - this.mX) + " " + (my1 - this.mY));
        lt.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (my1 - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (my2 - this.mY));
        lt2.attr({"stroke-width": "2"});
        var lt3 = this.paper.path("M" + (targetPoint.x - this.mX) + " " + (my2 - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt3.attr({"stroke-width": "2"});
        lt3.attr({"arrow-end": "classic-wide-long"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            lt3.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                lt3.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //垂直方向的三段折线箭头
    obkiqueCurveVTwo: function (transition) {
        var stNode = this.stNode(transition)
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceTop ? this.getBottom(stNode.sourceNode) : this.getTop(stNode.sourceNode);
        var targetPoint = this.isSourceTop ? this.getTop(stNode.targetNode) : this.getBottom(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var my1 = sourcePoint.y + (targetPoint.y - sourcePoint.y) / 3;
            var my2 = sourcePoint.y + (targetPoint.y - sourcePoint.y) / 3 * 2;
            this.obkiqueCurveVTwoBase(sourcePoint, targetPoint, my1, my2, transition);

        }
    },

    obkiqueCurveHTwoBase: function (sourcePoint, targetPoint, mx1, mx2, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (mx1 - this.mX) + " " + (sourcePoint.y - this.mY));
        lt.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (mx1 - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (mx2 - this.mX) + " " + (targetPoint.y - this.mY));
        lt2.attr({"stroke-width": "2"});
        var lt3 = this.paper.path("M" + (mx2 - this.mX) + " " + (targetPoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt3.attr({"stroke-width": "2"});
        lt3.attr({"arrow-end": "classic-wide-long"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            lt3.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                lt3.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    getImagePath: function ( name ) {
        return window.cssPath + '/images/bpmgraph/' + name;
    },

    //水平方向的三段折线箭头
    obkiqueCurveHTwo: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceLeft ? this.getRight(stNode.sourceNode) : this.getLeft(stNode.sourceNode);
        var targetPoint = this.isSourceLeft ? this.getLeft(stNode.targetNode) : this.getRight(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var mx1 = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 3;
            var mx2 = sourcePoint.x + (targetPoint.x - sourcePoint.x) / 3 * 2;
            this.obkiqueCurveHTwoBase(sourcePoint, targetPoint, mx1, mx2, transition)
        }
    },

    filletCurveVTwoBase: function (sourcePoint, targetPoint, my, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (sourcePoint.x - this.mX) + " " + (my - this.mY));
        lt.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (my - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (my - this.mY));
        lt2.attr({"stroke-width": "2"});
        var lt3 = this.paper.path("M" + (targetPoint.x - this.mX) + " " + (my - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt3.attr({"stroke-width": "2"});
        lt3.attr({"arrow-end": "classic-wide-long"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            lt3.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                lt3.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //两个直角折线的箭头， 箭头为垂直方向
    filletCurveVTwo: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceTop ? this.getBottom(stNode.sourceNode) : this.getTop(stNode.sourceNode);
        var targetPoint = this.isSourceTop ? this.getTop(stNode.targetNode) : this.getBottom(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var my = (sourcePoint.y + targetPoint.y) / 2;
            this.filletCurveVTwoBase(sourcePoint, targetPoint, my, transition);
        }
    },

    filletCurveHTwoBase: function (sourcePoint, targetPoint, mx, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (mx - this.mX) + " " + (sourcePoint.y - this.mY));
        lt.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (mx - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (mx - this.mX) + " " + (targetPoint.y - this.mY));
        lt2.attr({"stroke-width": "2"});
        var lt3 = this.paper.path("M" + (mx - this.mX) + " " + (targetPoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt3.attr({"stroke-width": "2"});
        lt3.attr({"arrow-end": "classic-wide-long"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            lt3.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                lt3.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //两个直角折线的箭头， 箭头为水平方向
    filletCurveHTwo: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceLeft ? this.getRight(stNode.sourceNode) : this.getLeft(stNode.sourceNode);
        var targetPoint = this.isSourceLeft ? this.getLeft(stNode.targetNode) : this.getRight(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var mx = (sourcePoint.x + targetPoint.x) / 2;
            this.filletCurveHTwoBase(sourcePoint, targetPoint, mx, transition);
        }
    },

    filletCurveVOneBase: function (sourcePoint, targetPoint, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (sourcePoint.y - this.mY));
        lt.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (targetPoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt2.attr({"arrow-end": "classic-wide-long"});
        lt2.attr({"stroke-width": "2"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //直角折线箭头， 箭头为垂直方向
    filletCurveVOne: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceLeft ? this.getRight(stNode.sourceNode) : this.getLeft(stNode.sourceNode);
        var targetPoint = this.isSourceTop ? this.getTop(stNode.targetNode) : this.getBottom(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            this.filletCurveVOneBase(sourcePoint, targetPoint, transition)
        }
    },

    filletCurveHOneBase: function (sourcePoint, targetPoint, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (sourcePoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (targetPoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt2.attr({"arrow-end": "classic-wide-long"});
        lt2.attr({"stroke-width": "2"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //直角折线箭头， 箭头为水平方向
    filletCurveHOne: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceTop ? this.getBottom(stNode.sourceNode) : this.getTop(stNode.sourceNode);
        var targetPoint = this.isSourceLeft ? this.getLeft(stNode.targetNode) : this.getRight(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            this.filletCurveHOneBase(sourcePoint, targetPoint, transition);
        }
    },

    chamferCurveVTwoBase: function (sourcePoint, targetPoint, dX, dY, rX, rY, my, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (sourcePoint.x - this.mX) + " " + (my + (dY < 0 ? rY : -rY) - this.mY));
        lt.attr({"stroke-width": "2"});
        var sweep = 0;
        if (dY * dX < 0) {
            sweep = 1;
        }
        var arc = lt.paper.path("M" + (sourcePoint.x - this.mX) + " " + (my + (dY < 0 ? rY : -rY) - this.mY) + "A" + rX + " " + rY + " 0 0" + " " + sweep + " " + (sourcePoint.x + (dX < 0 ? -rX : +rX) - this.mX) + " " + (my - this.mY));
        arc.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (sourcePoint.x + (dX < 0 ? -rX : +rX) - this.mX) + " " + (my - this.mY) + "L" + (targetPoint.x + (dX < 0 ? rX : -rX) - this.mX) + " " + (my - this.mY));
        lt2.attr({"stroke-width": "2"});
        var sweep1 = 0;
        if (dY * dX > 0) {
            sweep1 = 1;
        }
        var arc2 = lt.paper.path("M" + (targetPoint.x + (dX < 0 ? rX : -rX) - this.mX) + " " + (my - this.mY) + "A" + rX + " " + rY + " 0 0" + " " + sweep1 + " " + (targetPoint.x - this.mX) + " " + (my + (dY < 0 ? -rY : rY) - this.mY));
        arc2.attr({"stroke-width": "2"});
        var lt3 = this.paper.path("M" + (targetPoint.x - this.mX) + " " + (my + (dY < 0 ? -rY : rY) - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        lt3.attr({"arrow-end": "classic-wide-long"});
        lt3.attr({"stroke-width": "2"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            arc.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
            arc2.attr({"stroke": "red"});
            lt3.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                arc.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                arc2.attr({"stroke-dasharray": "- "});
                lt3.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //采用圆弧过度的双直角折线箭头， 箭头为垂直方向
    chamferCurveVTwo: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceTop ? this.getBottom(stNode.sourceNode) : this.getTop(stNode.sourceNode);
        var targetPoint = this.isSourceTop ? this.getTop(stNode.targetNode) : this.getBottom(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var dY = targetPoint.y - sourcePoint.y;
            var rY = Math.min(Math.abs(dY), 20);
            var dX = targetPoint.x - sourcePoint.x;
            var rX = Math.min(Math.abs(dX), 20);
            var my = (sourcePoint.y + targetPoint.y) / 2;
            this.chamferCurveVTwoBase(sourcePoint, targetPoint, dX, dY, rX, rY, my, transition);
        }
    },

    chamferCurveHTwoBase: function (sourcePoint, targetPoint, dX, dY, rX, rY, mx, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (mx + (dX < 0 ? rX : -rX) - this.mX) + " " + (sourcePoint.y - this.mY));
        lt.attr({"stroke-width": "2"});
        var sweep = 0;
        if (dY * dX > 0) {
            sweep = 1;
        }
        var arc = lt.paper.path("M" + (mx + (dX < 0 ? rX : -rX) - this.mX) + " " + (sourcePoint.y - this.mY) + "A" + rX + " " + rY + " 0 0" + " " + sweep + " " + (mx - this.mX) + " " + (sourcePoint.y + (dY < 0 ? -rY : rY) - this.mY));
        arc.attr({"stroke-width": "2"});
        var lt2 = this.paper.path("M" + (mx - this.mX) + " " + (sourcePoint.y + (dY < 0 ? -rY : rY) - this.mY) + "L" + (mx - this.mX) + " " + (targetPoint.y + (dY < 0 ? rY : -rY) - this.mY));
        lt2.attr({"stroke-width": "2"});
        var sweep1 = 0;
        if (dY * dX < 0) {
            sweep1 = 1;
        }
        var arc2 = lt.paper.path("M" + (mx - this.mX) + " " + (targetPoint.y + (dY < 0 ? rY : -rY) - this.mY) + "A" + rX + " " + rY + " 0 0" + " " + sweep1 + " " + (mx + (dX < 0 ? -rX : +rX) - this.mX) + " " + (targetPoint.y - this.mY));
        arc2.attr({"stroke-width": "2"});
        var lt3 = this.paper.path("M" + (mx + (dX < 0 ? -rX : +rX) - this.mX) + " " + (targetPoint.y - this.mY) + "L" + targetPoint.x + " " + (targetPoint.y - this.mY));
        lt3.attr({"arrow-end": "classic-wide-long"});
        lt3.attr({"stroke-width": "2"})
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            arc.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
            arc2.attr({"stroke": "red"});
            lt3.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                arc.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                arc2.attr({"stroke-dasharray": "- "});
                lt3.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //采用圆弧过度的双直角折线箭头， 箭头为水平方向
    chamferCurveHTwo: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceLeft ? this.getRight(stNode.sourceNode) : this.getLeft(stNode.sourceNode);
        var targetPoint = this.isSourceLeft ? this.getLeft(stNode.targetNode) : this.getRight(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var dY = targetPoint.y - sourcePoint.y;
            var rY = Math.min(Math.abs(dY), 20);
            var dX = targetPoint.x - sourcePoint.x;
            var rX = Math.min(Math.abs(dX), 20);
            var mx = (sourcePoint.x + targetPoint.x) / 2;
            this.chamferCurveHTwoBase(sourcePoint, targetPoint, dX, dY, rX, rY, mx, transition)
        }
    },

    chamferCurveVOneBase: function (sourcePoint, targetPoint, dX, dY, rX, rY, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (targetPoint.x - this.mX + (dX < 0 ? rX : -rX)) + " " + (sourcePoint.y - this.mY));
        lt.attr({"stroke-width": "2"});
        var sweep = 0;
        if (dY * dX > 0) {
            sweep = 1;
        }
        var arc = lt.paper.path("M" + (targetPoint.x + (dX < 0 ? rX : -rX) - this.mX) + " " + (sourcePoint.y - this.mY) + "A" + rX + " " + rY + " 0 0" + " " + sweep + " " + (targetPoint.x - this.mX) + " " + (sourcePoint.y + (dY < 0 ? -rY : rY) - this.mY));
        arc.attr({"stroke-width": "2"});
        if (sweep == 0) {
            var lt2 = arc.paper.path("M" + (targetPoint.x - this.mX) + " " + (sourcePoint.y + (dY < 0 ? -rY : rY) - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
            lt2.attr({"arrow-end": "classic-wide-long"});
            lt2.attr({"stroke-width": "2"});
        } else {
            var lt2 = arc.paper.path("M" + (targetPoint.x - this.mX) + " " + (sourcePoint.y + (dY < 0 ? -rY : rY) - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
            lt2.attr({"arrow-end": "classic-wide-long"});
            lt2.attr({"stroke-width": "2"});
        }
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            arc.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                arc.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //采用圆弧过度的直角折线箭头， 箭头为垂直方向
    chamferCurveVOne: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceLeft ? this.getRight(stNode.sourceNode) : this.getLeft(stNode.sourceNode);
        var targetPoint = this.isSourceTop ? this.getTop(stNode.targetNode) : this.getBottom(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var dY = targetPoint.y - sourcePoint.y;
            var rY = Math.min(Math.abs(dY), 20);
            var dX = targetPoint.x - sourcePoint.x;
            var rX = Math.min(Math.abs(dX), 20);
            this.chamferCurveVOneBase(sourcePoint, targetPoint, dX, dY, rX, rY, transition);
        }
    },

    chamferCurveHOneBase: function (sourcePoint, targetPoint, dX, dY, rX, rY, transition) {
        var lt = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (sourcePoint.x - this.mX) + " " + (targetPoint.y + (dY < 0 ? rY : -rY) - this.mY));
        lt.attr({"stroke-width": "2"});
        var sweep = 0;
        if (dY * dX < 0) {
            sweep = 1;
        }
        var arc = lt.paper.path("M" + (sourcePoint.x - this.mX) + " " + (targetPoint.y + (dY < 0 ? rY : -rY) - this.mY) + "A" + rX + " " + rY + " 0 0" + " " + sweep + " " + (sourcePoint.x - this.mX + (dX < 0 ? -rX : rX)) + " " + (targetPoint.y - this.mY));
        arc.attr({"stroke-width": "2"});
        var lt2 = arc.paper.path("M" + (sourcePoint.x + rX - this.mX) + " " + (targetPoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + targetPoint.y - this.mY);
        lt2.attr({"arrow-end": "classic-wide-long"});
        lt2.attr({"stroke-width": "2"});
        if (this.isTransPathLine(transition)) {
            lt.attr({"stroke": "red"});
            arc.attr({"stroke": "red"});
            lt2.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                lt.attr({"stroke-dasharray": "- "});
                arc.attr({"stroke-dasharray": "- "});
                lt2.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = lt.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5 - this.mX), (circle_center.y - 8.5 - this.mY), 17, 17);
                break;
        }
    },

    //采用圆弧过度的直角折线箭头， 箭头为水平方向
    chamferCurveHOne: function (transition) {
        var stNode = this.stNode(transition);
        this.brokenLine(stNode.sourceNode, stNode.targetNode);
        var sourcePoint = this.isSourceTop ? this.getBottom(stNode.sourceNode) : this.getTop(stNode.sourceNode);
        var targetPoint = this.isSourceLeft ? this.getLeft(stNode.targetNode) : this.getRight(stNode.targetNode);
        if (sourcePoint != null && targetPoint != null) {
            var dY = targetPoint.y - sourcePoint.y;
            var rY = Math.min(Math.abs(dY), 20);
            var dX = targetPoint.x - sourcePoint.x;
            var rX = Math.min(Math.abs(dX), 20);
            this.chamferCurveHOneBase(sourcePoint, targetPoint, dX, dY, rX, rY, transition);
        }
    },

    steaightLineBase: function (sourcePoint, targetPoint, transition) {
        var line = this.paper.path("M" + (sourcePoint.x - this.mX) + " " + (sourcePoint.y - this.mY) + "L" + (targetPoint.x - this.mX) + " " + (targetPoint.y - this.mY));
        line.attr({"arrow-end": "classic-wide-long"});
        line.attr({"stroke-width": "2"});
        if (this.isTransPathLine(transition)) {
            line.attr({"stroke": "red"});
        }
        switch (transition.tagName) {
            case "association" :
                line.attr({"stroke-dasharray": "- "});
                break;
            case "exception-flow" :
                var circle_center = line.getPointAtLength(8.5),
                    imagePath = this.getImagePath("ExceptionFlow-icon.png");
                var image = this.paper.image(imagePath, (circle_center.x - 8.5), (circle_center.y - 8.5), 17, 17);
                break;
        }
    },

    createSteaightLine: function (transition) {
        var stNode = this.stNode(transition)
        var sourceGraph = this.elements[stNode.sourceNodeKey];
        var targetGraph = this.elements[stNode.targetNodeKey];
        var sourcePoint = this.getSourcePoint(sourceGraph, stNode.targetNode, stNode.sourceNode);
        var targetPoint = this.getTargrtPoint(targetGraph, stNode.targetNode, stNode.sourceNode);
        if (sourcePoint != null && targetPoint != null) {
            this.steaightLineBase(sourcePoint, targetPoint, transition)
        }
    },

    getCenter: function (node) {
        var type = this.elements[node.key].type;
        var center = {};
        if (type == 'circle') {
            center.x = node.x + this.circle_R;
            center.y = node.y + this.circle_R;
        }
        if (type == 'rect') {
            center.x = node.x + node.width / 2;
            center.y = node.y + node.height / 2;
        }
        if (type == 'set') {
            center.x = node.x + 25;
            center.y = node.y + 25;
        }
        return center;
    },

    getTop: function (node) {
        var type = this.elements[node.key].type;
        var top = {};
        if (type == "circle") {
            top.x = node.x + this.circle_R;
            top.y = node.y;
        }
        if (type == "rect") {
            top.x = node.x + node.width / 2;
            top.y = node.y;
        }
        if (type == "set") {
            top.x = node.x + 25;
            top.y = node.y;
        }
        return top;
    },

    getBottom: function (node) {
        var type = this.elements[node.key].type;
        var bottom = {};
        if (type == "circle") {
            bottom.x = node.x + this.circle_R;
            bottom.y = node.y + 2 * this.circle_R;
        }
        if (type == "rect") {
            bottom.x = node.x + node.width / 2;
            bottom.y = node.y + node.height;
        }
        if (type == "set") {
            bottom.x = node.x + 25;
            bottom.y = node.y + 50;
        }
        return bottom;
    },

    getLeft: function (node) {
        var type = this.elements[node.key].type;
        var left = {};
        if (type == "circle") {
            left.x = node.x;
            left.y = node.y + this.circle_R;
        }
        if (type == "rect") {
            left.x = node.x;
            left.y = node.y + node.height / 2;
        }
        if (type == "set") {
            left.x = node.x;
            left.y = node.y + 25;
        }
        return left;
    },

    getRight: function (node) {
        var type = this.elements[node.key].type;
        var right = {};
        if (type == "circle") {
            right.x = node.x + 2 * this.circle_R;
            right.y = node.y + this.circle_R;
        }
        if (type == "rect") {
            right.x = node.x + node.width;
            right.y = node.y + node.height / 2;
        }
        if (type == "set") {
            right.x = node.x + 50;
            right.y = node.y + 25;
        }

        return right;
    },

    getSourcePoint: function (sourceGraph, targetNode, sourceNode) {
        if (sourceGraph.type == "circle") {
            var sourcePoint = this.getCircleLineIntersectPoint(sourceNode, targetNode);
            return sourcePoint;
        }

        if (sourceGraph.type == "rect") {
            var sourcePoint = this.getRectLineIntersectPoint(sourceNode, targetNode);
            return sourcePoint;
        }
        if (sourceGraph.type == "set") {
            var sourcePoint = this.getDiamondLineIntersectPoint(sourceNode, targetNode);
            return sourcePoint;
        }
        return null;
    },

    getTargrtPoint: function (targetGraph, targetNode, sourceNode) {
        if (targetGraph.type == "circle") {
            var targetPoint = this.getCircleLineIntersectPoint(targetNode, sourceNode);
            return targetPoint;
        }

        if (targetGraph.type == "rect") {
            var targetPoint = this.getRectLineIntersectPoint(targetNode, sourceNode);
            return targetPoint;
        }
        if (targetGraph.type == "set") {
            var targetPoint = this.getDiamondLineIntersectPoint(targetNode, sourceNode);
            return targetPoint;
        }
        return null;
    },

    getCircleLineIntersectPoint: function (sourceNode, targetNode) {
        var vx = this.getCenter(targetNode).x - sourceNode.x - this.circle_R;
        var vy = this.getCenter(targetNode).y - sourceNode.y - this.circle_R;

        var calX = (sourceNode.x + this.circle_R) - this.getCenter(targetNode).x;
        var calY = (sourceNode.y + this.circle_R) - this.getCenter(targetNode).y;

        var distance = Math.pow((calX * calX + calY * calY), 0.5);

        if (distance < this.circle_R) {
            return;
        }

        var px = sourceNode.x + this.circle_R + vx * this.circle_R / distance;
        var py = sourceNode.y + this.circle_R + vy * this.circle_R / distance;

        return {
            x: px,
            y: py
        }
    },

    getRectLineIntersectPoint: function (sourceNode, targetNode) {
        var center = {};
        var x = sourceNode.x
        center.x = sourceNode.x + sourceNode.width / 2;
        center.y = sourceNode.y + sourceNode.height / 2;

        //矩形的四个顶点
        var a = {}, b = {}, c = {}, d = {};
        a.x = sourceNode.x;
        a.y = sourceNode.y;
        b.x = sourceNode.x + sourceNode.width;
        b.y = sourceNode.y;
        c.x = sourceNode.x + sourceNode.width;
        c.y = sourceNode.y + sourceNode.height;
        d.x = sourceNode.x;
        d.y = sourceNode.y + sourceNode.height;
        var ip = this.getRectIntersectPoint(center, this.getCenter(targetNode), a, b);
        if (ip == null) {
            ip = this.getRectIntersectPoint(center, this.getCenter(targetNode), b, c);
        }
        if (ip == null) {
            ip = this.getRectIntersectPoint(center, this.getCenter(targetNode), c, d);
        }
        if (ip == null) {
            ip = this.getRectIntersectPoint(center, this.getCenter(targetNode), d, a);
        }
        return ip;
    },

    getDiamondLineIntersectPoint: function (sourceNode, targetNode) {
        var line1a = {};
        line1a.x = sourceNode.x + 25;
        line1a.y = sourceNode.y + 25;

        //菱形的四个顶点
        var a = {}, b = {}, c = {}, d = {};
        a.x = sourceNode.x;
        a.y = sourceNode.y + 25;
        b.x = sourceNode.x + 25;
        b.y = sourceNode.y + 50;
        c.x = sourceNode.x + 50;
        c.y = sourceNode.y + 25;
        d.x = sourceNode.x + 25;
        d.y = sourceNode.y;
        var ip = this.getRectIntersectPoint(line1a, this.getCenter(targetNode), a, b);
        if (ip == null) {
            ip = this.getRectIntersectPoint(line1a, this.getCenter(targetNode), b, c);
        }
        if (ip == null) {
            ip = this.getRectIntersectPoint(line1a, this.getCenter(targetNode), c, d);
        }
        if (ip == null) {
            ip = this.getRectIntersectPoint(line1a, this.getCenter(targetNode), d, a);
        }
        return ip;
    },

    getRectIntersectPoint: function (line1a, line1b, line2a, line2b) {
        var vx1 = line1b.x - line1a.x;
        var vy1 = line1b.y - line1a.y;
        var vx2 = line2b.x - line2a.x;
        var vy2 = line2b.y - line2a.y;

        var check = vx1 * vy2 - vy1 * vx2;
        // 两条线平行，没有交点
        if (check == 0)
            return null;

        var l = ((line2b.x - line1a.x) * vy1 + (line1a.y - line2b.y) * vx1) / check;

        if (l > 0 || l < -1)
            return null;

        var ret = {};
        ret.x = line2b.x + vx2 * l;
        ret.y = line2b.y + vy2 * l;
        if ((ret.x - line1a.x) * (ret.x - line1b.x) > 0)
            return null;
        if ((ret.y - line1a.y) * (ret.y - line1b.y) > 0)
            return null;
        return ret;
    },

    createNode: function (node) {
        var nodeType = node.nodeType;
        switch (nodeType) {
            case BPMNodeType.BEGIN:
            case BPMNodeType.END:
            case BPMNodeType.JOIN:
            case BPMNodeType.DECISION:
            case BPMNodeType.FORK:
            case BPMNodeType.EXCLUSIVE_FORK:
            case BPMNodeType.COMPLEX_JOIN:
            case BPMNodeType.STATE:
                break;
            default:
                var showText = this.getShowCaption(node.width, node.caption);
                if (showText.length > 0) {
                    node.caption = showText;
                }
                break;
        }

        //是否用图片方式显示节点
        if (node.image) {
           return this.createImageNode(node);
        }

        switch (nodeType) {
            case BPMNodeType.BEGIN:
                return this.createBeginNode(node);
            case BPMNodeType.END:
                return this.createEndNode(node);
            case BPMNodeType.BRANCH_END:
                return this.createBranchEndNode(node);
            case BPMNodeType.STATE:
                return this.createStateNode(node);
            case BPMNodeType.USER_TASK:
                return this.createUserTaskNode(node);
            case BPMNodeType.SERVICE_TASK:
                return this.createServiceTaskNode(node);
            case BPMNodeType.MANUAL_TASK:
                return this.createManualTaskNode(node);
            case BPMNodeType.AUDIT:
                return this.createAuditNode(node);
            case BPMNodeType.FORK:
                return this.createForkNode(node);
            case BPMNodeType.JOIN:
                return  this.createJoinNode(node);
            case BPMNodeType.EXCLUSIVE_FORK:
                return this.createExclusiveForkNode(node);
            case BPMNodeType.COMPLEX_JOIN:
                return this.createComplexJoinNode(node);
            case BPMNodeType.DECISION:
                return this.createDecisionNode(node);
            case BPMNodeType.SUB_PROCESS:
                return this.createSubProcessNode(node);
            case BPMNodeType.INLINE:
                return this.createInlineNode(node);
            case BPMNodeType.DATAMAP:
                return this.createDataMapNode(node);
            case BPMNodeType.COUNTERSIGN:
                return this.createCounterSignNode(node);
            case BPMNodeType.STATE_ACTION:
                return this.createStateActionNode(node);
            case BPMNodeType.MultiTask:
                return this.createMultiTaskNode(node);
            case BPMNodeType.MultiAudit:
                return this.createMultiAuditNode(node);
            default:
                return null;
        }
    },

    createImageNode: function(node) {
        if (!node["tag-name"]) {
            return null;
        }

        //此处不用 node.width, node.height本来的尺寸，设计器中的节点一旦属性修改后，这两个属性会根据绘制图形的大小改变，无法修改
        node.width = 80, node.height = 50;
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);

        var imagePath,
            color;

        if (this.isLastNodeInPath(node)) {
            //var imagePath = "yesui/src/ui/res/css/default/images/bpmgraph/node/" + (node.image_last || node.image);
            // out.attr({fill: "url(" + imagePath + ")", stroke: "red"});
            imagePath = this.getImagePath("node/" + (node.image_last || node.image));
            color = "red";
        } else if (this.isPastNodeInPath(node)) {
            // var imagePath = "yesui/src/ui/res/css/default/images/bpmgraph/node/" + (node.image_past || node.image);
            // out.attr({fill: "url(" + imagePath + ")", stroke: "blue"});
            imagePath = this.getImagePath("node/" + (node.image_last || node.image));
            color = "blue";
        } else {
            // var imagePath = "yesui/src/ui/res/css/default/images/bpmgraph/node/" + node.image;
            // out.attr({fill: "url(" + imagePath + ")", stroke: "none"});
            imagePath = this.getImagePath("node/" + node.image);
            color = "none";
        }

        out.attr({fill: "url(" + imagePath + ")", stroke: color});

        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y - this.mY + node.height + 15, node.caption);
        this.isIE() && this.textFormat(text);
        $(out[0]).attr("key", node.key);
        $(text[0]).attr("key", node.key);
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createBeginNode: function (node) {
        var begin = this.paper.circle((node.x - this.mX) + this.circle_R, node.y + this.circle_R - this.mY, this.circle_R);
        if (this.isLastNodeInPath(node)) {
            begin.attr("stroke", "red");
        }
        begin.attr({"stroke-width": "2",
            "fill": "white"});
        var text = begin.paper.text((node.x - this.mX) + this.circle_R, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + text.node.clientHeight / 2 - this.mY + 10;
        text.attr({"y": "" + text_y});
        begin.hover(function (e) {
            begin.attr({"cursor": "pointer"});
        }, function () {
        });
        begin.click(function(e) {
            console.log("beginNode click.");
        });
        return begin;
    },

    createEndNode: function (node) {
        var endOut = this.paper.circle((node.x - this.mX) + this.circle_R, node.y + this.circle_R - this.mY, this.circle_R);
        if (this.isLastNodeInPath(node)) {
            endOut.attr("stroke", "red");
        }
        endOut.attr({"stroke-width": "2"});
        endOut.attr({"fill": "white"});
        var endIn = this.paper.circle(node.x + this.circle_R - this.mX, node.y + this.circle_R - this.mY, this.circle_R - 10);
        endIn.attr({"stroke-width": "0"});
        endIn.attr({"stroke": null});
        endIn.attr({"fill": "black"});
        var text = endOut.paper.text(node.x + this.circle_R - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + text.node.clientHeight / 2 - this.mY + 10;
        text.attr({"y": "" + text_y});
        endOut.hover(function (e) {
            endOut.attr({"cursor": "pointer"});
            endIn.attr({"cursor": "pointer"});
        }, function () {
        });
        return endOut;
    },

    createBranchEndNode: function (node) {
        var branchEnd = this.paper.circle(node.x + this.circle_R - this.mX, node.y + this.circle_R - this.mY, this.circle_R);
        if (this.isLastNodeInPath(node)) {
            branchEnd.attr("stroke", "red");
        }
        branchEnd.attr({"stroke-width": "5"});
        branchEnd.attr({"fill": "white"});
        var text = branchEnd.paper.text(node.x + this.circle_R - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + text.node.clientHeight / 2 - this.mY + 20;
        text.attr({"y": "" + text_y});
        branchEnd.hover(function (e) {
            branchEnd.attr({"cursor": "pointer"});
        }, function () {
        });
        return branchEnd;
    },

    createStateNode: function (node) {
        var endOut = this.paper.circle(node.x + this.circle_R - this.mX, node.y + this.circle_R - this.mY, this.circle_R);
        if (this.isLastNodeInPath(node)) {
            endOut.attr("stroke", "red");
        }
        endOut.attr({"stroke-width": "1"});
        endOut.attr({"fill": "white"});
        var endIn = this.paper.circle(node.x + this.circle_R - this.mX, node.y + this.circle_R - this.mY, this.circle_R - 5);
        endIn.attr({"stroke-width": "2"});
        endIn.attr({"stroke": "black"});
        endIn.attr({"fill": "white"});
        var text = endOut.paper.text(node.x + this.circle_R - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + text.node.clientHeight / 2 - this.mY + 10;
        text.attr({"y": "" + text_y});
        endOut.hover(function (e) {
            endOut.attr({"cursor": "pointer"});
            endIn.attr({"cursor": "pointer"});
        }, function () {
        });
        return endOut;
    },

    createUserTaskNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath = this.getImagePath("UserTask-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        $(out[0]).attr("key", node.key);
        $(image[0]).attr("key", node.key);
        $(text[0]).attr("key", node.key);
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createMultiTaskNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath1 = this.getImagePath("SubProcess-icon.png"),
            imagePath2 = this.getImagePath("MultiTask-icon.png");

        //矩形内部图案
        var image1 = out.paper.image(imagePath1, node.x + node.width / 2 - 10 - this.mX, node.y + node.height - 18 - this.mY, 18, 18);
        var image = out.paper.image(imagePath2, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        $(out[0]).attr("key", node.key);
        $(image1[0]).attr("key", node.key);
        $(image[0]).attr("key", node.key);
        $(text[0]).attr("key", node.key);
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image1.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createMultiAuditNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath1 = this.getImagePath("SubProcess-icon.png"),
            imagePath2 = this.getImagePath("MultiAudit-icon.png");

        //矩形内部图案
        var image1 = out.paper.image(imagePath1, node.x + node.width / 2 - 10 - this.mX, node.y + node.height - 18 - this.mY, 18, 18);
        var image = out.paper.image(imagePath2, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        $(out[0]).attr("key", node.key);
        $(image1[0]).attr("key", node.key);
        $(image[0]).attr("key", node.key);
        $(text[0]).attr("key", node.key);
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image1.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createServiceTaskNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath = this.getImagePath("ServiceTask-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createManualTaskNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"fill": "white"});
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath = this.getImagePath("ManualTask-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createAuditNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath = this.getImagePath("Audit-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        $(out[0]).attr("key", node.key);
        $(image[0]).attr("key", node.key);
        $(text[0]).attr("key", node.key);
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    //绘制菱形
    createDiamond: function (node) {
        var line1 = this.paper.path("M" + (node.x - this.mX) + " " + (node.y + 25 - this.mY) + "L" + (node.x + 25 - this.mX) + " " + (node.y + 2 * 25 - this.mY));
        var line2 = this.paper.path("M" + (node.x + 25 - this.mX) + " " + (node.y + 2 * 25 - this.mY) + "L" + (node.x + 2 * 25 - this.mX) + " " + (node.y + 25 - this.mY));
        var line3 = this.paper.path("M" + (node.x + 2 * 25 - this.mX) + " " + (node.y + 25 - this.mY) + "L" + (node.x + 25 - this.mX) + " " + (node.y - this.mY));
        var line4 = this.paper.path("M" + (node.x + 25 - this.mX) + " " + (node.y - this.mY) + "L" + (node.x - this.mX) + " " + (node.y + 25 - this.mY));
        var diamond = this.paper.set();
        diamond.push(line1, line2, line3, line4);
        if (this.isLastNodeInPath(node)) {
            line1.attr("stroke", "red");
            line2.attr("stroke", "red");
            line3.attr("stroke", "red");
            line4.attr("stroke", "red");
            diamond.attr("stroke", "red");
        }
        diamond.attr({"stroke-width": "2"});
        diamond.attr({"type": "diamond"});
        diamond.attr({"fill": "white"});
        diamond.data({"diamond": "diamond"});
        return diamond;
    },

    createForkNode: function (node) {
        var fork = this.createDiamond(node);
        var forkShadow = this.paper.rect(node.x + 7.5 - this.mX, node.y + 7.5 - this.mY, 35.4, 35.4, 0).transform("r45");
        forkShadow.attr({"fill": "white"});
        if (this.isLastNodeInPath(node)) {
            forkShadow.attr("stroke", "red");
        }
        fork.paper.path("M" + (node.x + 25 - 15 - this.mX) + " " + (node.y + 25 - this.mY) + "L" + (node.x + 25 + 15 - this.mX) + " " + (node.y + 25 - this.mY))
        fork.paper.path("M" + (node.x + 25 + 5 - this.mX) + " " + (node.y + 25 + 10 - this.mY) + "L" + (node.x + 25 - 6 - this.mX) + " " + (node.y + 25 - this.mY))
        fork.paper.path("M" + (node.x + 25 + 5 - this.mX) + " " + (node.y + 25 - 10 - this.mY) + "L" + (node.x + 25 - 6 - this.mX) + " " + (node.y + 25 - this.mY))
        var text = fork.paper.text(node.x + 25 - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + 15 - this.mY;
        text.attr({"y": "" + text_y});
        forkShadow.hover(function () {
            forkShadow.attr({"cursor": "pointer"});
        }, function () {
        });
        return fork;
    },

    createJoinNode: function (node) {
        var join = this.createDiamond(node);
        var joinShadow = this.paper.rect(node.x + 7.5 - this.mX, node.y + 7.5 - this.mY, 35.4, 35.4, 0).transform("r45");
        if (this.isLastNodeInPath(node)) {
            joinShadow.attr("stroke", "red");
        }
        joinShadow.attr({"fill": "white"});
        join.paper.path("M" + (node.x + 25 - 15 - this.mX) + " " + (node.y + 25 - this.mY) + "L" + (node.x + 25 + 15 - this.mX ) + " " + (node.y + 25 - this.mY))
        join.paper.path("M" + (node.x + 25 - 5 - this.mX) + " " + (node.y + 25 + 10 - this.mY) + "L" + (node.x + 25 + 6 - this.mX) + " " + (node.y + 25 - this.mY))
        join.paper.path("M" + (node.x + 25 - 5 - this.mX) + " " + (node.y + 25 - 10 - this.mY) + "L" + (node.x + 25 + 6 - this.mX) + " " + (node.y + 25 - this.mY))

        var text = join.paper.text(node.x + 25 - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + 15 - this.mY;
        text.attr({"y": "" + text_y});
        joinShadow.hover(function () {
            joinShadow.attr({"cursor": "pointer"});
        }, function () {
        });
        return join;
    },

    createExclusiveForkNode: function (node) {
        var exclusive = this.createDiamond(node);
        var exclusiveShadow = this.paper.rect(node.x + 7.5 - this.mX, node.y + 7.5 - this.mY, 35.4, 35.4, 0).transform("r45");
        if (this.isLastNodeInPath(node)) {
            exclusiveShadow.attr("stroke", "red");
        }
        exclusiveShadow.attr({"fill": "white"});
        exclusive.paper.path("M" + (node.x + 25 - 5 - this.mX) + " " + (node.y + 25 - 5 - this.mY) + "L" + (node.x + 25 + 5 - this.mX) + " " + (node.y + 25 + 5 - this.mY))
        exclusive.paper.path("M" + (node.x + 25 - 5 - this.mX) + " " + (node.y + 25 + 5 - this.mY) + "L" + (node.x + 25 + 5 - this.mX) + " " + (node.y + 25 - 5 - this.mY))

        var text = exclusive.paper.text(node.x + 25 - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + 15 - this.mY;
        text.attr({"y": "" + text_y});
        ;
        exclusiveShadow.hover(function () {
            exclusiveShadow.attr({"cursor": "pointer"});
        }, function () {
        });
        return exclusive;
    },

    createComplexJoinNode: function (node) {
        var complex = this.createDiamond(node);
        var complexShadow = this.paper.rect(node.x + 7.5 - this.mX, node.y + 7.5 - this.mY, 35.4, 35.4, 0).transform("r45");
        complexShadow.attr({"fill": "white"});
        if (this.isLastNodeInPath(node)) {
            complexShadow.attr("stroke", "red");
        }
        complex.paper.path("M" + (node.x + 25 - 5 - this.mX) + " " + (node.y + 25 - 5 - this.mY ) + "L" + (node.x + 25 + 5 - this.mX) + " " + (node.y + 25 + 5 - this.mY))
        complex.paper.path("M" + (node.x + 25 - 5 - this.mX) + " " + (node.y + 25 + 5 - this.mY) + "L" + (node.x + 25 + 5 - this.mX) + " " + (node.y + 25 - 5 - this.mY))
        complex.paper.path("M" + (node.x + 25 - 7 - this.mX) + " " + (node.y + 25 - this.mY) + "L" + (node.x + 25 + 7 - this.mX) + " " + (node.y + 25 - this.mY))
        complex.paper.path("M" + (node.x + 25 - this.mX) + " " + (node.y + 25 - 7 - this.mY) + "L" + (node.x + 25 - this.mX) + " " + (node.y + 25 + 7 - this.mY))


        var text = complex.paper.text(node.x + 25 - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + 15 - this.mY;
        text.attr({"y": "" + text_y});
        complexShadow.hover(function () {
            complexShadow.attr({"cursor": "pointer"});
        }, function () {
        });
        return complex;
    },

    createDecisionNode: function (node) {
        var decision = this.createDiamond(node);
        var decisionShadow = this.paper.rect(node.x + 7.5 - this.mX, node.y + 7.5 - this.mY, 35.4, 35.4, 0).transform("r45");
        decisionShadow.attr({"fill": "white"});
        if (this.isLastNodeInPath(node)) {
            decisionShadow.attr("stroke", "red");
        }
        var image = decision.paper.text(node.x + 25 - this.mX, node.y + 25 - this.mY, "?");
        image.attr("font-size", "25px");
        if (this.isIE()) {
            this.textFormat(image);
        }
        var text = decision.paper.text(node.x + 25 - this.mX, node.y + node.height, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        var text_y = text.attr().y + 15 - this.mY;
        text.attr({"y": "" + text_y});
        decisionShadow.hover(function () {
            decisionShadow.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
        }, function () {
        });
        return decision;
    },

    createSubProcessNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"fill": "white"});
        out.attr({"stroke-width": "2"});

        var imagePath = this.getImagePath("SubProcess-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + node.width / 2 - 10 - this.mX, node.y + node.height - 18 - this.mY, 18, 18);

        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createInlineNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"fill": "white"});
        out.attr({"stroke-width": "2"});

        var imagePath = this.getImagePath("Inline-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + node.width / 2 - 10 - this.mX, node.y + node.height - 18 - this.mY, 18, 18);

        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createDataMapNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"fill": "white"});
        out.attr({"stroke-width": "2"});

        var imagePath = this.getImagePath("DataMap-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + node.width / 2 - 10 - this.mX, node.y + node.height - 18 - this.mY, 18, 18)
        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        $(out[0]).attr("key", node.key);
        $(image[0]).attr("key", node.key);
        $(text[0]).attr("key", node.key);
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createCounterSignNode: function (node) {
        var out = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            out.attr("stroke", "red");
        }
        out.attr({"stroke-width": "2"});
        out.attr({"fill": "white"});

        var imagePath = this.getImagePath("UserTask-icon.png");

        //矩形内部图案
        var image = out.paper.image(imagePath, node.x + 2 - this.mX, node.y + 2 - this.mY, 18, 18);

        var text = out.paper.text(node.x + node.width / 2 - this.mX, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        out.hover(function (e) {
            out.attr({"cursor": "pointer"});
            image.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return out;
    },

    createStateActionNode: function (node) {
        var stateAction = this.paper.rect(node.x - this.mX, node.y - this.mY, node.width, node.height, 10);
        if (this.isLastNodeInPath(node)) {
            stateAction.attr("stroke", "red");
        }
        stateAction.attr({"stroke-width": "2"});
        stateAction.attr({"fill": "white"});
        var text = stateAction.paper.text(node.x - this.mX + node.width / 2, node.y + node.height / 2 - this.mY, node.caption);
        if (this.isIE()) {
            this.textFormat(text);
        }
        stateAction.hover(function (e) {
            stateAction.attr({"cursor": "pointer"});
            text.attr({"cursor": "pointer"});
        }, function () {
        });
        return stateAction;
    },

    getTextWidth: function (text, fontSize) {
        var span = document.getElementById("__getWidth");
        if (span == null) {
            span = document.createElement("span");
            span.id = "__getWidth";
            document.body.appendChild(span);
            span.style.visibility = "hidden";
            span.style.whiteSpace = "nowrap";
        }
        span.innerText = text;
        span.style.fontSize = (fontSize == null ? 12 : fontSize) + "px";
        return span.offsetWidth;
    },

    getShowCaption: function (width, caption) {
        var fontSize = 12, textWidth = this.getTextWidth(caption, fontSize), s = "", tempS = "";
        if (textWidth > width) {
            for (var i = 0; i < caption.length; i++) {
                tempS = tempS + caption.substr(i, 1);
                var w = this.getTextWidth(tempS, fontSize);
                if (w >= width) {
                    tempS = tempS.substring(0, tempS.length - 1);
                    tempS += "\n";
                    s += tempS;
                    tempS = "";
                    i--;
                }
            }
            s += tempS;
        }
        return s;
    },
    brokenLine: function (sourceNode, targetNode) {
        var sourceCenter = this.getCenter(sourceNode);
        var targetCenter = this.getCenter(targetNode);
        this.isSourceLeft = sourceCenter.x <= targetCenter.x;
        this.isSourceTop = sourceCenter.y <= targetCenter.y;
    },

    stNode: function (transition) {
        var Return = {
            sourceNodeKey: transition.source,
            targetNodeKey: transition.target,
            sourceNode: this.nodeElements[transition.source],
            targetNode: this.nodeElements[transition.target]
        };
        return Return;
    }

});

YIUI.reg('bpmgraph', YIUI.Control.BPMGraph);

var BPMNodeType = (function () {
    var Return = {
        BEGIN: 0,
        END: 1,
        USER_TASK: 2,
        AUDIT: 3,
        COUNTERSIGN: 4,
        DECISION: 5,
        SUB_PROCESS: 6,
        FORK: 7,
        JOIN: 8,
        EVENT: 9,
        STATE: 10,
        TIMER: 11,
        INLINE: 12,
        DATAMAP: 13,
        COMPLEX_JOIN: 14,
        MANUAL_TASK: 15,
        EXCLUSIVE_FORK: 16,
        SERVICE_TASK: 17,
        BRANCH_END: 18,
        STATE_ACTION: 19,
        MultiTask: 20,
        MultiAudit: 21
    };
    return Return;
})();

var BPMLineType = (function () {
    var Return = {
        STEAIGHT_LINE: 0,
        FILLET_CURVE_H_ONE: 1,
        FILLET_CURVE_V_ONE: 2,
        FILLET_CURVE_H_TWO: 3,
        FILLET_CURVE_V_TWO: 4,
        CHAMFER_CURVE_H_ONE: 5,
        CHAMFER_CURVE_V_ONE: 6,
        CHAMFER_CURVE_H_TWO: 7,
        CHAMFER_CURVE_V_TWO: 8,
        OBKIQUE_CURVE_H_TWO: 9,
        OBKIQUE_CURVE_V_TWO: 10
    };
    return Return;
})();