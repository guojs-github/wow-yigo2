/**
 * Created by 陈瑞 on 2017/3/15 use WebStorm.
 */
YIUI.UIParaProcess = (function () {

    /**
     * 静态私有方法,刷新一个参数的值
     * @param para 参数
     */
    var refreshPara = function (form,para) {
        var value,
            cxt = new View.Context(form);
        switch (para.type) {
        case YIUI.ParameterSourceType.CONST:
            value = YIUI.TypeConvertor.toDataType(para.dataType,para.value);
            break;
        case YIUI.ParameterSourceType.FORMULA:
        case YIUI.ParameterSourceType.FIELD:
            value = form.eval(para.formula,cxt,null);
            break;
        default:
            break;
        }
        form.setPara(para.key,value);
    };

    var Return = {
        calcAll:function (form) {
            var paras = form.dependency.paraTree.items;
            for( var i = 0,size = paras.length;i < size;i++ ) {
                refreshPara(form,paras[i]);
            }
        },
        valueChanged:function (form,component) {
            var affectItems = form.dependency.paraTree.affectItems,affect;
            if( !affectItems )
                return;
            for( var i = 0,length = affectItems.length;i < length;i++ ) {
                if( affectItems[i].key === component.key ) {
                    affect = affectItems[i];
                    break;
                }
            }
            if( affect ) {
                for( var i = 0,size = affect.expItems.length;i < size;i++ ) {
                    refreshPara(form,affect.expItems[i]);
                }
            }
        }
    }
    return Return;
})();

