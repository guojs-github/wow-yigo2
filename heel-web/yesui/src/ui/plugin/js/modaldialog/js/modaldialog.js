(function($) {
	$.fn.extend( {
		modalDialog : function (msg, options) {
			msg = msg == null ? "" : $.htmlEncode(msg);
			if($(".dialog.error").length > 0) {
				return;
			}
			if (typeof(options) == "undefined") {
				options = { };
			}
			var defaults = {
				title: YIUI.I18N.getString("GRID_PROMPT","提示"),
				isResize: true,
				showCloseIcon: true,
				showClose: true,
				className: "",
				height: 100
			};
			var settings = $.extend(defaults, options);
			var c_h = document.body.clientHeight;
			var c_w = document.body.clientWidth;
			if(parseInt(settings.height) > c_h) {
				settings.height = c_h;
			} 
			if(parseInt(settings.width) > c_w) {
				settings.width = c_w;
			}
			var dialog = this.get(0);
			dialog.detailHeight = 0;

			$(dialog).addClass("dialog " + settings.className)
					.html(
						"<div class='dialog-header'>" +
							"<div class='dialog-title'></div>" +
							"<div class='dialog-close'></div>" +
						"</div>" +
						"<div class='dialog-content'>" +
							"<div class='dialog-content-inner' />" +
							"<div class='dialog-button-container'>" +
								"<input type='button' class='dialog-button close' value="+YIUI.I18N.getString("DIALOG_CLOSE","关闭")+" />" +
							"</div>" +
						"</div>"
					);

			if(!settings.showCloseIcon) {
				$(".dialog-close", dialog).hide();
			}
			var length = $(".dialog").length;
			var dialogmask = $("<div class='"+settings.className+"'/>");
			if(length == 0){
				$(dialog).addClass("show");
			}
			dialogmask.addClass("modal");
			if(dialogmask.hasClass("dict") || settings.type == "error"){
				dialogmask.removeClass("modal");
			}
			 //var dialogmask = $("<div class='"+settings.type+"'/>");
			dialogmask.addClass('dialog-mask').attr("id", dialog.id + "_mask");
			dialogmask.css("z-index",  (length+1) * 200);
			if(length > 0) {
				dialogmask.css({
					opacity: 0,
					filter: "alpha(opacity=0)"
				});
			}
			dialogmask.appendTo($(document.body));

			var z_index = $.getZindex(dialogmask) + 1;
			$(dialog).css("z-index", z_index);
			
			dialogmask.hide();
			$(dialog).hide();
			$(document.body).append(dialog);

			$(".dialog-close,.dialog-button.close", dialog).click(function () {
				if( typeof settings.close === 'function' ) {
					settings.close();   // 模态窗口,执行关闭事件
				} else {
					$(this).close();
				}
            });
			$('.dialog-title', dialog).text(settings.title);
			var doLayout = function(width, height) {
				innerHeight = height - $(".dialog-header", dialog).outerHeight();
				$('.dialog-content', dialog).css('height', innerHeight);
				
				if(!closeBtn.is(":hidden")) {
					innerHeight -= closeBtn.height();
				}
				$('.dialog-content-inner', dialog).css('height', innerHeight - dialog.detailHeight);
			};
			$('.dialog-content-inner', dialog).html(msg);
			$(dialog).fadeIn("slow");
			dialogmask.fadeIn("normal");
			var closeBtn = $('.dialog-button-container', dialog),
				innerHeight;
			if (settings.showClose) {
				if(settings.type == "error") {
					$(dialog).addClass("error");
					$('.dialog-content-inner', dialog).after($("<div class='dialog-detail'></div>"));
					$(".close", closeBtn).before($("<input type='button' class='dialog-button detail' value="+YIUI.I18N.getString("DIALOG_DETAILS","详情")+"  />"));
					$(".detail", closeBtn).click(function() {
						$(".dialog-detail", dialog).toggleClass("open").text(msg);
						var height = $(dialog).outerHeight();
						if($(".dialog-detail", dialog).hasClass("open")) {
							dialog.detailHeight = $(".dialog-detail", dialog).outerHeight();
							$(dialog).css('height', height + dialog.detailHeight);
						} else {
							$(dialog).css('height', height - dialog.detailHeight);
							dialog.detailHeight = 0;
						}
						innerHeight = $(dialog).height() - $(".dialog-header", dialog).outerHeight();
						$('.dialog-content', dialog).css('height', innerHeight);
					});
				} else if(settings.type == "warn") {
					$(dialog).addClass("warn");
					$('.dialog-content-inner', dialog).after($("<div class='dialog-detail'></div>"));
				}
				closeBtn.show();
			} else {
				closeBtn.remove();
			}

			settings.width && $(dialog).css('width', settings.width);
			$(dialog).css('height', settings.height);
			doLayout($(dialog).width(), $(dialog).height());

			var left = ($(window).width() / 2 - $(dialog).width() / 2) + "px";
            var top = ($(window).height() / 2 - $(dialog).height() / 2) + "px";
			$(dialog).css({left: left, top: top});
			
			var doResize = function() {
				$(dialog).append("<div class='rRightDown'></div>");
				$(dialog).append("<div class='rLeftDown'></div>");
				$(dialog).append("<div class='rRightUp'></div>");
				$(dialog).append("<div class='rLeftUp'></div>");/*
				$(dialog).append("<div class='rRight'></div>");
				$(dialog).append("<div class='rLeft'></div>");
				$(dialog).append("<div class='rUp'></div>");
				$(dialog).append("<div class='rDown'></div>");*/

				var resize = new Resize(dialog);
				resize.set($('.rLeftUp', dialog), 'leftUp')
					.set($('.rLeftDown', dialog), 'leftDown')
					.set($('.rRightDown', dialog), 'rightDown')
					.set($('.rRightUp', dialog), 'rightUp');
				resize.change = function(txt) {
					doLayout($(dialog).width(), $(dialog).height());
					if(settings.resizeCallback && $.isFunction(settings.resizeCallback)) {
						settings.resizeCallback();
					}
				};
			};

			if(settings.isResize) {
				doResize();
			}
			var self = this;
			
			var $box = $(".dialog-header", dialog).mousedown(function(e) {
				if(!$(e.target).hasClass("dialog-close")) {
				    var offset = $(dialog).offset();
				    dialog.posix = {'x': e.pageX - offset.left, 'y': e.pageY - offset.top};
				    $.extend(document, {'move': true, 'move_target': dialog});
				}
			});
			$(document).mousemove(function(e) {
				if (!!this.move) {
					var posix = !document.move_target ? {'x': 0, 'y': 0} : document.move_target.posix,
						callback = document.call_down || function() {
							var top = e.pageY - posix.y;
							if(top > 0) {
								if($(window).height() - top < $(document.move_target).height()) {
									top = $(window).height() - $(document.move_target).height();
								}
							} else {
								top = 0;
							}

							var left = e.pageX - posix.x;
							if(left > 0) {
								if($(window).width() - left < $(document.move_target).width()) {
									left = $(window).width() - $(document.move_target).width();
								}
							} else {
								left = 0;
							}

							$(this.move_target).css({
								'top': top,
								'left': left
							});
						};
					callback.call(this, e, posix);
				}
			}).mouseup(function(e) {
				if (!!this.move) {
					var callback = document.call_up || function(){};
					callback.call(this, e);
					$.extend(this, {
						'move': false,
						'move_target': null,
						'call_down': false,
						'call_up': false
					});
				}
			});
			
			$(".dialog-content", dialog).delegate(".errorinfo .closeIcon", "click", function() {
	        	$(this).parent().hide();
	        });

			// var $box = $(".dialog-header", dialog).mousedown(function(e) {
			// 	if($(e.target).hasClass("dialog-close")) {
			// 		return false;
			// 	}
			//     var offset = $(dialog).offset();
			//     dialog.posix = {'x': e.pageX - offset.left, 'y': e.pageY - offset.top};
			//     $.extend(this, {'move': true, 'move_target': dialog});
			// });
			//  $(".dialog-header", dialog).mousemove(function(e) {
			// 	if (!!this.move) {
			// 		var posix = !this.move_target ? {'x': 0, 'y': 0} : this.move_target.posix,
			// 			callback = this.call_down || function() {
			// 				$(this.move_target).css({
			// 					'top': e.pageY - posix.y,
			// 					'left': e.pageX - posix.x
			// 				});
			// 			};
			// 		callback.call(this, e, posix);
			// 	}
			// }).mouseup(function(e) {
			// 	if (!!this.move) {
			// 		var callback = this.call_up || function(){};
			// 		callback.call(this, e);
			// 		$.extend(this, {
			// 			'move': false,
			// 			'move_target': null,
			// 			'call_down': false,
			// 			'call_up': false
			// 		});
			// 	}
			// });

		},

        //关闭窗口
        close: function () {
            var dialog = $(this);
            if(!dialog.hasClass("dialog")) {
                dialog = $(this).parents(".dialog");
            }
            var mask =  $("#" +  (dialog.attr("id") || "") + "_mask");
            dialog.remove();
            mask.remove();
        },

		//可加载内容处
		dialogContent: function() {
			return $('.dialog-content-inner', this);
		}
	
	});

})(jQuery);
