/*
	loading mask 
    2023.3.20 Created by GuoJS
*/

class Loading {
    private _id = 'loading_mask';
    private _layers = 0; // 遮罩层数

    public show() { // Show loading mask
		console.log('Show loading.');
        let mask = null;

        mask = $(`body #${this._id}`);
        if (0 >= mask.length) {
            mask = $(`<div id='${this._id}' class='-mask'><img src='./image/loading.gif'></img></div>`);
            $(`body`).append(mask);
        }
        mask.show();
        this._layers += 1; // 增加遮罩层
    };
 
    public close() { // Close loading mask
		console.log('Close loading.');
        this._layers -= 1; // 减少遮罩层
        if (0 >= this._layers) { // 没有遮罩层了么？
            $(`body #${this._id}`).hide();
        }
    };
};

export default new Loading();