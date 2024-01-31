/*
    New style Date time mask component
    2023.8.9 added by guojs
*/

//====================================================================================================
// [插件名称] jQuery DateTimeMask
//----------------------------------------------------------------------------------------------------
// [描    述] jQuery DateTimeMask日期掩码插件，它是基于jQuery类库，实现了js脚本于页面的分离。对一个单行
//			  文本框，你只要需要写：$("input_id").DateTimeMask();就能完美的实现输入控制，目前能实现5种日
//			  期掩码控制。在ie6.0和firefox3.0下调试通过。本插件采用配置信息的思想，你可以轻松扩展里面的
//			  功能，从而符合自己的业务逻辑需要
//----------------------------------------------------------------------------------------------------
// [作者网名] 猫冬	
// [日    期] 2008-02-04	
// [邮    箱] wzmaodong@126.com
// [作者博客] http://wzmaodong.cnblogs.com
//====================================================================================================
$.fn.DateTimeMask = function(settings) {
	var TYPE = { //1:yyyy-MM-dd HH:mm:ss 3:yyyy-MM-dd 4:HH:mm 5:HH:mm:ss 6:yyyy-MM
		yyyyMMddHHmmss: 1,
		yyyyMMdd: 3,
		HHmm: 4,
		HHmmss: 5,
		yyyyMM: 6
	};
	this.TYPE = TYPE;

	var options = {
		safemodel: true,					//安全模式下，不能粘贴，不能拖拉
		masktype: TYPE.yyyyMMdd,						
		isnull: false,						//是否可以全部都是0
		lawlessmessage: YIUI.I18N.getString("DATE_FORMATERROR","输入的格式错误"),	//非法格式的提示信息
		onlycontrolkeydown: false,			//只控制输入
		focuscssname: '',					//获得焦点的样式
		oldclassname: '',					//记录当前的样式
		maxLength: 10,
		dateSep: "-",
		timeSep: ":",
		isnow: false,
		ismonthstart: false,
		whenfocus:function(){},				//获得焦点时候的回调函数。无返回值。
		whenblur: function(){return true;}	//失去焦点时候的回调函数。return ture 表示额外校验成功；return false:恢复到上次的值
	};

	settings = settings || {};
	$.extend(options, settings);
	return this.each(function(){
		//初始化
		if(options.isnow) this.value = $.DateTimeMask.getDateTime(options);

		if(options.masktype == TYPE.yyyyMMddHHmmss) {
			options.maxLength = 19;
			options.preText = "2001"+options.dateSep+"01"+options.dateSep+"01 00"+options.timeSep+"00"+options.timeSep+"00";
		} else if(options.masktype == TYPE.yyyyMMdd){
			options.maxLength = 10;
			options.preText = "2001"+options.dateSep+"01"+options.dateSep+"01";
		} else if(options.masktype == TYPE.HHmm){
			options.maxLength = 5;
			options.preText = "00"+options.timeSep+"00";
		} else if(options.masktype == TYPE.HHmmss){
			options.maxLength = 8;
			options.preText = "00"+options.timeSep+"00"+options.timeSep+"00";
		}else if(options.masktype == TYPE.yyyyMM){
			options.maxLength = 7;
			options.preText = "2001"+options.dateSep+"01";
		}
		$(this).attr("autocomplete", "off");
		$(this).attr("maxLength", options.maxLength);
		
		if (options.safemodel) {
			if ($.browser.isIE) {
				this.ondragenter = function(){return false;};
				// this.onpaste = function(){return false;};
			}
		}

		$(this).keydown(function(event){
			return $.DateTimeMask.key_down(this, event, options);
		}).keyup(function(event) {
	    	var nKeyCode = event.keyCode; 
			if(nKeyCode == 8) {
				this.oldvalue = this.value;
			}
		})

		if (!options.onlycontrolkeydown) {
			$(this).focus(function(){
				$.DateTimeMask.set_focus(this,options);
				options.whenfocus();
			});
			$(this).blur(function(){
				if(!$.DateTimeMask.lost_focus(this,options))
				{
					if(!options.whenblur(this.value)) this.value = this.oldvalue;
				}
			});
		}
	});
};

