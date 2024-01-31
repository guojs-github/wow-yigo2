/*
	install utilities
    2023.1.1 Created by GuoJS
*/
import { App } from 'vue'
import {ObjectInterface, RequestInterface, StringInterface, UtilsInterface, EnvInterface, TimeInterface, ChineseInterface} from './interface';

import env from './common/env';
import object from './common/object';
import request from './common/request';
import string from './common/string';
import time from './common/time';
import chinese from './common/chinese';
import BaiduMapClass from './baidu/baidu_map.js';

class Utils implements UtilsInterface {
	object: ObjectInterface = object;
	request: RequestInterface = request;
	string: StringInterface = string;
	env: EnvInterface = env;
	time: TimeInterface = time;
	chinese: ChineseInterface = chinese;
	baidu_map: any = BaiduMapClass;
};

const install = function (app: App) {
	app.config.globalProperties.$utils = new Utils(); 
};

export default {
	install
};