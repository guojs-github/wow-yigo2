(function () {
    
    YIUI.Yes_Image = function (options) {
    	var cell_imgOpt = {
    	         open: YIUI.I18N.getString("GRID_SELECT","打开"),
    	         show: YIUI.I18N.getString("GRID_SHOW","查看"),
    	         clear: YIUI.I18N.getString("CURRENCY_CLEAN","清除")
    	     };

        var installBar = function (self) {
            var locale = cell_imgOpt,
                optBar = $("<div class='bar'></div>").appendTo(self.el);

            var upload = $("<span class='opt load' title='" + locale.open + "'/>").appendTo(optBar),
                clear = $("<span class='opt clear' title='" + locale.clear + "'/>").appendTo(optBar),
                show = $("<span class='opt show' title='" + locale.show + "'/>").appendTo(optBar);

            $("<input type='file' class='upload' name='file'/>").appendTo(upload);

            $(".opt",self.el).hover(function () {
                $(this).addClass("sel");
            },function () {
                $(this).removeClass("sel");
            });

            clear.click(function () {
                self.clear();
            });

            show.click(function () {

                var value = self.value;
                if( !value ) {
                    return;
                }

                var showDiv = $("<div class='ui-img-showDiv'></div>").appendTo(document.body),
                imageDiv = $("<div class='image_count'></div>").appendTo(document.body),
                deleteDiv = $("<span class='deleteImage'><span class='image_delete'></span></span>").appendTo(imageDiv),
                toolbarDiv = $("<div class='toolbarIamge'><span class='big'></span><span class='small'></span></div>").appendTo(imageDiv);

                var  tmpImg = $("<img class='ui-img-showImg'>");
            
                options.getImageURL(value, function(src) {
                	tmpImg.attr("src", src);
                });
        	
                tmpImg.appendTo(imageDiv);
                
                tmpImg.load(function () {
                    var imageDivWidth = imageDiv.outerWidth(),
                        imageDivHeight = imageDiv.outerHeight();
                    var left = (showDiv.width() - imageDivWidth) / 2 + "px",
                        top = (showDiv.height() - imageDivHeight) / 2 + "px";
                       
                    if(this.width>imageDivWidth && this.height>imageDivHeight){
                        tmpImg.addClass("max");
                    }else if(this.width<imageDivWidth && this.height>=imageDivHeight){
                        tmpImg.css({width: this.width, height: imageDiv.height()});
                    }else if(this.width>=imageDivWidth && this.height<imageDivHeight){
                        tmpImg.css({width: imageDiv.width(), height: this.height});
                    }else{
                        tmpImg.css({width: this.width, height: this.height});
                    }
                    
                    imageDiv.css({left: left, top: top});
                });

                $(".image_delete").click(function () {
                    showDiv.remove();
                    imageDiv.remove();
                });
                
                showDiv.click(function () {
                    showDiv.remove();
                    tmpImg.remove();
                    imageDiv.remove();
                });

                // tmpImg.click(function () {
                //     showDiv.remove();
                //     tmpImg.remove();
                // });
                var tmpWidth,  tmpHeight ;
                $(".big").click(function(){
                    var imageDivWidth = imageDiv.width(),
                        imageDivHeight = imageDiv.height(),
                        tmpImgWidth = tmpImg.width(),
                        tmpImgHeight = tmpImg.height();
                    
                    if(tmpImgWidth<imageDivWidth && tmpImgHeight<imageDivHeight){
                        tmpWidth= tmpImgWidth + 20 ;
                        tmpHeight = tmpImgHeight + 20;

                    }else if(tmpImgWidth<imageDivWidth && tmpImgHeight>=imageDivHeight){
                        tmpWidth= tmpImgWidth + 20;
                        tmpHeight = imageDivHeight;
                    }else if(tmpImgWidth >=imageDivWidth && tmpImgHeight<imageDivHeight){
                        tmpWidth = imageDivWidth;
                        tmpHeight = tmpImgWidth + 20;

                    }else if(tmpImgWidth>=imageDivWidth && tmpImgHeight>=imageDivHeight ||
                            tmpImgWidth==imageDivWidth && tmpImgHeight==imageDivHeight){
                        tmpWidth= imageDivWidth;
                        tmpHeight = imageDivHeight;
                        tmpImg.css({display: 'block'});
                        tmpImg.addClass("max");
                    }
                    tmpImg.css({width: tmpWidth + "px", height: tmpHeight  + "px"});
                });


                $(".small").click(function(){
                    tmpWidth= tmpImg.width() - 20 ;
                    tmpHeight = tmpImg.height() - 20;
                    tmpImg.css({width: tmpWidth + "px", height: tmpHeight  + "px",display:'inline-block'});
                });

            });
           
            $(".opt,.bar", self.el).hide();
        }

        var Return = {
            el: $("<div></div>"),
            sourceType: YIUI.IMAGE_SOURCETYPE.DATA,
            image: "",
            stretch: false,
            imageCut: false,
            enable: true,
            init: function () {
                this._img = $("<img />").appendTo(this.el);
                if( this.stretch ) {
                    this._img.addClass("stretch");
                }
                installBar(this);
            },
            getEl: function () {
                return this.el;
            },
            setSourceType: function (sourceType) {
                this.sourceType = sourceType;
            },
            setImagePath: function (path) {
                this._img.attr("src", path);
            },
            setImageCut: function (imageCut) {
                this.imageCut = imageCut;
            },
            setStretch: function (stretch) {
                this.stretch = stretch;
            },
            setEnable: function (enable) {
                this.enable = enable;
            },
            getImage: function () {
                return this._img;
            },
            setHeight: function (height) {

            },
            setWidth: function (width) {

            },
            update: function (value) {
                this.value = value;
                if( value ) {
                    this._img.removeClass("empty");
                } else {
                    this._img.addClass("empty");
                }
            },
            setAlt: function (text) {
                this._img.attr("alt",text);
            },

            uploadImg: $.noop,
            clear: $.noop,
            click: $.noop,
            commitValue: $.noop,

            install: function () {
                var self = this;

                self.el.on('change', '.upload', function (event) {
                    var file,fileName,type;
                    if( $.browser.isIE ) {
                        file = $(this).val();
                        fileName = file.substring(file.lastIndexOf("\\") + 1), type = fileName.split(".")[1];
                    } else {
                        file = event.target.files[0];
                        fileName = file.name, type = file.type.split("/")[1];
                    }
                    var _this = this;
                    if (self.imageCut) {
                        $(_this).photoCut({
                            type: type,
                            callback: function (paras) {
                                self.uploadImg($(_this), paras);
                            }
                        });
                    } else {
                        self.uploadImg($(_this), {
                                fileName: fileName,
                                imgType: type
                            }
                        );
                    }
                });

                self.el.on('blur', '.upload', function (event) {
                    $(".opt,.bar", self.el).hide();
                });

                this._img.bind("click", function (e) {
                    self.click();
                });

                this.el.hover(function () {
                    if(self.sourceType == YIUI.IMAGE_SOURCETYPE.DATA && self.enable) {
                        $(".opt,.bar", self.el).show();
                    } else {
                        $(".opt.show,.bar", self.el).show();
                    }
                },function () {
                    $(".opt,.bar", self.el).hide();
                })
            }
        };
        Return = $.extend(Return, options);
        if (!options.isPortal) {
            Return.init();
        }
        Return.install();
        return Return;
    }
})();