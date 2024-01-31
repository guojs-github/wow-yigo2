"use strict";
(function () {

  // 初始化影子表
  var initShadowTable = function(form,com) {
    var doc = form.getDocument(),
    tableKey = com.tableKey,
    shadowTable = doc.getShadow(tableKey);
    if ( !shadowTable ) {
      doc.addShadow(tableKey, YIUI.DataUtil.newShadowDataTable(doc.getByKey(tableKey)));
    }
  }

  YIUI.ShowData = function (form) {
    var Return = {
      prepare: function () {
        // 1.重置表单状态
        form.reset();

        // 2.重置文档状态，主要是将每个表的游标移到第一行
        var document = form.getDocument();
        if (document == null) {
          return;
        }
        var table = null;
        for (var i = 0, len = document.tbls.length; i < len; i++) {
          table = document.tbls[i];
          table.first();
        }
      },
      loadHeader: function (cmp) {
        var document = form.getDocument(),
          columnKey = cmp.columnKey;
        if (!columnKey || !document) {
          return;
        }
        var table = document.getByKey(cmp.tableKey);
        if (table.first()) {
          var value = YIUI.Handler.getComponentValue(cmp, table, columnKey);
          cmp.setValue(value, false, false, true, false);
        }
      },
      loadAttachment: function (attachment) {
        attachment.load();
      },
      loadListView: function (listView) {

        // 初始化影子表
        if (listView.pageLoadType == YIUI.PageLoadType.DB && listView.selectFieldIndex != -1) {
            initShadowTable(form,listView);
        }

        var showLV = new YIUI.ShowListView(form, listView);
        showLV.load();
      },
      loadGrid: function (grid) {
        if (grid.condition) {
          return;
        }

        // 初始化影子表
        if (grid.pageInfo.pageLoadType == YIUI.PageLoadType.DB && grid.selectFieldIndex != -1) {
            initShadowTable(form,grid);
        }

        // 加载数据
        var show = new YIUI.ShowGridData(form, grid);
        show.load(true);
      },
      loadChart: function (chart) {
        var document = form.getDocument();
        var metaChart = chart.getMetaObj();
        var dataJSON = {};
        var dataSource = metaChart.dataSource;
        var sourceType = metaChart.sourceType;
        var categoryKey = new HashMap();
        if (dataSource != null) {
          // 来源于数据对象
          if ("DataObject".equalsIgnoreCase(sourceType)) {
            var table = document.getByKey(dataSource.bindingKey);
            // 计算项目列表
            var metaCategory = dataSource.category;
            table.beforeFirst();
            var index = 0;
            var categoryCount = 0;
            var categories = [];
            while (table.next()) {
              var o = table.getByKey(metaCategory.dataKey);
              var value = YIUI.TypeConvertor.toString(o);
              if (!categoryKey.containsKey(value)) {
                categories.push(value);
                categoryKey.put(value, index);
                ++index;
                ++categoryCount;
              }
            }
            dataJSON.categories = categories;
            var metaSeriesArray = dataSource.series;
            var series = [];
            var metaSeries = null;
            $.each(metaSeriesArray, function (i, metaSeries) {
              var splitDataKey = metaSeries.splitDataKey;
              var splitSeries = splitDataKey != null && !splitDataKey.isEmpty();
              if (splitSeries) {
                var seriesMap = new HashMap();
                table.beforeFirst();
                var jsonObj = null;
                while (table.next()) {
                  var splitData = table.getByKey(splitDataKey);
                  var o = table.getByKey(metaSeries.dataKey);
                  var value = YIUI.TypeConvertor.toInt(o);
                  jsonObj = seriesMap.get(splitData);
                  if (jsonObj == null) {
                    jsonObj = {};
                    var data = [];
                    for (var i = 0; i < categoryCount; ++i) {
                      data.push(parseInt(0));
                    }
                    jsonObj.data = data;
                    jsonObj.name = splitData.toString();
                    seriesMap.put(splitData, jsonObj);
                    series.push(jsonObj);
                  }
                  o = table.getByKey(metaCategory.dataKey);
                  var c_value = YIUI.TypeConvertor.toString(o);
                  var c_index = categoryKey.get(c_value);
                  if (c_index != null) {
                    var data = jsonObj["data"];
                    data[c_index] = value;
                  }
                }
              } else {
                table.beforeFirst();
                var jsonObj = {"name": metaSeries.title};
                var data = [];
                while (table.next()) {
                  var o = table.getByKey(metaSeries.dataKey);
                  var value = YIUI.TypeConvertor.toInt(o);
                  data.push(value);
                }
                jsonObj.data = data;
                series.push(jsonObj);
              }
            });
            dataJSON.series = series;
          }
        }
        chart.setDataModel(dataJSON);
      },
      loadBPMGraph: function (graph) {
        var meta = graph.getMetaObj();
        var processKey = "";
        var processVer = -1;
        var path = null;
        var oID = -1;
        var keyFormula = meta.processKey;
        var verFormula = meta.processVer;
        var pathFormula = meta.processPath;
        var OID = meta.OID;
        var cxt = new View.Context(form);
        if (keyFormula != null && !keyFormula.isEmpty()) {
          processKey = form.eval(keyFormula, cxt);
        }
        if (verFormula != null && !verFormula.isEmpty()) {
          processVer = form.eval(verFormula, cxt);
        }
        if (pathFormula != null && !pathFormula.isEmpty()) {
          path = form.eval(pathFormula, cxt);
        }
        if (OID != null && !OID.isEmpty()) {
          oID = form.eval(OID, cxt);
        }


        var data = {
          cmd: "DownloadProcessGraph",
          service: "BPMDefService",
          processKey: processKey,
          processVer: processVer,
          OID: oID
        };
        var transGraph = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, data);
        if (transGraph != null) {
          if (transGraph.transPath) {
            graph.transPath = transGraph.transPath;
          } else {
            graph.transPath = path;
          }
          graph.swims = transGraph.swims;
          var nodes = transGraph.nodes;
          var transitions = [];
          for (var j = 0, len = nodes.length; j < len; j++) {
            var node = nodes[j];
            var n_transitions = node.transitions;
            if (n_transitions) {
              for (var i = 0, size = n_transitions.length; i < size; ++i) {
                var n_transition = n_transitions[i];
                var transition = {
                  "lineStyle": n_transition["line-style"],
                  "inpath": n_transition["inpath"],
                  "source": node["key"],
                  "tagName": n_transition["tag-name"],
                  "target": n_transition["target-node-key"]
                };
                transitions.push(transition);
              }
            }
            delete node.transitions;
          }
          graph.nodes = nodes;
          graph.transitions = transitions;
          graph.refreshGraph();
        }
      },

      show: function () {
        this.prepare();
        var cmpList = form.getComponentList(), cmp;
        for (var i in cmpList) {
          cmp = cmpList[i];

          cmp.reset();

          if (cmp.isSubDetail) {
            continue;
          }

          switch (cmp.type) {
            case YIUI.CONTROLTYPE.LISTVIEW:
            case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
              this.loadListView(cmp);
              break;
            case YIUI.CONTROLTYPE.GRID:
              this.loadGrid(cmp);
              break;
            case YIUI.CONTROLTYPE.CHART:
              this.loadChart(cmp);
              break;
            case YIUI.CONTROLTYPE.BPM_GRAPH:
              this.loadBPMGraph(cmp);
              break;
            case YIUI.CONTROLTYPE.ATTACHMENT:
              this.loadAttachment(cmp);
              break;
            default:
              this.loadHeader(cmp);
              break;
          }
        }
        return this.postShowData();
      },

      postShowData: function () {
        // 变体加载,在show之后做,需要界面取值
        var variantDef;
        if ( form.metaForm.useVariant ) {
          variantDef = form.getViewDataMonitor().refreshVariant(false);
        } else {
          variantDef = $.Deferred(function (def) {def.resolve(null);}).promise();
        }

        // 不能在show完refresh,因为$t.p.colModel不能及时刷新,插行会报错
        variantDef.then(function () {
          form.getUIProcess().doPostShowData();
          form.getUIProcess().addOperation();
        });
      }
    };
    return Return;
  };
  YIUI.ShowSubDetailData = function (form, grid) {
    var Return = {
      load: function () {
        var compList = form.subDetailInfo[grid.key];

        if (!compList || compList.length == 0 || !grid.tableKey) {
          return;
        }

        var rowIndex = grid.getFocusRowIndex();
        if (rowIndex == -1) {
          return;
        }

        var rowData = grid.getRowDataAt(rowIndex);
        if (!rowData.isDetail || rowData.bkmkRow == null) {
          return;
        }

        var doc = form.getDocument(),
          table = doc.getByKey(grid.tableKey);

        table.setByBkmk(rowData.bkmkRow.getBookmark());

        var com;
        for (var i = 0, len = compList.length; i < len; i++) {
          com = form.getComponent(compList[i]);
          if (com.type == YIUI.CONTROLTYPE.GRID) {
            this.loadGrid(form, com);
          } else {
            this.loadHeader(rowIndex, com);
          }
        }
        form.getUIProcess().calcSubDetail(grid.key);
       // form.getUIProcess().doRefreshSubGrid(grid.key); // 计算完再show
      },
      loadGrid: function (form, grid) {
        var show = new YIUI.ShowGridData(form, grid);
        show.load(true);
      },
      loadHeader: function (rowIndex, com) {
        var meta = com.getMetaObj();
        if (meta.tableKey && meta.columnKey) {
          var table = form.getDocument().getByKey(meta.tableKey);
          value = table.getByKey(meta.columnKey);
          com.setValue(value, false, false, true, false);
        } else {
          var cellKey = meta.bindingCellKey;
          if (cellKey) {
            var value = grid.getValueByKey(rowIndex, cellKey);
            com.setValue(value, false, false, true, false);
          }
        }
      }
    }
    return Return;
  }
  YIUI.ShowListView = function (form, listView) {
    var Return = {
      load: function () {
        listView.clearAllRows();
        var document = form.getDocument();
        var tableKey = listView.tableKey;
        if (!tableKey) return;
        var table = document.getByKey(tableKey),row;
        listView.totalRowCount = YIUI.TotalRowCountUtil.getRowCount(document, tableKey);
        for (var k = 0, length = table.getRowCount(); k < length; k++) {
          row = {};
          listView.data.push(row);
          table.setPos(k);
          row.bkmkRow = new YIUI.DetailRowBkmk(table.getBkmk());
          listView.handler.showDetailRow(form, listView, k);
        }
        listView.repaint();
      }
    };
    return Return;
  };
})();