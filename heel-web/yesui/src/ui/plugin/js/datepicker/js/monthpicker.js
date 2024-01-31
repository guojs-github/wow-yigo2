/**
 *
 * Date picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 * Dual licensed under the MIT and GPL licenses
 * 
 */
(function ($) {
	var MonthPicker = function () {
		var	ids = {},
			views = {
				years: 'monthPickerViewYears',
				months: 'monthPickerViewMonths'
			},
			tpl = {
				wrapper: '<div class="monthPicker"><table cellspacing="0" cellpadding="0"><tbody><tr></tr></tbody></table></div>',
				head: [
					'<td>',
					'<table cellspacing="0" cellpadding="0">',
						'<thead>',
							'<tr>',
								'<th class="monthPickerGoPrev"><a href="#"><span><%=prev%></span></a></th>',
								'<th class="monthPickerMonth"><a href="#"><span></span></a></th>',
								'<th class="monthPickerGoNext"><a href="#"><span><%=next%></span></a></th>',
							'</tr>',
						'</thead>',
					'</table></td>'
				],
				space : '<td class="monthPickerSpace"><div></div></td>',
				months: [
							'<tbody class="<%=className%>">',
								'<tr>',
									'<td><a href="#"><span class="<%=time%>"><%=data[0]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[1]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[2]%></span></a></td>',
								'</tr>',
								'<tr>',
								    '<td><a href="#"><span class="<%=time%>"><%=data[3]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[4]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[5]%></span></a></td>',
								'</tr>',
								'<tr>',
								    '<td><a href="#"><span class="<%=time%>"><%=data[6]%></span></a></td>',
								    '<td><a href="#"><span class="<%=time%>"><%=data[7]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[8]%></span></a></td>',
								'</tr>',
								'<tr>',
									'<td><a href="#"><span class="<%=time%>"><%=data[9]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[10]%></span></a></td>',
									'<td><a href="#"><span class="<%=time%>"><%=data[11]%></span></a></td>',
								'</tr>',
							'</tbody>'
						]
			},
			defaults = {
				flat: false,
				starts: 7,
				prev: '',
				next: '',
				lastSel: false,
				mode: 'single',
				view: 'months',
				calendars: 1,
				format: 'yyyy-MM',
				position: 'bottom',
				eventName: 'click',
				regional: 'zh-CN',//zh-CN、en-US
				locale: {},
				onRender: function(){return {};},
				onChange: function(){return true;},
				onShow: function(){return true;},
				onBeforeShow: function(){return true;},
				onHide: function(){return true;}
			},
			zhLocale = {
				months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
				weekMin: 'wk'
			},
			enLocale = {
				months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
				weekMin: 'wk'
			},
			fill = function(el) {
				var options = $(el).data('monthPicker');
				var cal = $(el);
				var currentCal = Math.floor(options.calendars/2), date, data, dow, html, tblCal;
				cal.find('td>table tbody').remove();
				for (var i = 0; i < options.calendars; i++) {
					date = new Date(options.current);
					date.addMonths(-currentCal + i);
					tblCal = cal.find('table').eq(i+1);
					switch (tblCal[0].className) {
						case 'monthPickerViewMonths':
							dow = date.getFullYear();
							break;
						case 'monthPickerViewYears':
							dow = (date.getFullYear()-6) + ' - ' + (date.getFullYear()+5);
							break;
					} 
					tblCal.find('thead tr:first th:eq(1) span').text(dow);
					dow = date.getFullYear()-6;
					data = {
						data: [],
						className: 'monthPickerYears',
						time:'times'
					}
					for ( var j = 0; j < 12; j++) {
						data.data.push(dow + j);
					}
					
					html = tmpl(tpl.months.join(''), data);
					date.setDate(1);
					data = {weeks:[], test: 10};
					data = {
							data: options.locale.monthsShort,
							className: 'monthPickerMonths',
							time:'times'
						};
					
					html = tmpl(tpl.months.join(''), data) + html;
					tblCal.append(html);
					$(el).find(".monthPickerYears .times:first").addClass("prev page");
					$(el).find(".monthPickerYears .times:last").addClass("next page");
					var times = $(".times");
					var current = new Date();
					var title = $(".monthPickerMonth").children().text();
					for (var s = 0; s < times.length; s++) {
						if(times[s].innerHTML == date.getMonthName()){
							$(times[s]).addClass("select");
						}
					}
				}
			},
			parseDate = function (date, format) {
				if (date.constructor == Date) {
					return new Date(date);
				}
				var parts = date.split(/\W+/);
				var against = format.split(/\W+/), d, m, y, h, min, now = new Date();
				for (var i = 0; i < parts.length; i++) {
					switch (against[i]) {
						case 'dd':
						case 'e':
							d = parseInt(parts[i],10);
							break;
						case 'MM':
							m = parseInt(parts[i], 10)-1;
							break;
						case 'yyyy':
						case 'y':
							y = parseInt(parts[i], 10);
							y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
							break;
						case 'HH':
						case 'I':
						case 'k':
						case 'l':
							h = parseInt(parts[i], 10);
							break;
						case 'P':
						case 'p':
							if (/pm/i.test(parts[i]) && h < 12) {
								h += 12;
							} else if (/am/i.test(parts[i]) && h >= 12) {
								h -= 12;
							}
							break;
						case 'mm':
							min = parseInt(parts[i], 10);
							break;
					}
				}
				if( m === 1){
					d = 28;
				}
				return new Date(
					y === undefined ? now.getFullYear() : y,
					m === undefined ? now.getMonth() : m,
					d === undefined ? now.getDate() : d,
					h === undefined ? now.getHours() : h,
					min === undefined ? now.getMinutes() : min
				);
			},
			extendDate = function(options) {
				if (Date.prototype.tempDate) {
					return;
				}
				Date.prototype.tempDate = null;
				Date.prototype.months = options.months;
				Date.prototype.monthsShort = options.monthsShort;
				Date.prototype.getMonthName = function(fullName) {
					return this[fullName ? 'months' : 'monthsShort'][this.getMonth()];
				};
				Date.prototype.addMonths = function (n) {
					if (this.tempDate == null) {
						this.tempDate = this.getDate();
					}
					this.setDate(1);
					this.setMonth(this.getMonth() + n);
					this.setDate(Math.min(this.tempDate, this.getMaxDays()));
				};
				Date.prototype.addYears = function (n) {
					if (this.tempDate == null) {
						this.tempDate = this.getDate();
					}
					this.setDate(1);
					this.setFullYear(this.getFullYear() + n);
					this.setDate(Math.min(this.tempDate, this.getMaxDays()));
				};
				Date.prototype.getMaxDays = function() {
					var tmpDate = new Date(Date.parse(this)),
						d = 28, m;
					m = tmpDate.getMonth();
					d = 28;
					while (tmpDate.getMonth() == m) {
						d ++;
						tmpDate.setDate(d);
					}
					return d - 1;
				};
				
			},
			layout = function (el) {
				var options = $(el).data('monthPicker');
				var cal = $(el);
				var tbl = cal.find('table:first').get(0);
				var width = tbl.offsetWidth;
				var height = tbl.offsetHeight;
			},
			click = function(ev) {
				if ($(ev.target).is('span')) {
					ev.target = ev.target.parentNode;
				}
				var el = $(ev.target);
				if (el.is('a')) {
					ev.target.blur();
					if (el.hasClass('monthPickerDisabled')) {
						return false;
					}
					var options = $(this).data('monthPicker');
					var parentEl = el.parent();
					var selectMonth = parentEl.get(0).innerText;
					var tblEl = parentEl.parent().parent().parent();
					var tblIndex = $('table', this).index(tblEl.get(0)) - 1;
					var tmp = new Date(options.current);
					var changed = false;
					var fillIt = false;
					var isSelect = false;
					var times = $(".times");
					var year = tmp.getFullYear();
					for (var s = 0; s < times.length; s++) {
						if(times[s].innerHTML == year){
							$(times[s]).addClass("ym");
						}
					}
					if (parentEl.is('th')) {
						if (parentEl.hasClass('monthPickerMonth')) {
							tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
							switch (tblEl.get(0).className) {
								case 'monthPickerViewMonths':
									tblEl.get(0).className = 'monthPickerViewYears';
									tblEl.find(".monthPickerYears .times:first").addClass("prev page");
									tblEl.find(".monthPickerYears .times:last").addClass("next page");
									el.find('span').text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
									break;
								case 'monthPickerViewYears':
									tblEl.get(0).className = 'monthPickerViewMonths';
									el.find('span').text(tmp.getFullYear());
									break;
							}
						} else if (parentEl.parent().parent().is('thead')) {
							switch (tblEl.get(0).className) {
								case 'monthPickerViewMonths':
									options.current.addYears(parentEl.hasClass('monthPickerGoPrev') ? -1 : 1);
									isSelect = true;
									break;
								case 'monthPickerViewYears':
									options.current.addYears(parentEl.hasClass('monthPickerGoPrev') ? -12 : 12);
									break;
							}
							fillIt = true;
						}
					}else if(parentEl.children().children().is('.page')){
						switch (tblEl.get(0).className) {
							case 'monthPickerViewYears':
								options.current.addYears(parentEl.children().children().hasClass('prev') ? -10 : 10);
								break;
						}
						fillIt = true;
					} else if (parentEl.is('td') && !parentEl.hasClass('monthPickerDisabled')) {
						switch (tblEl.get(0).className) {
							case 'monthPickerViewYears':
								options.current.setFullYear(parseInt(el.text(), 10));
								tblEl.get(0).className = 'monthPickerViewMonths';
								isSelect = true;
								break;
							default:
								var monthIndex = tblEl.find('tbody.monthPickerMonths td').index(parentEl);
								if(monthIndex === 1){
									tmp.setDate(28);
								}
								tmp.setMonth(monthIndex);
								tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
								if (parentEl.hasClass('monthPickerNotInMonth')) {
									tmp.addMonths(val > 15 ? -1 : 1);
								}
								
								options.date = tmp.valueOf();
								changed = true;
								break;
						}
						fillIt = true;
					}
					if (fillIt) {
						fill(this);
					}
					if(isSelect){
						$(".select").removeClass().addClass("times");
					}
					if (changed) {
						options.onChange.apply(this, prepareDate(options));
					}
				}
				return false;
			},
			prepareDate = function (options) {
				var tmp;
				if (options.mode == 'single') {
					tmp = new Date(options.date);
					
					return [tmp.Format(options.format),tmp.Format("yyyyMM"), tmp, options.el];
				} else {
					tmp = [[],[], options.el];
					$.each(options.date, function(nr, val){
						var date = new Date(val);
						tmp[0].push(formatDate(date, options.format));
						tmp[1].push(date);
					});
					return tmp;
				}
			},
			isChildOf = function(parentEl, el, container) {
				if (parentEl == el) {
					return true;
				}
				if (parentEl.contains) {
					return parentEl.contains(el);
				}
				if ( parentEl.compareDocumentPosition ) {
					return !!(parentEl.compareDocumentPosition(el) & 16);
				}
				var prEl = el.parentNode;
				while(prEl && prEl != container) {
					if (prEl == parentEl)
						return true;
					prEl = prEl.parentNode;
				}
				return false;
			},
			hide = function (ev) {
				if (ev.target != ev.data.trigger && !isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('monthPicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
			};
		return {
			init: function(options){
				options = $.extend({}, defaults, options||{});

				var l = $.cookie("locale");
				if(l){
					options.regional = l;
				}

				if(options.regional == "zh-CN") {
					options.locale = zhLocale;
				} else {
					options.locale = enLocale;
				}
				extendDate(options.locale);
				options.calendars = Math.max(1, parseInt(options.calendars,10)||1);
				options.mode = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
				return this.each(function(){
					if (!$(this).data('monthPicker')) {
						options.el = this;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format);
							options.date.setHours(0,0,0,0);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (!options.current) {
							options.current = new Date();
						} else {
							options.current = parseDate(options.current, options.format);
						} 
						options.current.setDate(1);
						options.current.setHours(0,0,0,0);
						var id = 'monthPicker_' + parseInt(Math.random() * 1000), cnt;
						options.id = id;
						$(this).data('monthPickerId', options.id);
						var cal = $(tpl.wrapper).attr('id', id).bind('click', click).data('monthPicker', options);
						if (options.className) {
							cal.addClass(options.className);
						}
						var html = '';
						for (var i = 0; i < options.calendars; i++) {
							cnt = options.starts;
							if (i > 0) {
								html += tpl.space;
							}
							html += tmpl(tpl.head.join(''), {
									week: options.locale.weekMin,
									prev: options.prev,
									next: options.next
								});
						}
						cal
							.find('tr:first').append(html)
								.find('table').addClass(views[options.view]);
						fill(cal.get(0));
						if (options.flat) {
							cal.appendTo(this).show().css('position', 'relative');
							layout(cal.get(0));
						} else {
							cal.appendTo(document.body);
							$(this).bind(options.eventName, show);
						}
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('monthPickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('monthPickerId')) {
						$('#' + $(this).data('monthPickerId')).hide();
					}
				});
			},
			setDate: function(date, shiftTo){
				return this.each(function(){
					if ($(this).data('monthPickerId')) {
						var cal = $('#' + $(this).data('monthPickerId'));
						var options = cal.data('monthPicker');
						options.date = date;
						if (options.date.constructor == String) {
							options.date = parseDate(options.date, options.format);
							options.date.setHours(0,0,0,0);
						}
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else {
							options.date = options.date.valueOf();
						}
						if (shiftTo) {
							options.current = new Date (options.mode != 'single' ? options.date[0] : options.date);
						}
						fill(cal.get(0));
					}
				});
			},
			getDate: function(formated) {
				if (this.size() > 0) {
					return prepareDate($('#' + $(this).data('monthPickerId')).data('monthPicker'))[formated ? 0 : 1];
				}
			},
			formatDate: function(date, format) {
				return formatDate(date, format);
			},
			clear: function(){
				return this.each(function(){
					if ($(this).data('monthPickerId')) {
						var cal = $('#' + $(this).data('monthPickerId'));
						var options = cal.data('monthPicker');
						if (options.mode != 'single') {
							options.date = [];
							fill(cal.get(0));
						}
					}
				});
			},
			fixLayout: function(){
				return this.each(function(){
					if ($(this).data('monthPickerId')) {
						var cal = $('#' + $(this).data('monthPickerId'));
						var options = cal.data('monthPicker');
						if (options.flat) {
							layout(cal.get(0));
						}
					}
				});
			}
		};
	}();
	$.fn.extend({
		MonthPicker: MonthPicker.init,
		MonthPickerHide: MonthPicker.hidePicker,
		MonthPickerShow: MonthPicker.showPicker,
		MonthPickerSetDate: MonthPicker.setDate,
		MonthPickerGetDate: MonthPicker.getDate,
		MonthPickerClear: MonthPicker.clear,
		MonthPickerLayout: MonthPicker.fixLayout
	});
	$.extend($, {
		MonthPickerFormatDate: MonthPicker.formatDate
	});
})(jQuery);

(function(){
  var cache = {};
 
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
     
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
        
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();