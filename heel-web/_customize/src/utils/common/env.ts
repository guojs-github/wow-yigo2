/*
	env 
    2023.1.3 Created by GuoJS
*/
import { EnvInterface } from '../interface';
import { App } from 'vue'
import { appendFile } from 'fs';

class Env implements EnvInterface {
    private _mode: string;

    constructor() {
        this._mode = process.env.NODE_ENV || "" ;
    };

    public mode():string {
        return this._mode;
    };

    public isProduction(): boolean {
		if ('production' === this.mode() ) {
			return true;
		} else {
			return false;
		}
    };

    public version(): string {
        // @ts-ignore
        return __APP_VERSION__;
    }
};

export default new Env();