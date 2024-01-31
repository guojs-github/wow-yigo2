YIUI.DateFormat = (function () {

    var SHORT_FORMAT = "yyyy-MM-dd";
    var LONG_FORMAT = "yyyy-MM-dd HH:mm:ss";

    var getFormat = function (format,onlyDate) {
        if( !format ) {
           return onlyDate ? SHORT_FORMAT : LONG_FORMAT;
        }
        return format;
    };

    var Return = {
        format: function(date, format, onlyDate){
            if( !date ) {
                return "";
            }
            return date.Format(getFormat(format,onlyDate));
        }

    };
    return Return;
})();