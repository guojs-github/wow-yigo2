/**
 * Created with JetBrains WebStorm.
 * User: chenzs
 * Date: 14-3-27
 * Time: 上午10:41
 */
YIUI.Control.Calendar = YIUI.extend(YIUI.Control, {
    autoEl: '<div></div>',
    events: new Array(),
    slotMinutes: 30,
    setValue: function (value, commit, fireEvent) {
        var changed = this.base(value, commit, fireEvent);
        this.events = value;
        return changed;
    },
    setHeight: function (height) {
        this.base(height);
        this.el.fullCalendar("option", "height", height);
        this.el.fullCalendar("render");
    },
   
    onRender: function (ct) {
        this.base(ct);
        var self = this;
        this.el.fullCalendar({
            theme: true,   //是否使用主题
            defaultView: "month",       //默认显示的view：month-月份界面，agendaWeek-周界面，agendaDay-日界面
            header: {        //标题栏
                left: 'prev,next today',   //左边按钮，
                center: 'title',   //中间标题
                right: 'month,agendaWeek,agendaDay' //右边按钮
            },
            titleFormat: { //各个view界面对应的标题显示格式
                month: YIUI.I18N.getString("CALENDAR_MONTHS","yyyy年MM月"),
                week: YIUI.I18N.getString("CALENDAR_WEEKS","yyyy年MM月dd-{dd}日"),
                day: YIUI.I18N.getString("CALENDAR_DAYS","yyyy年MM月dd日-dddd")
            },
            //日程事件在各个view上的时间显示格式
            timeFormat: {agendaDay: "HH:mm-{HH:mm}", agendaWeek: "HH:mm-\n{HH:mm}", month: "HH:mm"},
            //月界面，高度定义：fixed-固定显示6周，liquid-高度不变，但是周数随月份变化，variable-高度随月份的周数变化
            weekMode: "liquid",
            weekends: true,//是否显示周六周日
            weekNumbers: false,//是否显示周次（一年中的第几周）
            weekNumberTitle: YIUI.I18N.getString("CALENDAR_WEEK","周"),//周次标题
            buttonText: {   //按钮显示文本
                month: YIUI.I18N.getString("CALENDAR_MONTH","月"),
                agendaWeek: YIUI.I18N.getString("CALENDAR_WEEK","周"),
                agendaDay: YIUI.I18N.getString("CALENDAR_DAY","日"),
                today: YIUI.I18N.getString("CALENDAR_TODAY","今天")
            },
            monthNames: [YIUI.I18N.getString("CALENDAR_JANUARY","一月"), YIUI.I18N.getString("CALENDAR_FEBRUARY","二月"), YIUI.I18N.getString("CALENDAR_MARCH","三月"), 
                            YIUI.I18N.getString("CALENDAR_APRIL","四月"),YIUI.I18N.getString("CALENDAR_MAY","五月"), YIUI.I18N.getString("CALENDAR_JUNE","六月"),
                            YIUI.I18N.getString("CALENDAR_JULY","七月"), YIUI.I18N.getString("CALENDAR_AUGUST","八月"), YIUI.I18N.getString("CALENDAR_SEPTEMBER","九月"), 
                            YIUI.I18N.getString("CALENDAR_OCTOBER","十月"), YIUI.I18N.getString("CALENDAR_NOVEMBER","十一月"), YIUI.I18N.getString("CALENDAR_DECEMBER","十二月")],
            monthNamesShort: [YIUI.I18N.getString("CALENDAR_JANUARY","一月"), YIUI.I18N.getString("CALENDAR_FEBRUARY","二月"), YIUI.I18N.getString("CALENDAR_MARCH","三月"),
                              YIUI.I18N.getString("CALENDAR_APRIL","四月"),YIUI.I18N.getString("CALENDAR_MAY","五月"), YIUI.I18N.getString("CALENDAR_JUNE","六月"), 
                              YIUI.I18N.getString("CALENDAR_JULY","七月"), YIUI.I18N.getString("CALENDAR_AUGUST","八月"),YIUI.I18N.getString("CALENDAR_SEPTEMBER","九月"), 
                              YIUI.I18N.getString("CALENDAR_OCTOBER","十月"),YIUI.I18N.getString("CALENDAR_NOVEMBER","十一月"), YIUI.I18N.getString("CALENDAR_DECEMBER","十二月")],
            dayNames: [YIUI.I18N.getString("CALENDAR_SUNDAY","周日"), YIUI.I18N.getString("CALENDAR_MONDAY","周一"), YIUI.I18N.getString("CALENDAR_TUESDAY","周二"), YIUI.I18N.getString("CALENDAR_WEDNESDAY","周三"), 
                        YIUI.I18N.getString("CALENDAR_THURSDAY","周四"), YIUI.I18N.getString("CALENDAR_FRIDAY","周五"), YIUI.I18N.getString("CALENDAR_SATURDAY","周六")],
            dayNamesShort: [YIUI.I18N.getString("CALENDAR_SUNDAY","周日"), YIUI.I18N.getString("CALENDAR_MONDAY","周一"), YIUI.I18N.getString("CALENDAR_TUESDAY","周二"),YIUI.I18N.getString("CALENDAR_WEDNESDAY","周三"), 
                            YIUI.I18N.getString("CALENDAR_THURSDAY","周四"), YIUI.I18N.getString("CALENDAR_FRIDAY","周五"), YIUI.I18N.getString("CALENDAR_SATURDAY","周六")],
            editable: true,//日程事件是否可编辑，可编辑是指可以移动，改变大小等
            slotMinutes: this.slotMinutes,// 表示在agenda的view中，两个时间之间的间隔，即一个小时分成多行，每行的时间
            allDayText: YIUI.I18N.getString("CALENDAR_ALLDAY","全天"),
            axisFormat: "HH" + YIUI.I18N.getString("CALENDAR_DOT","点"), //周或日界面左边列的显示格式
            minTime: 0,// 设置显示时间从几点开始
            maxTime: 24,// 设置显示时间从几点結束
            slotEventOverlap: false,//設置日程事件是否可以重叠
            events: this.events,
            eventClick: function (calEvent, event, view) {  //点击日程事件时的事件
                var dateFormat = calEvent.allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss";
                self.modifyEventDialog(calEvent).dialog("open");
            },
            eventMouseover: function (calEvent, event, view) { //鼠标划过日程事件时的事件
            },
            eventMouseout: function (calEvent, event, view) { //鼠标离开日程事件时的事件
            },
            selectable: true, //是否允许用户通过单击或拖动选择日历中的对象，包括天和时间
            selectHelper: true,
            select: function (startDate, endDate, allDay, jsevent, view) {   //选中时间事件
                var dateFormat = allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss";
                self.editEventDialog(
                    "add",
                    $.fullCalendar.formatDate(startDate, dateFormat),
                    $.fullCalendar.formatDate(endDate, dateFormat),
                    allDay
                ).dialog("open");
            }
        });
    },
    editEventDialog: function (oper, startD, endD, isAllDay, content, eventID) { //弹出的模态窗口
        var self = this;
        startD = (typeof startD == "undefined") ? "" : startD;
        endD = (typeof endD == "undefined") ? "" : endD;
        isAllDay = (typeof isAllDay == "undefined") ? true : isAllDay;
        var formDiv = $("<div id='editEventDialog' style='display: none'></div>");
        $.datepicker.setDefaults($.datepicker.regional['zh-CN'])
        $('<p style="margin: 0;padding:0">'+YIUI.I18N.getString("CALENDAR_SCHEDULE","日程内容：")+'</p>').appendTo(formDiv)
            .append($('<label id="contentCheck" style="color: red;display: none"></label>'));
        var eventContent = $('<textarea id="event" style="width:100%;height: 50%" placeholder='+YIUI.I18N.getString("CALENDAR_THING","记录你将要做的一件事...")+'>' +
            '</textarea>').appendTo(formDiv);
        eventContent.focus(function () {
            $("#contentCheck").hide()
        });
        if (typeof  content != "undefined") {
            eventContent.val(content);
        }
        var startDate = $("<input type='text'>").appendTo(formDiv);
        startDate.wrap("<p style='margin: 0;padding: 0'>"+YIUI.I18N.getString("CALENDAR_STARTTIME","开始时间：")+"</p>");
        var endDate = $("<input type='text'>").appendTo(formDiv);
        endDate.wrap("<p id='endDate' style='margin: 0;padding: 0;display: none'>"+YIUI.I18N.getString("CALENDAR_STOPTIME","结束时间：")+"</p>");
        endDate.datetimepicker({showSecond: false, stepMinute: self.slotMinutes,
            closeText:YIUI.I18N.getString("CALENDAR_CHOICE","选择"), currentText: YIUI.I18N.getString("CALENDAR_CURRENT","当前")});
        var allDayCheck = $('<input type="checkbox" value="1" id="isallday"> ').appendTo(formDiv);
        var checkAllDay = function () {
            endDate[0].parentElement.style.display = isAllDay ? "none" : "block";
            if (!isAllDay) {
                allDayCheck.removeAttr("checked");
                startDate.val("");
                endDate.val("");
                startDate.datepicker("destroy");
                startDate.datetimepicker({showSecond: false, stepMinute: self.slotMinutes,
                    closeText: YIUI.I18N.getString("CALENDAR_CHOICE","选择"), currentText: YIUI.I18N.getString("CALENDAR_CHOICE","选择")});
            } else {
                allDayCheck.attr("checked", "checked");
                startDate.val("");
                endDate.val("");
                startDate.datetimepicker("destroy");
                startDate.datepicker();
            }
        }
        checkAllDay();
        startDate.val(startD);
        endDate.val(endD);
        allDayCheck.click(function () {
            isAllDay = !isAllDay;
            checkAllDay();
        });
        allDayCheck.wrap("<label></label>").after(YIUI.I18N.getString("CALENDAR_ALLDAY","全天"));
        var checkRule = function () {
            if (eventContent.val() == "") {
                $("#contentCheck").html(YIUI.I18N.getString("CALENDAR_NOTEMPTY","内容不允许为空!"));
                $("#contentCheck").show();
                return false;
            }
            if (startDate.val() == "") {
                $("#contentCheck").html(YIUI.I18N.getString("CALENDAR_NOTTIME","开始时间不允许为空!"));
                $("#contentCheck").show();
                return false;
            }
            return true;
        };
        var lnew = YIUI.I18N.getString("CALENDAR_NEW","新建");
        var modify = YIUI.I18N.getString("RIGHTSSET_MODIFY","修改");
        var cancel = YIUI.I18N.getString("DICT_CANCEL","取消");
        formDiv.dialog({   //设置弹出窗口属性
            title: (oper == "add") ? YIUI.I18N.getString("CALENDAR_NEWEVENT","新建事件"): YIUI.I18N.getString("CALENDAR_EDITEVENT","编辑事件"),
            autoOpen: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
            	lnew : function () {
                    if (!checkRule()) {
                        return;
                    }
                    var newEvent = {
                        title: eventContent.val(),
                        start: startDate.val(),
                        end: isAllDay ? "" : endDate.val(),
                        allDay: isAllDay
                    };
                    self.events.push(newEvent);
                    formDiv.dialog("close");
                },
                modify: function () {
                    if (!checkRule()) {
                        return;
                    }
                    var modifyEvent = self.getEventByID(eventID);
                    modifyEvent.title = eventContent.val();
                    modifyEvent.start = startDate.val();
                    modifyEvent.end = isAllDay ? "" : endDate.val();
                    modifyEvent.allDay = isAllDay;
                    formDiv.dialog("close");
                },
                cancel: function () {
                    formDiv.dialog("close");
                }
            },
            close: function () {
                formDiv.remove();
                self.el.fullCalendar("refetchEvents");
            }
        });
        var buttonPanel = formDiv[0].nextElementSibling;
        var buttonSet = buttonPanel.firstElementChild;
        if (oper == "add") {       //新建的時候隐藏 修改 按钮
            $(buttonSet.childNodes[1]).hide();
        } else {         //修改的時候隐藏 新增 按钮
            var delButton = $("<button>"+YIUI.I18N.getString("ATTACHMENT_DELETE","删除")+"</button>").button().click(function () {  //添加刪除按鈕，並且实现点击事件
            	var determine = YIUI.I18N.getString("CURRENCY_OK","确定");
                var delConfirm = $("<div></div>").dialog({
                    title: YIUI.I18N.getString("CALENDAR_CONFIRMDEL","确定删除？"),
                    height: "auto",
                    width: "auto",
                    modal: true,
                    buttons: {
                        determine: function () {
                            var delEvent = self.getEventByID(eventID);
                            var index = self.events.indexOf(delEvent);
                            self.events.splice(index, 1);
                            formDiv.dialog("close");
                            delConfirm.dialog("close");
                        },
                        cancel: function () {
                            delConfirm.dialog("close");
                        }
                    },
                    close: function () {
                        delConfirm.remove();
                        self.el.fullCalendar("refetchEvents");
                    }
                });
            });
            var delDiv = $("<div style='float: left;width: auto;height: auto'></div>").append(delButton);
            buttonPanel.insertBefore(delDiv[0], buttonSet);
            $(buttonSet.childNodes[0]).hide();
        }
        return formDiv;
    },
    modifyEventDialog: function (event) {
        var dateFormat = event.allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm:ss";
        return this.editEventDialog("modify", $.fullCalendar.formatDate(event.start, dateFormat),
            $.fullCalendar.formatDate(event.end, dateFormat), event.allDay, event.title, event._id);
    },
    getEventByID: function (id) {
        for (var i = 0; i < this.events.length; i++) {
            var event = this.events[i];
            if (event._id == id) {
                return event;
            }
        }
        return null;
    }
});
YIUI.reg('calendar', YIUI.Control.Calendar);
