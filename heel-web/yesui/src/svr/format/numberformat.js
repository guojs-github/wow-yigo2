/**
 * Created by 陈瑞 on 2007/5/25 use WebStorm.
 */
YIUI.NumberFormat = (function () {

    /**
     * tool function
     */
    var contains = function (arr,char){
        for(var i = 0;i < arr.length;i++){
            if(arr[i] == char){
                return true;
            }
        }
        return false;
    }

    /**
     * constructor
     */
    function NumberFormat(){

    }

    NumberFormat.SPECIAL_CHARS=["0",".","-",",","E","%","#","\u2030"];

    /**
     * apply the pattern
     * @param pattern
     */
    NumberFormat.prototype.applyPattern=function(pattern){
        if(pattern==undefined){
            pattern="";
        }
        for(var i=0;i<pattern.length;i++){
            if(!contains(NumberFormat.SPECIAL_CHARS,pattern.charAt(i))){
                throw new Error("Malformed pattern "+pattern);
            }
        }
        this.pattern=pattern;
    };

    /**
     * format the number
     * param number
     */
    NumberFormat.prototype.format=function(number){
        if(isNaN(number)){
            throw new Error("The argument must be a number");
        }
        var pattern=this.pattern;
        if(pattern==""){
            return number;
        }
        var strNum=new String(number);
        var numNum=parseFloat(number);
        var isNegative=false;
        if(numNum<0){
            isNegative=true;
        }
        if(isNegative){
            strNum=strNum.substring(1,strNum.length);
            numNum=-numNum;
        }
        var ePos=pattern.indexOf("E");
        var pPos=pattern.indexOf("%");
        if(ePos!=-1&&pPos!=-1){
            throw new Error("Malformed exponential pattern : E and % can not be existed at the same time");
        }
        if(ePos!=-1){
            if(ePos==pattern.length-1){
                throw new Error("Malformed exponential pattern "+this.pattern);
            }
            var beStr=pattern.substring(0,ePos);
            var aeStr=pattern.substring(ePos+1);
            var dPos=beStr.indexOf(".");
            var dPosOfNum=strNum.indexOf(".");
            if(dPos!=-1){
                if(dPosOfNum==-1){
                    dPosOfNum=strNum.length-1;
                }

                strNum = strNum.deleteCharAt(dPosOfNum);
                strNum = strNum.insert(dPos,".");

                var adStrLength=beStr.length-dPos;
                var snbFixed=new Number(parseFloat(strNum)).toFixed(adStrLength-1);
                var aeLabel=dPosOfNum-dPos;
                if(isNegative){
                    return "-"+snbFixed+"e"+(aeLabel);
                }else{
                    return snbFixed+"e"+(aeLabel);
                }
            }else{
                if(dPosOfNum==-1){
                    dPosOfNum=strNum.length-1;
                }

                strNum = strNum.deleteCharAt(dPosOfNum);
                strNum = strNum.insert(beStr.length,".");

                var adStrLength=beStr.length-beStr.length;
                var snbFixed=-1;
                if(adStrLength==0){
                    snbFixed=new Number(parseFloat(strNum)).toFixed();
                }else{
                    snbFixed=new Number(parseFloat(strNum)).toFixed(adStrLength-1);
                }
                var aeLabel=dPosOfNum-beStr.length;
                if(isNegative){
                    return "-"+snbFixed+"e"+(aeLabel);
                }else{
                    return snbFixed+"e"+(aeLabel);
                }
            }
        }
        if(pPos!=-1){
            if(pPos!=pattern.length-1){
                throw new Error("Malformed exponential pattern "+this.pattern);
            }
            pattern=pattern.substring(0,pattern.length-1);
            numNum=parseFloat(number)*100;
            strNum=new String(numNum);
            if(isNegative){
                strNum=strNum.substring(1,strNum.length);
                numNum=-numNum;
            }
        }
        var dPos=pattern.indexOf(".");
        var dPosOfNum=strNum.indexOf(".");
        var result="";
        if(dPos!=-1){
            if(dPosOfNum==-1){
                dPosOfNum=strNum.length-1;
            }
            var adStrLength=pattern.length-dPos;
            var snbFixed=new Number(parseFloat(strNum)).toFixed(adStrLength-1);
            if(isNegative){
                result="-"+snbFixed;
            }else{
                result=snbFixed;
            }
        }else{
            if(dPosOfNum==-1){
                dPosOfNum=strNum.length-1;
            }
            var snbFixed=new Number(parseFloat(strNum)).toFixed();
            if(isNegative){
                result="-"+snbFixed;
            }else{
                result=snbFixed;
            }
        }
        if(pPos!=-1){
            result+="%";
        }
        return result;
    };

    return NumberFormat;
})();