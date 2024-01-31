/*
	string 
    2023.1.3 Created by GuoJS
*/
import { StringInterface } from '../interface';

class String implements StringInterface {
	public isValid(value: any): boolean {
		// console.log(`If the specified value(${value}) is a valid string.`);
		
		if ((typeof value === 'string') && (value.trim().length > 0)) {
			return true;
		} else {
			return false;
		}		
	};
};

export default new String();
