/*
	chinese 
    2023.3.15 Created by GuoJS
*/
import { ChineseInterface } from '../interface';

class Chinese implements ChineseInterface {
    public fromNumber (n:number):string { // 数值转中文显示
        let result = ''
        let temp = n.toString();
        let numbers:string[] = temp.split('');
        let c_number = ['0', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        let c_number_link = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万'];

        if (numbers.length > c_number_link.length) { // 太长了不翻译
            return temp;
        }
        if (temp.indexOf('.') != -1) { // 是浮点数不翻译
            return temp;
        }
        for (let i=0; i<numbers.length; i++) {
            let n = Number(numbers[i]);
            if (n!=0) {
                result += c_number[n] + c_number_link[numbers.length - i - 1];
            } else {
                result = result.trim();
                result += ' ';
            }
        }

        result = result.trim().replaceAll(' ', '零');

        return result;
    };
};

export default new Chinese();
