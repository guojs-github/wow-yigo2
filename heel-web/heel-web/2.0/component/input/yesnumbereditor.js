/**
 * Number editor control.
 * 
 * 2023.8.30 added by guojs.
 */

(function () {
    function autoStrip(s, settings) {
        if (settings.aSign) {
            while (s.indexOf(settings.aSign) > -1) {
                s = s.replace(settings.aSign, '');
            }
        }

        s = s.replace(settings.skipFirstAutoStrip, '$1$2');
        s = s.replace(settings.skipLastAutoStrip, '$1');
        s = s.replace(settings.allowedAutoStrip, '');

        if (settings.altDec) {
            s = s.replace(settings.altDec, settings.aDec);
        }

        var m = s.match(settings.numRegAutoStrip);

        s = m ? [m[1], m[2], m[3]].join('') : '';

        return s;
    }

    function convertKeyToNumber(settings, key) {
        if (typeof(settings[key]) === 'string') {
            settings[key] *= 1;
        }
    }

    function autoCode($this, settings) {
        settings.oEvent = null;

        var vmax = settings.vMax.toString().split('.'), vmin = (!settings.vMin && settings.vMin !== 0)
            ? []
            : settings.vMin.toString().split('.');
        convertKeyToNumber(settings, 'vMax');
        convertKeyToNumber(settings, 'vMin');
        convertKeyToNumber(settings, 'mDec');

        settings.aNeg = settings.vMin < 0 ? '-' : '';
        vmax[0] = vmax[0].replace('-', '');
        vmin[0] = vmin[0].replace('-', '');
        settings.mInt = Math.max(vmax[0].length, vmin[0].length, 1);
        if (settings.mDec === null) {
            var vmaxLength = 0, vminLength = 0;
            if (vmax[1]) {
                vmaxLength = vmax[1].length;
            }
            if (vmin[1]) {
                vminLength = vmin[1].length;
            }
            settings.mDec = Math.max(vmaxLength, vminLength);
        }
        /** set alternative decimal separator key */
        if (settings.altDec === null && settings.mDec > 0) {
            if (settings.aDec === '.' && settings.aSep !== ',') {
                settings.altDec = ',';
            } else if (settings.aDec === ',' && settings.aSep !== '.') {
                settings.altDec = '.';
            }
        }
        /** cache regexps for autoStrip */
        var aNegReg = settings.aNeg ? '([-\\' + settings.aNeg + ']?)' : '(-?)';
        settings.aNegRegAutoStrip = aNegReg;
        settings.skipFirstAutoStrip = new RegExp(aNegReg + '[^-'
            + (settings.aNeg ? '\\' + settings.aNeg : '') + '\\'
            + settings.aDec + '\\d]' + '.*?(\\d|\\' + settings.aDec
            + '\\d)');
        settings.skipLastAutoStrip = new RegExp('(\\d\\' + settings.aDec + '?)[^\\' + settings.aDec + '\\d]\\D*$');

        var allowed = '-' + settings.aNum + '\\' + settings.aDec;
        settings.allowedAutoStrip = new RegExp('[^' + allowed + ']', 'gi');
        settings.numRegAutoStrip = new RegExp(aNegReg + '(?:\\' + settings.aDec
            + '?(\\d+\\' + settings.aDec + '\\d+)|(\\d*(?:\\'
            + settings.aDec + '\\d*)?))');
        return settings;
    }

//		function checkValue(value, settings) {
//			if (value) {
//				var checkSmall = +value;
//				if (checkSmall < 0.000001 && checkSmall > -1) {
//					value = +value;
//
//					if (value < 0.000001 && value > 0) {
//						value = (value + 10).toString();
//						value = value.substring(1);
//					}
//
//					if (value < 0 && value > -1) {
//						value = (value - 10).toString();
//						value = value.substring(2);
//					}
//					value = value.toString();
//
//				} else {
//					var parts = value.split('.');
//					if (parts[1] !== undefined) {
//						if (+parts[1] === 0) {
//							value = parts[0];
//						} else {
//							parts[1] = parts[1].replace(/0*$/, '');
//							value = parts.join('.');
//						}
//					}
//				}
//			}
//
//			return value;
//
//		}

    function presentNumber(s, aDec, aNeg) {
        if (aNeg && aNeg !== '-') {
            s = s.replace('-', aNeg);
        }

        if (aDec && aDec !== '.') {
            s = s.replace('.', aDec);
        }
        return s;
    }

    function autoCheck(s, settings) {
        s = autoStrip(s, settings);
        s = truncateDecimal(s, settings.aDec, settings.mDec);
        s = fixNumber(s, settings.aDec, settings.aNeg);
        var value = +s;

        if (value < settings.vMin || value > settings.vMax) {
        //    window.setTimeout(function () {
         //       YIUI.ViewException.throwException(YIUI.ViewException.Exceed_Value_Max_Accuracy);
        //    }, 0);
        }

        return value >= settings.vMin && value <= settings.vMax;
    }

    function truncateDecimal(s, aDec, mDec) {
        if (aDec && mDec) {
            var parts = s.split(aDec);

            if (parts[1] && parts[1].length > mDec) {
                if (mDec > 0) {
                    parts[1] = parts[1].substring(0, mDec);
                    s = parts.join(aDec);
                } else {
                    s = parts[0];
                }
            }
        }
        return s;

    }

    function fixNumber(s, aDec, aNeg) {
        if (aDec && aDec !== '.') {
            s = s.replace(aDec, '.');
        }

        if (aNeg && aNeg !== '-') {
            s = s.replace(aNeg, '-');
        }

        if (!s.match(/\d/)) {
            s += '0';
        }
        return s;

    }

    function autoRound(iv, settings) {
        /** value to string */
        iv = (iv === '') ? '0' : iv.toString();

        var ivRounded = '', i = 0, nSign = '';
        if (iv.charAt(0) === '-') {
            /** Checks if the iv (input Value)is a negative value */
            nSign = '-';
            iv = iv.replace('-', '');
            /** removes the negative sign will be added back later if required */
        }
        if (!iv.match(/^\d/)) {
            /** append a zero if first character is not a digit (then it is likely to be a dot)*/
            iv = '0' + iv;
        }
        if (nSign === '-' && +iv === 0) {
            /** determines if the value is zero - if zero no negative sign */
            nSign = '';
        }

        var dPos = iv.lastIndexOf('.'), /** virtual decimal position */
            vdPos = (dPos === -1) ? iv.length - 1 : dPos, /** checks decimal places to determine if rounding is required */
            cDec = (iv.length - 1) - vdPos;
        /** check if no rounding is required */

        //小数位数 小于等于 设定的 小数位数
        if (cDec <= settings.mDec) {
            ivRounded = iv;
            if (dPos === -1) {
                ivRounded += '.';
            }

            var zeros = '0';
            while (cDec < settings.mDec) {
                ivRounded += zeros;
                cDec += zeros.length;
            }

            //return (+ivRounded === 0) ? ivRounded : nSign + ivRounded;
        } else {
            //获取需要判断 四舍五入 的数值
            var rLength = dPos + settings.mDec, tRound = +iv
                .charAt(rLength + 1), ivArray = iv
                .substring(0, rLength + 1).split('');
            if ((tRound > 4 && settings.mRound === YIUI.NUMBEREDITOR_ROUNDINGMODE.HALF_UP)
                || (tRound > 0 && settings.mRound === YIUI.NUMBEREDITOR_ROUNDINGMODE.ROUND_UP)
                || (nSign === '' && tRound > 0 && settings.mRound === YIUI.NUMBEREDITOR_ROUNDINGMODE.ROUND_CEILING)
                || (nSign === '-' && tRound > 0 && settings.mRound === YIUI.NUMBEREDITOR_ROUNDINGMODE.ROUND_FLOOR)) {
                // var i = ivArray.length - 1;
                // ivArray[i] = +ivArray[i] + 1;

                for(i = (ivArray.length - 1); i >= 0; i -= 1){
                    if(ivArray[i] !== '.'){
                        ivArray[i] = +ivArray[i] + 1;
                        if(ivArray[i] < 10){
                            break;
                        }

                        if(i > 0){
                            ivArray[i] = '0';
                        }
                    }
                }

            }
            ivArray = ivArray.slice(0, rLength + 1);
            ivRounded = ivArray.join('');
        }

        return (+ivRounded === 0) ? ivRounded : nSign + ivRounded;
    }

    function autoGroup(iv, settings) {
        iv = autoStrip(iv, settings);
        var testNeg = iv.replace(',', '.');
        var empty = checkEmpty(iv, settings, true);

        if (empty !== null) {
            return empty;
        }

        var ivSplit = iv.split(settings.aDec);

        if (settings.altDec && ivSplit.length === 1) {
            ivSplit = iv.split(settings.altDec)
        }

        var s = ivSplit[0];

        if (settings.aSep && settings.useSeparator) {
            var digitalGroup = '';
            if (settings.dGroup === 2) {
                digitalGroup = /(\d)((\d)(\d{2}?)+)$/;
            } else if (settings.dGroup === 4) {
                digitalGroup = /(\d)((\d{4}?)+)$/;
            } else {
                digitalGroup = /(\d)((\d{3}?)+)$/;
            }
            while (digitalGroup.test(s)) {
                s = s.replace(digitalGroup, '$1' + settings.aSep + '$2');
            }
        }

        if (settings.mDec !== 0 && ivSplit.length > 1) {
            if (ivSplit[1].length > settings.mDec) {
                ivSplit[1] = ivSplit[1].substring(0, settings.mDec);
            }

            iv = s + settings.aDec + ivSplit[1];
        } else {
            iv = s;
        }

        if (settings.aSign) {
            var has_aNeg = iv.indexOf(settings.aNeg) !== -1;
            iv = iv.replace(settings.aNeg, '');
            iv = settings.pSign === 'p' ? settings.aSign + iv : iv
                + settings.aSign;
            if (has_aNeg) {
                iv = settings.aNeg + iv;
            }
        }

        return iv;

    }

    function checkEmpty(iv, settings, signOnEmpty) {
        if (iv === '' || iv === settings.aNeg) {
            // if(settings.vEmpty==='zero'){
            // return iv +'0';
            // }
            // if(settings.vEmpty === 'sign' || signOnEmpty){
            // return iv + settings.aSign;
            //		}
            return iv;
        }
        return null;

    }

    function getElementSelection(that) {
        var position = {};
        if (that.selectionStart === undefined) {
            that.focus();
            var select = document.selection.createRange();
            position.length = select.text.length;
            select.moveStart('character', -that.value.length);
            position.end = select.text.length;
            position.start = position.end - position.length;
        } else {
            position.start = that.selectionStart;
            position.end = that.selectionEnd;
            position.length = position.end - position.start;
        }
        return position;
    }

    function setElementSelection(that, start, end) {
        if (that.selectionStart === undefined) {
            that.focus();
            var r = that.createTextRange();
            r.collapse(true);
            r.moveEnd('character', end);
            r.moveStart('character', start);
            r.select();
        } else {
            that.selectionStart = start;
            that.selectionEnd = end;
        }
    }

    function NumberEditorHandler(that, settings) {
        this.settings = settings;
        this.that = that;
        this.$that = $(that);
        this.formatted = false;
        this.settingsClone = autoCode(this.$that, this.settings);
        this.value = that.value;
    }

    NumberEditorHandler.prototype = {
        init: function (e) {
            this.value = this.that.value;
            this.settingsClone = autoCode(this.$that, this.settings);
            this.ctrlKey = e.ctrlKey;
            this.cmdKey = e.metaKey;
            this.shiftKey = e.shiftKey;
            this.selection = getElementSelection(this.that);
            if (e.type === 'keydown' || e.type === 'keyup') {
                this.kdCode = e.keyCode;
            }
            this.which = e.which;
            this.processed = false;
            this.formatted = false;
        },

        setSelection: function (start, end, setReal) {
            start = Math.max(start, 0);
            end = Math.min(end, this.that.value.length);
            this.selection = {
                start: start,
                end: end,
                length: end - start
            };

            if (setReal === undefined || setReal) {
                setElementSelection(this.that, start, end);
            }

        },

        setPosition: function (pos, setReal) {
            this.setSelection(pos, pos, setReal);
        },

        getBeforeAfter: function () {
            var value = this.value, left = value.substring(0,
                this.selection.start), right = value.substring(
                this.selection.end, value.length);
            return [left, right];
        },

        getBeforeAfterStriped: function () {
            var parts = this.getBeforeAfter();
            parts[0] = autoStrip(parts[0], this.settingsClone);
            parts[1] = autoStrip(parts[1], this.settingsClone);
            return parts;
        },

        normalizeParts: function (left, right) {
            var settingsClone = this.settingsClone;
            right = autoStrip(right, settingsClone);

            left = autoStrip(left, settingsClone);

            var new_value = left + right;

            /** insert zero if has leading dot */
            if (settingsClone.aDec) {
                var m = new_value.match(new RegExp('^'
                    + settingsClone.aNegRegAutoStrip + '\\'
                    + settingsClone.aDec));
                if (m) {
                    left = left.replace(m[1], m[1] + '0');
                    new_value = left + right;
                }
            }

            return [left, right];
        },

//			signPosition : function() {
//				var settingsClone = this.settingsClone, aSign = settingsClone.aSign, that = this.that;
//				if (aSign) {
//					var aSignLen = aSign.length;
//					if (settingsClone.pSign === 'p') {
//						var hasNeg = settingsClone.aNeg && that.value
//								&& that.value.charAt(0) === settingsClone.aNeg;
//						return hasNeg ? [1, aSignLen + 1] : [0, aSignLen];
//					}
//					var valueLen = that.value.length;
//					return [valueLen - aSignLen, valueLen];
//				}
//				return [1000, -1];
//			},

//			expandSelectionOnSign : function(setReal) {
//				var sign_position = this.signPosition(), selection = this.selection;
//				if (selection.start < sign_position[1]
//						&& selection.end > sign_position[0]) {
//					/** if selection catches something except sign and catches only space from sign */
//					if ((selection.start < sign_position[0] || selection.end > sign_position[1])
//							&& this.value.substring(
//									Math.max(selection.start, sign_position[0]),
//									Math.min(selection.end, sign_position[1]))
//									.match(/^\s*$/)) {
//						/** then select without empty space */
//						if (selection.start < sign_position[0]) {
//							this.setSelection(selection.start, sign_position[0],
//									setReal);
//						} else {
//							this.setSelection(sign_position[1], selection.end,
//									setReal);
//						}
//					} else {
//						/** else select with whole sign */
//						this.setSelection(Math.min(selection.start,
//										sign_position[0]), Math.max(selection.end,
//										sign_position[1]), setReal);
//					}
//				}
//			},

        processKeypress: function () {
            var settingsClone = this.settingsClone, cCode = String
                .fromCharCode(this.which), parts = this
                .getBeforeAfterStriped(), left = parts[0], right = parts[1];
            /** start rules when the decimal character key is pressed */
            /** always use numeric pad dot to insert decimal separator */
            if (cCode === settingsClone.aDec
                || (settingsClone.altDec && cCode === settingsClone.altDec)
                || ((cCode === '.' || cCode === ',') && this.kdCode === 110)) {
                /** do not allow decimal character if no decimal part allowed */
                if (!settingsClone.mDec || !settingsClone.aDec) {
                    return true;
                }

                /** do not allow decimal character before aNeg character */
                if (settingsClone.aNeg
                    && right.indexOf(settingsClone.aNeg) > -1) {
                    return true;
                }

                /** do not allow decimal character if other decimal character present */
                if (left.indexOf(settingsClone.aDec) > -1) {
                    return true;
                }

                if (right.indexOf(settingsClone.aDec) > 0) {
                    return true;
                }

                if (right.indexOf(settingsClone.aDec) === 0) {
                    right = right.substr(1);
                }
                this.setValueParts(left + settingsClone.aDec, right);
                return true;
            }

            /**
             * start rule on negative sign & prevent minus if not allowed
             */
            if (cCode === '-' || cCode === '+') {
                if (!settingsClone.aNeg) {
                    return true;
                }
                /** caret is always after minus */
                if (left === '' && right.indexOf(settingsClone.aNeg) > -1) {
                    left = settingsClone.aNeg;
                    right = right.substring(1, right.length);
                }
                /** change sign of number, remove part if should */
                if (left.charAt(0) === settingsClone.aNeg) {
                    left = left.substring(1, left.length);
                } else {
                    left = (cCode === '-') ? settingsClone.aNeg + left : left;
                }
                this.setValueParts(left, right);
                return true;
            }

            /** digits */
            if (cCode >= '0' && cCode <= '9') {
                /** if try to insert digit before minus */
                if (settingsClone.aNeg && left === ''
                    && right.indexOf(settingsClone.aNeg) > -1) {
                    left = settingsClone.aNeg;
                    right = right.substring(1, right.length);
                }
                if (settingsClone.vMax <= 0
                    && settingsClone.vMin < settingsClone.vMax
                    && this.value.indexOf(settingsClone.aNeg) === -1
                    && cCode !== '0') {
                    left = settingsClone.aNeg + left;
                }
                this.setValueParts(left + cCode, right);
                return true;
            }
            /** prevent any other character */
            return true;
        },

        setValueParts: function (left, right) {
            var settingsClone = this.settingsClone,
                parts = this.normalizeParts(left, right),
                new_value = parts.join(''),
                position = parts[0].length;
            if (autoCheck(new_value, settingsClone)) {
                new_value = truncateDecimal(new_value, settingsClone.aDec,
                    settingsClone.mDec);
                if (position > new_value.length) {
                    position = new_value.length;
                }
                this.value = new_value;
                this.setPosition(position, false);
                return true;
            }
            return false;
        },

        processAllways: function () {
            var parts;
            if (this.kdCode === 8 || this.kdCode === 46) {
                if (!this.selection.length) {
                    parts = this.getBeforeAfterStriped();
                    if (this.kdCode === 8) {
                        parts[0] = parts[0].substring(0, parts[0].length - 1);
                    } else {
                        parts[1] = parts[1].substring(1, parts[1].length);
                    }

                    this.setValueParts(parts[0], parts[1]);
                }
                else {
//						this.expandSelectionOnSign(false);
                    parts = this.getBeforeAfterStriped();
                    this.setValueParts(parts[0], parts[1]);
                }
                return true;
            }
            return false;
        },

        checkPaste: function () {
            if (this.valuePartsBeforePaste !== undefined) {
                var parts = this.getBeforeAfter(),
                    oldParts = this.valuePartsBeforePaste;
                delete this.valuePartsBeforePaste;
                /** try to strip pasted value first */
                parts[0] = parts[0].substr(0, oldParts[0].length) + autoStrip(parts[0].substr(oldParts[0].length), this.settingsClone);
                if (!this.setValueParts(parts[0], parts[1])) {
                    this.value = oldParts.join('');
                    this.setPosition(oldParts[0].length, false);
                }
            }
        },

        skipAllways: function (e) {
            var kdCode = this.kdCode, which = this.which, ctrlKey = this.ctrlKey, cmdKey = this.cmdKey, shiftKey = this.shiftKey;

            if (((ctrlKey || cmdKey) && e.type === 'keyup' && this.valuePartsBeforePaste !== undefined) || (shiftKey && kdCode === 45)) {
                this.checkPaste();
                return false;
            }

            if ((kdCode >= 112 && kdCode <= 123)
                || (kdCode >= 91 && kdCode <= 93)
                || (kdCode >= 9 && kdCode <= 31)
                || (kdCode < 8 && (which === 0 || which === kdCode))
                || kdCode === 144 || kdCode === 145 || kdCode === 45) {
                return true;
            }

            if ((ctrlKey || cmdKey) && kdCode === 65) {
                return true;
            }

            if ((ctrlKey || cmdKey)
                && (kdCode === 67 || kdCode === 86 || kdCode === 88)) {
//					if (e.type === 'keydown') {
//						this.expandSelectionOnSign();
//					}

                if (kdCode === 86 || kdCode === 45) {
                    if (e.type === 'keydown' || e.type === 'keypress') {
                        if (this.valuePartsBeforePaste === undefined) {
                            this.valuePartsBeforePaste = this.getBeforeAfter();
                        }
                    } else {
                        this.checkPaste();
                    }
                }

                return e.type === 'keydown' || e.type === 'keypress'
                    || kdCode === 67;

            }

            if (ctrlKey || cmdKey) {
                return true;
            }

            if (kdCode === 37 || kdCode === 39) {
                var aSep = this.settingsClone.aSep, start = this.selection.start, value = this.that.value;

                if (e.type === 'keydown' && aSep && !this.shiftKey) {
                    if (kdCode === 37 && value.charAt(start - 2) === aSep) {
                        this.setPosition(start - 1);
                    } else if (kdCode === 39
                        && value.charAt(start + 1) === aSep) {
                        this.setPosition(start + 1);
                    }
                }
                return true;
            }

            if (kdCode >= 34 && kdCode <= 40) {
                return true;
            }

            return false;

        },

        formatQuick: function () {
            var settingsClone = this.settingsClone, parts = this
                .getBeforeAfterStriped(), leftLength = this.value;

            if ((settingsClone.aSep === '' || (settingsClone.aSep !== '' && leftLength
                .indexOf(settingsClone.aSep) === -1))
                && (settingsClone.aSign === '' || (settingsClone.aSign !== '' && leftLength
                .indexOf(settingsClone.aSign) === -1))) {
                var subParts = [], nSign = '';
                subParts = leftLength.split(settingsClone.aDec);
                if (subParts[0].indexOf('-') > -1) {
                    nSign = '-';
                    subParts[0] = subParts[0].replace('-', '');
                    parts[0] = parts[0].replace('-', '');
                }

                if (subParts[0].length > settingsClone.mInt
                    && parts[0].charAt(0) === '0') {
                    parts[0] = parts[0].slice(1);
                }
                parts[0] = nSign + parts[0];

            }

            var value = autoGroup(this.value, this.settingsClone),
                position = value.length;

            if (value) {
                var left_ar = parts[0].split(''), i = 0;

                for (i; i < left_ar.length; i += 1) {
                    if (!left_ar[i].match('\\d')) {
                        left_ar[i] = '\\' + left_ar[i];
                    }
                }

                var leftReg = new RegExp('^.*?' + left_ar.join('.*?'));

                var newLeft = value.match(leftReg);
                if (newLeft) {
                    position = newLeft[0].length;
                    if (((position === 0 && value.charAt(0) !== settingsClone.aNeg)
                        || (position === 1 && value.charAt(0) === settingsClone.aNeg))
                        && settingsClone.aSign && settingsClone.pSign === 'p') {
                        position = this.settingsClone.aSign.length
                            + (value.charAt(0) === '-' ? 1 : 0);
                    }
                } else if (settingsClone.aSign && settingsClone.pSign === 's') {
                    position -= settingsClone.aSign.length;

                }

            }

            this.that.value = value;
            this.setPosition(position);
            this.formatted = true;
        }
    };

    function getHandler($that, settings, update) {
        var data = $that.data('NumberEditor');
        if (!data) {
            data = {};
            $that.data('NumberEditor', data);
        }

        var handler = data.handler;
        if ((handler === undefined && settings) || update) {
            handler = new NumberEditorHandler($that.get(0), settings);
            data.handler = handler;
        }
        return handler;
    };

    YIUI.Yes_NumberEditor = function (options) {

        var Return = {

            /**
             * HTML默认创建为input
             * IE8-不支持input标签动态setAttribute
             */
            el: $('<span></span>'),

            selectOnFocus: true,

            // required: false,

            promptText: null,

            settings: {
                aNum: '0123456789',
                //组分割符
                aSep: ',',
                //组大小
                dGroup: '3',
                //小数点符号
                aDec: '.',
                //前缀或后缀符号
                aSign: '',
                //p是前缀 s是后缀
                pSign: '',
                //最大值
                vMax: '99999999999999.99',
                //最小值
                vMin: '-99999999999999.99',
                //小数位数
                mDec: '2',
                //精度
                mPre: '16',
                //四舍五入方式
                mRound: YIUI.NUMBEREDITOR_ROUNDINGMODE.HALF_UP,

                altDec: null
            },

            init: function () { // 初始化，界面？
                // 加入input控件
                $('<input type="text"/>').appendTo(this.el);

                // 加入清除按钮
                $('<div class="clear"><i class="fa-solid fa-xmark"></i></div>').appendTo(this.el);

                this.handler = getHandler(this.getInput(), this.settings);
                //this.setValue(this.value);
            },
		    
		    isEnable: function() {
		    	return true;
		    },

            /**
             * 返回值的时候
             */
            getValue: function () {
                var realV = null;
                if (this.value == null) {
                    realV = 0;
                } else {
                    realV = fixNumber(this.value, this.settings.aDec, this.settings.aNeg);
                }
                return new Decimal(realV);
            },

            getInput: function () {
                return $("input", this.el);
            },

            get_clear_button: function () { // 获取清除按钮
                return $('.clear', this.el);
            },

            getEl: function () {
                return this.el;
            },

            setInputValue: function(v){
                this.getInput().val(v);
                //this.value = v;
            },

            setValue: function (value) {
                this.value = value;
            },

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
                if ($.browser.isIE) {
                    this.getInput().css('line-height', (height - 3) + 'px');
                }
            },

            setWidth: function (width) {
                this.el.css('width', width + 'px');
                this.getInput().css('width', width + 'px');
            },

            /** 设置输入提示 */
            setPromptText: function (promptText) {
                this.promptText = promptText;
                this.getInput().placeholder(this.promptText);
            },

            autoStrip: function (s, settings) {
                return autoStrip(s, settings);
            },

            // getHandler: function ($that, settings, update) {
            //     return getHandler($that, settings, update);
            // },

            commitValue: $.noop,
            
            doFocusOut: $.noop,

            // setRequired: function (required) {
            //     this.required = required;
            //     if (required) {
            //         this.getEl().addClass('ui-required');
            //     } else {
            //         this.getEl().removeClass('ui-required');
            //     }
            // },

            finishInput: function () {
                var self = this,
                    $this = this.getInput(),
                    //handler = self.getHandler($this),
                    settingsClone = this.handler.settingsClone;
                var curValue = self.autoStrip($this[0].value, settingsClone);
                if (self.stripTrailingZeros) {
              	   self.commitValue(curValue);
                }
                if (!YIUI.TypeConvertor.toDecimal(curValue).equals(self.value)) {
                   // self.setValue(curValue);
                    self.commitValue(curValue);
                }
            },

            install: function () {
                var $this = this.getInput();
                var self = this;
                $this.on('keydown.numbereditor', function (e) {
                    if(!self.isEnable()) return false;
                    //var handler = getHandler($this);
                    var handler = self.handler;
                    if (handler.settings.aDec === handler.settings.aSep) {
                        $.error("error");
                        return this;
                    }

                    if (handler.that.readOnly) {
                        handler.processed = true;
                        return true;
                    }

                    handler.init(e);

                    handler.settings.oEvent = 'keydown';
                    if (handler.skipAllways(e)) {
                        handler.processed = true;
                        return true;
                    }

                    if (handler.processAllways()) {
                        handler.processed = true;
                        handler.formatQuick();
                        e.preventDefault();
                        return false;
                    }

                    handler.formatted = false;
                    return true;

                });

                $this.on('keypress.numbereditor', function (e) {
                    if(!self.isEnable()) return false;
                    // var handler = getHandler($this);
                    var handler = self.handler;
                    var processed = handler.processed;

                    handler.init(e);

                    handler.settings.oEvent = 'keypress';

                    if (handler.skipAllways(e)) {
                        return true;
                    }

                    if (processed) {
                        e.preventDefault();
                        return false;
                    }

                    if (handler.processAllways()
                        || handler.processKeypress()) {
                        handler.formatQuick();
                        e.preventDefault();
                        return false;
                    }

                    handler.formatted = false;
                });

                $this.on('keyup.numbereditor', function (e) {
                    if(!self.isEnable()) return false;
                   // var handler = getHandler($this);
                    var handler = self.handler;
                    handler.init(e);
                    handler.settings.oEvent = 'keyup';
                    var skip = handler.skipAllways(e);
                    handler.kdCode = 0;
                    delete handler.valuePartsBeforePaste;
                    if ($this[0].value === handler.settings.aSign) {
                        /** added to properly place the caret when only the currency is present */
                        if (handler.settings.pSign === 's') {
                            setElementSelection(this, 0, 0);
                        } else {
                            setElementSelection(this,
                                handler.settings.aSign.length,
                                handler.settings.aSign.length);
                        }
                    }
                    if (skip) {
                        return true;
                    }
                    if (this.value === '') {
                        return true;
                    }
//                    if (!handler.formatted) {
//                        handler.formatQuick();
//                    }
                });

                $this.on('focusin.numbereditor', function () {
                    if(!self.isEnable()) return false;
                    if (self.selectOnFocus) {
                        self.needSelectAll = true;
                    }

                   // var handler = getHandler($this);
                    var handler = self.handler;
                    handler.settingsClone.oEvent = 'focusin';

                    handler.inVal = $this.val();
                    var onempty = checkEmpty(handler.inVal,
                        handler.settingsClone, true);
                    if (onempty !== null) {
                        $this.val(onempty);
                        if (handler.settings.pSign === 's') {
                            setElementSelection(this, 0, 0);
                        } else {
                            setElementSelection(this,
                                handler.settings.aSign.length,
                                handler.settings.aSign.length);
                        }
                    }
                });

                $this.on('focusout.numbereditor', function () {
                    if(!self.isEnable()) return false;
                  //  var handler = getHandler($this),
                    var handler = self.handler,
                        settingsClone = handler.settingsClone,
                        value = $this.val(),
                        origValue = value;
                    handler.settingsClone.oEvent = 'focusout';

                    if (value !== '') {
                        value = autoStrip(value, settingsClone);
                        if (checkEmpty(value, settingsClone) === null
                            && autoCheck(value, settingsClone, $this[0])) {
                            value = fixNumber(value, settingsClone.aDec,
                                settingsClone.aNeg);
                            value = autoRound(value, settingsClone);
                            value = presentNumber(value, settingsClone.aDec,
                                settingsClone.aNeg);
                        } else {
                            value = '';
                        }
                    }
                    var groupedValue = checkEmpty(value, settingsClone, false);
                    if (groupedValue === null) {
                        groupedValue = autoGroup(value, settingsClone);
                    }
                    if (groupedValue !== origValue) {
                        $this.val(groupedValue);
                    }
                    if (groupedValue !== handler.inVal) {
                        $this.change();
                        delete handler.inVal;
                    }
//                    if (value == '' && self.showZero) {
//                    	$(this).val("0");
//                    }

                });


                $this.on('click', function (event) {
                    if(!self.isEnable()) return false;
                    if (self.needSelectAll) {
                        self.selectOnFocus && $this.select();
                        self.needSelectAll = false;
                    }
                });

                $this.on('focusout', function (event) {
                    if(!self.isEnable()) return false;
                    self.finishInput();
                    self.doFocusOut();
                });

                this.getInput().focus(function(event) { // 获得焦点
                    $this.select(); // 选中内容
                });

                this.get_clear_button().click(function(event) { // 点击清除按钮
                    console.log('click number editor clear button.');

                    self.getInput().val(null);
                    self.commitValue(null);
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