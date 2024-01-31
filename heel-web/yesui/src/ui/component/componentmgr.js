/**
 * 控件管理类
 * 控件类型管理类
 * @type {YIUI.ComponentMgr}
 */
YIUI.ComponentMgr = function(){
	// 所有控件
    var all = {};

	// 所有控件类型
    var types = {};

    var Return= {
        /** 注册控件，以控件id为key */
        register : function(c){
            all[c.id] = c;
        },

        /** 取消注册控件，通常在destroy */
        unregister : function(c){
            all[c.id] = null;
        },

        /**
         * 根据控件id，获取已经注册的控件
         */
        get : function(id){
            return all[id];
        },

        all : all,

        /**
		 * 检查某控件类型是否已经注册过
         */
        isRegistered : function(type){
            return types[type] !== undefined;
        },

        /**
         * 注册控件类型，控件type为key，控件class为value
         */
        registerType : function(type, cls){
            types[type] = cls;
            cls.type = type;
        },
        
        /**
         * 遍历所有已注册的所有类型。
         * @param fn 对每个遍历到的类型进行的操作，形如：function(typeName,type)
         */
        eachType : function(fn) {
        	if($.isFunction(fn)) {
        		for(var typeName in types) {
        			fn(typeName, types[typeName]);
        		}
        	}
        },

		/**
		 * 根据传入的json动态创建控件
		 * @param config 传入的json
		 * @param defaultType 如果json中未定义type，默认创建的控件
		 * @returns {*}
		 */
        create : function(config, defaultType){
        	if(!types[config.tagName]) {
                // YIUI.ViewException.throwException(YIUI.ViewException.NO_COMPONENT, config.tagName);
                
            	throw new YIUI.ViewException(YIUI.ViewException.NO_COMPONENT, config.tagName);
        	}
            return config.render ? config : new types[config.tagName || defaultType](config);
        }
    };
    return Return;
}();

/**
 * YIUI.ComponentMgr#registerType的简写
 */
YIUI.reg = YIUI.ComponentMgr.registerType;
/**
 * YIUI.ComponentMgr#create的简写
 */
YIUI.create = YIUI.ComponentMgr.create;
/**
 * YIUI.ComponentMgr#get的简写
 */
YIUI.get = YIUI.ComponentMgr.get;