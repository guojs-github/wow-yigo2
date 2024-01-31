/**
 * 附件管理控件。
 */
YIUI.Control.Attachment = YIUI.extend(YIUI.Control, {
	/**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div></div>',

    handler: YIUI.AttachmentHandler,

    _operatorID: null,

    maxSize: -1,

    width: 1500,

	tableKey: '',

	provider: '',

	types:'',

	data: null,
    
    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.maxSize = meta.maxSize || this.maxSize;
        this.tableKey = meta.tableKey || '';
        this.provider = meta.provider || '';
        this.types = meta.types || '';
    },

    isDataBinding: function() {
        return false;
	},

    onRender: function (ct) {
        this.base(ct);
        this._operatorID = $.cookie("userID");
        this.el.addClass('ui-att');
        var _thead = $('<thead></thead>');
        var _tbody = $('<tbody></tbody>');
        
        this.$att_tbl = $('<table class="att-tbl"></table>').appendTo(this.el);

        var $tr_h = $('<tr class="tr-head"></tr>').appendTo(this.$att_tbl);
        var $td_h = $('<td class="out"></td>').appendTo($tr_h);
        var $div_h = $('<div class="head"></div>').appendTo($td_h);
        var $head = $('<table class="tbl-head"></table>').append(_thead).appendTo($div_h);
        
        var $tr_b = $('<tr class="tr-body"></tr>').appendTo(this.$att_tbl);
        var $td_b = $('<td class="out"></td>').appendTo($tr_b);
        var _body = $("<div class='body'></div>").appendTo($td_b);
        this.$table = $('<table border="1" class="tbl-body"></table>').append(_tbody).appendTo(_body);
        $("<span class='space'></span>").appendTo(_body);
        

        var $tr_f = $('<tr class="tr-foot"></tr>').appendTo(this.$att_tbl);
        var $td_f = $('<td class="out"></td>').appendTo($tr_f);
        var $div_f = $('<div class="foot"></div>').appendTo($td_f);
        $('<table border="1" class="tbl-foot"></table>').appendTo($div_f);
        
    	this.createColumns();

        this.addAttachment(this.data);
    },

    onSetHeight: function(height) {
    	this.base(height);
    	var $height = height - $(".tbl-head", this.el).outerHeight() - $(".tbl-foot", this.el).outerHeight();
    	$(".body", this.el).height($height);
    	this.addEmptyRow();
    	
    	$(".ui-resizer", this.el).height($(".tbl-head", this.el).outerHeight() + $(".body", this.el)[0].clientHeight);
    },

    onSetWidth: function(width) {
    	this.base(width);
    	var leftW = width - this.getPlaceholderWidth();
    	var placeW = this.placeW = $.getReal("100%", leftW);
    	if(placeW > 0) {
        	$(".tbl-head td.empty", this.el).outerWidth("100%");
        	$(".body tr.first td.empty", this.el).outerWidth("100%");
    	}
    	this.fileBtn.css("left", width/2);
    },

    getPlaceholderWidth: function() {
    	var tds = $(".tbl-head td", this.el), td, width = 0;
    	for (var i = 0, len = tds.length; i < len - 1; i++) {
			td = tds.eq(i);
			width += td.outerWidth();
		}
    	return width;
    },

    setEnable: function(enable) {
    	this.base(enable);
		if(this.enable) {
			$(".fup", this.el).removeAttr("disabled");
		} else {
			$(".fup", this.el).attr("disabled", "disabled");
		}
    },

    createColumns: function(){
		var $resizer = $("<div class='ui-resizer' />").prependTo(this.el);
    	var $thead = $(".tbl-head", this.el).children("thead");
		var $tr = $('<tr></tr>'),$th;
	    $('<td class="name"><label>'+YIUI.I18N.getString("ATTACHMENT_Name","附件名称")+'</label><span class="att-handler"></span></td>').appendTo($tr);
	    $('<td class="time"><label>'+YIUI.I18N.getString("ATTACHMENT_UPLOADTIME","上传时间")+'</label><span class="att-handler"></span></td>').appendTo($tr);
	    $('<td class="operator"><label>'+YIUI.I18N.getString("ATTACHMENT_UPLOADOPERATORID","上传人")+'</label><span class="att-handler"></span></td>').appendTo($tr);
	    $('<td class="path"><label>'+YIUI.I18N.getString("ATTACHMENT_PATH","附件路径")+'</label><span class="att-handler"></span></td>').appendTo($tr);
	    var operate = $('<td class="option_u"><label>'+YIUI.I18N.getString("ATTACHMENT_OPERATE","操作")+'</label></td>').appendTo($tr);
        $('<td class="option_d" style="width:0px;"><label></label></td>').appendTo($tr);
	    if( this.preview ) {
	    	$tr.addClass("hasView");
	    	$('<td class="option_p" style="width:0px;"><label></label></td>').appendTo($tr);
	    }
	    $('<td class="option_del" style="width:0px;"><label></label></td>').appendTo($tr);

		if( this.preview ) {
			operate.width(200);
		} else {
            operate.width(150);
		}

	    $('<td class="empty"><span/></td>').appendTo($tr);
		$thead.append($tr);

		var $tfoot = $('.tbl-foot', this.el);
		var btn = $("<input class='btn fileBtn' type='button' value='"+YIUI.I18N.getString("ATTACHMENT_UPLOAD","上传")+"'>");
		var fileBtn = this.fileBtn = $("<input type='file' name='file' data-url='upload' class='fup'>").data("fileID", -1);
		$('<td colspan="7"></td>').append(btn).append(fileBtn).appendTo($('<tr></tr>')).appendTo($tfoot);
		

    	var $tbody = this.$table.children('tbody');
		var $tr_f = $('<tr class="first"></tr>');
		$('<td class="name"></td>').appendTo($tr_f);
		$('<td class="time"></td>').appendTo($tr_f);
		$('<td class="operator"></td>').appendTo($tr_f);
		$('<td class="path"></td>').appendTo($tr_f);
		//下载
		$('<td class="download"></td>').appendTo($tr_f);
		//删除
		$('<td class="delete"></td>').appendTo($tr_f);
		$('<td class="upload"></td>').appendTo($tr_f);
		if(this.preview) {
			$tr_f.addClass("hasView");
			$('<td class="view"></td>').appendTo($tr_f);
		}
		$('<td class="empty"></td>').appendTo($tr_f);
		$tbody.append($tr_f);
    },

    load: function() {
        var form = YIUI.FormStack.getForm(this.ofFormID);
        var self = this;
        var callback = function(msg) {
        	self.data = msg;
        };
    	new Svr.Request(form).getSyncData(Svr.SvrMgr.AttachURL, {service: "LoadAllAttachment",
			tableKey:this.tableKey, oid: form.getOID(),formKey:form.formKey}, callback);
    },
    
    addAttachment: function(tbl) {
        this.$table.children('tbody tr').not(".first").remove();
    	var $tbody = this.$table.children('tbody');
    	var $tr, $td, self = this;
    	if(tbl && tbl.size() > 0) {
    		var $first = $("tr.first", $tbody);
    		for (var i = 0, len = tbl.size(); i < len; i++) {
    			tbl.setPos(i);
					var date = YIUI.DateFormat.format(tbl.getByKey(YIUI.Attachment_Data.UPLOAD_TIME));
					var uploadName = tbl.getByKey("UploadName");
					var path = tbl.getByKey(YIUI.Attachment_Data.PATH);
					var name = tbl.getByKey(YIUI.Attachment_Data.NAME);
					var oid = tbl.getByKey(YIUI.SystemField.OID_SYS_KEY);
    			
				$tr = $('<tr></tr>');
				$('<td>' + name + '</td>').appendTo($tr);
				$('<td>' + date + '</td>').appendTo($tr);
				$('<td>' + uploadName + '</td>').appendTo($tr);
				$('<td>' + path + '</td>').appendTo($tr);
				// 上传
                $('<td></td>').appendTo($tr).append($("<input class='btn upd' type='button' value='"+YIUI.I18N.getString("ATTACHMENT_UPLOAD","上传")+"'>"))
                    .append($("<input type='file' name='file' data-url='upload' class='btn upd fup'>").data("fileID", oid));
				// 下载
				$('<td></td>').appendTo($tr).append($("<input class='btn download' type='button' value='"+YIUI.I18N.getString("ATTACHMENT_DOWNLOAD","下载")+"'>").data("fileID", oid));
				// 删除
				$('<td></td>').appendTo($tr).append($("<input class='btn del' type='button' value='"+YIUI.I18N.getString("ATTACHMENT_DELETE","删除")+"'>").data("fileID", oid));
				if(this.preview) {
					$tr.addClass("hasView");
					$('<td></td>').appendTo($tr).append($("<input class='btn view' type='button' value='"+YIUI.I18N.getString("ATTACHMENT_PREVIEW","预览")+"'>").data("fileID", oid));
				}

				$('<td></td>').addClass("empty").appendTo($tr);
				$tbody.append($tr);
			}
    	}
    	this.data = null;
    },
    
    addEmptyRow: function() {
    	var $body = $(".body", this.el);
    	var $head = $(".head", this.el);
    	var $span = $body.children("span");
    	if(!this.items || this.items.length == 0) {
    		var lbl = $("label.empty", $span).remove();
    		if($("tr", $body).not(".first").length == 0) {
				lbl = $("<label class='empty'>"+YIUI.I18N.getString("ATTACHMENT_NOCONTENT","表中无内容")+"</label>");
				$span.append(lbl);
        		var width = $(".head tr", this.el).width();
        		var top = ($body.height() - lbl.height()) / 2;
        		lbl.width(width).css({
        			"top": top + "px",
        			"padding-left": $span.width()/2 + "px"
        		});
    		}
    	}
    	var $space = $(".body span.space", this.el);
    	$space.outerHeight($body[0].clientHeight - $body.outerHeight());
    	if($body[0].clientWidth != $body[0].scrollWidth) {
    		var scroll_w = $body.width() - $body[0].clientWidth;
    		if($("td.empty", $head).width() < scroll_w) {
    			$("td.empty", $head).outerWidth(scroll_w);
    			$("tr.first td.empty", $body).outerWidth(0);
    		}
    	} else {
    		$("td.empty", $head).outerWidth("100%");
    		$("tr.first td.empty", $body).outerWidth("100%");
    	}
    },

    uploadFile: function ($file) {
    	var self = this,
			form = YIUI.FormStack.getForm(self.ofFormID),
			fileID = $file.data("fileID") || -1,
			parent = $file.parents("tr").eq(0), _tds = parent.children();

        var success = function (data) {
            var table = YIUI.DataUtil.fromJSONDataTable(data);
            if( fileID > 0 ) {
                _tds.eq(0).text(table.getByKey(YIUI.Attachment_Data.NAME));
                _tds.eq(1).text(YIUI.DateFormat.format(table.getByKey(YIUI.Attachment_Data.UPLOAD_TIME)));
                _tds.eq(2).text(table.getByKey("UploadName"));
                _tds.eq(3).text(table.getByKey(YIUI.Attachment_Data.PATH));
                parent.find("input[type='file']").data("fileID",fileID);// newElement set fileID
            } else {
                self.addAttachment(table);
                self.addEmptyRow();
            }
        }

		var paras = {
        	service:"UploadAttachment",
			formKey: form.formKey,
			tableKey: self.tableKey,
			quickSave:"true",
            operatorID: self._operatorID,
			fileID: fileID,
			oid: form.getOID(),
			mode: 1,
			provider: self.provider,
			file: $file,
			maxSize: self.maxSize,
			types: !self.types ? null : self.types.split(";"),
			path: _tds.eq(3).text(),
			success: success
		};

        YIUI.FileUtil.ajaxFileUpload(paras);
    },

    focus: function () {
        $(".btn.fileBtn",this.el).focus();
    },

    install: function () {
        var self = this;
        self.$table.delegate('.download', 'click', function(event){
        	var target = $(event.target),
            parent = target.parents("tr").eq(0),
			_tds = parent.children(),
        	form = YIUI.FormStack.getForm(self.ofFormID);

			var options = {
                fileID: target.data("fileID"),
                formKey: form.formKey,
                path: _tds.eq(3).text(),
                mode: 1,
                service: 'DownloadAttachment',
				provider: self.provider
            };

            YIUI.FileUtil.downLoadFile(options);
        });
        self.el.delegate('.tbl-body .upd, .tbl-foot .fileBtn', 'click', function(event){
        	var target = $(event.target);
        	target.next().click();
        });
        self.$table.delegate('.del', 'click', function(event){
        	var target = $(event.target),
        	fileID = target.data("fileID"),
            parent = target.parents("tr").eq(0),
			_tds = parent.children(),
        	form = YIUI.FormStack.getForm(self.ofFormID);

        	var paras = {
                fileID:target.data("fileID"),
				formKey:form.formKey,
				tableKey: self.tableKey,
				provider: self.provider,
				path: _tds.eq(3).text(),
				service: "DeleteAttachment"
			}

        	self.handler.deleteAttachment(paras);

        	var rowIndex = target.parents("tr").eq(0).index() - 1;
        	$(this).parents("tr").eq(0).remove();
        	self.addEmptyRow();
        });

        self.el.delegate('.fup', 'change', function(event) {
        	self.uploadFile($(this));
        });

        self.el.delegate('.btn.fileBtn', "keydown", function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 13 || keyCode === 108) {
                $(".fup", self.el).click();
                event.preventDefault();
            } else if (keyCode === 9) {   //Enter
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
        
        self.el.delegate('.view', "click", function (event) {
        	var $tr = $(this).parents("tr:eq(0)");
        	var name = $("td:eq(0)", $tr).text();
        	var path = $("td:eq(3)", $tr).text();
        	self.handler.preview(path, name, self);
        });
        

        var $body = $(".body", this.el);
        var $head = $(".head", this.el);
        $body.scroll(function() {
			var left = $body.scrollLeft();
			$head.scrollLeft(left);
			if($body[0].clientWidth != $body[0].scrollWidth) {
				var scroll_w = $body.width() - $body[0].clientWidth;
				$("td.empty", $head).outerWidth(scroll_w);
			} 
		});
        

		$(".att-handler", this.el).bind('mousedown', function (e) {
			if(!self.enable) return false;
			var resizer = $(".ui-resizer", self.el);
			var resizerLeft = $(this).parent().position().left + $(this).parent().outerWidth();
			resizer.css("left", resizerLeft);
			resizer.addClass("clicked");
			var $leftColumn, leftColOldW, tableWidth ;
			e.preventDefault();
			var startPosition = e.clientX;
			$leftColumn = $(this).parents("td").eq(0);
			leftColOldW = $leftColumn.width();
			
			var difference , leftColW, tblWidth;
			$(document).on('mousemove.rc', function (e) {
				difference = e.clientX - startPosition;
    			resizer.css("left", resizerLeft + difference);
			});
			return $(document).one('mouseup', function () {
				$(document).off('mousemove.rc');
				leftColW = leftColOldW + difference;
				if(leftColW < 10) {
					leftColW = 10;
				}
				$leftColumn.width(leftColW);
				$("label", $leftColumn).width(leftColW);
				var $b_left = $(".tbl-body tr.first td", $body).eq($leftColumn.index());
				$b_left.width(leftColW);
                resizer.removeClass("clicked");
                self.addEmptyRow();
			});
		});
    }
});
YIUI.reg('attachment', YIUI.Control.Attachment);