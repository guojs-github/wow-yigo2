(function(global, $){
    var pluginName = 'pagination';
    var eventPrefix = '__pagination-';
    $.fn[pluginName] = function(options){
        if(typeof options === 'undefined'){
            return this;
        }
        var container = $(this);
        var pagination = {
            initialize: function(){
                attributes.totalPage = this.calTotalPage(attributes.totalNumber, attributes.pageSize);
                this.model = {
                    pageRange: attributes.pageRange,
                    pageSize: attributes.pageSize,
	                totalNumber: attributes.totalNumber,
	                totalPage: attributes.totalPage,
	                pageChanges: attributes.pageChanges,
	                isFirstRender: true 
                };
                var self = this;
                var model = this.model;
                container.addClass("paginationjs");
                var el = $("<div class='paginationjs-pages'></div>").hide();
                model.el = el;
                container.append($("<div class='paginationjs-content'></div>"));
                container.append(el);
                if(attributes.totalPage > 1) {
                	model.isFirstRender = false;
                }
                model.content = $(".paginationjs-content", container);
                model.hidePagination = function() {
            		$(".paginationjs-pages", container).hide();
            		model.content.css("height",model.content.parent().height());
            		model.isFirstRender = true;
                };
                
                model.setPageRowCount = function(pageRowCount) {
                	attributes.pageSize = pageRowCount;
                	this.pageSize = pageRowCount;
                	this.totalPage = self.calTotalPage(attributes.totalRowCount, pageRowCount);
                	this.pageNumber = 1;
                	self.renderPages(model);
                	self.render();
                };
                model.setTotalRowCount = function(totalRowCount, isResetPageNum) {
                	attributes.totalNumber = totalRowCount;
                	this.totalNumber = totalRowCount;
                	this.totalPage = self.calTotalPage(totalRowCount, attributes.pageSize);
                	
                	if((this.totalPage > 1 && model.el.is(":hidden")) || (this.totalPage <= 1 && !model.el.is(":hidden"))) {
                        self.renderPages(model);
                    }
                	if(isResetPageNum) {
                		this.pageNumber = 1;
                	}
                	if(this.totalPage > 1) {
                		self.render();
                	}
                };
                model.pageRender = function() {
                    var h = model.content.parent().height() - model.el.outerHeight() - $(".fuzzy", model.content.parent()).height();
                    model.content.css("height", h + "px");
                    self.render();
                };
                this.observer();
            },
            renderPages: function(model) {
            	if(/*model.isFirstRender && */model.totalPage > 1) {
//                  container.append(model.el);
                    // model.el.show();
                    var h = model.content.parent().height() - model.el.outerHeight() - $(".fuzzy", model.content.parent()).height();
                    model.content.css("height", h + "px");
//                  model.isFirstRender = false;
                } else {
                	model.hidePagination();
                	model.content.height(model.content.parent().height() - $(".fuzzy", model.content.parent()).height());
                    // model.content.css("height",model.content.parent().height());
                }
            },
            calTotalPage: function(totalPage, pageRowCount) {
            	if($.isNumeric(totalPage)) {
            		return Math.ceil(totalPage / pageRowCount)
            	}
            },
            render: function(){
                var model = this.model,
                	el = container,
		            currentPage = model.pageNumber || attributes.pageNumber,
		            pageRange = attributes.pageRange,
		            totalPage = model.totalPage,
		            totalNumber = attributes.totalNumber = model.totalNumber,
		            rangeStart = currentPage - pageRange,
		            rangeEnd = currentPage + pageRange;
                if(rangeEnd > totalPage){
                    rangeEnd = totalPage;
                    rangeStart = totalPage - pageRange * 2;
                    rangeStart = rangeStart < 1 ? 1 : rangeStart;
                }
                if(rangeStart <= 1){
                    rangeStart = 1;
                    rangeEnd = Math.min(pageRange * 2 + 1, totalPage);
                }
                $(".paginationjs-pages", el).html(this.createTemplate({
                    currentPage: currentPage,
                    totalPage: totalPage,
                    rangeStart: rangeStart,
                    rangeEnd: rangeEnd
                })).show();
                return el;
            },
            createTemplate: function(args){
                var currentPage = args.currentPage,
	                totalPage = args.totalPage,
	                rangeStart = args.rangeStart,
	                rangeEnd = args.rangeEnd,
	                totalNumber = attributes.totalNumber,
	                prevText = attributes.prevText,
	                nextText = attributes.nextText,
	                ellipsisText = attributes.ellipsisText,
	                classPrefix = attributes.classPrefix,
	                showGoInput = attributes.showGoInput,
	                showGoButton = attributes.showGoButton,
	                showFirstButton = attributes.showFirstButton,
	                showLastButton = attributes.showLastButton,
	                showPageDetail = attributes.showPageDetail,
	                showAllPages = attributes.showAllPages,
	                showPages = attributes.showPages,
	                firstText = attributes.firstText,
	                lastText = attributes.lastText,
	                pageIndicatorCount = attributes.pageIndicatorCount,
	                html = '<ul>', i;
                if(currentPage === 1){
                	if(showFirstButton) {
                		html += '<li class="'+ classPrefix +'-firstpage disabled" title="First Page"><a>'+firstText+'</a></li>';
                	}
                	html += '<li class="'+ classPrefix +'-prev disabled"><a>'+ prevText +'</a></li>';
                } else {
                	if(showFirstButton) {
                		html += '<li class="'+ classPrefix +'-firstpage" title="First Page"><a>'+firstText+'</a></li>';
                	}
                    html += '<li class="'+ classPrefix +'-prev paginationjs-previous" data-num="'+ (currentPage - 1) +'" title="Previous page"><a>'+ prevText +'</a></li>';
                }
                if(showAllPages) {
                	if(rangeStart > pageIndicatorCount) {
                		html += '<li class="'+ classPrefix +'-page '+ classPrefix +'-first paginationjs-page" data-num="1"><a>1</a></li>'
                		+ '<li class="'+ classPrefix +'-ellipsis disabled"><a>'+ ellipsisText +'</a></li>';
                	} else {
                		for (var i = 1; i < rangeStart; i++) {
                			html += '<li class="'+ classPrefix +'-page '+ classPrefix +'-first paginationjs-page" data-num="'+i+'"><a>'+i+'</a></li>';
                		}
                	}
                }
                if(showPages) {
            		var len;
            		len = parseInt((pageIndicatorCount - 1) / 2);
            		if(len >= currentPage) {
            			len = currentPage - 1;
            		}
            		if(totalPage >= pageIndicatorCount && totalPage - currentPage < Math.ceil((pageIndicatorCount - 1) / 2)) {
            			len += len - (totalPage - currentPage);
            		}
                	if(totalPage < pageIndicatorCount) {
                		len = currentPage - 1;
                	}
    				for (var j = len; j >= 1 ; j--) {
    					html += '<li class="'+ classPrefix +'-page '+ classPrefix +'-first paginationjs-page" data-num="'+(currentPage - j)+'"><a>'+(currentPage - j)+'</a></li>';
					}
                }
                for(i = rangeStart; i <= rangeEnd; i++){
                    if(i == currentPage){
                        html += '<li class="'+ classPrefix +'-page paginationjs-page active" data-num="'+ i +'"><a>'+ i +'</a></li>';
                    } else {
                        html += '<li class="'+ classPrefix +'-page paginationjs-page" data-num="'+ i +'"><a>'+ i +'</a></li>';
                    }
                }
                if(showPages) {
                	var len = Math.ceil((pageIndicatorCount - 1) / 2);
                	if(totalPage - currentPage < len) {
        				len -= len - (totalPage - currentPage);
        			}
                	if(totalPage >= pageIndicatorCount && currentPage <= parseInt((pageIndicatorCount - 1) / 2)) {
                		len += parseInt((pageIndicatorCount - 1) / 2) - (currentPage - 1);
                	}
                	if(totalPage < pageIndicatorCount) {
                		len = totalPage - currentPage;
                	}
        			for (var i = 1; i <= len; i++) {
        				html += '<li class="'+ classPrefix +'-page '+ classPrefix +'-first paginationjs-page" data-num="'+(currentPage+i)+'"><a>'+(currentPage+i)+'</a></li>';
					}
                }
                if(showAllPages) {
                	if(rangeEnd >= totalPage - 2){
                		for(i = rangeEnd + 1; i <= totalPage; i++){
                			html += '<li class="'+ classPrefix +'-page paginationjs-page" data-num="'+ i +'"><a>'+ i +'</a></li>';
                		}
                	} else {
                		html += '<li class="'+ classPrefix +'-ellipsis disabled"><a>'+ ellipsisText +'</a></li>'
                		+ '<li class="'+ classPrefix +'-page '+ classPrefix +'-last paginationjs-page" data-num="'+ totalPage +'"><a>'+ totalPage +'</a></li>';
                	}
                }
                if(currentPage == totalPage){
                    html += '<li class="'+ classPrefix +'-next disabled"><a>'+ nextText +'</a></li>';
                    if(showLastButton) {
                    	html +='<li class="'+ classPrefix +'-lastpage disabled" title="Last Page"><a>'+lastText+'</a></li>';
                    }
                } else {
                    html += '<li class="'+ classPrefix +'-next paginationjs-next" data-num="'+ (currentPage + 1) +'" title="Next page"><a>'+ nextText +'</a></li>';
                    if(showLastButton) {
                    	html += '<li class="'+ classPrefix +'-lastpage" title="Last Page"><a>'+lastText+'</a></li>';
                    }
                }
                html += '</ul>';
            	if(showPageDetail) {
            		html += '<div class="'+ classPrefix +'-nav"> '+YIUI.I18N.getString("PAGINATION_JOINT","共")+'' + totalNumber + ''+YIUI.I18N.getString("PAGINATION_TOTALRECORD","条记录")+' </div>';
            	}
        		if(showGoInput) {
        			html += '<div class="'+ classPrefix +'-go-input"><input type="text" class="paginationjs-go-pagenumber"/>/'+totalPage+''+YIUI.I18N.getString("PAGINATION_PAGE","页")+'</div>'
        		}
        		if(showGoButton) {
        			html += '<div class="'+ classPrefix +'-go-button"> <input type="button" class="paginationjs-go-button" value="Go"/>';
        		}
                		
                return html;
            },
            go: function(number){
                var self = this;
                if(self.disabled) return;
                var model = self.model,
                	pageNumber = number,
                	pageSize = attributes.pageSize,
                	totalPage = model.totalPage;
            	pageNumber = parseInt(pageNumber);
            	
            	model.direction = typeof model.pageNumber === 'undefined' ? 0 : (pageNumber > model.pageNumber ? 1 : -1);
            	model.pageNumber = pageNumber;
            	if(totalPage != 1) {
            		self.render();
            	}
            	self.doCallback(pageNumber-1);
            },
            doCallback: function(currentPageNumber){
            	if(currentPageNumber < 0) return;
                var model = this.model;
                var self = this;
                if ($.isFunction(model.pageChanges)) {
                	model.pageChanges(currentPageNumber);
                }
            },
            delay_till_last: function(id, fn, wait) {
            	var _timer = this._timer || {};
            	if(_timer[id]) {
            		window.clearTimeout(_timer[id]);
            		delete _timer[id];
            	}
            	return _timer[id] = window.setTimeout(function() {
            		fn();
            		delete _timer[id];
            	}, wait);
            },
            observer: function(){
                var self = this;
                var el = self.model.el;
//                container.on(eventPrefix + 'go', function(event, pageNumber, done){
//                    self.go(pageNumber);
//                });
                el.delegate('.paginationjs-page', 'click', function(event){
                    var current = $(event.currentTarget);
                    if(current.hasClass("disabled")) return;
                    var pageNumber = $.trim(current.attr('data-num'));
                    if(!pageNumber || current.hasClass("active")) return;
                    self.go(pageNumber);
                });
                el.delegate('.paginationjs-previous', 'click', $.debounce(100,function(event){
	                    var current = $(event.currentTarget);
	                    if(current.hasClass("disabled")) return;
	                    var pageNumber = $.trim(current.attr('data-num'));
	                    if(!pageNumber) return;
	                    self.go(pageNumber);
                }));
                el.delegate('.paginationjs-next', 'click', $.debounce(100,function(event){
                	//console.log('click');
                		var current = $(event.currentTarget);
                        if(current.hasClass("disabled")) return;
                        var pageNumber = $.trim(current.attr('data-num'));
                        if(!pageNumber) return;
                        self.go(pageNumber);
                }));
                el.delegate('input.paginationjs-go-button', 'click', function(){
                    var pageNumber = $('.paginationjs-go-pagenumber', el).val();
                    if(!$.isNumeric(pageNumber)) return;
//                    container.trigger(eventPrefix + 'go', pageNumber);
                    self.go(pageNumber);
                });
                el.delegate('.paginationjs-go-pagenumber', 'keyup', function(event){
                    if(event.which === 13){
                    	var pageNumber = $(event.currentTarget).val();
                        if(!$.isNumeric(pageNumber)) return;
//                        container.trigger(eventPrefix + 'go', pageNumber);
                        self.go(pageNumber);
                        $('.paginationjs-go-pagenumber', el).focus();
                    }
                });
                el.delegate('.paginationjs-firstpage', 'click', function(){
                    if($(this).hasClass("disabled")) return;
                    self.go(1);
                });
                el.delegate('.paginationjs-lastpage', 'click', function(){
                    if($(this).hasClass("disabled")) return;
                    self.go(self.model.totalPage);
                });
//                container.trigger(eventPrefix + 'go', Math.min(attributes.pageNumber, self.model.totalPage));
                self.go(Math.min(attributes.pageNumber, self.model.totalPage));
            }
        };
        var attributes = $.extend({}, arguments.callee.defaults, options);
        pagination.initialize();
        return pagination.model;
    };
    $.fn[pluginName].defaults = {
        totalNumber: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPage: 1,
        pageRange: 0,
        prevText: "",
        nextText: "",
        firstText: "",
        lastText: "",
        ellipsisText: '...',
        classPrefix: 'paginationjs',
        showGoInput: false,
        showGoButton: false,
        showNavigator: false,
        showFirstButton: false,
        showLastButton: false,
        showPageDetail: true,
        showAllPages: false,
        showPages: false,
        pageIndicatorCount: 3,
        pageChanges: function(){}
    };
})(this, window.jQuery);