/*
	HomePage 
    2023.6.5 Created by GuoJS
*/
import { HomePageInterface } from '../interface';
import request from '../../utils/common/request';
import object from '../../utils/common/object';

class HomePage implements HomePageInterface {
    public carousel():Promise<string> {
        console.log(`GET home page carousel pictures.`);
        let url = `http://localhost:8089/yigo/customize/home-page-carousel.jsp`;

        let p = new Promise<string>(function(resolve, reject) {
			request.post(url).then(function(response:any) {
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

export default new HomePage();