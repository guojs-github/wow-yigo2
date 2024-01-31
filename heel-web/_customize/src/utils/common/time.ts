/*
	time 
    2023.3.3 Created by GuoJS
*/
import { TimeInterface } from '../interface';

class Time implements TimeInterface {
    public formatDate (t:Date):string { // 格式化日期显示 "yyyy-MM-dd"
		if (t === null) return '';
		
		var result = '';
		result += t.getFullYear();
		result += '-';
		result += ('' + (t.getMonth() + 1)).trim().length < 2 ? '0' + (t.getMonth() + 1) : (t.getMonth() + 1);
		result += '-';
		result += ('' + t.getDate()).trim().length < 2 ? '0' + t.getDate() : t.getDate();

		return result;
    };

	public formatTime(t:Date):string { // 格式化时钟显示 "yyyy-MM-dd HH:mm"
		if (t === null) return '';
		
		let result = this.formatDate(t);
		result += ' ';
		result += ('' + t.getHours()).trim().length < 2 ? '0' + t.getHours() : t.getHours();
		result += ':';
		result += ('' + t.getMinutes()).trim().length < 2 ? '0' + t.getMinutes() : t.getMinutes();

		return result;
	};

	public formatTimeWithSec(t:Date):string { // 格式化时钟显示 "yyyy-MM-dd HH:mm:ss"
		if (t === null) return '';
		
		let result = this.formatTime(t);
		result += ':';
		result += ('' + t.getSeconds()).trim().length < 2 ? '0' + t.getSeconds() : t.getSeconds();

        return result;
	};	

    public formatTimestamp(t:Date):string { // 格式化时钟显示 "yyyy-MM-dd HH:mm:ss.ms"
		if (t === null) return '';
		
		let result = this.formatTimeWithSec(t);
		result += `.${t.getMilliseconds()}`;

        return result;
	};

    public formatString(s:string):Date { // 转换字符串为Date对象
        let result = s.replace(/-/g, '/');
        
        return new Date(result);
    };

    public currentTimestamp():string { // 显示当前时间的完整信息        
        return this.formatTimestamp(new Date);
    };

	public currentTime(timeZone:number):Date { // 任意时区的当前时间
		let _this = this;
		
		let tz = timeZone;
		if ((typeof tz !== 'number') || (tz < -12) || (tz > 12)) {
			tz = 0;
		}
		
		// get specified timezone time
		let now = new Date();
		let result = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + tz * 60 * 60 * 1000);
		result.toString = function() {
			return _this.formatTimeWithSec(this/* 指向result */);
		};
				
		return result;
	};
};

export default new Time();
