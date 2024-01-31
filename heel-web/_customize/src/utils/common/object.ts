/*
	object 
    2023.1.3 Created by GuoJS
*/
import { ObjectInterface } from '../interface';

class Object implements ObjectInterface {
	public isValid(value: any): boolean {
		// console.log(`If the specified value(${value}) is a valid object.`);
		
		if ((typeof value === 'object') && (value !== null)) {
			return true;
		} else {
			return false;
		}		
    };
};

export default new Object();