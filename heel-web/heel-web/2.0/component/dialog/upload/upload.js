/*
	heel-web component upload
	2023.4.6 created by guojs
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.upload = function (param){
	let _this = this;
	let _param = param;	
	let _files = [];
	let _type = '', _multiple = false, 	_on_close = null;
	let _width = '400px', _height = '250px';
	let _dialog, _upload, _file_wrap, _file, _icon, _progress_wrap, _progresses = [];

	let _params = function() {
		if (_param) {
			if (typeof _param.type == 'string') {
				_type = _param.type;
			}
			if (_param.multiple == true) {
				_multiple = true;
			}
			if (typeof _param.on_close == 'function') {
				_on_close = _param.on_close;
			}
		} else {
			_param = {};
		}
	};
	
	let _create = function() {
		// create dialog
		_param.ex_class = 'hw-upload';
		if (_type == 'pic') {
			_param.caption = '上传图片';		
		} else {
			_param.caption = '上传文件';					
		}
		_param.height = 'auto';
		_param.on_close = () => {
			if (typeof _on_close == 'function') {
				_on_close(_files);
			}
		};
		_dialog = new heelWeb.component.dialog(_param);
		
		// customize dialog
		content = _dialog.content();
		_upload = $('<div class="hw-flex-col hw-upload-content"></div>');
		_upload.width(_width);_upload.height(_height);

		_progress_wrap = $('<div class="hw-scroll-y hw-upload-progress-wrap"></div>');
		_progress_wrap.height(_height);
		_upload.append(_progress_wrap);

		_file_wrap = $('<div class="myApi-box-shadow hw-flex-col hw-file-wrap"></div>');
		_file = $('<input type="file" name="file-2-upload" id="file-2-upload"/>'); 
		if (_type == 'pic') {
			_file.attr('accept', 'image/*');
		}
		if (_multiple) {
			_file.attr('multiple', ''); // multiple 多选开关			
		}
		_file_wrap.append(_file);
		_icon = $('<div class="fa-2x hw-file-icon"><i class="fa-solid fa-upload"></i></div>');
		_file_wrap.append(_icon);
		_upload.append(_file_wrap);

		content.append(_upload);
	};
		
	let _create_progress = function(file) {
		// Get information
		let name = file.name;
		let size = file.size < 1024 ? file.size + ' B' : (file.size < 1024 * 1024 ? Math.ceil(file.size / 1024) + ' KB' : Math.ceil(file.size / 1024 / 1024) + ' MB');
		
		// create		
		let progress = $('<div class="hw-upload-progress">\
			<div class="hw-name">' + name + '（' + size + '）</div>\
			<div class="hw-progress">\
				<div class="hw-progress-bar"></div>\
			</div>\
		</div>');
		_progresses.push(progress);
		file['progress_index'] = _progresses.length - 1;
		_progress_wrap.append(progress);		
	};

	let _update_progress = function(index, percentage) {
		let bar = _progresses[index].find('.hw-progress-bar');

		bar.width(percentage * 100 + '%');		
		if (percentage < 1) {
			bar.css('background-color', 'red');
		} else {
			bar.css('background-color', 'green');
		}
	};

	let _upload_file = function(file, done) {
		let send_result = false;
		let data = null;

		// Prepare file data
		let file_data = new FormData();
		file_data.append('file_data', file);				

		// Upload
		let request = $.ajax({
			url: '/yigo/uploadfile',
			type: 'post',
			data: file_data,
			dataType: 'json',
			processData: false,
			contentType: false,
			xhr: function() {
				let new_xhr = new XMLHttpRequest()
				// 添加文件上传的监听
				// onprogress:进度监听事件，只要上传文件的进度发生了变化，就会自动的触发这个事件
				new_xhr.upload.onprogress = function(e) {
					console.log(e)

					if (e) {
						_update_progress(file['progress_index'], e.loaded / e.total);
					}
				}

				return new_xhr;
			},
			success: (res) => {
				// console.log('Succeed to send file ' + file.name);
				console.log(res);
				send_result = true;
				data = res;
			},
			error: (request, status, err) => { // faile
				// console.log('Fail to send file ' + file.name);
				console.log(err);
				send_result = false;
			},
			complete: (XMLHttpRequest, status) => { // 请求完成后最终执行参数
				if('timeout' == status){ // 超时,status还有success,error等值的情况
					request.abort();
				}
				if (typeof done == 'function') {
					done(send_result, data);
				}
			}
		});
	};

	let _upload_files = function() {	
		// Show selected file
		let files = _file.prop('files');
		console.log('upload ' + files.length + ' files.');
		for (let i = 0; i < files.length; i++) {
			_create_progress(files[i]); // create progress
		}
				
		// upload files 
		for (let i = 0; i < files.length; i++) { // upload files
			_upload_file(files[i], (result, data) => { // call when done
				if (result) {
					console.log('Succeed to send file [' + files[i].name +']');
					_files.push(data);

					if (_multiple == false) {// 如果是文件单选,成功后直接关闭弹窗
						_dialog.close();
					}					
				} else {
					console.log('Fail to send file [' + files[i].name +']!');
				}
			});
		}
	};
	
	let _events = function() {
		_file.change(() => {
			console.log('file selected');
			
			if (!_multiple) {
				_file_wrap.hide(); // Disable select file function
			}
			_upload_files();			
		});

		_icon.click(() => {
			_file.click(); // 打开文件选择
		});		
	};
	
	let _init = function(){
		console.log('upload.init()');
		_params();
		_create();
		_events();
	};

	this.show = function() {	
		console.log('message-box.show()');
		_dialog.show();
	};
	
	_init();
	_file.click(); // 打开文件选择
};