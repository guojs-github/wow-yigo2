(function () {
    YIUI.Yes_Icon= function (options) {
        var Return = {
            el: $("<div></div>"),
            enable: true,
            init: function () {
                this._img = $("<img />").appendTo(this.el);
            },
            getEl: function () {
                return this.el;
            },
            setImagePath: function (path) {
                this._img.attr("src", path);
            },
            setEnable: function (enable) {
                this.enable = enable;
            },
            getImage: function () {
                return this._img;
            },

            setValue: function (value) {
                this.value = value;
                if( value ) {
                    this._img.removeClass("empty");
                } else {
                    this._img.addClass("empty");
                }
            },
        };
        Return = $.extend(Return, options);
        if (!options.isPortal) {
            Return.init();
        }
        return Return;
    }
})();