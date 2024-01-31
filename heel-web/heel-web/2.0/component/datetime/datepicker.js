/**
 *
 * Date picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 * Dual licensed under the MIT and GPL licenses
 * 2023.8.9 added by guojs
 * 
 */
(function ($) {
	var DatePicker = function () {
		var	ids = {},
			views = {
				years: 'datepickerViewYears',
				moths: 'datepickerViewMonths',
				days: 'datepickerViewDays'
			},
			tpl = { // 用于生成界面的模板
				wrapper: '<div class="datepicker"><div class="datepickerBorderT" /><div class="datepickerBorderB" /><div class="datepickerBorderL" /><div class="datepickerBorderR" /><div class="datepickerBorderTL" /><div class="datepickerBorderTR" /><div class="datepickerBorderBL" /><div class="datepickerBorderBR" /><div class="datepickerContainer"><table cellspacing="0" cellpadding="0"><tbody><tr></tr></tbody></table></div></div>',
				head: [
					'<td>',
					'<table cellspacing="0" cellpadding="0">',
						'<thead>',
							'<tr style="display:none">', // 2023.8.23 hide by guojs
								'<th class="datepickerGoPrev"><a href="#"><span><%=prev%></span></a></th>',
								'<th colspan="5" class="datepickerMonth"><a href="#"><span></span></a></th>',
								'<th class="datepickerGoNext"><a href="#"><span><%=next%></span></a></th>',
							'</tr>',
							'<tr>', // 2023.8.23 added by guojs
								'<td colspan="12">',
									'<div class="date-picker-year-month">',
										'<div class="date-picker-year">',
											// '<a class="year" href="#"><span>2000</span></a>',
											'<select>',
										        // '<option value="2022">2022</option>',
												// '<option value="2023">2023</option>',
												// '<option value="2024">2024</option>',
											'</select>',
										'</div>',
										'<div class="date-picker-month">',
											'<a class="month" href="#"><span>1</span></a>',
											'<a class="month" href="#"><span>2</span></a>',
											'<a class="month" href="#"><span>3</span></a>',
											'<a class="month" href="#"><span>4</span></a>',
											'<a class="month" href="#"><span>5</span></a>',
											'<a class="month" href="#"><span>6</span></a>',
											'<a class="month" href="#"><span>7</span></a>',
											'<a class="month" href="#"><span>8</span></a>',
											'<a class="month" href="#"><span>9</span></a>',
											'<a class="month" href="#"><span>10</span></a>',
											'<a class="month" href="#"><span>11</span></a>',
											'<a class="month" href="#"><span>12</span></a>',
										'</div>',
									'</div>',
								'</td>',
							'</tr>',
							'<tr class="datepickerDoW">',
								'<th><span><%=day1%></span></th>',
								'<th><span><%=day2%></span></th>',
								'<th><span><%=day3%></span></th>',
								'<th><span><%=day4%></span></th>',
								'<th><span><%=day5%></span></th>',
								'<th><span><%=day6%></span></th>',
								'<th><span><%=day7%></span></th>',
							'</tr>',
						'</thead>',
					'</table></td>'
				],
				space : '<td class="datepickerSpace"><div></div></td>',
				days: [
					'<tbody class="datepickerDays">',
						'<tr>',
							'<td class="<%=weeks[0].days[0].classname%>"><a href="#"><span><%=weeks[0].days[0].text%></span></a></td>',
							'<td class="<%=weeks[0].days[1].classname%>"><a href="#"><span><%=weeks[0].days[1].text%></span></a></td>',
							'<td class="<%=weeks[0].days[2].classname%>"><a href="#"><span><%=weeks[0].days[2].text%></span></a></td>',
							'<td class="<%=weeks[0].days[3].classname%>"><a href="#"><span><%=weeks[0].days[3].text%></span></a></td>',
							'<td class="<%=weeks[0].days[4].classname%>"><a href="#"><span><%=weeks[0].days[4].text%></span></a></td>',
							'<td class="<%=weeks[0].days[5].classname%>"><a href="#"><span><%=weeks[0].days[5].text%></span></a></td>',
							'<td class="<%=weeks[0].days[6].classname%>"><a href="#"><span><%=weeks[0].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=weeks[1].days[0].classname%>"><a href="#"><span><%=weeks[1].days[0].text%></span></a></td>',
							'<td class="<%=weeks[1].days[1].classname%>"><a href="#"><span><%=weeks[1].days[1].text%></span></a></td>',
							'<td class="<%=weeks[1].days[2].classname%>"><a href="#"><span><%=weeks[1].days[2].text%></span></a></td>',
							'<td class="<%=weeks[1].days[3].classname%>"><a href="#"><span><%=weeks[1].days[3].text%></span></a></td>',
							'<td class="<%=weeks[1].days[4].classname%>"><a href="#"><span><%=weeks[1].days[4].text%></span></a></td>',
							'<td class="<%=weeks[1].days[5].classname%>"><a href="#"><span><%=weeks[1].days[5].text%></span></a></td>',
							'<td class="<%=weeks[1].days[6].classname%>"><a href="#"><span><%=weeks[1].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=weeks[2].days[0].classname%>"><a href="#"><span><%=weeks[2].days[0].text%></span></a></td>',
							'<td class="<%=weeks[2].days[1].classname%>"><a href="#"><span><%=weeks[2].days[1].text%></span></a></td>',
							'<td class="<%=weeks[2].days[2].classname%>"><a href="#"><span><%=weeks[2].days[2].text%></span></a></td>',
							'<td class="<%=weeks[2].days[3].classname%>"><a href="#"><span><%=weeks[2].days[3].text%></span></a></td>',
							'<td class="<%=weeks[2].days[4].classname%>"><a href="#"><span><%=weeks[2].days[4].text%></span></a></td>',
							'<td class="<%=weeks[2].days[5].classname%>"><a href="#"><span><%=weeks[2].days[5].text%></span></a></td>',
							'<td class="<%=weeks[2].days[6].classname%>"><a href="#"><span><%=weeks[2].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=weeks[3].days[0].classname%>"><a href="#"><span><%=weeks[3].days[0].text%></span></a></td>',
							'<td class="<%=weeks[3].days[1].classname%>"><a href="#"><span><%=weeks[3].days[1].text%></span></a></td>',
							'<td class="<%=weeks[3].days[2].classname%>"><a href="#"><span><%=weeks[3].days[2].text%></span></a></td>',
							'<td class="<%=weeks[3].days[3].classname%>"><a href="#"><span><%=weeks[3].days[3].text%></span></a></td>',
							'<td class="<%=weeks[3].days[4].classname%>"><a href="#"><span><%=weeks[3].days[4].text%></span></a></td>',
							'<td class="<%=weeks[3].days[5].classname%>"><a href="#"><span><%=weeks[3].days[5].text%></span></a></td>',
							'<td class="<%=weeks[3].days[6].classname%>"><a href="#"><span><%=weeks[3].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=weeks[4].days[0].classname%>"><a href="#"><span><%=weeks[4].days[0].text%></span></a></td>',
							'<td class="<%=weeks[4].days[1].classname%>"><a href="#"><span><%=weeks[4].days[1].text%></span></a></td>',
							'<td class="<%=weeks[4].days[2].classname%>"><a href="#"><span><%=weeks[4].days[2].text%></span></a></td>',
							'<td class="<%=weeks[4].days[3].classname%>"><a href="#"><span><%=weeks[4].days[3].text%></span></a></td>',
							'<td class="<%=weeks[4].days[4].classname%>"><a href="#"><span><%=weeks[4].days[4].text%></span></a></td>',
							'<td class="<%=weeks[4].days[5].classname%>"><a href="#"><span><%=weeks[4].days[5].text%></span></a></td>',
							'<td class="<%=weeks[4].days[6].classname%>"><a href="#"><span><%=weeks[4].days[6].text%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td class="<%=weeks[5].days[0].classname%>"><a href="#"><span><%=weeks[5].days[0].text%></span></a></td>',
							'<td class="<%=weeks[5].days[1].classname%>"><a href="#"><span><%=weeks[5].days[1].text%></span></a></td>',
							'<td class="<%=weeks[5].days[2].classname%>"><a href="#"><span><%=weeks[5].days[2].text%></span></a></td>',
							'<td class="<%=weeks[5].days[3].classname%>"><a href="#"><span><%=weeks[5].days[3].text%></span></a></td>',
							'<td class="<%=weeks[5].days[4].classname%>"><a href="#"><span><%=weeks[5].days[4].text%></span></a></td>',
							'<td class="<%=weeks[5].days[5].classname%>"><a href="#"><span><%=weeks[5].days[5].text%></span></a></td>',
							'<td class="<%=weeks[5].days[6].classname%>"><a href="#"><span><%=weeks[5].days[6].text%></span></a></td>',
						'</tr>',
					'</tbody>'
				],
				months: [
					'<tbody class="<%=className%>">',
						'<tr>',
							'<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[0]%></span></a></td>',
							'<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[1]%></span></a></td>',
							'<td colspan="3"><a href="#"><span class="<%=time%>"><%=data[2]%></span></a></td>',
						'</tr>',
						'<tr>',
						    '<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[3]%></span></a></td>',
							'<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[4]%></span></a></td>',
							'<td colspan="3"><a href="#"><span class="<%=time%>"><%=data[5]%></span></a></td>',
						'</tr>',
						'<tr>',
						    '<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[6]%></span></a></td>',
						    '<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[7]%></span></a></td>',
							'<td colspan="3"><a href="#"><span class="<%=time%>"><%=data[8]%></span></a></td>',
						'</tr>',
						'<tr>',
							'<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[9]%></span></a></td>',
							'<td colspan="2"><a href="#"><span class="<%=time%>"><%=data[10]%></span></a></td>',
							'<td colspan="3"><a href="#"><span class="<%=time%>"><%=data[11]%></span></a></td>',
						'</tr>',
					'</tbody>'
				]
			},
			defaults = { // 默认配置值
				flat: false,
				starts: 7,
//				prev: '&#9664;',
//				next: '&#9654;',
				prev: '',
				next: '',
				lastSel: false,
				mode: 'single',
				view: 'days',
				calendars: 1,
				format: 'yyyy-MM-dd',
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
			zhLocale = { // 中文标签
				days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'], // 星期全称
				daysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'], // 星期简称
				daysMin: ['日', '一', '二', '三', '四', '五', '六', '日'], // 星期最短称呼
				months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], // 月份全称
				monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], // 月份简称
				weekMin: 'wk'
			},
			enLocale = { // 英语标签
				days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // 星期全称
				daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 星期简称
				daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], // 星期最短称呼
				months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], // 月份全称
				monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // 月份简称
				weekMin: 'wk'
			},

			fill = function(el) { // 创建或者调整下拉界面
				var options = $(el).data('datepicker');
				var cal = $(el);
				var currentCal = Math.floor(options.calendars/2), date, data, dow, month, cnt = 0, week, days, indic, indic2, html, tblCal;
				cal.find('td>table tbody').remove();
				for (var i = 0; i < options.calendars; i++) {
					date = new Date(options.current); // 获取当前日期，这个可能是当前时间或者是选择的日期
					date.addMonths(- currentCal + i); // 加减显示月份，如果calendars=1，只有一个日期选择，则此处应该0，不挪动月份

					// 获取当前是打算选择日期、月份还是年份
					// cal.find('table')产生一个匹配元素数组
					// .eq(i+1)，指定返回结果数组的第几个项目
					tblCal = cal.find('table').eq(i+1);
					switch (tblCal[0].className) {
						case 'datepickerViewDays':
							// 获取年月信息，例如，"八月, 2023"
							dow = formatDate(date, 'B, Y');
							break;
						case 'datepickerViewMonths':
							dow = date.getFullYear();
							break;
						case 'datepickerViewYears':
							dow = (date.getFullYear()-6) + ' - ' + (date.getFullYear()+5);
							break;
					} 
					// th:eq(1)，返回匹配th第二个结果，就是当中文字显示部分，修改为dow的内容
					tblCal.find('thead tr:first th:eq(1) span').text(dow);
					
					dow = date.getFullYear() - 6;
					data = {
						data: [],
						className: 'datepickerYears',
						time:'times'
					}
					for (var j = 0; j < 12; j++) { // 12年组成的年份范围
						data.data.push(dow + j);
					}
					
					html = tmpl(tpl.months.join(''), data); // 组成年份选择界面

					/////////////////////////////////////////////////////////////////////////////////
					date.setDate(1); // 日期设置为1号
					data = {
						weeks:[]
					};
					month = date.getMonth(); // 获取当前日期的月份
					// options.starts表示从周几开始每行日期的显示
					// date.getDay()表示本月1号是周几
					// 此处计算需要从几月几日开始显示日期
					var dow = (date.getDay() - options.starts) % 7;
					date.addDays(-(dow + (dow < 0 ? 7 : 0)));

					week = -1;
					cnt = 0;
					while (cnt < 42) { // 一共显示6周，6*7=42个日期格子
						indic = parseInt(cnt/7, 10); 
						indic2 = cnt%7;
						if (!data.weeks[indic]) {
							week = date.getWeekNumber();
							data.weeks[indic] = {
								week: week,
								days: []
							};
						}
						data.weeks[indic].days[indic2] = { // 显示的信息
							text: date.getDate(), // 日期数字
							classname: [] // 附加的样式信息
						};

						if (month != date.getMonth()) { // 不是当月日期，禁用
							data.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
						}

						if (date.getDay() == 0) { // 周日
							data.weeks[indic].days[indic2].classname.push('datepickerSunday');
						}

						if (date.getDay() == 6) { // 周六
							data.weeks[indic].days[indic2].classname.push('datepickerSaturday');
						}

						var fromUser = options.onRender(date);
						var val = date.valueOf();
						if (!options.select) { /*用户没有选定任何值*/
							if (options.date == val) { /*控件日期等于当前单元格日期, 此处应该是控件赋予了默认值*/
								data.weeks[indic].days[indic2].classname.push('no-user-input');
							}
						}

						if (fromUser.selected 
							|| options.date == val/*控件日期等于当前单元格日期*/ 
							|| $.inArray(val, options.date) > -1 
							|| (options.mode == 'range' && val >= options.date[0] && val <= options.date[1]) /* 日期在选中的范围内 */) { // 选中？
							data.weeks[indic].days[indic2].classname.push('datepickerSelected');
						}

						if ((new Date()).setHours(0, 0, 0, 0) == val) { // 如果与当前日期一样
							data.weeks[indic].days[indic2].classname.push('selected');
						}
				
						if (fromUser.disabled) { // 用户自定义的禁用
							data.weeks[indic].days[indic2].classname.push('datepickerDisabled');
						}

						if (fromUser.className) { // 用户自定义的样式类
							data.weeks[indic].days[indic2].classname.push(fromUser.className);
						}
						data.weeks[indic].days[indic2].classname = data.weeks[indic].days[indic2].classname.join(' '); // 将样式类名组成一个值
						
						cnt++; // 计数+1
						date.addDays(1); // 日期+1
					}
					html = tmpl(tpl.days.join(''), data) + html; // 生成日期选择界面
									
					/////////////////////////////////////////////////////////////////////////////////
					data = {
						data: options.locale.monthsShort,
						className: 'datepickerMonths',
						time:'times'
					};
					html = tmpl(tpl.months.join(''), data) + html; // 生成月份选择界面
					tblCal.append(html);


					// 新的年月选择器，更新年月信息
					fill_ex(options, cal);
				}
			},

			fill_ex = function(options, cal) { // 更新新增界面元素的信息
				// console.log('fill_ex()');

				// 更新年份显示
				let current_year = options.current.getFullYear();
				let select_year = cal.find('.date-picker-year-month > .date-picker-year select');
				if (select_year.find('option').length == 0) { // 初始化年份下拉
					for (let y = current_year - 100; y <= (current_year + 100); y++) {
						$('<option value="' + y + '">' + y + '</option>').appendTo(select_year);
					}
				}
				select_year.val(current_year); // 更新年份选择

				// 更新月份显示
				let current_month = options.current.getMonth();
				let now = new Date();
				let select_month_options = cal.find('.date-picker-year-month > .date-picker-month a');
				select_month_options.attr('class', 'month'); // 重置样式
				for (let i = 0; i < select_month_options.length; i++) { // 遍历12个月份的选项，找到匹配的选项，修改样式
					let option = $(select_month_options[i]);
					
					if (!options.select) { // 用户没有选定任何值
						option.addClass('no-user-input');
					}

					if (i == now.getMonth()) { // 匹配当前时间月份
						option.addClass('selected');
					}	

					if (i == current_month/*控件月份等于当前单元格月份*/ 
						|| (options.mode == 'range' && i >= options.date[0].getMonth() && val <= options.date[1].getMonth()) /* 单元格月份在选中的范围内 */) { // 选中？
							option.addClass('datepickerSelected');
					}


				}
			},

			parseDate = function (date, format) { // 格式化日期
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
				return new Date(
					y === undefined ? now.getFullYear() : y,
					m === undefined ? now.getMonth() : m,
					d === undefined ? now.getDate() : d,
					h === undefined ? now.getHours() : h,
					min === undefined ? now.getMinutes() : min
				);
			},

			formatDate = function(date, format) { // 格式化日期信息
				var m = date.getMonth();
				var d = date.getDate();
				var y = date.getFullYear();
				var wn = date.getWeekNumber();
				var w = date.getDay();
				var s = {};
				var hr = date.getHours();
				var pm = (hr >= 12);
				var ir = (pm) ? (hr - 12) : hr;
				var dy = date.getDayOfYear();
				if (ir == 0) {
					ir = 12;
				}
				var min = date.getMinutes();
				var sec = date.getSeconds();
				var parts = format.split(""), part;
				for ( var i = 0; i < parts.length; i++ ) {
					part = parts[i];
					switch (parts[i]) {
						case 'a':
							part = date.getDayName();
							break;
						case 'A':
							part = date.getDayName(true);
							break;
						case 'b':
							part = date.getMonthName();
							break;
						case 'B':
							part = date.getMonthName(true);
							break;
						case 'C':
							part = 1 + Math.floor(y / 100);
							break;
						case 'dd':
							part = (d < 10) ? ("0" + d) : d;
							break;
						case 'e':
							part = d;
							break;
						case 'HH':
							part = (hr < 10) ? ("0" + hr) : hr;
							break;
						case 'I':
							part = (ir < 10) ? ("0" + ir) : ir;
							break;
						case 'j':
							part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
							break;
						case 'k':
							part = hr;
							break;
						case 'l':
							part = ir;
							break;
						case 'MM':
							part = (m < 9) ? ("0" + (1+m)) : (1+m);
							break;
						case 'mm':
							part = (min < 10) ? ("0" + min) : min;
							break;
						case 'p':
						case 'P':
							part = pm ? "PM" : "AM";
							break;
						case 's':
							part = Math.floor(date.getTime() / 1000);
							break;
						case 'ss':
							part = (sec < 10) ? ("0" + sec) : sec;
							break;
						case 'u':
							part = w + 1;
							break;
						case 'w':
							part = w;
							break;
						case 'y':
							part = ('' + y).substr(2, 2);
							break;
						case 'Y':
						case 'yyyy':
							part = y;
							break;
					}
					parts[i] = part;
				}
				return parts.join("");
			},
			extendDate = function(options) { // 扩展Date对象
				if (Date.prototype.tempDate) {
					return;
				}
				Date.prototype.tempDate = null;
				Date.prototype.months = options.months;
				Date.prototype.monthsShort = options.monthsShort;
				Date.prototype.days = options.days;
				Date.prototype.daysShort = options.daysShort;
				Date.prototype.getMonthName = function(fullName) {
					return this[fullName ? 'months' : 'monthsShort'][this.getMonth()];
				};
				Date.prototype.getDayName = function(fullName) {
					return this[fullName ? 'days' : 'daysShort'][this.getDay()];
				};
				Date.prototype.addDays = function (n) {
					this.setDate(this.getDate() + n);
					this.tempDate = this.getDate();
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
				Date.prototype.getFirstDay = function() {
					var tmpDate = new Date(Date.parse(this));
					tmpDate.setDate(1);
					return tmpDate.getDay();
				};
				Date.prototype.getWeekNumber = function() {
					var tempDate = new Date(this);
					tempDate.setDate(tempDate.getDate() - (tempDate.getDay() + 6) % 7 + 3);
					var dms = tempDate.valueOf();
					tempDate.setMonth(0);
					tempDate.setDate(4);
					return Math.round((dms - tempDate.valueOf()) / (604800000)) + 1;
				};
				Date.prototype.getDayOfYear = function() {
					var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
					var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
					var time = now - then;
					return Math.floor(time / 24*60*60*1000);
				};
				
			},
			layout = function (el) { // flat模式的额外样式？
				var options = $(el).data('datepicker');
//				var cal = $('#' + options.id);
				var cal = $(el);
				if (!options.extraHeight) {
					var divs = $(el).find('div');
					options.extraHeight = divs.get(0).offsetHeight + divs.get(1).offsetHeight;
					options.extraWidth = divs.get(2).offsetWidth + divs.get(3).offsetWidth;
				}
				var tbl = cal.find('table:first').get(0);
				var width = tbl.offsetWidth;
				var height = tbl.offsetHeight;
				/*cal.css({
					width: width + options.extraWidth + 'px',
					height: height + options.extraHeight + 'px'
				}).find('div.datepickerContainer').css({
					width: width + 'px',
					height: height + 'px'
				});*/
			},

			click = function(ev) { // 日历上的click事件统一处理
				// 预处理，如果点击目标是<span>，则取父元素
				if ($(ev.target).is('span')) {
					ev.target = ev.target.parentNode;
				}
				var el = $(ev.target);

				if (el.is('a')) { // 只有是<a>才进行处理
					ev.target.blur();
					if (el.hasClass('datepickerDisabled')) { // 这个元素禁用，不处理
						return false;
					}
					var options = $(this).data('datepicker'); // 配置信息
					var parentEl = el.parent();
					var selectMonth = parentEl.get(0).innerText;
					var tblEl = parentEl.parent().parent().parent();
					var tblIndex = $('table', this).index(tblEl.get(0)) - 1;
					var tmp = new Date(options.current); // current标志的时间
					var changed = false;
					var fillIt = false;
					var times = $(".times"); // 貌似是12个月份+12个年份，一共24个格子
					var year = tmp.getFullYear();
					var month = selectMonth.substr(0,2);
					var months = selectMonth.substr(0,3);
					for (var s = 0; s < times.length; s++) {
						if(times[s].innerHTML == year || times[s].innerHTML == month || times[s].innerHTML == months){
							$(times[s]).addClass("ym");
						}
					}
					if (parentEl.is('th')) {
						if (parentEl.hasClass('datepickerMonth')) { // 此处切换显示日期、显示月、显示年的界面
							tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
							switch (tblEl.get(0).className) {
								case 'datepickerViewDays':
									tblEl.get(0).className = 'datepickerViewMonths';
									el.find('span').text(tmp.getFullYear());
									$("div.time").css("display","none");
									break;
								case 'datepickerViewMonths':
									tblEl.get(0).className = 'datepickerViewYears';
									el.find('span').text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
									$("div.time").css("display","none");
									break;
								case 'datepickerViewYears':
									tblEl.get(0).className = 'datepickerViewDays';
									el.find('span').text(formatDate(tmp, 'B, Y'));
									$("div.time").css("display","block");
									break;
							}
						} else if (parentEl.parent().parent().is('thead')) {
							switch (tblEl.get(0).className) {
								case 'datepickerViewDays':
									options.current.addMonths(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									break;
								case 'datepickerViewMonths':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
									break;
								case 'datepickerViewYears':
									options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -12 : 12);
									break;
							}
							fillIt = true;
						}
					} else if (parentEl.is('td') && !parentEl.hasClass('datepickerDisabled')) {
						switch (tblEl.get(0).className) {
							case 'datepickerViewMonths': // 月份界面，月份选择
								options.current.setMonth(tblEl.find('tbody.datepickerMonths td').index(parentEl));
								options.current.setFullYear(parseInt(tblEl.find('thead th.datepickerMonth span').text(), 10));
								options.current.addMonths(Math.floor(options.calendars/2) - tblIndex); // 范围控件调整月份
								tblEl.get(0).className = 'datepickerViewDays';
								$("div.time").css("display","block");
								break;
							case 'datepickerViewYears': // 年份界面，年份选择
								options.current.setFullYear(parseInt(el.text(), 10));
								tblEl.get(0).className = 'datepickerViewMonths';
								break;
							default: // 日期界面，日期选择
								var val = parseInt(el.text(), 10);
								tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
								if (parentEl.hasClass('datepickerNotInMonth')) {
									tmp.addMonths(val > 15 ? -1 : 1);
								}
								tmp.setDate(val);
								options.date = tmp.valueOf();
								changed = true; // 触发数据修改事件
								break;
						}

						fillIt = true; // 重新绘制界面的标志
					} 

					if (changed) {
						options.onChange.apply(this, prepareDate(options));
						options.select = true; // 用户有选择了
					}

					if (fillIt) { // 重新绘制界面
						fill(this); // this应该是发生点击事件的元素，这个click始终是绑定在外框根元素上的
					}
				}

				click_ex.call(this, ev);

				return false;
			},

			click_ex = function(event) { // 新界面的点击处理
				let options = $(this).data('datepicker'); // 配置信息
				let change = false;
				let refresh = false;
				let el = $(event.target);

				if (el.is('a') && el.parent().attr('class') == 'date-picker-month') { // 月份
					console.log('month selected');
					let month = el.parent().find('a').index(el); // 获得选择的月份
					options.current.setMonth(month);
					// options.current.addMonths(Math.floor(options.calendars/2) - tblIndex); // 范围控件调整月份

					refresh = true; // 重新绘制界面的标志
				}


				if (change) {
					options.onChange.apply(this, prepareDate(options));
					options.select = true; // 用户有选择了
				}

				if (refresh) { // 重新绘制界面
					fill(this); // this应该是发生点击事件的元素，这个click始终是绑定在外框根元素上的
				}
			},

			change = function(event) { // 数据修改事件
				console.log('date picker change event.');
				let options = $(this).data('datepicker'); // 配置信息
				let change = false;
				let refresh = false;
				let el = $(event.target);

				if (el.is('select') && el.parent().attr('class') == 'date-picker-year') { // 年份
					options.current.setFullYear(el.val());

					refresh = true;
				}

				if (change) {
					options.onChange.apply(this, prepareDate(options));
					options.select = true; // 用户有选择了
				}

				if (refresh) { // 重新绘制界面
					fill(this); // this应该是发生点击事件的元素，这个click始终是绑定在外框根元素上的
				}				
			},

			prepareDate = function (options) { // 准备向接口返回的当前日期数据
				var tmp;
				if (options.mode == 'single') {
					tmp = new Date(options.date); // single模式下，更新options.date就更新返回值了
					if($(options.el).children().hasClass("time")){ // 格式化时间，但是似乎没有使用这个功能
						var time = $(options.el).children(".time");
						var hours = time.children(".smartspinner")[0].value;
						var minutes = time.children(".smartspinner")[1].value;
						var seconds = time.children(".smartspinner")[2].value;
						tmp.setHours(hours);
						tmp.setMinutes(minutes);
						tmp.setSeconds(seconds);
					}
					return [tmp.Format(options.format) /*Date.Format()*/, tmp, options.el];
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

			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
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
			show = function (ev) { // 显示下拉
				var cal = $('#' + $(this).data('datepickerId')); // 找到下拉界面的外部元素
				if (!cal.is(':visible')) { // 如果下拉隐藏了，则执行，根据class='datepicker'默认应该是隐藏的
					var calEl = cal.get(0);
					fill(calEl);
					var options = cal.data('datepicker');
					options.onBeforeShow.apply(this, [cal.get(0)]);
					var pos = $(this).offset();
					var viewPort = getViewport();
					var top = pos.top;
					var left = pos.left;
					var oldDisplay = $.curCSS(calEl, 'display');
					cal.css({
						visibility: 'hidden',
						display: 'block'
					});
					layout(calEl);
					switch (options.position){
						case 'top':
							top -= calEl.offsetHeight;
							break;
						case 'left':
							left -= calEl.offsetWidth;
							break;
						case 'right':
							left += this.offsetWidth;
							break;
						case 'bottom':
							top += this.offsetHeight;
							break;
					}
					if (top + calEl.offsetHeight > viewPort.t + viewPort.h) {
						top = pos.top  - calEl.offsetHeight;
					}
					if (top < viewPort.t) {
						top = pos.top + this.offsetHeight + calEl.offsetHeight;
					}
					if (left + calEl.offsetWidth > viewPort.l + viewPort.w) {
						left = pos.left - calEl.offsetWidth;
					}
					if (left < viewPort.l) {
						left = pos.left + this.offsetWidth
					}
					cal.css({
						visibility: 'visible',
						display: 'block',
						top: top + 'px',
						left: left + 'px'
					});
					if (options.onShow.apply(this, [cal.get(0)]) != false) {
						cal.show();
					}
					$(document).bind('mousedown', {cal: cal, trigger: this}, hide);
				}

				return false;
			},
			hide = function (ev) {
				if (ev.target != ev.data.trigger && !isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('datepicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
			};

		return { // 定义所有暴露出来的接口
			init: function(options){ // 初始化控件接口
				// 配置
				options = $.extend({}, defaults, options||{}); // 配置默认值与用户指定值合并在一起
				
				// 区域语言
				var locale = $.cookie('locale'); // 从cookie中获取当前区域
				if (locale) {
					options.regional = locale;
				}
				if(options.regional == 'zh-CN') { // 要么中文处理配置
					options.locale = zhLocale;
				} else { // 要么英语处理配置
					options.locale = enLocale;
				}
				extendDate(options.locale);

				options.calendars = Math.max(1, parseInt(options.calendars, 10)||1); // 月历的数量，如果range是不是就应该有2个
				options.mode = /single|multiple|range/.test(options.mode) ? options.mode : 'single'; // 三种模式single、multiple、range

				return this.each(function() { // 因为绑定到jquery元素，this指向的jquery元素,因为$()产生的，所以可能有多个，所以用了each
					if (!$(this).data('datepicker')) { // 没有信息，所以要初始化
						options.el = this;

						if (options.date.constructor == String) { // 日期构造时字符串
							options.date = parseDate(options.date, options.format);
							options.date.setHours(0, 0, 0, 0);
						}

						// 解读参数中的日期信息
						if (options.mode != 'single') {
							if (options.date.constructor != Array) {
								options.date = [options.date.valueOf()];
								if (options.mode == 'range') {
									options.date.push(((new Date(options.date[0])).setHours(23, 59, 59, 0)).valueOf());
								}
							} else {
								for (var i = 0; i < options.date.length; i++) {
									options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
								}
								if (options.mode == 'range') {
									options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
								}
							}
						} else { // single模式，单选模式吧
							options.date = options.date.valueOf(); // valueOf() 返回对象原始值
						}

						// 获取当前时间选择
						if (!options.current) { // 没有则赋予当前时间
							// options.
							options.current = new Date(); 
						} else {
							options.current = parseDate(options.current, options.format);
						}

						options.current.setDate(1); // Date.setDate,设置日期，这里是设置为1号
						options.current.setHours(0, 0, 0, 0); // Date.setHours, 参数：小时、分钟、秒、毫秒

						// 生成id
						var id = 'datepicker_' + parseInt(Math.random() * 1000), cnt;
						options.id = id;
						$(this).data('datepickerId', options.id); // 给界面根元素添加id信息，下次不会重复生成

						// 生成界面 ////////////////////////////////////////////////////////////////////////
						var cal = $(tpl.wrapper) // tpl.wrapper，界面基本框架
							.attr('id', id) // 记录id
							.bind('click', click) // 统一的点击事件处理器？？？！！！！
							.bind('change', change) // 统一的数据修改事件处理器
							.data('datepicker', options); // 界面元素，带着自身配置信息
						if (options.className) { // 有额外的样式，就给加上
							cal.addClass(options.className);
						}
						var html = '';
						for (var i = 0; i < options.calendars; i++) { // 绘制月历
							cnt = options.starts; // 其实是周几？
							if (i > 0) { // 如果输出第二个或者更多日期，则当中加入分割部分
								html += tpl.space;
							}
							/*
								tpl.head.join('')，输出日历头部模板。
								<td>
									<table cellspacing=\"0\" cellpadding=\"0\">
										<thead>
											<tr>
												<th class=\"datepickerGoPrev\">
													<a href=\"#\"><span><%=prev%></span></a>
												</th>
												<th colspan=\"5\" class=\"datepickerMonth\">
													<a href=\"#\"><span></span></a>
												</th>
												<th class=\"datepickerGoNext\">
													<a href=\"#\"><span><%=next%></span></a>
												</th>
											</tr>
											<tr class=\"datepickerDoW\">			
												<th><span><%=day1%></span></th>
												<th><span><%=day2%></span></th>
												<th><span><%=day3%></span></th>
												<th><span><%=day4%></span></th>
												<th><span><%=day5%></span></th>
												<th><span><%=day6%></span></th>
												<th><span><%=day7%></span></th>
											</tr>
										</thead>
									</table>
								</td>

								tmpl(...),替换了<%=prev%><%=next%>和<%=day1%>到<%=day7%>
								<td>
									<table cellspacing=\"0\" cellpadding=\"0\">
										<thead>
											<tr>
												<th class=\"datepickerGoPrev\">
													<a href=\"#\"><span></span></a>
												</th>
												<th colspan=\"5\" class=\"datepickerMonth\">
													<a href=\"#\"><span></span></a>
												</th>
												<th class=\"datepickerGoNext\">
													<a href=\"#\"><span></span></a>
												</th>
											</tr>
											<tr class=\"datepickerDoW\">
												<th><span>日</span></th>
												<th><span>一</span></th>
												<th><span>二</span></th>
												<th><span>三</span></th>
												<th><span>四</span></th>
												<th><span>五</span></th>
												<th><span>六</span></th>
											</tr>
										</thead>
									</table>
								</td>
							*/
							html += tmpl(tpl.head.join(''), {
									week: options.locale.weekMin,
									prev: options.prev, // 年月左侧，可供嵌入的元素
									next: options.next, // 年月右侧，可供嵌入的元素
									day1: options.locale.daysMin[(cnt++)%7], // 第一天是周几？
									day2: options.locale.daysMin[(cnt++)%7],
									day3: options.locale.daysMin[(cnt++)%7],
									day4: options.locale.daysMin[(cnt++)%7],
									day5: options.locale.daysMin[(cnt++)%7],
									day6: options.locale.daysMin[(cnt++)%7],
									day7: options.locale.daysMin[(cnt++)%7]
								});
						}
						cal.find('tr:first').append(html) // 将日历头部添加到框架中
							.find('table').addClass(views[options.view]); // 根据日历类型添加样式class名称
						/*
							<div class=\"datepickerBorderT\"></div>
							<div class=\"datepickerBorderB\"></div>
							<div class=\"datepickerBorderL\"></div>
							<div class=\"datepickerBorderR\"></div>
							<div class=\"datepickerBorderTL\"></div>
							<div class=\"datepickerBorderTR\"></div>
							<div class=\"datepickerBorderBL\"></div>
							<div class=\"datepickerBorderBR\"></div>
							<div class=\"datepickerContainer\">
								<table cellspacing=\"0\" cellpadding=\"0\">
									<tbody>
										<tr>
											<td>
												<table cellspacing=\"0\" cellpadding=\"0\" class=\"datepickerViewDays\">
													<thead>
														<tr>
															<th class=\"datepickerGoPrev\">
																<a href=\"#\"><span></span></a>
															</th>
															<th colspan=\"5\" class=\"datepickerMonth\">
																<a href=\"#\"><span>八月, 2023</span></a>
															</th>
															<th class=\"datepickerGoNext\">
																<a href=\"#\"><span></span></a>
															</th>
														</tr>
														<tr class=\"datepickerDoW\">
															<th><span>日</span></th>
															<th><span>一</span></th>
															<th><span>二</span></th>
															<th><span>三</span></th>
															<th><span>四</span></th>
															<th><span>五</span></th>
															<th><span>六</span></th>
														</tr>
													</thead>
													<tbody class=\"datepickerMonths\"> <!--选择月份-->
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">一月</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">二月</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">三月</span></a>
															</td>
														</tr>
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">四月</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">五月</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">六月</span></a>
															</td>
														</tr>
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">七月</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">八月</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">九月</span></a>
															</td>
														</tr>
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">十月</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">十一月</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">十二月</span></a>
															</td>
														</tr>
													</tbody>
													<tbody class=\"datepickerDays\"> <!--选择日期-->
														<tr>
															<td class=\"datepickerNotInMonth datepickerSunday\">
																<a href=\"#\"><span>30</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>31</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>1</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>2</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>3</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>4</span></a>
															</td>
															<td class=\"datepickerSaturday\">
																<a href=\"#\"><span>5</span></a>
															</td>
														</tr>
														<tr>
															<td class=\"datepickerSunday\">
																<a href=\"#\"><span>6</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>7</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>8</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>9</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>10</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>11</span></a>
															</td>
															<td class=\"datepickerSaturday\">
																<a href=\"#\"><span>12</span></a>
															</td>
														</tr>
														<tr>
															<td class=\"datepickerSunday\">
																<a href=\"#\"><span>13</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>14</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>15</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>16</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>17</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>18</span></a>
															</td>
															<td class=\"datepickerSaturday\">
																<a href=\"#\"><span>19</span></a>
															</td>
														</tr>
														<tr>
															<td class=\"datepickerSunday\">
																<a href=\"#\"><span>20</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>21</span></a>
															</td>
															<td class=\"selected\">
																<a href=\"#\"><span>22</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>23</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>24</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>25</span></a>
															</td>
															<td class=\"datepickerSaturday\">
																<a href=\"#\"><span>26</span></a>
															</td>
														</tr>
														<tr>
															<td class=\"datepickerSunday\">
																<a href=\"#\"><span>27</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>28</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>29</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>30</span></a>
															</td>
															<td class=\"\">
																<a href=\"#\"><span>31</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>1</span></a>
															</td>
															<td class=\"datepickerNotInMonth datepickerSaturday\">
																<a href=\"#\"><span>2</span></a>
															</td>
														</tr>
														<tr>
															<td class=\"datepickerNotInMonth datepickerSunday\">
																<a href=\"#\"><span>3</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>4</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>5</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>6</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>7</span></a>
															</td>
															<td class=\"datepickerNotInMonth\">
																<a href=\"#\"><span>8</span></a>
															</td>
															<td class=\"datepickerNotInMonth datepickerSaturday\">
																<a href=\"#\"><span>9</span></a>
															</td>
														</tr>
													</tbody>
													<tbody class=\"datepickerYears\"> <!--选择年份-->
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2017</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2018</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">2019</span></a>
															</td>
														</tr>
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2020</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2021</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">2022</span></a>
															</td>
														</tr>
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2023</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2024</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">2025</span></a>
															</td>
														</tr>
														<tr>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2026</span></a>
															</td>
															<td colspan=\"2\">
																<a href=\"#\"><span class=\"times\">2027</span></a>
															</td>
															<td colspan=\"3\">
																<a href=\"#\"><span class=\"times\">2028</span></a>
															</td>
														</tr>
													</tbody>
												</table>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						*/
						fill(cal.get(0)); // 填入除了头部年月外的界面内容
						if (options.flat) { // 是flat，
							cal.appendTo(this) // 下拉界面添加到发生事件的jquery界面元素上
								.show() // 只是jquery的show，显示下拉
								.css('position', 'relative');
							layout(cal.get(0));
						} else { // 不是flat
							cal.appendTo(document.body); // 直接绑到body元素上
							$(this).bind(options.eventName, show);
						}
					} // if 没有创建过
				});
			},

			showPicker: function() {
				return this.each( function () {
					if ($(this).data('datepickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('datepickerId')) {
						$('#' + $(this).data('datepickerId')).hide();
					}
				});
			},
			setDate: function(date, shiftTo){
				return this.each(function(){
					if ($(this).data('datepickerId')) {
						var cal = $('#' + $(this).data('datepickerId'));
						var options = cal.data('datepicker');
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
					return prepareDate($('#' + $(this).data('datepickerId')).data('datepicker'))[formated ? 0 : 1];
				}
			},
			formatDate: function(date, format) {
				return formatDate(date, format);
			},
			clear: function(){
				return this.each(function(){
					if ($(this).data('datepickerId')) {
						var cal = $('#' + $(this).data('datepickerId'));
						var options = cal.data('datepicker');
						if (options.mode != 'single') {
							options.date = [];
							fill(cal.get(0));
						}
					}
				});
			},
			fixLayout: function(){
				return this.each(function(){
					if ($(this).data('datepickerId')) {
						var cal = $('#' + $(this).data('datepickerId'));
						var options = cal.data('datepicker');
						if (options.flat) {
							layout(cal.get(0));
						}
					}
				});
			}
		};
	}();

	$.fn.extend({ // jQuery的扩展映射
		DatePicker: DatePicker.init, // 调用jquery对象的DatePicker函数，就相当于调用此处init函数
		DatePickerHide: DatePicker.hidePicker,
		DatePickerShow: DatePicker.showPicker,
		DatePickerSetDate: DatePicker.setDate,
		DatePickerGetDate: DatePicker.getDate,
		DatePickerClear: DatePicker.clear,
		DatePickerLayout: DatePicker.fixLayout
	});

	$.extend($, {
		DatePickerFormatDate: DatePicker.formatDate
	});
})(jQuery); // 所有jquery返回对象，都扩展了这个对象

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