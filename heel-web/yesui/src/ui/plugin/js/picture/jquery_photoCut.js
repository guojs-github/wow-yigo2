/*********************
 1、 引入jquery.js,开发是的版本是1.11.2
 2、引入jquery.form.js,开发是的版本是3.51
 3  引入photoCut.css
 3 使用方法，对一个文件上传按钮发生change事件时，使用  $('btn').photoCut();
 例如：$("#btn").change(function(){
			$("#btn").photoCut()	
		})

 4 本插件以post方式给后台一张图片资源和四个参数，参数分别为 x1 y1 w h  isCut 分别表示 x1裁切框左上角坐标X、y1裁切框左上角坐标Y、w裁切的宽度、h裁切的高度,isCut是否开启裁切功能

 ***********************/
;
(function ($) {
    $.fn.photoCut = function (opts) {
        var defaults = {
            ImgType: ["gif", "jpeg", "jpg", "bmp", "png"],      //设置文件上传类型 默认["gif", "jpeg", "jpg", "bmp", "png"]
            headWidth: 190,   									//最终头像显示尺寸宽  默认150
            headHeight: 190,  								    //最终头像显示尺寸高  默认150
            width: 548,											//显示框宽,默认400, 须大于等于headWidth
            height: 386,										//显示框宽,默认300，须大于等于headHeight + 50以上
            isCut: true,										//true或false,是否开启裁切功能，默认true
            maxSize: 10,									    //图片最大放大倍数,默认10倍,
            proportion: 0.1,   				 				    //图片放大缩小比例
            //imgProportion : 0.2 ,							    //图片最小显示比例
            backfile: null,     							        //后台处理文件 返回字符串 “图片保存地址“
            laodIcon : null
        };

        var options = $.extend(defaults, opts); //组合多个对象 options 会去覆盖默认defaults对象
        var _this = $(this);
        var _self = $(this)[0];
        var style = ""; 												//判断浏览器
        var photo = {};
        photo.dom = {};													//存dom对象
        photo.src = null;
        photo.widthInitial = null;    									//图片原始宽宽
        photo.heightInitial = null;    									//图片原始高宽
        photo.widthShow = null;   										//图片显示原始宽度
        photo.heightShow = null;  										//图片显示原始高度
        photo.size = 1;													//图片显示比例
        photo.controlWidth = null;             							// 缩放条长度
        photo.sliderWidth = null;  										// 缩放条拖拽块长度
        photo.choiceCentralX = (options.width - options.headWidth) / 2;     //裁切框左上角坐标X
        photo.choiceCentralY = (options.height - options.headHeight) / 2;   //裁切框左上角坐标y
        photo.timer = null;                                                 //收放按钮的定时器
        photo.backX1 = null;												//传入后台的图片裁切左上角坐标x
        photo.backY1 = null;												//传入后台的图片裁切左上角坐标y
        photo.backWidth = null;												//传入后台的图片裁切宽度
        photo.backHeight = null;												//传入后台的图片裁切高度
        photo.minLeft = null;													//拖动条最小值
        photo.minsize = null;												//图片缩小最小尺寸比例

        if (options.headWidth > options.width || options.headHeight + 50 > options.height) {
            alert(YIUI.I18N.getString("IMAGE_HEIGHT","显示框的宽不能小于头像框，高至少大于头像框高50px"));
            return;
        }

        //初始化
        //创建遮罩层
        var mask = '<div id="mask"></div>';

        //插入弹出层DOM
        var photoMain = '<div id="photo_photoMain">';
        photoMain += '<div id="photo_showBox">';
        photoMain += '<div id="photo_imgBox">';
        photoMain += '<img id="photo_ImgPr">';
        photoMain += '</div>';
        photoMain += '</div>';
        photoMain += '<div id="photo_controlBox">';
        photoMain += '<div id="photo_btn1"></div>';
        photoMain += '<div id="photo_control">';
        photoMain += '<div id="photo_slider"></div>';
        photoMain += '</div>';
        photoMain += '<div id="photo_btn2"></div>';
        photoMain += '</div>';
        photoMain += '<div id="photo_imgBox1">';
        photoMain += '<div id="photo_posBox">';
        photoMain += '<div id="photo_imgsmallBox">';
        photoMain += '<img id="photo_ImgPr2">';
        photoMain += '</div>';
        photoMain += '</div>';
        photoMain += '</div>';
        photoMain += '<div id="photo_btn">';
        photoMain += '<button id="confrim_btn">'+YIUI.I18N.getString("CURRENCY_OK","确定")+'</button>';
        photoMain += '<button id="cancel_btn">'+YIUI.I18N.getString("DICT_CANCEL","取消")+'</button>'
        photoMain += '</div>';
        photoMain += '</div>';
        $('body').append(photoMain, mask);

        if (options.isCut == true) {                      //判断是否开启了裁切功能,来创建裁切框dom，并设置样式
            var photoChoiceBox = '<div id="photo_choiceBox">';
            photoChoiceBox += '<div id="photo_choiceCentral">';
            photoChoiceBox += '<div class="photo_lineTop"></div>';
            photoChoiceBox += '<div class="photo_lineBottom"></div>';
            photoChoiceBox += '<div class="photo_lineLeft"></div>';
            photoChoiceBox += '<div class="photo_lineRight"></div>';
            photoChoiceBox += '</div>';
            photoChoiceBox += '<div id="photo_choiceLeft"></div>';
            photoChoiceBox += '<div id="photo_choiceRight"></div>';
            photoChoiceBox += '<div id="photo_choiceTop"></div>';
            photoChoiceBox += '<div id="photo_choiceBottom"></div>';
            photoChoiceBox += '</div>';
            $('#photo_showBox').append(photoChoiceBox);
            $('#photo_choiceBox').width(options.width).height(options.height);            //遮罩层设置
            $("#photo_choiceCentral").css({	 										 //遮罩层裁切显示框
                width: options.headWidth,
                height: options.headHeight,
                left: photo.choiceCentralX,
                top: photo.choiceCentralY
            });
            $("#photo_choiceLeft").css({											//遮罩层左
                width: (options.width - options.headWidth) / 2,
                height: options.height
            });
            $("#photo_choiceRight").css({											//遮罩层右
                width: (options.width - options.headWidth) / 2,
                height: options.height
            });
            $("#photo_choiceTop").css({											  //遮罩层上
                width: options.headWidth,
                height: (options.height - options.headHeight) / 2,
                left: (options.width - options.headWidth) / 2
            });
            $("#photo_choiceBottom").css({											//遮罩层下
                width: options.headWidth,
                height: (options.height - options.headHeight) / 2,
                left: (options.width - options.headWidth) / 2
            });
            $(".photo_lineTop,.photo_lineBottom").width(options.headWidth);
            $(".photo_lineLeft,.photo_lineRight").height(options.headHeight);
        }

        //缓存常用dom
        photo.dom.showBox = $("#photo_showBox");
        photo.dom.imgBox1 = $("#photo_imgBox1");
        photo.dom.control = $("#photo_control");
        photo.dom.slider = $("#photo_slider");
        photo.dom.imgBox = $("#photo_imgBox");
        photo.dom.imgsmallBox = $("#photo_imgsmallBox");
        photo.dom.ImgPr = $("#photo_ImgPr");
        photo.dom.ImgPr2 = $("#photo_ImgPr2");
        photo.dom.confrim = $("#confrim_btn");
        photo.dom.cancel = $("#cancel_btn");

        //样式设
        photo.dom.showBox.width(options.width).height(options.height);  			//显示框
        photo.dom.imgBox1.width(options.headWidth).height(options.headHeight);      // 动态小图框
        $("#photo_posBox").css({													//小图定位框层
            width: options.width,
            height: options.height,
            marginTop: -photo.choiceCentralY,
            marginLeft: -photo.choiceCentralX
        });
        $("#photo_photoMain").css({											//弹出层
            // width: options.width + options.headWidth + 50 + 22,
            // height: options.height + 22,
            left: ($(window).width() - options.width - options.headWidth) / 2,
            top: ($(window).height() - options.height) / 2
        });

        $("#photo_controlBox").css({									//滑块盒定位
            width: options.headWidth,
            top: options.headHeight + 50 - 10
        });
        photo.dom.control.css({											//滑块条设置
            width: options.headWidth - 50 -2
        });

        photo.controlWidth = photo.dom.control.width();             		// 缩放条长度
        photo.sliderWidth = photo.dom.slider.width();  						// 缩放条拖拽块长度
        

        //显示图片
        function getObjectURL(file) {          //获得图片预览地址
            var url = null;
            if (window.createObjectURL != undefined) {
                url = window.createObjectURL(file);
            } else if (window.URL != undefined) {
                url = window.URL.createObjectURL(file);
            } else if (window.webkitURL != undefined) {
                url = window.webkitURL.createObjectURL(file);
            }
            return url;
        }

        if (_self.value) {
            if (!RegExp("\.(" + options.ImgType.join("|") + ")$", "i").test(_self.value.toLowerCase())) {
                alert(YIUI.I18N.getString("IMAGE_FILEERROR","选择文件错误,图片类型必须是") + options.ImgType.join("，") + YIUI.I18N.getString("IMAGE_BILDERTYPE","中的一种"));
                _self.value = "";
                return false;
            }

            if (navigator.userAgent.indexOf("MSIE") > -1) {
                try {
                    $("#photo_ImgPr,#photo_ImgPr2").attr('src', getObjectURL(_self.files[0]));
                    showPhoto();
                } catch (e) {
                    var src = "";
                    _self.select();
                    if (top != self) {
                        window.parent.document.body.focus();
                    } else {
                        _this.blur();
                    }
                    src = document.selection.createRange().text;
                    photo.src = _this.val();
                    document.selection.empty();
                    $("#photo_ImgPr,#photo_ImgPr2").hide();
                    style = "ie";
                    //计算图片高度
                    var oImg = new Image();
                    oImg.onload = function(){
                         $("#photo_imgBox").width(this.width).height(this.height);
                         $("#photo_imgsmallBox").width(this.width).height(this.height);
                        photo.widthInitial = this.width;
                        photo.heightInitial = this.height;
                        showPhoto();
                    }
                    oImg.src = photo.src;                 
                }
            } else {
                $("#photo_ImgPr,#photo_ImgPr2").attr('src', getObjectURL(_self.files[0]));
                showPhoto();
            }
            //showPhoto();
            //计算拖动条最小值
            //photo.minLeft =options.imgProportion * (photo.size * (photo.controlWidth - photo.sliderWidth) / options.maxSize);
        }

        //图片尺寸按图片框缩放
        function showCalculation(obj) {     										//显示宽高初始画函数
            var proportion = photo.widthInitial / photo.heightInitial;
            if (obj.width() >= options.width || obj.height() >= options.height) {
                if (proportion >= 1) {
                    if (options.width / proportion > options.height) {
                        if (options.height * proportion < options.headWidth) {   //小于裁切框的处理
                            obj.width(options.headWidth).height(options.headWidth / proportion)
                        } else {
                            obj.width(options.height * proportion).height(options.height)
                        }
                    } else {
                        if (options.width / proportion < options.headHeight) {
                            obj.width(options.headHeight * proportion).height(options.headHeight);
                        } else {
                            obj.width(options.width).height(options.width / proportion);
                        }
                    }
                } else {
                    if (options.height * proportion > options.width) {
                        obj.width(options.width).height(options.width / proportion);
                    } else {
                        if (options.height * proportion < options.headWidth) {
                            obj.height(options.headWidth / proportion).width(options.headWidth);
                        } else {
                            obj.height(options.height).width(options.height * proportion);
                        }
                    }
                }
            } else if (style == "ie") {
                obj.height(photo.heightInitial).width(photo.widthInitial);
            }

            if (obj.width() <= options.headWidth || obj.height() <= options.headHeight) {  //当图片原始尺寸小于裁切框时拉大
                if (proportion >= 1) {
                    obj.width(options.headHeight * proportion).height(options.headHeight)
                } else {
                    obj.width(options.headWidth).height(options.headWidth / proportion)
                }
            }
        }

        function showBox(obj) {
            photo.dom.imgBox.css({visibility: 'visible'});
            photo.widthInitial = obj.width();
            photo.heightInitial = obj.height();
            showCalculation(obj);
            photo.widthShow = obj.width();
            photo.heightShow = obj.height();
            photo.size = 1;
               
            //初始化图片最小缩放比例
            photo.minsize = photo.widthShow <= photo.heightShow ? options.headWidth / photo.widthShow : options.headHeight / photo.heightShow;
            //计算拖动条最小值
            photo.minLeft = photo.minsize * (photo.size * (photo.controlWidth - photo.sliderWidth) / options.maxSize);
            //初始化拖拽块
            photo.dom.slider.css({left: photo.size * (photo.controlWidth - photo.sliderWidth) / options.maxSize - photo.minLeft});
            //photo.dom.slider.css({left: photo.size * (photo.controlWidth - photo.sliderWidth) / options.maxSize });
        }

        function imgCenter(obj) {  //图片居中
            obj.css({
                left: (options.width - obj.width()) / 2,
                top: (options.height - obj.height()) / 2
            });
        }

        function showPhoto() {
            //大图初始化
            photo.dom.imgsmallBox.css({visibility: 'visible'});//重置小图定位
            $("#mask").show();
            $("#photo_photoMain").fadeIn();
            if (style == "ie") {                
                $("#photo_imgBox,#photo_imgsmallBox").css({
                    'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)'
                });
                photo.dom.imgBox[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = photo.src;
                photo.dom.imgsmallBox[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = photo.src;
                showBox(photo.dom.imgBox);      //大图初始化
                imgCenter(photo.dom.imgBox);
                showCalculation(photo.dom.imgsmallBox);
                imgCenter(photo.dom.imgsmallBox);
            } else {
                photo.dom.ImgPr.load(function () {
                    photo.dom.ImgPr.removeAttr('style');    	//重置图片实际宽
                    showBox(photo.dom.ImgPr);
                    imgCenter(photo.dom.imgBox);
                });

                //小图初始化
                photo.dom.ImgPr2.load(function () {
                    photo.dom.ImgPr2.removeAttr('style'); //重置图片实际宽高
                    photo.dom.imgsmallBox.css({visibility: 'visible'});
                    showCalculation(photo.dom.ImgPr2);
                    imgCenter(photo.dom.imgsmallBox);
                })
            }
        }

        //照片放大缩小
        function imgChange() {
            var oWidth = photo.widthShow * photo.size;
            var oHeight = photo.heightShow * photo.size;
            if (style == "ie") {
                //限制缩放的最小尺寸
                if ((parseFloat(photo.dom.imgBox.css('left')) + photo.widthShow * photo.size) < (photo.choiceCentralX + options.headWidth)) {
                    var l = photo.choiceCentralX + options.headWidth - photo.widthShow * photo.size;
                    photo.dom.imgBox.css({'left': l});
                    photo.dom.imgsmallBox.css({'left': l})
                }
                if ((parseFloat(photo.dom.imgBox.css('top')) + photo.heightShow * photo.size) < (photo.choiceCentralY + options.headHeight)) {
                    var t = photo.choiceCentralY + options.headHeight - photo.heightShow * photo.size;
                    photo.dom.imgBox.css({'top': t});
                    photo.dom.imgsmallBox.css({'top': t})
                }

                photo.dom.imgBox.width(oWidth).height(oHeight);
                photo.dom.imgsmallBox.width(oWidth).height(oHeight);
            } else {

                if ((parseFloat(photo.dom.imgBox.css('left')) + photo.widthShow * photo.size) < (photo.choiceCentralX + options.headWidth)) {
                    var l1 = photo.choiceCentralX + options.headWidth - photo.widthShow * photo.size;
                    photo.dom.imgBox.css({'left': l1});
                    photo.dom.imgsmallBox.css({'left': l1})
                }
                if ((parseFloat(photo.dom.imgBox.css('top')) + photo.heightShow * photo.size) < (photo.choiceCentralY + options.headHeight)) {
                    var t1 = photo.choiceCentralY + options.headHeight - photo.heightShow * photo.size;
                    photo.dom.imgBox.css({'top': t1});
                    photo.dom.imgsmallBox.css({'top': t1});
                }

                photo.dom.ImgPr.width(oWidth).height(oHeight);
                photo.dom.ImgPr2.width(oWidth).height(oHeight);
            }
        }

        function photoAmplification() { //图片放大函数
            photo.size += options.proportion;
            if (photo.size >= options.maxSize) photo.size = options.maxSize;
            imgChange();
            photo.dom.slider.css({left: photo.size * (photo.controlWidth - photo.sliderWidth) / options.maxSize});
        }

        function photoNarrow() {     //图片缩小函数
            photo.size -= options.proportion;
            if (photo.size <= photo.minsize) photo.size = photo.minsize;
            imgChange();
            photo.dom.slider.css({left: photo.size * (photo.controlWidth - photo.sliderWidth) / options.maxSize - photo.minLeft});
        }

        //计算传入后台的裁剪坐标和尺寸
        function fnData(obj) {
            var widthInitial = photo.widthInitial;
            var heightInitial = photo.heightInitial;
            var backX1 = photo.backX1 = (photo.choiceCentralX - parseFloat(photo.dom.imgBox.css('left'))) * (widthInitial / obj.width());
            var backY1 = photo.backY1 = (photo.choiceCentralY - parseFloat(photo.dom.imgBox.css('top'))) * (heightInitial / obj.height());
            var backWidth = options.headWidth * widthInitial / obj.width();
            var backHeight = options.headHeight * heightInitial / obj.height();
            var diffWidth = widthInitial - (backX1 + backWidth);
            if(diffWidth < 0) {
                backWidth += diffWidth;
            }
            var diffHeight = heightInitial - (backY1 + backHeight);
            if(diffHeight < 0) {
                backHeight += diffHeight;
            }
            photo.backWidth = backWidth;
            photo.backHeight = backHeight;
        }

        function backstageData() {
            if (style == "ie") {
                fnData(photo.dom.imgBox);
            } else {
                fnData(photo.dom.ImgPr);
            }
        }

        $("#photo_btn1").mousedown(function () {
            clearInterval(photo.timer);
            photo.timer = setInterval(function () {
                photoNarrow();
                backstageData();
            }, 50);

            $(document).mouseup(function () {
                clearInterval(photo.timer)
            })
        });

        $("#photo_btn2").mousedown(function () {
            clearInterval(photo.timer);
            photo.timer = setInterval(function () {
                photoAmplification();
                backstageData();
            }, 50);

            $(document).mouseup(function () {
                clearInterval(photo.timer)
            })
        });
        //拖动条

        photo.dom.slider.mousedown(function (e) {
            var n , m;
            var w = photo.controlWidth - photo.sliderWidth;
            n = e.pageX - photo.dom.slider.offset().left;
            m = photo.dom.control.offset().left;

            photo.dom.slider[0].setCapture && photo.dom.slider[0].setCapture(); //ie下捕捉焦点

            $(document).bind('mousemove', sliderMove).bind('mouseup', sliderUp);

            //拖动条移动事件
            function sliderMove(e) {
                var x = e.pageX - n - m;
                /*if (x <= photo.minLeft) {
                    x = photo.minLeft
                } else if (x >= w) {
                    x = w
                }*/
                if (x <=0 ) {
                    x = 0
                } else if (x >= w) {
                    x = w
                }
              
                photo.dom.slider.css({left: x});
                //与按钮联动photo.size
                //photo.size = x / (w ) * options.maxSize;
                photo.size = ( x + photo.minLeft ) / w  * options.maxSize;
                imgChange();
            }

            //滑块停止
            function sliderUp() {
                $(document).unbind('mousemove', sliderMove).unbind('mouseup', sliderUp);
                photo.dom.slider[0].releaseCapture && photo.dom.slider[0].releaseCapture();
                backstageData();
            }

            return false;
        });

        //滚轮操作图片大小
        mousescroll();
        function mousescroll() {
            if (photo.dom.showBox[0].addEventListener) {
                photo.dom.showBox[0].addEventListener('DOMMouseScroll', fn, false);
            }
            photo.dom.showBox[0].onmousewheel = fn;
            function fn(e) {
                var ev = e || event,
                    dis;//滚动方向

                if (ev.wheelDelta) {
                    dis = ev.wheelDelta > 0 ? 'up' : 'down';
                } else {
                    dis = ev.detail > 0 ? 'down' : 'up';
                }

                if (dis === 'up') {
                    photoAmplification(); //图片放大函数
                } else if (dis === 'down') {
                    photoNarrow();        //图片缩小函数

                }
                //计算传入后台的裁剪坐标和尺寸
                backstageData();
                //解除绑定事件
                if (ev.preventDefault) ev.preventDefault();
                return false;
            }
        }

        //图片拖动
        photo.dom.showBox.mousedown(function (e) {
            var x = e.pageX;
            var y = e.pageY;
            photo.dom.showBox[0].setCapture && photo.dom.showBox[0].setCapture(); //ie下捕捉焦点
            function photoMove(e) {					//图片移动
                var oLeft = parseInt(photo.dom.imgBox.css('left')) + e.pageX - x;
                var oTop = parseInt(photo.dom.imgBox.css('top')) + e.pageY - y;
                var oRighr = photo.choiceCentralX + options.headWidth - photo.dom.imgBox.width();
                var oBottom = photo.choiceCentralY + options.headHeight - photo.dom.imgBox.height();
                //限制图片拖动
                if (oLeft > photo.choiceCentralX) oLeft = photo.choiceCentralX;
                if (oLeft < oRighr) oLeft = oRighr;
                if (oTop > photo.choiceCentralY) oTop = photo.choiceCentralY;
                if (oTop < oBottom) oTop = oBottom;

                photo.dom.imgBox.css({
                    left: oLeft,
                    top: oTop
                });
                photo.dom.imgsmallBox.css({
                    left: oLeft,
                    top: oTop
                });
                x = e.pageX;
                y = e.pageY;
            }

            function photoUp() {
                //计算传入后台的裁剪坐标和尺寸
                backstageData();
                //解除绑定事件
                $(document).unbind('mousemove', photoMove).unbind("mouseup", photoUp);
                photo.dom.showBox[0].releaseCapture && photo.dom.showBox[0].releaseCapture();
            }

            $(document).bind("mousemove", photoMove).bind("mouseup", photoUp);
            return false;
        });

        //上传数据
        photo.dom.confrim.click(function () {
            var data = upData();
            backstageData();
            var paras = {
                needCut: true,
                imgType: options.type,
                x: parseInt(photo.backX1),
                y: parseInt(photo.backY1),
                newWidth: parseInt(photo.backWidth),
                newHeight: parseInt(photo.backHeight),
                width: data.width,
                height: data.height,
                fileName : data.fileName
            };
            options.callback(paras);
            resetFile();
            $('#mask,#photo_photoMain').remove();
            return false;
        });
        photo.dom.cancel.click(function(){
            resetFile();
            $('#mask,#photo_photoMain').remove();
        });

        //上传图片宽高计算，文件名截取
        function upData(){
            var result={};
            if( photo.widthInitial < options.headWidth & photo.heightInitial < options.headHeight ){
                result.width = photo.widthInitial;
                result.height = photo.heightInitial;
            }else{
                result.width = options.headWidth;
                result.height = options.headHeight;
            }
            var fileName =  _this.val().substring( _this.val().lastIndexOf("\\") + 1) ;
            //fileName = encodeURI(encodeURI(fileName));
            result.fileName = fileName;
            return result;   
        }

        //重置input file值
        function resetFile() {
            var  $parent = _this.parent();
            if($parent.is("form")){
               $parent[0].reset(); 
               return;
            }
           
            var $form = $("<form></form>");           
            $parent.append($form);
            $form.append(_this);
            $form.get(0).reset();
            $parent.append(_this);
            $form.remove();
        }

        //取消弹出框
        $("#mask").click(function () {
            resetFile();
            $('#photo_photoMain,#mask').remove();
        });

        //鼠标右键
        /*	$("#photo_mx")[0].oncontextmenu = function(){
         alert("添加右键删除功能事件");
         return false;
         }*/

        //窗口变化时
        $(window).resize(function () {
            $("#photo_photoMain").css({											//弹出层
                left: ($(window).width() - options.width - options.headWidth) / 2,
                top: ($(window).height() - options.height) / 2
            })
        });

        return this;
    }
})(jQuery);

