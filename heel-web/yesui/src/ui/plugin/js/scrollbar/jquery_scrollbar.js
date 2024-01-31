/*******************************************************************************************************************************************
 1、 引入jquery.js,开发是的版本是1.10.2
 2、使用方法，引入scrollbar.css和本就是文件，
                对一个容器使用.scrollbar()方法 ，如： $('.box').scrollbar();
 3、参数： isHorizontal ： true | false  是否显示横向滚动条  默认显示
           events : []   数组格式，添加改变内容宽高的事件 如 {obj : $obj , ev : 'click'},拖拽事件为'drag'.不支持有运动效果的事件
           isAnimate : false | true  默认false     默认返还$(this)   为true时返还一个设置滚动条布局的方法，方便在移动效果的计时器中调用。
                        
 4、如果一个页面有多个滚动条且有不同样式，在scrollbar.css文件中添加相关样式。建议使用子选择器方法覆盖。
 ***********************************************************************************************************************************************/
;
(function ($) {
    $.fn.scrollbar = function (opts) {
        var defaults = {
                isHorizontal : true,                      //是否显示横向滚动条
                events : [],                     
                isAnimate : false
            },
            options = $.extend(defaults, opts), 

            $this = $(this),
            $child = $this.children(),
            $document = $(document),
            $vScrollMid = $("<div class='scroll-middle-V'></div>"),             //滚动条
            $scrollTop = $("<div class='scroll-top'></div>"),                //顶部按钮
            $scrollBot = $("<div class='scroll-bottom'></div>"),             //底部按钮
            $vScrollSlider = $("<div class='scroll-slider-V'></div>"),          //滑块Y
            $scrollWrap,
            disTance = 20;                                                  //每次滚动及按钮点击，滑块的位移
            
        if(options.isHorizontal){
            var $hScrollMid = $("<div class='scroll-middle-H'></div>"),                //滚动条
                $scrollLeft = $("<div class='scroll-left'></div>"),                     //左部按钮
                $scrollRight = $("<div class='scroll-right'></div>"),               //右部按钮
                $hScrollSlider = $("<div class='scroll-slider-H'></div>");          //滑块x
        }
                
        var into = function(){               
                createScroll();
                setSlider();
                showHide();
                setDrag();
                btnCkick();
                longPress();
                mouseWheel($this.get(0));
            },

            createScroll = function(){
                if( $child.length == 1 && $child.get(0).nodeType == 1){
                    $child.addClass("scroll-wrap");
                    $scrollWrap = $child;
                }else{
                    $scrollWrap= $("<div class='scroll-wrap'></div>");                 //创建滚动控制区域 
                    $this.children().wrapAll($scrollWrap);
                }
                $scrollWrap.css('position' , 'absolute');
                $vScrollMid.appendTo($this).append($scrollTop,$scrollBot,$vScrollSlider);
                if(options.isHorizontal){
                    $hScrollMid.appendTo($this).append($scrollLeft,$scrollRight,$hScrollSlider);
                }
                $this.css({
                    position : 'relative',
                    overflow : 'hidden'
                });
            },
            setMidWidth = function(){
                var _height = $this.height(),
                    _width = $this.width(),
                    disY = $scrollWrap.height() - _height;
                if(disY >0) $vScrollMid.height(_height);
                if(options.isHorizontal){
                    var disX = $scrollWrap.width() - _width;
                    if(disY > 0 && disX > 0){
                        $hScrollMid.width(_width-$vScrollMid.width());
                        $vScrollMid.height(_height-$hScrollMid.height());
                    }else{
                        if(disX >0) $hScrollMid.width(_width);
                    }
                }  
            },

            setSlider = function(){
                setMidWidth();
                var _top =  $scrollTop.height(),
                    $thisHeight = $this.height(),
                    midHeight = $vScrollMid.height() - _top - $scrollBot.height(),
                    wrapHeight = $scrollWrap.height(),
                    difference = wrapHeight -  $thisHeight,
                    silderHeight,
                    isShow = $vScrollMid.css('display') == 'none' ? false : true;
                if(difference > 0){
                    silderHeight =  midHeight * $thisHeight / wrapHeight;
                    if(wrapHeight + parseInt($scrollWrap.css('top')) <= $thisHeight ){
                        $scrollWrap.css('top',  $thisHeight - wrapHeight);
                    }
                    if(!isShow) $vScrollMid.show();
                }else{     
                    $scrollWrap.css('top',0);
                    if(isShow) $vScrollMid.hide();  
                }

                var _disY =  parseInt($scrollWrap.css('top')) / difference * (midHeight - silderHeight) - _top;
                
                $vScrollSlider.css({
                    'top' : -_disY,
                    'height' : silderHeight
                });
                if(options.isHorizontal){
                    var _left =  $scrollLeft.width(),
                        midWidth = $hScrollMid.width() - _left - $scrollRight.width(),
                        difference_X = $scrollWrap.width() - $this.width(),
                        silderWidth,
                        isShow_X = $hScrollMid.css('display') == 'none' ? false : true;
                    if(difference_X > 0){
                        silderWidth =  midWidth * $this.width() / $scrollWrap.width();
                        if(!isShow_X) $hScrollMid.show();                       
                    }else{
                        if(isShow_X) $hScrollMid.hide(); 
                    }
                    $scrollWrap.css('left',0);
                    $hScrollSlider.css({
                        'left' : _left,
                        'width' : silderWidth
                    });
                }
            },

            showHide = function(){
                var len = options.events.length
                if(!len) return;
                $.each(options.events,function(i,v){
                   var $obj = options.events[i].obj,
                       _event = options.events[i].ev;
                    if(_event != 'drag'){
                            $obj.on(_event,function(){
                                setTimeout(function(){
                                    setSlider();
                                },50) 
                            });
                    }else{
                        seekBarFn($obj);
                    }
                })
              
            },

            seekBarFn = function($obj){
                $obj.on('mousedown',function(){
                    $document.on('mousemove.seekBar',function(){
                        setSlider();
                    }).one('mouseup',function(){
                        $document.off('mousemove.seekBar'); 
                    })
                })
            },

            setDrag = function(){
                $vScrollSlider.on('mousedown',function(e){
                    var silderTop = $(this).offset().top,
                        midTop = $vScrollMid.offset().top,
                        diffY = e.pageY - silderTop,
                        _top = $scrollTop.height(),
                        _bottom = $scrollBot.height(),
                        minY = _top,
                        maxY = $vScrollMid.height() - $scrollBot.height() -  $(this).height();
                       
                    $document.on('mousemove.srcoll',function(e){
                        var disY = e.pageY - midTop - diffY;
                        setAbsolute($vScrollSlider,disY,minY,maxY,'top');
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                    }).one('mouseup',function(){
                        $document.off('mousemove.srcoll'); 
                    })

                    e.stopPropagation(); 
                })

                if(options.isHorizontal){
                    $hScrollSlider.on('mousedown',function(e){
                        var silderLeft = $(this).offset().left,
                            midLeft = $hScrollMid.offset().left,
                            diffX = e.pageX - silderLeft,
                            _left = $scrollLeft.width(),
                            _right = $scrollRight.width(),
                            minX = _left,
                            maxX = $hScrollMid.width() - _right -  $(this).width();                         
                        $document.on('mousemove.srcollX',function(e){
                            var disX = e.pageX - midLeft - diffX;
                            setAbsolute($hScrollSlider,disX,minX,maxX,'left');
                            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        }).one('mouseup.srcollX',function(){
                            $document.off('mousemove.srcollX'); 
                        })
                        e.stopPropagation(); 
                    })
                }
            },

            btnCkick = function(){
               $scrollTop.on('click',function(){
                    scrollFn('down');
               }) 
                $scrollBot.on('click',function(){
                    scrollFn('up');
               }) 
               if(options.isHorizontal){
                    $scrollLeft.on('click',function(){
                        scrollFn('right');
                   }) 
                    $scrollRight.on('click',function(){
                        scrollFn('left');
                   }) 
                }
            },

            scrollFn = function(direction){
                var isVertical = true;
                if(direction == 'left' || direction == 'right'){
                    isVertical = false;
                } 
                if(isVertical){
                    var disY = parseInt($vScrollSlider.css('top')),
                        _top = $scrollTop.height(),
                        _bottom = $scrollBot.height(),
                        minY = _top,
                        maxY = $vScrollMid.height() - _bottom -  $vScrollSlider.height();
                    if(direction == 'down') disY -= disTance;
                    if(direction == 'up') disY += disTance;
                    setAbsolute($vScrollSlider,disY,minY,maxY,'top');
                }else{
                    var disX = parseInt($hScrollSlider.css('left')),
                        _left = $scrollLeft.width(),
                        _right =  $scrollRight.width(),
                        minX = _left,
                        maxX = $hScrollMid.width() - _right -  $hScrollSlider.width();
                    if(direction == 'right') disX -= disTance;
                    if(direction == 'left') disX += disTance;
                    setAbsolute($hScrollSlider,disX,minX,maxX,'left');   
                }
            },
            
            setAbsolute = function($silder,dis,min,max,dir){
                if( dis <= min) dis = min;
                if( dis >= max) dis = max;
                var bili = (dis-min) / (max - min),
                    _absolute;
                if(dir == 'top'){
                    _absolute = bili *($scrollWrap.height() - $this.height());
                }else{
                    _absolute = bili *($scrollWrap.width() - $this.width());
                }
                $silder.css(dir,dis);
                $scrollWrap.css(dir,-_absolute );
                
            },

            //长按按钮
            longPress = function(){
                longPressFn($scrollTop,'down');
                longPressFn($scrollBot,'up');
                if(options.isHorizontal){
                    longPressFn($scrollLeft,'right');
                    longPressFn($scrollRight,'left');
                }
            },
            longPressFn = function($obj,direction){
                $obj.on('mousedown',function(){
                    var timer = setInterval(function(){
                        scrollFn(direction);
                    },100);
                    $obj.one('mouseup',function(){
                        clearInterval(timer);
                    })
                })
            },
            mouseWheel = function($obj){
                if($obj.addEventListener){
                    $obj.addEventListener('DOMMouseScroll',wheelFn,false);       
                }
                $obj.onmousewheel = wheelFn;   
            },

            wheelFn = function(ev){
                if($this.height() >= $scrollWrap.height()) return;
                var ev = ev ||event,
                    dis;//滚动方向
                if(ev.wheelDelta){
                    dis = ev.wheelDelta >0 ? 'up' : 'down';
                }else{
                    dis = ev.detail > 0 ? 'down' : 'up';
                }                   
                dis == 'up' ?  scrollFn('down') : scrollFn('up');   
                //解除绑定事件
                if(ev.preventDefault) ev.preventDefault();
                return false;  
            }

        into();
        return options.isAnimate ? setSlider : $this;
        
    }
})(jQuery);