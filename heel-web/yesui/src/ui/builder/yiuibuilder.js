YIUI.YIUIBuilder = (function(){

    function _builder(formKey){
        this._formKey = formKey;
        this._state = -1;
        this._appEnv = null;
    };

    _builder.prototype.setContainer = function(container){
        this._container = container;
    };

    _builder.prototype.setParentForm = function(pForm){
        this._pForm = pForm;
    };

    _builder.prototype.setTarget = function(target){
        this._target = target;
    };

    _builder.prototype.setTemplateKey = function(templateKey){
        this.templateKey = templateKey;
    };
    
    _builder.prototype.setClose = function(close){
        this._close = close;
    };

    _builder.prototype.setOperationState= function(state){
        this._state = state;
    };

    _builder.prototype.setAppEnv = function(appEnv){
        this._appEnv = appEnv;
    };

    _builder.prototype.newEmpty= function(){
        var metaDef = null;
        if(this.templateKey){
            //反向模版用法， 为流程中专用， 根据流程权限加载， 所以这个地方不加载操作员权限
            metaDef = new YIUI.MetaService(this._pForm).getMetaForm(this._formKey, this.templateKey);
        }else{
            metaDef = new YIUI.MetaService(this._pForm).getMetaForm(this._formKey);
        }

        if(this._appEnv == null && this._pForm){
            this._appEnv = this._pForm.getAppEnv();
        }

        if(this._appEnv == null){
            console.log("appenv is null");
        }

        var _this = this;
        return $.when(metaDef)
                    .then(function(meta){
                        var metaForm = new YIUI.MetaForm(meta);
                        var emptyForm = new YIUI.Form(metaForm, _this._appEnv);
                        emptyForm.setTemplateKey(_this.templateKey);
                        return emptyForm;
                    }).promise();

    };

    _builder.prototype.builder= function(form){
        
        var _target = this._target;
        var _close = this._close;

        if (_target != YIUI.FormTarget.MODAL) {
            if (_target == YIUI.FormTarget.STACK) {
                form.isStack = true;
            }
            this._container.build(form);
        }

        if(this._pForm){
            form.pFormID = this._pForm.formID;
        }
        
        form.setContainer(this._container);

        var metaForm = form.metaForm;

        // 如果有指定状态,使用指定状态,否则使用初始状态
        var initState = this._state != -1 ? this._state : metaForm.initState;

        form.setOperationState(initState);

        if(_target == YIUI.FormTarget.MODAL) {
            var popHeight = form.popHeight || "60%";
            var popWidth = form.popWidth || "40%";
            var dialogID = form.formID;
            var dialogDiv = $("<div id=" + dialogID + "></div>");
            
            var settings = {
                title: form.caption, 
                showClose: false, 
                width: popWidth, 
                height: popHeight,
                close: function () {
                    return form.fireClose();
                },
                showCloseIcon: _close
            };
            var root = form.getRoot();
            settings.resizeCallback = function() {
                var dialogContent = dialogDiv.dialogContent();
                if(root.hasLayout) {
                    root.doLayout(dialogContent.width(), dialogContent.height());
                } else {
                    root.setWidth(dialogContent.width());
                    root.setHeight(dialogContent.height());
                }
            }
            dialogDiv.modalDialog(null, settings);

            var ct = dialogDiv.dialogContent();
            ct.el = dialogDiv.dialogContent();
            ct.renderDom = function(form) {
        		dialogDiv.dialogContent().empty();
            	form.getRoot().render(dialogDiv.dialogContent());
            };
            ct.build = function() {
                  return false;
            };
            ct.removeForm = function(form) {
                        dialogDiv.close();
                YIUI.FormStack.removeForm(form.formID);
            };
            form.setContainer(ct);
          }
          var newDocDef = new YIUI.DocService(form).newDocument(form.metaForm.formKey), loadPreDef;

          if (form.type == YIUI.Form_Type.View){
            	loadPreDef = new YIUI.RemoteService(form).loadPreference(form.getFormKey());
          } else {
            	loadPreDef = $.Deferred(function (def) {def.resolve(null);}).promise();
          }

          return $.when(newDocDef,loadPreDef)
          			.then(function(doc,data){
        	  if(doc && form.metaForm.dataObject.version != doc.version){
                  throw new Error(" version is error, refresh.");
              }

              form.setDocument(doc);

              if( form.type == YIUI.Form_Type.View ) { // 设置用户喜好
                form.showPreference(data);
              }

              return form.doOnLoad().then(function(data){
                      if( !form.willShow() ) {
                          form.showDocument();
                      }
                  return form;
              });
          }).promise();
    };

    return _builder;
})();