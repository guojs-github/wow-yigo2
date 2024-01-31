/**
 * Created by chenbinbin on 17-7-19.
 */

/**
 * 按钮控件。
 */
YIUI.Control.FlatCanvas = YIUI.extend(YIUI.Control, {

    handler: YIUI.SVGHandler,

    height: 800,

    width: 800,
    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        var self = this;
        var id = self.ofFormID
        var form = YIUI.FormStack.getForm(id);

        this.contextHandler = {
            queryData: function(paras) {
                var jsonResult = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
                return  jsonResult['result'];
            },

            fireDBClick: function(e, sEvent) {
                //this.eval('ShowModal("Order")');
                this.eval(sEvent);
            },

            eval: function(sFormula, dataTable) {
                if ($.fn.hasVariables(sFormula) && dataTable) {
                    var arr = $.fn.getVariables(sFormula);
                    if (arr) {
                        var json = {};
                        for (var n=0; n<arr.length; n++) {
                            json[arr[n]] = dataTable.getByKey(arr[n]) ||  YIUI.TypeConvertor.toDataType(dataTable.getColByKey(arr[n]).getType(), "");
                        }
                        sFormula = Snap.format(sFormula, json);
                    }
                }

                var cxt = new View.Context(form);
                if ($.fn.isExp(sFormula)) {
                    return form.eval(sFormula, cxt, null);
                } else {
                    return sFormula;
                }
            }
        };

        var source = meta.Source;
        var paras = {
            cmd: "GetFlatCanvasMeta",
            service: "FlatCanvas",
            key: source
        };
        this.svgmeta = $.parseJSON(this.contextHandler.queryData(paras));
    },

    setValue: function (value, commit, fireEvent) {
        var changed = this.base(value, commit, fireEvent);
        return changed;
    },

    setZoom: function(zoom) {
        this.zoom = zoom;
    },

    setEnable: function(enable) {
        this.enable = enable;
    },

    /**
     * 完成渲染。
     */
    onRender: function (ct) {
        this.base(ct);
        this.createGraph();
    },

    createGraph: function () {
        if (!this.board) {
            var metaPaper = this.svgmeta["Paper"];
            var metaBoard = metaPaper["Board"];
            this.el.css("overflow", "auto")
            this.board = new FlatCanvas(metaBoard.width, metaBoard.height);
            this.board.setContextHandler(this.contextHandler);

            this.board.loadView(metaBoard);
            this.board.render(this.el);

            var dataSource = metaPaper["DataSource"];
			if (dataSource) {
				var refbjectKey = dataSource.RefObjectKey;

				var id = this.ofFormID;
				var form = YIUI.FormStack.getForm(id);

				var doc = form.getDocument();
				if (doc == null) return;
				this.board.loadDocData(doc);
			}
        }
    },

    beforeDestroy: function () {
    },

    /**
     * 给DOM添加事件监听。
     */
    install: function () {
        var self = this;
    }
});
YIUI.reg('flatcanvas', YIUI.Control.FlatCanvas);