/*
	utilities interface
    2023.1.3 Created by GuoJS
*/
interface Object {
    isValid: (value: any)=> boolean;
};

interface String {
    isValid: (value: any)=> boolean;
};

interface Request {
    getUrlKey: (key:string) => string;
    requestSync: (url:string, method:string, param:any, timeout:number) => string;    
    get: (url:string, timeout?:number) => void;
    post: (url:string, param?:any, timeout?:number) => void;
};

interface Env {
    mode: ()=> string;
    isProduction: ()=> boolean;
    version: ()=> string;
};

interface Time {
    formatDate: (t:Date)=>string;
    formatTime: (t:Date)=>string;
    formatTimeWithSec: (t:Date)=>string;
    formatTimestamp: (t:Date)=>string;
    formatString: (s:string)=>Date;
    currentTimestamp: ()=>string;
    currentTime: (timeZone:number)=>Date;
};

interface Chinese {
    fromNumber: (n:number)=>string;
};

interface Utils {
    request: Request;
    object: Object;
    string: String;
    env: Env;
    time: Time;
    chinese: Chinese;
    baidu_map: any;
};

export type UtilsInterface = Utils;
export type RequestInterface = Request;
export type ObjectInterface = Object;
export type StringInterface = String;
export type EnvInterface = Env;
export type TimeInterface = Time;
export type ChineseInterface = Chinese;
