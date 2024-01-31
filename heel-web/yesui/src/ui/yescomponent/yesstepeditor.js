(function () { 
    YIUI.Yes_StepEditor = function (options) {
        var Return = {
            /**
             * HTML默认创建为input
             * 
             */
            el: $('<span></span>'),

            /**
             * Boolean。
             * 光标进入默认全选。
             */
            selectOnFocus: true,
            
            init: function () {
            	var scale = this.settings.scale;
            	var input = $("<input type='text' />");
                input.appendTo(this.el);
                if (this.value != "") {
                    this.setValue((this.value*1).toFixed(scale));
                } else {
                    this.setValue((this.settings.vMin).toFixed(scale));
                }
                
            },

            /**
             * 返回值的时候
             */

            getInput: function () {
                return $("input", this.el);
            },

            getEl: function () {
                return this.el;
            },

            setValue: function (valueIn) {
            	if (valueIn === "" || valueIn == "undefined") {
            		this.value = this.settings.vMin;
            		valueIn = this.settings.vMin;
            	} else {
            		this.value = valueIn;
            	}
            	
            	this.value = valueIn;
            	 if (this.getEl()) {
                     this.getInput().val(valueIn);
                 }
            },
            
            getValue: function() {
            	var val = this.getInput().val();
            	if($.isNumeric(val)) {
            		val = new Decimal(val);
            	} else {
            		val = null;
            	}
            	return val;
            },
            
            commitValue: $.noop,
            
            setBackColor: function (backColor) {
                this.backColor = backColor;
                this.getInput().css({
                    'background-image': 'none',
                    'background-color': backColor
                })
            },

            setForeColor: function (foreColor) {
                this.foreColor = foreColor;
                this.getInput().css('color', foreColor);
            },

            setFormatStyle: function (cssStyle) {
                this.getInput().css(cssStyle);
            },

            setHeight: function (height) {
                this.el.css('height', height + 'px');
                this.getInput().css('height', height + 'px');
                if (this.settings.style == 1) {
                	$(this.el.children(".spanup")).css('height', height + 'px');
                	$(this.el.children(".spandown")).css('height', height + 'px');
                } else if (this.settings.style == 0) {
                    height = height - 2;
            	    $(this.el.children(".spanwarp")).css('height',height + 'px');
            	    $(this.el.children(".spanwarp").children(".spanup")).css('height',(height/2) + 'px');
            	    $(this.el.children(".spanwarp").children(".spandown")).css('height',(height/2) + 'px');
                }
                if ($.browser.isIE) {
                    this.getInput().css('line-height', (height - 3) + 'px');
                }
            },

            setWidth: function (width) {
                this.el.css('width', width + 'px');
                if (this.settings.style == 1) {
                	this.getInput().css('width', (width - this.el.children(".spanup").width() - this.el.children(".spandown").width()) + 'px');
                } else if (this.settings.style == 0){
            	   //this.getInput().css('width', (width - 20) + 'px');
            	   this.getInput().css('width', width + 'px');
                }
                
            },

            finishInput: function () {
                var self = this, $this = this.getInput();
                var minval = this.settings.vMin;
                var maxval = this.settings.vMax;
                var scale = this.settings.scale;
                if ($this.val() == "") {
                	$this.val(minval.toFixed(scale));
                }
               if (!isNaN($this.val())) {
            	   var inval = parseFloat($this.val());
                   
                   if(inval < minval){
                        //$this.val(minval.toFixed(scale));
                        $this.val(parseFloat(minval));
                   } else if(inval > maxval) {
                   	    //$this.val(maxval.toFixed(scale));
                        $this.val(parseFloat(maxval));
                   }
               } else {
            	   $this.val(minval.toFixed(scale)); 
               }
               this.value = $this.val();
               self.setValue($this.val())
               self.commitValue($this.val());
            },
            
            install: function () {
                var $this = this.getInput();
                var inputval = $this.val();
                var scale = this.settings.scale;
                // var minval = (this.settings.vMin).toFixed(scale);
                // var maxval = (this.settings.vMax).toFixed(scale);
                var minval = this.settings.vMin;
                var maxval = this.settings.vMax;
                var self = this;
                var step = (this.settings.step)*1;
                //如果step为非法字符，step设置为1
                step = isNaN(step) ? 1 : step;
				
				var $spanup = null, $spandown = null;
                if (this.settings.style == 1) {
                	$spanup = this.el.children(".spanup");
                    $spandown = this.el.children(".spandown");
                } else if(this.settings.style == 0) {
                	$spanup = this.el.children(".spanwarp").children(".spanup");
                	$spandown = this.el.children(".spanwarp").children(".spandown");
                }
               
                $this.on('click', function (event) {
                	 $this.removeAttr('selected');
                    if (self.needSelectAll) {
                        self.selectOnFocus && $this.select();
                        self.needSelectAll = true;
                    } 
                   
                });
                    
                $this.on('blur', function (event) {
                    self.finishInput();
                });
                
                $this.on('focusout', function (event) {
                	var inputvalue = $this.val();
                	var index = inputvalue.indexOf('.');
                	
                	if (index == -1) {
                		inputvalue = inputvalue == "" ? minval :inputvalue;
                		inputvalue = (inputvalue)*1;
                		$this.val(inputvalue.toFixed(scale));
                    	self.value = $this.val();
                      	self.commitValue(inputvalue);
                		
                	} else {
                		var substr = inputvalue.substring(index+1,inputvalue.length);
                		if (substr.length >= scale) {
                			inputvalue = inputvalue.substring(0,index+scale+1);
                			
                		} else {
                			for (var i = substr.length; i < scale; i++) {
                				inputvalue = inputvalue + '0';
                				
                			}
                		}
                	}
                	inputvalue = index == 0 ? minval : inputvalue;
                	var i = (inputvalue+"").indexOf('.') 
                	i == -1 ? $this.val(inputvalue.toFixed(scale)) : $this.val((+inputvalue).toFixed(scale));
                	$this.removeAttr('selected');
        			self.value = $this.val();
                  	self.commitValue(inputvalue);
  
                });
                
               $this.select(function(){
            	   $this.attr('selected',true);
               });
                
                $this.on('keydown',function(event){
                	var cursorindex = $this.getCursorPosition();
                	var oldval = ($this.val());
                	var select = $this.attr('selected') == 'selected' ? true : false;
                	
                	if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)){
                		var i = maxval.indexOf('.');
            			var len = maxval.length;
            			var j = oldval.indexOf('.');
            			var lenj = (oldval+"").length;
                        len = +oldval > 0 ? len : minval.length;
                        if (oldval.length == len && !select) {
                        	event.preventDefault(); 
                        }
                        
                        if (scale != 0  && +oldval > 0) {
                  
                        	if (j == -1 && oldval.length == maxval.indexOf('.') && !select){
                        		if (event.which != 110 ||event.which !=190) {
                        			event.preventDefault(); 
                        		}
                        		
                        	}
                        }
                       
                        if (scale !=0 && +oldval <0 ) {
                        	if (j == -1 && oldval.length == minval.indexOf('.') && !select){
                        		if (event.which != 110 ||event.which !=190) {
                        			event.preventDefault(); 
                        		}
                        	}
                        }
                        
                        var suboldval = (oldval.substring(j,oldval.length)).length - 1;
                        if (scale !=0 && oldval.length < len) {
                        	if (j != -1 && suboldval == scale && !select && cursorindex > j){
                        		event.preventDefault(); 
                        	}
                        }
                        
                		if ( !select) {
                			var num = event.which;
                			if (num >= 96 && num <= 105) {
                				num = num -96;
                			}
                			
                			if(num >= 48 && num <= 57) {
                				num =num - 48
                			}
                			
                			if (cursorindex == 0) {
            					oldval = num+""+oldval;
            				} else {
            					oldval = oldval.substring(0,cursorindex) + num + oldval.substring(cursorindex,oldval.length); 
            				}
            				if (+oldval > 0 && +oldval > +maxval){
            					event.preventDefault(); 
            				}
            				if (+oldval < 0 && +oldval < +minval){
            					event.preventDefault(); 
            				}
                			
            				if (+oldval > 0 && +oldval < +minval && (oldval+"").length != 1){
            					event.preventDefault(); 
            				}
                		}
                		
                		
                		
                	} else {
                		if (event.which != 8 && event.which != 46 && event.which != 37 && event.which != 39 && event.which != 190 && event.which != 110 && event.which != 86 && event.which != 67) {
                			
            				if (event.which == 109 || event.which == 189) {
                        			var index = minval.indexOf('-');
                        			var indexnow = oldval.indexOf('-');
                        			
                        			if ( indexnow != -1 || minval <0) {
                        				//isNaN(Math.abs(oldval*1)) ? $this.val((Math.abs(oldval*1)+"").replace('NaN','')) :$this.val(Math.abs(oldval*1).toFixed(scale))
                        				oldval != "" && oldval != '-' ? $this.val((-oldval).toFixed(scale)) : $this.val('-');
                        				event.preventDefault(); 
                        			} else {
                        				/*if (oldval == ''){
                        					$this.val('-');
                        				} else {
                        					$this.val('-'+((oldval*1).toFixed(scale)));
                        				}
                            			*/
                            			event.preventDefault(); 	
                            		}
                    		} else {
                    			event.preventDefault(); 
                    		}	
                		}
               	}
                
                var valnow = $this.val();
                	//判断是否可以按下小数点
                
                if (event.which == 190 || event.which == 110) {
    				var index = oldval.indexOf('.');
    				
    				if (scale == 0 || index != -1) {
    					event.preventDefault(); 
    				} else {
    					
    					if (oldval == ""){
    						$this.val(0+'.');
    						event.preventDefault(); 
    					}
    				} 
    			} 
                
                if ((event.which == 109 || event.which == 189) && select && +minval < 0) {
                	$this.val('-');            	
                }
/*              
               var select = $this.attr('selected') == 'selected' ? true : false;
               var maxlen = maxval.length;
               var minlen = minval.length;
        	   var oldlen = oldval.length;
        	   var oldpoint = oldval.indexOf('.');
        	   var minpoint = minval.indexOf('.');
        	   var maxpoint = maxval.indexOf('.');
        	   if (event.which != 8 && event.which != 46 && event.which != 37 && event.which != 39 && event.which != 190 && event.which != 110 && event.which != 86) {
        		   if ( scale == 0 && +oldval > 0) {//正整数
                	   
                	   if (!select && maxlen == oldlen ) {
                		   event.preventDefault(); 
                	   }
                	   
                   } else if (scale != 0 && +oldval > 0) {//正小数
                	   if (!select && maxlen == oldlen ) {
                		   event.preventDefault(); 
                	   }
                	   if (!select && oldpoint == maxpoint) {
                		   event.preventDefault(); 
                	   }
                	   
                   } else if ( scale != 0 && +oldval < 0) {//负小数
                	   if (!select && minlen == oldlen ) {
                		   event.preventDefault(); 
                	   }
                	   
                   } else if ( scale == 0 && +oldval < 0) {//负整数
                	   if (+oldval > 0) {
                		   if (!select && maxlen == oldlen ) {
                    		   event.preventDefault(); 
                    	   }
                	   }
                	   
                	   if (+oldval < 0) {
                		   if (!select && minlen == oldlen ) {
                    		   event.preventDefault(); 
                    	   }  
                	   }
        	   }
               
            	   
            	   
               }*/
               /*if ( +oldval >= +maxval ) {
            	   if ( $this.attr('selected') == 'selected') {
            		   return true;
            	   } else {
            		   event.preventDefault(); 
            	   }
            	   
               }*/
                
                $this.removeAttr('selected'); 	
                });
                
                $this.on('keyup',function(event){
                	var oldval = ($this.val());
                	if (escape(oldval).indexOf("%u") > 0) {
                		$this.val(minval);
                	}
                	
                    
                	if (event.which != 8 && event.which != 46 && event.which != 37 && event.which != 39  && event.which != 86 && event.which != 189) {
                		  var m = oldval.indexOf('0');
                          var t = oldval.indexOf('.');
                          if (m + 1 != t && oldval != 0) {
                          	 oldval = m == 0 ? oldval.substring(1,oldval.length) : oldval;
                          	}
                         
                          var j = (oldval+"").indexOf('-');
                         
                          
                          if (j != -1 && j != 0) {
                          	
                          	oldval = oldval.replace('-','');
                          	oldval = '-'+ oldval;
                          	
                          	if (+oldval >= +minval) {
                          		$this.val(oldval);
                          	} else {
                          		
                          			$this.val(minval);
                          		
                          		
                          	}
                          	
                          } else {
                        	  //oldval = +oldval == 0 ? (+oldval).toFixed(scale) : oldval;
                        	  if ( j != -1 && oldval.length != 1) {
                        		  var p = oldval.indexOf('.');
                             	 var subval = p != -1 ? oldval.substring(j+1,p) : oldval.substring(j+1,oldval.length);
                             	 if (p == -1) {
                             		subval = +subval;
                             		 $this.val("-"+subval+"");
                             	 } else {
                             		subval = +subval;
                             		oldval = "-" + subval + oldval.substring(p,oldval.length);
                             		 $this.val(oldval);
                             	 }
                             	 
                        	  } else {
                        		  $this.val(oldval);
                        	  }    
                          }
                          
                        if (oldval*1 <0 && oldval*1 < minval*1) {
                      		$this.val(minval);
                      	}
                      	
                      	if (oldval*1 > maxval*1) {
                      		$this.val(maxval);
                      	}
                      	
                      	/*if ( +oldval < +minval && +minval > 0 ) {
                      		$this.val(minval);
                      	}*/
                        var i = oldval.indexOf('.');
                        var len = oldval.length;
                        
                        if (len - i - 1 > scale && i != -1) {
                          	$this.val((+oldval.substring(0,scale+i+1)).toFixed(scale));
                        }
                	}
                  
                   /* var m = oldval.charAt('0');
                    if (m == 0) {
                       oldval = oldval.substring(1,oldval.length-1);
                       $this.val
                    }*/
                	if (event.which == 86 || event.which == 16 || event.which == 189) {
                		
                		if ( oldval != "" && oldval != "-" ) {
                			if (isNaN(oldval)) {
                     			$this.val(minval);
                     			
                     		} else {
                         		oldval = oldval*1
                         		if (oldval >= minval && oldval <= maxval) {
                         			$this.val(oldval.toFixed(scale));
                         			self.value = oldval;
                         		} else {
                         			if (oldval < minval) {
                                       	$this.val(minval);
                                       	self.value = minval;
                                       } else if(oldval > maxval) {
                                       	$this.val(maxval);
                                       	self.value = maxval;
                                       }
                         		}
                         	}
                    	}
                 		
                	}
                });
               
                $spanup.on('click',function(event){
                	if (!$this.parent().is('.ui-readonly')) {
                		
                		var inputvalue = $this.val();
                    	inputvalue = (inputvalue)*1;
                    	
                    	if (inputvalue + step < maxval) {
                    		if (scale !=0) {
                       			var result = inputvalue + step;
                       			result =result.toFixed(scale);
                       			result = result + "";
                       			/* var ind = result.indexOf('.');
                       			var inde = (step+"").indexOf('.');
                       			var len = (step+"").length +1;
                       			result = result.substring(0,(len-inde+1)+ind);*/
                    			var index = result.indexOf('.');
                    			if (index == -1) {
                    				result = (result)*1;
                            		$this.val(result.toFixed(scale));
                                	
                            		
                            	} else {
                            		var substr = result.substring(index+1,result.length);
                            		if (substr.length >= scale) {
                            			result = result.substring(0,index+scale+1);
                            			$this.val(result);
                            			self.value = $this.val();
                                      	self.commitValue(result);
                            		} else {
                            			for (var i = substr.length; i < scale; i++) {
                            				result = result + '0';
                            				$this.val(result);
                                			
                            			}
                            		}
                            	}
                    		} else {
                    			$this.val(inputvalue + step);
                    			self.setValue(inputvalue + step);
                    		}
                    		
                    	}else{
                    		$this.val(maxval);
                    	}
                    	self.commitValue(self.getValue());
                	}   
                });
                
                $spandown.on('click',function(event){
                	if (!$this.parent().is('.ui-readonly')) {
                		var inputvalue = $this.val();
                    	if (scale == 0) {
                    		inputvalue = parseFloat(inputvalue);
                    	} else {
                    		inputvalue = (inputvalue)*1;
                    	}
                    	inputvalue = (inputvalue)*1;
                    	if (inputvalue  - step > minval) {
                    		if ( scale != 0) {
                    			var result = inputvalue - step;
                    			result =result.toFixed(scale);
                    			result = result + "";
                    			var index = (result+"").indexOf('.');
                    			if (index == -1) {
                    				result = (result)*1;
                            		$this.val(result.toFixed(scale));
                        
                            		
                            	} else {
                            		var substr = result.substring(index+1,result.length);
                            		if (substr.length >= scale) {
                            			result = result.substring(0,index+scale+1);
                            			$this.val(result);
                            			self.value = $this.val();
                                      	self.commitValue(result);
                            		} else {
                            			for (var i = substr.length; i < scale; i++) {
                            				result = result + '0';
                            				$this.val(result);
                                	
                            			}
                            		}
                            	}	
                    			
                    		} else {
                    			$this.val((inputvalue - step));
                    		}
                    		
                    	}else{
                    		$this.val(minval);
                    	}
                    	
                    	self.value = $this.val();
                      	self.commitValue(self.value);
                         
                	}
                	
                });
                
                $spandown.mousedown(function(){
                	if (!$this.parent().is('.ui-readonly')) {
                		var flag = false;
                    	var flag1 = false;
                    	var stop;
                    	stop = setInterval(function(){
                    		flag = true;
                    		if(!flag1){
                    			var inputvalue = $this.val();
                    			inputvalue = (inputvalue)*1;
                    			if (inputvalue  - step > minval) {
                    				
                    				$this.val((inputvalue - step).toFixed(scale));
                            		
                            	}else{
                            		$this.val(minval);
                            		clearInterval(stop);
                            	}
                    			self.value = $this.val();
                    			 self.commitValue(inputvalue);
                    		}else{
                    			clearInterval(stop);
                    		}
                    		
                    	},150);
                    	$spandown.mouseup(function(){
                    		flag1 = true;
                    		if(!flag){
                    			clearInterval(stop);
                    		}
                    	});
                    	//鼠标移开该按钮时结束事件
                    	$spandown.mouseout(function(){
                    		clearInterval(stop);
                    	})
                	}
                	
                });
                
                $spanup.mousedown(function(){
                	if (!$this.parent().is('.ui-readonly')) {
                		var flag = false;
                    	var flag2 = false;
                    	var stopadd;
                    	stopadd = setInterval(function(){
                    		flag = true;
                    		if(!flag2){
                    			var inputvalue = $this.val();
                    			inputvalue = (inputvalue)*1;
                    			if (inputvalue  + step < maxval) {
                    				
                    				$this.val((inputvalue + step).toFixed(scale));
                            		
                            	}else{
                            		$this.val(maxval);
                            		clearInterval(stopadd);
                            	}
                    		 self.value = $this.val();
                   			 self.commitValue(inputvalue);
                    		}else{
                    			clearInterval(stopadd);
                    		}
                    		
                    	},150);
                    	$spanup.mouseup(function(){
                    		flag2 = true;
                    		if(!flag){
                    			clearInterval(stopadd);
                    		}
                    	});
                    	//鼠标移开该按钮时结束事件
                    	$spanup.mouseout(function(){
                    		clearInterval(stopadd);
                    	})
                	}
                	
                	
                });
            }
        };
        Return = $.extend(true, Return, options);
        if(!options.isPortal) {
        	Return.init();
        }
        Return.install();
        return Return;

    }
})();

(function($,undefined) {
	$.fn. getCursorPosition = function(){
    	var el = $(this).get(0);
    	var pos = 0;
    	if ('selectionStart' in el ) {
    		pos = el.selectionStart;
    	} else if ('selection' in document) {
    		el.focus();
        	var Sel = document.selection.createRange();
        	var SelLength  = document.selection.createRange().text.length;
        	Sel.moveStart('character',-el.value.length);
        	pos=Sel.text.length - SelLength;
    	}
    	
    	return pos;
    }
    
	
})(jQuery);