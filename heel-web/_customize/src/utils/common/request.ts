/*
	request 
    2023.1.1 Created by GuoJS
*/
import axios from 'axios';
import Qs from 'qs';
import string from './string';
import object from './object';
import time from './time';
import { RequestInterface } from '../interface';
import loading from '../interface/loading';

class Request implements RequestInterface {
	private _timeout(value?:number) {
		// let ret = 10000; // default timeout length
		let ret = 60000; // default timeout length
		
		// Check
		if (typeof value !== 'number') {
			return ret;
		}
		if ((value >= 1000) && (value <= (60000 * 10))) {
			return value;
		}

		return ret;
	};

    public getUrlKey(key:string) {
        // Check
        if (!string.isValid(key)) return '';
        if (!object.isValid(window)) return '';
        let url = window?.location.toString();
        if (!string.isValid(url)) return '';
        console.log(`get url('${url}') key('${key}').`);

        // Analyze
        if (!url.split('?')[1]) { // No parameter
            return '';
        }
        let items = url.split('?')[1].split('&');
        let val = ''
        items.some(item => {
            let temp = item.split('=');
            if (2 != temp.length) {
                return false;
            }
            if (key.toLowerCase() == temp[0].toLowerCase()) {
                val = decodeURIComponent(temp[1]);
                return true;
            }
        });

        return val;
    };

    public requestSync(url:string, method:string, param?:any, timeout?:number) {
        console.log(`Request synchronous.`);
        let timeStamp = time.currentTimestamp(); console.log(`Time stamp:${timeStamp}`);
		let requestUrl = url;
		if (!string.isValid(requestUrl)) {
			console.log('Invalid request url');
			return null;
		}
		if (requestUrl.indexOf('?') === -1) {
			requestUrl += '?t=' + timeStamp;
		} else {
			requestUrl += '&t=' + timeStamp;			
		}
		console.log(`Get request url:${requestUrl}`);

		// Create ajax object
		let xmlHttp:any = null;
		if (window['XMLHttpRequest']) {
			xmlHttp = new window['XMLHttpRequest']();
		} else {
			return ''; 
		}
		
		// Timeout
		let timeoutValue:number = this._timeout(timeout);
		setTimeout(function() { // Timeout, abort request
			xmlHttp.abort();
			xmlHttp = null;
		}, timeoutValue);
		
		// request
		try {
			xmlHttp.open(method, requestUrl, false);
			xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
			if (method.toUpperCase() === 'POST') { // post
				xmlHttp.send(param);
			} else if (method.toUpperCase() === 'GET') { // get
				xmlHttp.send(null);
			}
		} catch (ex) {
			console.log('Request synchronous fail.');
		}
	
		if ((xmlHttp.readyState === 4) && (xmlHttp.status === 200)) { // request success
			console.log('Request synchronous success.');
			try {
				return JSON.parse(xmlHttp.responseText);
			} catch (ex) {
				return null;
			}
		}
		
		return null;        
    };

	public get(url:string, timeout?:number, loadingMask:boolean=true) {
		console.log('Get request.');
		let _this = this;

		if (true == loadingMask) loading.show();
		let p = new Promise(function (resolve, reject) {
			// params
			let timestamp = time.currentTimestamp();
			console.log(`Time stamp:${timestamp}`);			
			let requestUrl = url;
			if (!string.isValid(requestUrl)) {
				console.log(`Invalid request url.`);
				reject(new Error(''));
				return;
			}
			if (-1 === requestUrl.indexOf('?')) {
				requestUrl += '?t=' + timestamp;
			} else {
				requestUrl += '&t=' + timestamp;			
			}
			console.log(`Get request url:${requestUrl}`);
			
			let timeoutValue = _this._timeout(timeout);
			console.log(`time out:${timeoutValue}`);
			
			// request
			let requestParam = {
				method: 'get',
				url: requestUrl,
				timeout: timeoutValue,
			};
			axios(requestParam).then(function (response) {
				console.log('Get request success.');				
				console.log('Response:' + JSON.stringify(response));

				if (200 === response.status) {
					resolve(response.data);
				} else {
					reject(response);
				}
			}).catch(function (error) {
				console.log('Get request fail.');
				console.log('error:' + JSON.stringify(error));
				
				reject(error);
			}).finally(function() {
				loading.close();
			});
		});

		return p;
	};	

	public post(url:string, param?:Object, timeout?:number, loadingMask:boolean=true) {
		console.log('Post request.');
		let _this = this;

		if (true == loadingMask) loading.show();		
		let p = new Promise(function (resolve, reject) {
			// params
			if (!string.isValid(url)) {
				console.log('Invalid request url');
				reject(new Error(''));
				return;
			}
			console.log('Post request url:' + url);
			
			// timeout
			let timeoutValue = _this._timeout(timeout);
			console.log('time out:' + timeoutValue);
			// request
			let requestParam = {
				method: 'post',
				url: url,
				data: Qs.stringify(param),
				timeout: timeoutValue,
			};
			axios(requestParam).then(function (response) {
				console.log('Post request success.');
				console.log('Response:' + JSON.stringify(response));

				if (200 === response.status) {
					resolve(response.data);
				} else {
					reject(response);
				}
			}).catch(function (error) {
				console.log('Post request fail.');
				console.log('error:' + JSON.stringify(error));

				// _interceptRequestError(error);
			}).finally(function() {
				loading.close();
			});
		});
		return p;
	};
};

export default new Request();