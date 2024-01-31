/*
	install server
    2023.1.3 Created by GuoJS
*/
import { App } from 'vue'
import {ServerInterface, PaperInterface, HomePageInterface} from './interface';

import paper from './Paper/Paper';
import home_page from './HomePage/HomePage';

class Server implements ServerInterface {
    paper: PaperInterface = paper;
	home_page: HomePageInterface = home_page;
};

const install = function (app: App) {
	app.config.globalProperties.$server = new Server(); 
};

export default {
	install
};