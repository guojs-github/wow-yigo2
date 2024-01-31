/**
 * 文件工具类
 */
YIUI.FileUtil = (function () {

    YIUI.ImageTypes = ["gif", "jpg", "jpeg", "png", "bmp"];

    // 获取文件信息
    var getFileInfo = function ($file) {
        var prefix,size,fileName;
        if ($.browser.isIE) {
            var filePath = $file[0].value;
            var s = $file[0].value;
            var arr = s.split('\\');
            fileName = arr[arr.length-1];
            prefix = fileName.substring(fileName.lastIndexOf(".") + 1);

            if($file[0].files){
                size = $file[0].files[0].size / 1024;
            }else{
                size = 0;
            }
        } else {
            size = $file[0].files[0].size / 1024;
            var path = $file.val();
            prefix = path.substring(path.lastIndexOf(".") + 1);
            fileName = path.substring(path.lastIndexOf("\\") + 1);
        }
        var info = {};
        info.prefix = prefix.toLowerCase();;
        info.size = size;
        info.fileName = fileName;
        return info;
    };

    // 文件规格检查,IE, 报错:Automation,服务器不能创建对象,需要Internet设置ActiveX
    // IE同时需要设值上传文件到服务器时包含本地路径
    var checkFile = function (info, maxSize, types, fileInput) {
        if(fileInput && (fileInput instanceof jQuery)) {
            fileInput = fileInput[0];
        }
        if (types && types.length > 0 && $.inArray(info.prefix, types) == -1) {
            fileInput && (fileInput.outerHTML = fileInput.outerHTML);
            $.error(YIUI.I18N.getString("FILEUTIL_NONTYPEFILE", "非指定类型文件!") + "(" + types + ")");
            return false;
        }
        if (maxSize && maxSize != -1 && info.size > maxSize) {
            fileInput && (fileInput.outerHTML = fileInput.outerHTML);
            $.error(YIUI.I18N.getString("JQUERYEXT_ATTACHMENTEXCEEDMAXSIZE", "超出指定大小!") + "(" + maxSize + "KB)");
            return false;
        }
        return true;
    };

    var Return = {

        downLoadFile: function (options) {
        	if ($.browser.isIE && $.browser.version < 11) {
        		// IE 需要先把iframe进行appendTo(document.body)
                var $iframe = $('<iframe id="download-file-iframe"/>').appendTo(document.body);
                var $form = $('<form target="download-file-iframe" name="AAA" enctype="multipart/form-data" method="post"/>');

                $form.attr('action', Svr.SvrMgr.AttachURL);

                for(var key in options){
                    // $form.append('<input type="hidden" name="'+key+'" value="'+ options[key]+'"/>');
                    var p = $("<input type='hidden'/>");
                    p.attr('name', key);
                    p.attr('value', options[key]);
                    $form.append(p);
                }

                $iframe.append($form);
                $form.submit();

                $iframe.remove();
                $form.remove();
        	} else {
        		new Svr.Request().downloadFile(options, function (blob, fileName) {
        			if(window.navigator.msSaveBlob){
                        window.navigator.msSaveBlob(blob,fileName);
                    }else{
                        var a = document.createElement('a');
                        var URL = window.URL || window.webkitURL;
                        var u = URL.createObjectURL(blob);
                        a.href = u;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(u);
                     }
        		});
        	}
        },

        uploadFile:function (options) {
            // 先移除可能存在的iframe和form元素
            var $iframe = $("#upload-frame",document.body);
            var $form = $("#upload-form",document.body);
            $iframe.remove();
            $form.remove();

            //动态创建iframe和form表单,必须设置iframe的name值与form的target属性
            $iframe = $('<iframe name="upload-file-iframe" id="upload-frame"/>');
            $form = $('<form id="upload-form" target="upload-file-iframe" enctype="multipart/form-data" method="post" style="display:none;"/>');

            $form.attr('action',Svr.SvrMgr.AttachURL);

            var $file = $('<input type="file" name="upload-file">');

            $file.appendTo($form);
            $(document.body).append($iframe).append($form);

            $file.change(function () {

                var info = getFileInfo($(this));
                options.fileName = info.fileName;

                for(var key in options){
                    if( typeof options[key] === 'function' )
                        continue;
                    // $form.append('<input type="hidden" name="'+key+'" value="'+ options[key]+'"/>');
                    var p = $("<input type='hidden'/>");
                    p.attr('name', key);
                    p.attr('value', options[key]);
                    $form.append(p);
                }

                if( checkFile(info, options.maxSize, options.types) ) {
                    $form.submit();
                } else {
                    $iframe.remove();
                    $form.remove();
                }
            });

            // 处理回调事件
            $iframe.load(function () {
                var data = $(this).contents().find('body').text();
                if( data ) {
                    var ret = JSON.parse(data);
                    if( ret.data && typeof options.success === 'function' ) {
                        options.success(ret.data);
                    } else if ( ret.error ) {
                        $.error(ret.error.error_info);
                    }
                    $iframe.remove();
                    $form.remove();
                }
            });

            $file.click();// 触发浏览事件,选择文件
        },

        ajaxFileUpload:function (options) {
            var info = getFileInfo(options.file);
            options.fileName = info.fileName;

            if( checkFile(info,options.maxSize,options.types,options.file) ) {
            	new Svr.Request().uploadFile(options);
            }
            window.up_target = null;
        }
    };
    return Return;
})();
