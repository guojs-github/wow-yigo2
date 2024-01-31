/**
 * 功能性控件基础类，其他功能性控件都从它派生。
 */
YIUI.Control = YIUI.extend(YIUI.Component, {
    /**
     * 组件的值
     */
    value: null,
    /**
     * 值确认事件中需要的备份值
     */
    backupValue: '',

    /**
     * String。
     * 组件显示在界面上的文本，区别于value。
     */
    text: '',

    /**
     * String。
     * 组件值的需要满足的条件。
     */
    checkRule: null,

    /**
     * String。
     * 组件值变化时，需要执行的操作。
     */
    trigger: null,

    /**
     * 组件的事件处理对象
     */
    handler: YIUI.Handler,

    /**
     * 控件行为类
     */
    behavior: null,

    /**
     * 控件是否已经初始化值
     */
    initValue: false,

    /**
     * 组件触发事件时的回调方法。
     */
    listeners: {
        // TODO 是否把这些与平台后台相关的代码移动到一个独立的文件中？
        /**
         * 鼠标点击组件时的回调方法。
         */
        click: function () {
            this.handler && this.handler.doOnClick(this.ofFormID, this.clickContent);
        },

        /**
         * 组件值变化时的回调方法。
         */
        change: function () {
            var newValue = this.getValue();
            this.handler && this.handler.doValueChanged(this, newValue, true, true);
        }
    },

    /**
     * 判断组件的值是否为空值.null,'',undefined,0都是空值
     */
    isNull: function() {
        return this.value == null || this.value == "";
    },

	commitValue: function() {
		if ( this.changing ) {
			if ( this.handler ) {
				this.handler.doValueChanged(this, this.getValue(), true, true);
			}
		}
		this.changing = false;
	},
	
    rollbackValue: function() {
		this.changing = false;
		this.setValue(this.backupValue, false, false, true, false);
    },
    
    /** 设置控件真实值，对应于数据库中存储的值 */
    setValue: function (value, commit, fireEvent, ignoreChanged, editing) {
        if( this.behavior == null ) {
            return false;
        }

		this.backupValue = this.value;

    	var options = {
			oldVal: this.getValue(),
			newVal: value
    	};

        var metaObj = this.getMetaObj();
    	if(this.type == YIUI.CONTROLTYPE.DYNAMICDICT){
            if( value && !value.itemKey ) {
                var form = YIUI.FormStack.getForm(this.ofFormID);
                options.itemKey = YIUI.DictHandler.getItemKey(form,metaObj.refKey);
            }
    	}
    	if(this.type == YIUI.CONTROLTYPE.NUMBEREDITOR){
            this.byZero = value == '#DIV/0';
            options.byZero = this.byZero;
        }
    	options = $.extend((options || {}), metaObj);

        //控件显示的时候 计算默认值，不需要fireEvent,但是依赖需要触发
        var _this = this;
        return this.behavior.checkAndSet(options, function(value) {
            _this.initValue = true;
            _this.setControlValue(value);
            _this.doChanged(ignoreChanged, value, commit, fireEvent, editing);
        });
    },

    /** 没有el时调用*/
    setControlValue: function(value) {
    	this.value = value;
    	if( this.el ) {
    	    this.checkEnd(value);
        }
    },

    /** 有el时调用*/
    checkEnd: function(value) {
    	this.value = value;
    },
    
    doChanged: function(ignoreChanged, value, commit, fireEvent, editing) {
        if( !ignoreChanged && this.handler ) {
            if ( editing ) {
                // 如果验证通过，则处理changed事件
                var formID = this.ofFormID;
                var validation = this.getMetaObj().validation;
                if ( this.handler.validated(formID, validation) ) {
                    this.handler.doValueChanged(this, value, commit, fireEvent);
                } else {
                    // 验证未通过，如果定义了changing事件，则处理changing事件
                    var changing = this.getMetaObj().valueChanging;
                    if ( this.handler.hasChanging(changing) ) {
                        this.changing = true;
                        this.handler.changing(formID, changing);
                    } else {
                        // 如果未定义changing事件，则回滚数据
                        this.rollbackValue();
                    }
                }
            } else {
                this.handler.doValueChanged(this, value, commit, fireEvent);
            }
            this.setTip(this.tip);
        }
	},

    /** 获取控件真实值 */
    getValue: function () {
        return this.value;
    },

    /** 获取控件旧值 */
    getOldValue: function () {
        return this.backupValue;
    },
    /** 设置控件显示值，对应于界面显示。默认与getValue()相同，对于真实值与显示值不同的控件，可覆盖此方法。 */
    setText: function (text) {
        this.setValue(text);
    },

    /** 获取控件显示值，同setText */
    getText: function () {
        return this.getValue();
    }
});
YIUI.reg("control", YIUI.Control);