$.DateTimeMask = {	
	set_focus : function(obj, options) { //获得焦点时候的处理函数
		obj.oldvalue = obj.value;

		if (obj.focuscssname && obj.focuscssname!='') { // 如果获得焦点指定了样式,则此时添加样式
			obj.oldClassName = obj.className;
			obj.className = obj.focuscssname;
		}

		obj.select(); // 自动选中文字
	},

	lost_focus : function(obj, options) { //失去焦点时候的处理函数
		options.newValue = ""; // 格式化后的新值?
		var ls_date, ls_time;
		var lb_error = false;
		let TYPE = $.fn.DateTimeMask().TYPE;

		// 规范化输入
		$.DateTimeMask.format_input(obj, options);

		// 检查现有内容
		switch (options.masktype) {
			case TYPE.yyyyMMddHHmmss:
				// 分开时间与日期部分
				ls_date = obj.value.split(" ")[0];
				ls_time = obj.value.split(" ")[1];
				
				if (obj.value == options.preText) { // 和预置格式值一样?
					if (!options.isnull) { // 开关,不允许为空
						lb_error = true;
					}
				} else if (obj.value != '') {
					if(!($.DateTimeMask.is_valid_date(ls_date) && $.DateTimeMask.is_valid_time(ls_time))) { // 日期或者时间无效
						lb_error = true;
					}
				}

				break;
			case TYPE.yyyyMMdd:
				ls_date = obj.value; // 日期
				if (ls_date == options.preText) {
					if (!options.isnull) lb_error = true;
				} else if (obj.value != '') {
					if (!$.DateTimeMask.is_valid_date(ls_date)) { // 日期无效
						lb_error = true;
					}
				}

				break;
			case TYPE.HHmm:
				ls_time = obj.value + ':00'; // 时间
				if (obj.value == options.preText) {
					if (!options.isnull) lb_error = true;
				} else if (obj.value != '') {
					if (!$.DateTimeMask.is_valid_time(ls_time)) {
						lb_error = true;
					} 
				}

				break;
			case TYPE.HHmmss:
				ls_time = obj.value; // 时间
				if (ls_time == options.preText) {
					if (!options.isnull) lb_error = true;
				} else if (obj.value != '') {
					if (!$.DateTimeMask.is_valid_time(ls_time)) {
						lb_error = true;
					}
				}

				break;
			case TYPE.yyyyMM:
				ls_date = obj.value + '-01'; // 日期
				if (ls_date == options.preText) {
					if (!options.isnull) lb_error = true;
				} else if (obj.value != '') {
					if (!$.DateTimeMask.is_valid_date(ls_date)) {
						lb_error = true;
					}
				}

				break;
		}

		if (lb_error) { // 出错了呀
			var len = obj.value.length,
				maxLength = options.maxLength,
				value = '',
		    	cursor_pos = $.DateTimeMask.GetCursor(obj).start;
			if (len <= maxLength && cursor_pos <= maxLength) {
				value = obj.value + options.preText.substring(len);
			} 
			obj.value = value; // 修改输入值
			if(options.masktype == TYPE.yyyyMMddHHmmss || options.masktype == TYPE.yyyyMMdd){
				ls_date = value.split(' ')[0]; // 日期
			    ls_time = value.split(' ')[1]; // 时间
				if (!($.DateTimeMask.is_valid_date(ls_date) && (ls_time? $.DateTimeMask.is_valid_time(ls_time): true))) obj.value = ''; // 无效则清空
			} else if (options.masktype == TYPE.HHmm) {
				if (!(ls_time? $.DateTimeMask.is_valid_HHmm(obj.value): true)) obj.value = ''; // 无效则清空
			} else if (options.masktype == TYPE.HHmmss) {
				if (!(ls_time? $.DateTimeMask.is_valid_time(obj.value): true)) obj.value = ''; // 无效则清空
			} else if (options.masktype == TYPE.yyyyMM) {
				if (!($.DateTimeMask.is_valid_yyyyMM(obj.value))) obj.value = '';  // 无效则清空
			}
			
		}

		if (obj.focuscssname && obj.focuscssname!='') { // 失去焦点恢复之前的样式
			obj.className = obj.oldClassName;
		}

		return lb_error;
	},

	
	key_down : function(objTextBox, event, options) { //按键时候的处理函数
		// Update old value
		objTextBox.oldvalue = objTextBox.value;

		// Declaration /////////////////////////////////////////////
	    var KEY = { // 按键定义
			BACKSPACE: 8,
		    TAB: 9,
		    ENTER: 13,
			END: 35,
			HOME: 36,
		    LEFT: 37,
			RIGHT: 39,
		    DEL: 46,
			NUM_0: 48,
			NUM_9: 57
	    };

		var is_num = (code) => { // 判断是否数字输入
			/*
				48-57, 字符'0'到'9'
				!(nKeyCode >=96 && nKeyCode<=105) ，怀疑是小键盘按键
			*/
			if (code>=KEY.NUM_0 && code<=KEY.NUM_9)	return true;
			else return false;
		}

		var abandon_key = () => { // 放弃当前按键输入
			event.preventDefault(); // 禁止冒泡

			if (event.which == 229 && event.charCode == 0) { // 阻止非英语输入
				console.log('old value=' + objTextBox.oldvalue);
				setTimeout(() => {
					objTextBox.value = objTextBox.oldvalue;
					heelWeb.component.input_hint.err(objTextBox, '请切换至英语输入法');
				}, 1);
			}

			return false;
		}
		
		// Check /////////////////////////////////////////////
	    if(objTextBox.ReadOnly) { //只读就不执行任何操作
		    event.returnValue = false;
		    return;
	    }
		 		
		if(event.ctrlKey) { // 不处理
			return true;
		}

		// process /////////////////////////////////////////////
		var key_code = event.keyCode; // 当前按键

		// 当前光标位置 
	    var cursor = $.DateTimeMask.GetCursor(objTextBox);
	    var cursor_pos = cursor.start;

		event.returnValue = false; // IE属性，取消发生事件的源元素的默认动作
		
		// 处理不同输入
	    switch (key_code) {
	        case KEY.DEL:
			case KEY.BACKSPACE:
			case KEY.HOME:
			case KEY.END: 
			case KEY.LEFT:
			case KEY.RIGHT: 
			case KEY.TAB:
			case KEY.ENTER:
	            break;
	        default:
				// 输入字符'0'到'9'的处理
	            if (!is_num(key_code)) {
					return abandon_key();
	            }
				
				// 处理输入
				var key = String.fromCharCode(key_code); // 根据按键编码获取对应字符
				if (!$.DateTimeMask.format_while_input(key, cursor_pos, objTextBox, options)){
					return abandon_key();
				};
				
	            break; 
	    } // switch
	},
	
	is_valid: function(masktype, input, cursor_pos) { //根据光标所在的位置，判断输入的字符是否合法
	    var ls_date, ls_year, ls_month, ls_day, ls_time, ls_hour, ls_minute, ls_second;
		let TYPE = $.fn.DateTimeMask().TYPE;

		if(masktype == TYPE.yyyyMMddHHmmss) {
	        ls_year = input.substr(0, 4); // 年 
	        ls_month = input.substr(5, 2); // 月
	        ls_day = input.substr(8, 2); // 日
	        ls_date = ls_year + '-' + ls_month + '-' + ls_day; 
	        ls_time = '00:00:00';
			ls_hour = input.substr(11, 2); // 时
			ls_minute = input.substr(14, 2); // 分
			ls_second = input.substr(17, 2); // 秒
			ls_time = ls_hour + ':' + ls_minute + ':' + ls_second;

			// 根据当前光标位置判断检查日期还是检查时间
			return cursor_pos <= 10? $.DateTimeMask.is_valid_date(ls_date): $.DateTimeMask.is_valid_time(ls_time); 
		} else if (masktype == TYPE.yyyyMMdd) {
	        ls_year = input.substr(0, 4); // 年 
	        ls_month = input.substr(5, 2); // 月
	        ls_day = input.substr(8, 2); // 日
	        ls_date = ls_year + '-' + ls_month + '-' + ls_day; 

			return $.DateTimeMask.is_valid_date(ls_date); // 判断日期有效行
	    } else if (masktype == TYPE.yyyyMM) {
	    	ls_year = input.substr(0, 4); // 年  
	        ls_month = input.substr(5, 2); // 月
	        ls_date = ls_year + '-' + ls_month + '-01'; // 验证前补个日数据

	        return $.DateTimeMask.is_valid_date(ls_date); // 判断日期有效行
	    } else {
	    	ls_time = input;
	    	if (masktype == TYPE.HHmm) ls_time = ls_time + ':00';

			return $.DateTimeMask.is_valid_time(ls_time); // 判断时间有效性
	    }
	},

	is_valid_date : function(input) { // 验证日期有效性
		var regex = "^((((((0[48])|([13579][26])|([2468][048]))00)|([0-9][0-9]((0[48])|([13579][26])|([2468][048]))))-02-29)|(((000[1-9])|(00[1-9][0-9])|(0[1-9][0-9][0-9])|([1-9][0-9][0-9][0-9]))-((((0[13578])|(1[0|2]))-31)|(((0[1,3-9])|(1[0-2]))-(29|30))|(((0[1-9])|(1[0-2]))-((0[1-9])|(1[0-9])|(2[0-8]))))))$";
		var exp = new RegExp(regex, "i");

		return exp.test(input);
	},

	is_valid_time : function(input) { // 验证时间有效性
		if (!input) {
			return false;
		}
		var temp = input.match(/^(\d{2,2})(:)?(\d{2,2})\2(\d{2,2})$/);
        if (!temp || temp[1]>23 || temp[3]>59 || temp[4]>59) { // 验证每个位置的数字
			return false;
		}

		return true;
	},

	is_valid_HHmm : function(input) { // 验证时分格式有效性
		if (!input) {
			return false;
		}
		var temp = input.match(/^(\d{2,2})(:)?(\d{2,2})$/);
        if (!temp || temp[1]>23 || temp[3]>59) {
			return false;
		}

		return true;
	},

	is_valid_yyyyMM : function(input) { // 验证年月格式有效性
		var exp = /^\d{4}-(0?[1-9]|1[0-2])$/;

		return exp.test(input);
	},

	//动作：获取光标所在的位置，包括起始位置和结束位置
	GetCursor : function(textBox) {
		var obj = new Object();
		var start = 0, end = 0;

		if ($.browser.isIE && $.browser.version < 11) { // 老IE兼容代码，不太重要
			// 网页中选中的文字对象
			// Text Range对象
			var selrange = document.selection.createRange();
			var seltext = selrange.text; // 获取界面选中的文字
			
			selrange.moveStart("character", -textBox.value.length); // 文字选择开始点向前移动
			selrange.moveEnd("character", -seltext.length); // 文字选择结束点也向前移动
			
			start = selrange.text.length; // 选中内容长度是开始点
			end = start + seltext.length; // 结束点
		} else { // Edge Chrome走这里
			start = textBox.selectionStart; // 文字选中开始位置
			end = textBox.selectionEnd; // 文字选中结束位置
		}

		// return value
		obj.start = start;
		obj.end = end;
		return obj;
	},
	
	//动作：让field的start到end被选中
	Selection : function(field, start, end) {
		if( field.createTextRange ) {
			var r = field.createTextRange();
			r.moveStart('character',start);
			r.collapse(true);
			r.select(); 
		} else if ( field.setSelectionRange ){
			field.setSelectionRange(start, end);
		} else {
			if( field.selectionStart ) {
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
		field.focus();
	},
		
	getDateTime : function(options) {
		var d;
		if(options.isnow) {
			d = new Date();
		}
		var vYear = d.getFullYear();
		var vMon = d.getMonth() + 1;
		vMon = (vMon<10 ? "0" + vMon : vMon);
		var vDay = d.getDate();
		var ls_date = vYear+"-"+vMon+"-"+(vDay<10 ?  "0"+ vDay : vDay );
		var ls_month = vYear+"-"+vMon;
		var vHour = d.getHours();
		var vMin = d.getMinutes();
		var vSec = d.getSeconds();
		var ls_time = (vHour<10 ? "0" + vHour : vHour) + ":"+(vMin<10 ? "0" + vMin : vMin)+":"+(vSec<10 ?  "0"+ vSec : vSec );
		switch(options.masktype) {
			case 1:
				return (ls_date + " " + ls_time);
			case 3:
				return ls_date;
			case 4:
				return ls_time.substr(0,5);
			case 5:
				return ls_time;
			case 6:
				return ls_month;
		}
		
	}
};

// 边输入边格式，输入应该是0-9
$.DateTimeMask.format_while_input = function(key/*输入数字*/, pos/*光标位置*/, input/*输入控件*/, options/*控件参数*/) {
	let _TYPE = $.fn.DateTimeMask().TYPE;
	let _format_template = function() {
		this.format_number = function(key, type, need_sep) { // 格式化当前日期内容
			var n = parseInt(key); // 输入0-9的数字
			var sep = (type == 'M' || type == 'd')? options.dateSep: (type == 'm' || type == 's')? options.timeSep: ' ';
	
			if (need_sep) {
				input.value += sep;
			}
	
			if (type == 'M') { // 月
				if (n > 1) input.value += '0';
			} else if (type == 'd') { // 日
				if (n > 3) input.value += '0';
			} else if (type == 'H') { // 小时
				if (n > 2) input.value += '0';
			} else if (type == 'm') { // 分钟
				if (n > 5) input.value += '0';
			} else if (type == 's') { // 秒
				if (n > 5) input.value += '0';
			}
		};
		
		this.do = function() {
			console.log('Must be override!');
		};
	};
	let _format_yyyyMMddHHmmss = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (pos < 10) { // 日期部分处理
				if (pos == 0) { if (key==0) return false } // 年份第一位不能为0
				else if (pos == 4) this.format_number(key, 'M', true); // yyyyM，月份第一位
				else if (pos == 5) this.format_number(key, 'M'); // yyyy-M，月份第一位					
				else if (pos == 7) this.format_number(key, 'd', true); // yyyy-MMd，日期第一位					
				else if (pos == 8) this.format_number(key, 'd'); // yyyy-MM-d，日期第一位
				else {
					// 验证 
					let text = input.value.substring(0, pos) + key + options.preText.substring(pos+1);
					if(!$.DateTimeMask.is_valid(options.masktype, text, pos)) {
						return false;
					}
				}
			} else { // 时间部分
				if (pos == 10) this.format_number(key, 'H', true); // yyyy-MM-ddH, 小时第一个数字
				else if (pos == 11) this.format_number(key, 'H'); // yyyy-MM-dd H，小时第一个数字					
				else if (pos == 13) this.format_number(key, 'm', true); // yyyy-MM-dd HHm，分钟第一个数字					
				else if (pos == 14) this.format_number(key, 'm'); // yyyy-MM-dd HH:m，分钟第一个数字					
				else if (pos == 16) this.format_number(key, 's', true); // yyyy-MM-dd HH:mms，秒第一个数字					
				else if (pos == 17) this.format_number(key, 's'); // yyyy-MM-dd HH:mm:s，秒第一个数字
			}

			return true;
		}

		return new template();
	};
	let _format_yyyyMMdd = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (pos == 0) { if (key==0) return false } // 年份第一位不能为0
			else if (pos == 4) this.format_number(key, 'M', true); // yyyyM，月份第一位
			else if (pos == 5) this.format_number(key, 'M'); // yyyy-M，月份第一位					
			else if (pos == 7) this.format_number(key, 'd', true); // yyyy-MMd，日期第一位					
			else if (pos == 8) this.format_number(key, 'd'); // yyyy-MM-d，日期第一位
			else {
				// 验证 
				let text = input.value.substring(0, pos) + key + options.preText.substring(pos+1);
				if(!$.DateTimeMask.is_valid(options.masktype, text, pos)) {
					return false;
				}
			}

			return true;
		}

		return new template();
	};
	let _format_yyyyMM = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (pos == 0) { if (key==0) return false } // 年份第一位不能为0
			else if (pos == 4) this.format_number(key, 'M', true); // yyyyM，月份第一位
			else if (pos == 5) this.format_number(key, 'M'); // yyyy-M，月份第一位					
			else {
				// 验证 
				let text = input.value.substring(0, pos) + key + options.preText.substring(pos+1);
				if(!$.DateTimeMask.is_valid(options.masktype, text, pos)) {
					return false;
				}
			}

			return true;
		}

		return new template();
	};
	let _format_HHmmss = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (pos == 0) this.format_number(key, 'H'); // 小时数第一个字符				
			else if (pos == 2) this.format_number(key, 'm', true); // HHm，输入分钟第一个字符
			else if (pos == 3) this.format_number(key, 'm'); // HH:m，输入分钟第一个字符 
			else if (pos == 5) this.format_number(key, 's', true); // HH:mms，输入秒第一个字符				
			else if (pos == 6) this.format_number(key, 's'); // HH:mm:s，输入秒第一个字符
			else {
				// 验证
				let text = input.value + key + options.preText.substring(pos+1); 
				if(!$.DateTimeMask.is_valid(options.masktype, text, pos)) {
					return false;
				}
			}

			return true;
		}

		return new template();
	};
	let _format_HHmm = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (pos == 0) this.format_number(key, 'H'); // 小时数第一个字符				
			else if (pos == 2) this.format_number(key, 'm', true); // HHm，输入分钟第一个字符
			else if (pos == 3) this.format_number(key, 'm'); // HH:m，输入分钟第一个字符 
			else {
				// 验证
				let text = input.value + key + options.preText.substring(pos+1); 
				if(!$.DateTimeMask.is_valid(options.masktype, text, pos)) {
					return false;
				}
			}

			return true;
		}

		return new template();
	};

	// 如果是在字符串当中输入，则截断，后面的需重新输入
	input.value = input.value.substring(0, pos);

	// 创建处理器
	let format;
	if (options.masktype == _TYPE.yyyyMMddHHmmss) format = _format_yyyyMMddHHmmss();
	else if (options.masktype == _TYPE.yyyyMMdd) format = _format_yyyyMMdd();
	else if (options.masktype == _TYPE.yyyyMM) format = _format_yyyyMM();
	else if (options.masktype == _TYPE.HHmmss) format = _format_HHmmss();
	else if (options.masktype == _TYPE.HHmm) format = _format_HHmm();
	else return false;

	return format.do(key, pos);
};

