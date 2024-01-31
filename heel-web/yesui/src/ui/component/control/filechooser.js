/**
 * 按钮控件。
 */
YIUI.Control.FileChooser = YIUI.extend(YIUI.Control, {
    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div></div>',
    
    /**
     * 为用途，取值为Open(用于打开)、Save(用于保存)，默认值为Open。
     */
    useType: "open",
    
    /**
     * 是否允许多选。默认值为False；
     */
    allowMulti: false,
    
    /**
     * 扩展过滤，为文件的扩展名过滤，当有多个定义时以;分隔。无定义时为所有文件。
     */
    extFilter: null,

    handler: YIUI.FileChooserHandler,

    isDataBinding: function() {
        return false;
	},
    
    onSetWidth: function(width) {
    	this.base(width);
    	this.$input.width(width - this.$btn.width());
    	this.$fileBtn.css("left", this.$btn.position().left);
    },
    
    onSetHeight: function(height) {
    	this.base(height);
    	this.$input.height(height);
    	this.$btn.height(height);
    },

    /**
     * 完成FileChooser的渲染。
     */
    onRender: function (ct) {
    	this.base(ct);
    	this.el.addClass("ui-fc");
    	this.$input = $("<input class='txt' />").appendTo(this.el);
    	this.$btn = $("<button class='btn'>...</button>").appendTo(this.el);
    	this.$fileBtn = $("<input type='file' name='file' data-url='upload' class='fup'>").appendTo(this.el);
    },

    /**
     * 给DOM添加事件监听。
     */
    install: function () {
    	var self = this;

        // TODO 焦点策略暂未处理

        this.el.delegate('.fup', 'change', function(event) {
        	self.$input.val(this.value);
        	self.value = this.value;
        });
    }
});
YIUI.reg('filechooser', YIUI.Control.FileChooser);