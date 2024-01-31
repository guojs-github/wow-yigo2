/**
 * Created by chenbinbin on 16-11-22.
 */

YIUI.Component.Gantt = YIUI.extend(YIUI.Component, {
    onRender : function(ct) {
        this.base(ct);

        var form = YIUI.FormStack.getForm(this.ofFormID);
        this.el.addClass("gantt");

        var ctx = new View.Context(form);
        $.gantt(this.el, ctx, YIUI.Form_OperationState.New == form.getOperationState());
    }
});
YIUI.reg("gantt", YIUI.Component.Gantt);