// 对输入数据进行整体格式化，一般对付copy、paste的数据
$.DateTimeMask.format_input = function(input/*输入控件*/, options/*控件参数*/) {
	let _TYPE = $.fn.DateTimeMask().TYPE;
	let _value = '' + input.value.trim();
	let _values = [];

	let _split_number = () => { // 分解输入为纯数字数组
		if (_is_all_number()) { // 全数字字符串
			_split_all_number();
		} else { // 默认处理
			let result = '';
			for (let i = 0; i < _value.length; i++) {
				if (!isNaN(parseInt(_value[i]))) {
					result += _value[i];
				} else {
					result += ' ';
				}
			}

			let temp = result.split(' '); // 分解
			// 去除分解可能产生的空项
			_values = [];
			for (let i = 0; i < temp.length; i++) {
				if (temp[i].length > 0) {
					_values.push(temp[i]);
				}
			}			
		}
	};

	let _is_all_number = () => { // 全是数字？		
		for (let i = 0; i < _value.length; i++) {
			if (isNaN(parseInt(_value[i]))) {
				return false;
			}
		}

		return true;
	};

	let _split_all_number = () => { // 分解全数字字符串
		_values = [];

		if (options.masktype == _TYPE.yyyyMMddHHmmss) {
			if (_value.length == 14) {
				_values.push(_value.substring(0, 4)); // yyyy
				_values.push(_value.substring(4, 6)); // MM
				_values.push(_value.substring(6, 8)); // dd
				_values.push(_value.substring(8, 10)); // hh
				_values.push(_value.substring(10, 12)); // mm
				_values.push(_value.substring(12)); // ss
			}
		} else if (options.masktype == _TYPE.yyyyMMdd) {
			if (_value.length == 8) {
				_values.push(_value.substring(0, 4)); // yyyy
				_values.push(_value.substring(4, 6)); // MM
				_values.push(_value.substring(6)); // dd
			}
		} else if (options.masktype == _TYPE.yyyyMM) {
			if (_value.length == 6) {
				_values.push(_value.substring(0, 4)); // yyyy
				_values.push(_value.substring(4)); // MM
			}
		} else if (options.masktype == _TYPE.HHmmss) {
			if (_value.length == 6) {
				_values.push(_value.substring(0, 2)); // HH
				_values.push(_value.substring(2, 4)); // mm
				_values.push(_value.substring(4)); // ss
			}
		} else if (options.masktype == _TYPE.HHmm) {
			if (_value.length == 4) {
				_values.push(_value.substring(0, 2)); // HH
				_values.push(_value.substring(2)); // mm
			}
		}	
	};

	let _format_template = function() { 
		this.do = function() {
			console.log('Must be override!');
		};
	};

	let _format_yyyyMMddHHmmss = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (_values.length != 6) return; // 项目数不完整，不处理

			if (_values[0].length != 4) return; // yyyy
			if (_values[1].length == 1) _values[1] = '0' + _values[1]; // MM
			if (_values[2].length == 1) _values[2] = '0' + _values[2]; // dd
			if (_values[3].length == 1) _values[3] = '0' + _values[3]; // hh
			if (_values[4].length == 1) _values[4] = '0' + _values[4]; // mm
			if (_values[5].length == 1) _values[5] = '0' + _values[5]; // ss

			_value = _values[0] + options.dateSep + _values[1] + options.dateSep + _values[2] 
					+ ' ' + _values[3] + options.timeSep + _values[4] + options.timeSep + _values[5];
		};

		return new template();
	};

	let _format_yyyyMMdd = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (_values.length != 3) return; // 项目数不完整，不处理

			if (_values[0].length != 4) return; // yyyy
			if (_values[1].length == 1) _values[1] = '0' + _values[1]; // MM
			if (_values[2].length == 1) _values[2] = '0' + _values[2]; // dd

			_value = _values[0] + options.dateSep + _values[1] + options.dateSep + _values[2];
		};

		return new template();
	};

	let _format_yyyyMM = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (_values.length != 2) return; // 项目数不完整，不处理

			if (_values[0].length != 4) return; // yyyy
			if (_values[1].length == 1) _values[1] = '0' + _values[1]; // MM

			_value = _values[0] + options.dateSep + _values[1];
		};

		return new template();
	};

	let _format_HHmmss = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (_values.length != 3) return; // 项目数不完整，不处理

			if (_values[0].length == 1) _values[0] = '0' + _values[0]; // HH
			if (_values[1].length == 1) _values[1] = '0' + _values[1]; // mm
			if (_values[2].length == 1) _values[2] = '0' + _values[2]; // ss

			_value = _values[0] + options.timeSep + _values[1] + options.timeSep + _values[2];
		};

		return new template();
	};

	let _format_HHmm = function() {
		let template = function() {};
		template.prototype = new _format_template();

		template.prototype.do = function() {
			if (_values.length != 2) return; // 项目数不完整，不处理

			if (_values[0].length == 1) _values[0] = '0' + _values[0]; // HH
			if (_values[1].length == 1) _values[1] = '0' + _values[1]; // mm

			_value = _values[0] + options.timeSep + _values[1];
		};

		return new template();
	};


	if (_value.length == 0) return; 
	_split_number();
	let format;
	if (options.masktype == _TYPE.yyyyMMddHHmmss) format = _format_yyyyMMddHHmmss();
	else if (options.masktype == _TYPE.yyyyMMdd) format = _format_yyyyMMdd();
	else if (options.masktype == _TYPE.yyyyMM) format = _format_yyyyMM();
	else if (options.masktype == _TYPE.HHmmss) format = _format_HHmmss();
	else if (options.masktype == _TYPE.HHmm) format = _format_HHmm();
	else return;

	format.do();
	input.value = _value;
};
