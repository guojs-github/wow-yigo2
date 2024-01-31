/*
	Paper 
    2023.3.7 Created by GuoJS
*/
import { PaperInterface } from '../interface';
import env from '../../utils/common/env';
import object from '../../utils/common/object';
import request from '../../utils/common/request';

class Paper implements PaperInterface {
    public info(id:number):Promise<string> {
        console.log(`GET paper(${id}) information.`);
        let url = '';
        if (env.isProduction()) {
            url = `http://localhost:8089/yigo/customize/paper-detail.jsp`;
        } else {
            url = `http://localhost:8089/yigo/customize/paper-detail.jsp`;
        }

        let p = new Promise<string>(function(resolve, reject) {
			request.post(url, {
                oid: id,
            }).then(function(response:any) {
				if (!object.isValid(response)) {
					reject(new Error('Invalid response'));										
				}
                resolve(response);
			}).catch(function (error) {
				reject(error);
			});
        });

        return p;
    };

    public infoSync(id:number):string {
        console.log(`GET paper(${id}) information synchronously.`);
        let ret = '', url = '', method = 'GET';
        if (env.isProduction()) {
            url = '';
        } else {
            url = './public/paper_detail_sample.txt';
        }

        ret = request.requestSync(url, method);

        return ret;
    };

    public questions(id:number):Promise<string> {
        console.log(`GET paper(${id}) question information.`);
        let url = '';
        if (env.isProduction()) {
            url = `http://localhost:8089/yigo/customize/question-detail.jsp`;
        } else {
            url = `http://localhost:8089/yigo/customize/question-detail.jsp`;
        }

        let p = new Promise<string>(function(resolve, reject) {
			request.post(url, {
                oid: id,
            }).then(function(response:any) {
				if (!object.isValid(response)) {
					reject(new Error('Invalid response'));										
				}
                resolve(response);
			}).catch(function (error) {
				reject(error);
			});
        });

        return p;
    };
};

export default new Paper();