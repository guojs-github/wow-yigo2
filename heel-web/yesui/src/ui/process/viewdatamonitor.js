/**
 * Created with IntelliJ IDEA.
 * User: 陈瑞
 * Date: 16-12-26
 * Time: 下午5:19
 */
(function () {

	var cache = new LRUCache(10); // 缓存变体

	YIUI.ViewDataMonitor = function (form) {
		this.form = form;
		this.process = new YIUI.UIProcess(form);
		this.process.init();

		this.preFireCellValueChanged = function (grid, rowIndex, colIndex, cellKey) {
		this.process.doPreCellValueChanged(grid, rowIndex, colIndex, cellKey);
		}

		this.fireCellValueChanged = function (grid, rowIndex, colIndex) {
			var row = grid.dataModel.data[rowIndex],
				metaRow = grid.getMetaObj().rows[row.metaRowIndex],
				cellKey = row.cellKeys[colIndex];

			// 计算表达式
			this.process.doCellValueChanged(grid, rowIndex, colIndex, cellKey);

			// 汇总计算
			YIUI.GridSumUtil.evalAffectSum(form, grid, rowIndex, colIndex);

			var valueChanged = metaRow.cells[colIndex].valueChanged,cxt;

			if( form.useVariant ) {
				var events = this.getValueChanged(cellKey, valueChanged);
				if( events.length > 0 ) {
					cxt = new View.Context(form);
					cxt.updateLocation(grid.key, rowIndex, -1);
				}
				for( var i = 0,e;e = events[i];i++ ) {
					form.eval(e, cxt);
				}
			} else {
				if( valueChanged ) {
					cxt = new View.Context(form);
					cxt.updateLocation(grid.key, rowIndex, -1);
					form.eval(valueChanged, cxt);
				}
			}
		}

		this.getValueChanged = function (key,defaultValue) {
			var arr = [],
				vItem = form.events ? form.events[key] : null;

			if( vItem ) {
				if( vItem.option == 2 ) {
					if( defaultValue ) arr.push( defaultValue );
				}
				for( var i = 0,e;e = vItem.values[i];i++ ) {
					arr.push(e);
				}
			} else {
				if( defaultValue ) arr.push( defaultValue );
			}
			return arr;
		}

		this.postFireCellValueChanged = function (grid, rowIndex, colIndex, cellKey) {
			this.process.doPostCellValueChanged(grid, rowIndex, colIndex, cellKey);
		}

		this.preFireValueChanged = function (com) {
			this.process.preFireValueChanged(com);
		};

		this.fireValueChanged = function (com) {
			this.process.fireValueChanged(com);
			
			var valueChanged = com.valueChanged,cxt;
			
			if( form.useVariant ) {
				var events = this.getValueChanged(com.key,valueChanged);
				if( events.length > 0 ) {
					cxt = new View.Context(form);
					for( var i = 0,e;e = events[i];i++ ) {
					form.eval(e, cxt);
					}
				}
			} else {
				if( valueChanged ) {
					cxt = new View.Context(form);
					form.eval(valueChanged, cxt);
				}
			}
		};

		this.postFireValueChanged = function (com) {
			this.process.postFireValueChanged(com);
		};

		this.getUIProcess = function () {
			return this.process;
		},

		this.refreshVariant = function (calc) {
			var d, paras = {}, ctx = new View.Context(form);
			if (form.variant) {
				d = form.variant.dependency;
			}
			if (d) {
				$.each(d, function (i) {
				paras[d[i]] = form.eval(d[i], ctx);
				});
			}

			var cacheKey, o;
			if (d && d.length > 0) {
				cacheKey = $.toJSON(paras);
			}

			if (cacheKey) {
				o = cache.get(cacheKey);
			}

			var callback = function (o) {
				form.dependency = o.dependency;
				form.events = o.events;

				if (o.cache) {
				cache.set(cacheKey, o);
				}

				var process = form.getUIProcess();

				process.init();

				if (!calc) return;

				form.setSysExpVals("calcAll", true);

				process.calcAll();
				process.addOperation();

				form.removeSysExpVals("calcAll");
			}

			if ( !o ) {

				console.log("refresh variant....................");

				return new YIUI.MetaService().reBuildDepend(form.projectKey, form.formKey,
				YIUI.YesJSONUtil.toJSONObject(paras)).then(callback);
			} else {

				console.log("got variant from cache................");

				return $.Deferred(function (def) {
				def.resolve(callback(o));
				}).promise();
			}
		}

	}
})();
