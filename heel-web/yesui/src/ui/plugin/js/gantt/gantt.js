/**
 * Created by chenbinbin on 16-11-16.
 */
(function ($) {
    var GTT = YIUI.GANTT = YIUI.GANTT || {};

    if (!$.loadSingleRes) {
        $.extend($, {
            loadSingleRes: function (path, fn, media, title){
                var el,i;
                var type = path.substr(path.lastIndexOf(".")+1);
                if (type=="js") {
                    var els=document.getElementsByTagName("script");
                    for(i=0;i<els.length;i++) {
                        if(els[i].src && els[i].src.indexOf(path)!=-1 || els[i].title==title) {
                            fn && fn();
                            return els[i];
                        }
                    }
                    el = document.createElement("script");
                    el.type="text/javascript";
                    el.src=path;
                    if(title) el.title = title;
                }
                else if(type=="css") {
                    var ls=document.getElementsByTagName("link");
                    for( i=0; i<ls.length; i++) {
                        if(ls[i].href && ls[i].href.indexOf(path)!=-1 || ls[i].title==title) {
                            fn && fn();
                            return ls[i];
                        }
                    }
                    el = document.createElement("link");
                    el.rel="stylesheet";
                    el.type="text/css";
                    el.href=path;
                    if (title) el.title=title;
                    if (media) el.media = media;
                    el.disabled = false;
                }
                else return;

                el.onload = el.onreadystatechange = function () {
                    if (!el.readyState || 'loaded' === el.readyState || 'complete' === el.readyState) {
                        console.log(path + ": loaded");
                        el.onload = el.onreadystatechange = null;
                        fn && fn();
                    }
                };

                var head = document.getElementsByTagName("head")[0];
                head.appendChild(el);
                return el;
            }
        });
    }

    if (!$.loadRes) {
        $.extend($, {
            loadRes: function(res, callback) {
                (function loadRecurse(count, callback) {
                    if (count == res.length) {
                        callback && callback();
                    } else {
                        if (res[count]) {
                            $.loadSingleRes(res[count].path, function () {
                                loadRecurse(++count, callback);
                            }, res[count].media);
                        }
                    }
                })(0, callback);
            }
        });

    }

    $.extend( $, {
        gantt: function($parent, ctx, isnew) {
            var oid = ctx.form.getOID();
            var expEval = ctx.form;
            var dataObjectKey = ctx.form.getDataObject().key;

            oid = isnew ? -1 : oid;
            var BASE_PATH = "yesui/ui/plugin/js/gantt/";
            function ganttPath(path, media) {
                return {
                    path:BASE_PATH + path,
                    media: media
                } ;
            }

            var res = [
                ganttPath("platform.css"),
                ganttPath("libs/dateField/jquery.dateField.css"),
                ganttPath("gantt.css"),
                ganttPath("ganttPrint.css", "print"),
                ganttPath("libs/jquery.svg.css"),

                //ganttPath("libs/jquery.min.js"),
                ganttPath("libs/jquery-ui.min.js"),
                ganttPath("libs/jquery.livequery.min.js"),
                ganttPath("libs/jquery.timers.js"),
                ganttPath("libs/platform.js"),
                ganttPath("libs/date.js"),
                ganttPath("libs/i18nJs.js"),
                ganttPath("libs/dateField/jquery.dateField.js"),
                ganttPath("libs/JST/jquery.JST.js"),
                ganttPath("libs/jquery.svg.min.js"),
                ganttPath("libs/jquery.svgdom.1.8.js"),
                ganttPath("ganttUtilities.js"),
                ganttPath("ganttTask.js"),
                ganttPath("ganttDrawerSVG.js"),
                ganttPath("ganttGridEditor.js"),
                ganttPath("ganttMaster.js")
            ];

            $.loadRes(res, function() {
                $.JST.loadDecorator("ASSIGNMENT_ROW", function(assigTr, taskAssig) {
                    var resEl = assigTr.find("[name=resourceId]");
                    for (var i in taskAssig.task.master.resources) {
                        var res = taskAssig.task.master.resources[i];
                        var opt = $("<option>");
                        opt.val(res.id).html(res.name);
                        if (taskAssig.assig.resourceId == res.id)
                            opt.attr("selected", "true");
                        resEl.append(opt);
                    }

                    var roleEl = assigTr.find("[name=roleId]");
                    for (var i in taskAssig.task.master.roles) {
                        var role = taskAssig.task.master.roles[i];
                        var optr = $("<option>");
                        optr.val(role.id).html(role.name);
                        if (taskAssig.assig.roleId == role.id)
                            optr.attr("selected", "true");
                        roleEl.append(optr);
                    }

                    if(taskAssig.task.master.canWrite && taskAssig.task.canWrite){
                        assigTr.find(".delAssig").click(function() {
                            var tr = $(this).closest("[assigId]").fadeOut(200, function() {
                                $(this).remove();
                            });
                        });
                    }
                });

                var ge;  //this is the hugly but very friendly global var for the gantt editor
                var $body = $parent;

                var $container = $("<div/>")
                $body.append($container);
                var $ganttTmpls = $("<div id='gantEditorTemplates' style='display:none;'>");
                $container.append($ganttTmpls);

                $ganttTmpls.load(BASE_PATH + "tmpl-cn.html", function() {
                    //load templates
                    $("#ganttemplates").loadTemplates();

                    // here starts gantt initialization
                    ge = new GanttMaster();
                    ge.resourceUrl = BASE_PATH + ge.resourceUrl;
                    var workSpace =$("<div id='workSpace' style='padding:0px; overflow-y:auto; overflow-x:hidden;border:1px solid #e5e5e5;position:relative;margin:0 5px'/>");
                    $container.append(workSpace);
                    var w = $(".gantt").width();
                    var h = $(".gantt").height()-60;
                    workSpace.css({width:w,height:h});
                    //workSpace.css({width:$(window).width() - 20,height:$(window).height() - 100});
                    ge.init(workSpace);

                    //workSpace.bind("clear.gantt",clearGantt());
                    workSpace.bind("save.gantt",function() { saveGanttOnServer(); } );
                    workSpace.bind("critical.gantt", function() { criticalGantt(); } );
                    workSpace.bind("print.gantt", function() { printGantt(); } );
                    workSpace.bind("editresources.gantt", function() { editResources(); } );


                    //inject some buttons (for this demo only)
                    /*var btnClear = $("<button class='button'>清除</button>");
                    btnClear.bind("click", function() {
                        clearGantt();
                    });
                    $(".ganttButtonBar div").append(btnClear);*/

                    var btnDelete = $("<button class='button'>删除</button>");
                    btnDelete.bind("click", function() {
                        deleteGantt();
                    });
                    $(".ganttButtonBar div").append(btnDelete);

                    /*
                    $(".ganttButtonBar div").append("<button onclick='clearGantt();' class='button'>clear</button>")
                        .append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
                        .append("<button onclick='getFile();' class='button'>export</button>"); */

                    $(".ganttButtonBar div").addClass('buttons');
                    //overwrite with localized ones
                    loadI18n();

                    //simulate a data load from a server.
                    loadGanttFromServer(oid);

                    //fill default Teamwork roles if any
                    if (!ge.roles || ge.roles.length == 0) {
                        setRoles();
                    }

                    //fill default Resources roles if any
                    if (!ge.resources || ge.resources.length == 0) {
                        setResource();
                    }


                    $(window).resize(function(){
                        var w = $(".gantt").width();
                        var h = $(".gantt").height();
                        workSpace.css({width:w - 1,height:h-60});
                        //workSpace.css({width:$(window).width() - 1,height:$(window).height() - workSpace.position().top});
                        workSpace.trigger("resize.gantt");
                    }).oneTime(150,"resize",function(){$(this).trigger("resize")});
                });


                function loadGanttFromServer(oid) {
                    var paras = {dataObjectKey: dataObjectKey, oid: oid};
                    var ret = Svr.SvrMgr.loadGanttData(paras);
                    ge.reset();

                    //var ret = JSON.parse(ret);
                    //actualiza data
                    /*if(ret.tasks.length > 0) {
                        var offset=new Date().getTime()-ret.tasks[0].start;
                        for (var i=0;i<ret.tasks.length;i++) {
                            ret.tasks[i].start=ret.tasks[i].start+offset;
                        }
                    }*/
                    ge.loadProject(ret);
                    //fill default Resources roles if any
                    if (!ge.roles || ge.roles.length == 0) {
                        setRoles();
                    }
                    ge.checkpoint(); //empty the undo stack
                }

                function saveGanttOnServer() {
                    if(!ge.canWrite)
                        return;

                    var doSave = function () {
                        var prj = ge.saveProject();
                        //delete prj.resources;
                        //delete prj.roles;
                        // var prof = new Profiler("saveServerSide");
                        // prof.reset();
                        var paras = {
                            dataObjectKey: dataObjectKey,
                            ganttdata: $.toJSON(prj)
                        };
                        var oid = Svr.SvrMgr.saveGanttData(paras);
                        loadGanttFromServer(oid);
                    }

                    if (!ge.ganttname) {
                        inputGanttName(doSave);
                       // ge.ganttname = "测试" + ge.oid;
                    } else {
                        doSave();
                    }


                };

            //-------------------------------------------  Create some demo data ------------------------------------------------------
                function setRoles() {
                    ge.roles = [
                        {
                            id:"tmp_1",
                            name:"项目管理者"
                        },
                        {
                            id:"tmp_2",
                            name:"执行人员"
                        },
                        {
                            id:"tmp_3",
                            name:"客户/其他相关人员"
                        }
                    ];
                }

                function setResource() {
                    //var res = [];
                    //for (var i = 1; i <= 10; i++) {
                    //    res.push({id:"tmp_" + i,name:"Resource " + i});
                    //}
                    //ge.resources = res;
                }

                function clearGantt() {
                    ge.reset();
                }

                function deleteGantt() {
                    expEval.eval("DeleteData();UpdateView();Close();", ctx);
                }

                function criticalGantt() {
                    ge.gantt.showCriticalPath=!ge.gantt.showCriticalPath;
                    ge.redraw();
                }

                function printGantt() {
                    /*
                    var old = document.body.innerHTML;
                    document.body.innerHTML = document.getElementById("workSpace").innerHTML;
                    window.print();
                    document.body.innerHTML = old;
                    return false;
                    */
                }

                function loadI18n() {
                    GanttMaster.messages = {
                        "CANNOT_WRITE":                  "CANNOT_WRITE",
                        "CHANGE_OUT_OF_SCOPE":"NO_RIGHTS_FOR_UPDATE_PARENTS_OUT_OF_EDITOR_SCOPE",
                        "START_IS_MILESTONE":"START_IS_MILESTONE",
                        "END_IS_MILESTONE":"END_IS_MILESTONE",
                        "TASK_HAS_CONSTRAINTS":"TASK_HAS_CONSTRAINTS",
                        "GANTT_ERROR_DEPENDS_ON_OPEN_TASK":"GANTT_ERROR_DEPENDS_ON_OPEN_TASK",
                        "GANTT_ERROR_DESCENDANT_OF_CLOSED_TASK":"GANTT_ERROR_DESCENDANT_OF_CLOSED_TASK",
                        "TASK_HAS_EXTERNAL_DEPS":"TASK_HAS_EXTERNAL_DEPS",
                        "GANTT_ERROR_LOADING_DATA_TASK_REMOVED":"GANTT_ERROR_LOADING_DATA_TASK_REMOVED",
                        "ERROR_SETTING_DATES":"ERROR_SETTING_DATES",
                        "CIRCULAR_REFERENCE":"CIRCULAR_REFERENCE",
                        "CANNOT_DEPENDS_ON_ANCESTORS":"CANNOT_DEPENDS_ON_ANCESTORS",
                        "CANNOT_DEPENDS_ON_DESCENDANTS":"CANNOT_DEPENDS_ON_DESCENDANTS",
                        "INVALID_DATE_FORMAT":"INVALID_DATE_FORMAT",
                        "TASK_MOVE_INCONSISTENT_LEVEL":"TASK_MOVE_INCONSISTENT_LEVEL",

                        "GANTT_QUARTER_SHORT":"trim.",
                        "GANTT_SEMESTER_SHORT":"sem."
                    };
                }

            //-------------------------------------------  Get project file as JSON (used for migrate project from gantt to Teamwork) ------------------------------------------------------
                function getFile() {
                    $("#gimBaPrj").val(JSON.stringify(ge.saveProject()));
                    $("#gimmeBack").submit();
                    $("#gimBaPrj").val("");

                    /*  var uriContent = "data:text/html;charset=utf-8," + encodeURIComponent(JSON.stringify(prj));
                     neww=window.open(uriContent,"dl");*/
                }

                function inputGanttName(callback) {
                    var nameEditor = $.JST.createFromTemplate({}, "NAME_EDITOR");
                    //bind save event
                    nameEditor.find("#nameSaveButton").click(function(){
                        var name = nameEditor.find("#name").val();
                        ge.ganttname= name;
                        callback();
                        GTT.closeBlackPopup();
                        ge.redraw();
                    });

                    var ndo = GTT.createBlackPage(400, 180).append(nameEditor);
                }

            //-------------------------------------------  Open a black popup for managing resources. This is only an axample of implementation (usually resources come from server) ------------------------------------------------------
                function editResources(){
                    //make resource editor
                    var resourceEditor = $.JST.createFromTemplate({}, "RESOURCE_EDITOR");
                    var resTbl=resourceEditor.find("#resourcesTable");

                    for (var i=0;i<ge.resources.length;i++){
                        var res=ge.resources[i];
                        resTbl.append($.JST.createFromTemplate(res, "RESOURCE_ROW"))
                    }

                    //bind add resource
                    resourceEditor.find("#addResource").click(function(){
                        resTbl.append($.JST.createFromTemplate({id:"new",name:"resource"}, "RESOURCE_ROW"))
                    });

                    //bind save event
                    resourceEditor.find("#resSaveButton").click(function(){
                        var newRes=[];
                        //find for deleted res
                        for (var i=0;i<ge.resources.length;i++){
                            var res=ge.resources[i];
                            var row = resourceEditor.find("[resId="+res.id+"]");
                            if (row.size()>0){
                                //if still there save it
                                var name = row.find("input[name]").val();
                                if (name && name!="")
                                    res.name=name;
                                newRes.push(res);
                            } else {
                                //remove assignments
                                for (var j=0;j<ge.tasks.length;j++){
                                    var task=ge.tasks[j];
                                    var newAss=[];
                                    for (var k=0;k<task.assigs.length;k++){
                                        var ass=task.assigs[k];
                                        if (ass.resourceId!=res.id)
                                            newAss.push(ass);
                                    }
                                    task.assigs=newAss;
                                }
                            }
                        }

                        //loop on new rows
                        resourceEditor.find("[resId=new]").each(function(){
                            var row = $(this);
                            var name = row.find("input[name]").val();
                            if (name && name!="") {
                                newRes.push (new Resource("tmp_"+ Math.random(), name));
                                //newRes.push (new Resource("tmp_"+new Date().getTime(),name));
                            }
                        });

                        ge.resources=newRes;

                        GTT.closeBlackPopup();
                        ge.redraw();
                    });
                    var ndo = GTT.createBlackPage(400, 500).append(resourceEditor);
                }
          });
        }
    });
})(jQuery);