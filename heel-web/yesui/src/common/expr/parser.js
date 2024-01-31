var Expr = Expr || {};
(function () {
    Expr.rs = null;
    Expr.rules = function () {
        if (this.rs == null) {
            this.rs = new Expr.ParserRules();
        }
        return this.rs;
    };
    Expr.regCluster = function (map, c) {
        for (var p in c) {
            map.put(p, c[p]);
        }
    };
    Expr.eq = function (s1, s2) {
    	s1 = s1.toString().toLowerCase();
    	s2 = s2.toString().toLowerCase();
    	var v = s1.localeCompare(s2);
        return v == 0;
//        return s1.toString().toLowerCase() == s2.toString().toLowerCase();
    };
    Expr.ADD = 0;
    Expr.STRCAT = 1;
    Expr.SUB = 2;
    Expr.MUL = 3;
    Expr.DIV = 4;
    Expr.OR = 5;
    Expr.AND = 6;
    Expr.EQ = 7;
    Expr.ASSIGN = 8;
    Expr.NEQ = 9;
    Expr.GT = 10;
    Expr.GT_EQ = 11;
    Expr.LT = 12;
    Expr.LT_EQ = 13;
    Expr.FUN = 14;
    Expr.ID = 15;
    Expr.CONST = 16;
    Expr.LB = 17;
    Expr.RB = 18;
    Expr.COMMA = 19;
    Expr.DOLLAR = 20;
    Expr.IF = 21;
    Expr.ELSE = 22;
    Expr.WHILE = 23;
    Expr.VAR = 24;
    Expr.NOT = 25;
    Expr.SEMI = 26;
    Expr.L_BR = 27;
    Expr.R_BR = 28;
    Expr.RETURN = 29;
    Expr.BREAK = 30;
    Expr.LOOP = 31;
    Expr.RANGE = 32;
    Expr.SWITCH = 33;
    Expr.CASE = 34;
    Expr.COLON = 35;

    Expr.SL = 50;
    Expr.E = 51;
    Expr.IF_H = 52;
    Expr.IF_T = 53;
    Expr.FUN_H = 54;
    Expr.FUN_T = 55;
    Expr.PL = 56;
    Expr.SWITCH_S = 57;
    Expr.CASE_S = 58;
    Expr.CASE_SL = 59;

    Expr.MAX = 60;

    Expr.SELF = 0;
    Expr.PARENT = 1;

    Expr.T_INT = 0;
    Expr.T_NUM = 1;
    Expr.T_STR = 2;
    Expr.T_BOOL = 3;

    Expr.IIF = "iif";
    Expr.IIFS = "iifs";

    Expr.S_SELF = "self";
    Expr.S_PARENT = "parent";

    Expr.F_RETURN = 0;
    Expr.F_BREAK = 1;

    Expr.RefInt = function (v) {
        this.v = v;
    };

    Lang.impl(Expr.RefInt, {
        set: function (v) {
            this.v = v;
        },
        get: function () {
            return this.v;
        },
        inc: function () {
            ++this.v;
        },
        dec: function () {
            --this.v;
        }
    });

    Expr.RefBool = function (v) {
        this.v = v;
    };

    Lang.impl(Expr.RefBool, {
        set: function (v) {
            this.v = v;
        },
        get: function () {
            return this.v;
        }
    });

    Expr.Lexer = function (s) {
        this.s = s;
        this.len = s.length;
        this.li = null;
        this.lv = null;
        this.type = -1;
        this.start = -1;
        this.pos = 0;
        this.b_skip = false;
        this.c_skip = false;
        this.obj = -1;
        this.err = -1;
        this.lastID = -1;
    };

    Lang.impl(Expr.Lexer, {
        skipB: function (c) {
            var r = c;
            this.b_skip = false;
            while (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
                this.b_skip = true;
                if (this.pos < this.len) {
                    c = this.s.charAt(this.pos);
                } else {
                    this.err = -1;
                    return r;
                }
                r = c;
                ++this.pos;
                ++this.start;
            }
            return r;
        },
        skipC: function (c) {
        	var r = c;
            this.c_skip = false;
            if (this.pos < this.len) {
                var oldPos = this.pos;
                var oldStart = this.start;
                var found = false;
                if (c == '/') {
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        ++this.pos;
                        ++this.start;
                        if (c == '/') {
                            if (this.pos < this.len) {
                                c = this.s.charAt(this.pos);
                                ++this.pos;
                                ++this.start;
                                while (c != '\n' && this.pos < this.len) {
                                    if (this.pos < this.len) {
                                        c = this.s.charAt(this.pos);
                                        ++this.pos;
                                        ++this.start;
                                    }
                                }
                                if (this.pos < this.len) {
                                    c = this.s.charAt(this.pos);
                                    ++this.pos;
                                    ++this.start;
                                    r = c;
                                } else {
                                	r = '$';
                                }
                                
                                found = true;
                            }
                        } else if (c == '*') {
                            if (this.pos < this.len) {
                                c = this.s.charAt(this.pos);
                                ++this.pos;
                                ++this.start;
                                
                                while ( true ) {
                                	if ( c == '*' ) {
                                		if ( this.pos < this.len && this.s.charAt(this.pos) == '/' ) {
                                			++this.pos;
                                			++this.start;
                                			found = true;
                                			break;
                                		}
                                	}
                                	if ( this.pos < this.len ) {
                                		c = this.s.charAt(this.pos);
                                		++this.pos;
                                		++this.start;
                                	} else {
                                		break;
                                	}
                                }
                                
                                if ( found ) {
                                	if ( this.pos < this.len ) {
                                		c = this.s.charAt(this.pos);
                                		++this.pos;
                                		++this.start;
                                		r = c;
                                	} else {
                                		r = '$';
                                	}
                                }
                            }
                        }
                    }
                }
                if (!found) {
                    this.pos = oldPos;
                    this.start = oldStart;
                } else {
                    this.c_skip = true;
                }
            }
            return r;
        },
        lookSemi: function () {
            var id = 26;
            var oldPos = this.pos;
            var c = ' ';
            if (this.pos < this.len) {
                c = this.s.charAt(this.pos);
                ++this.pos;

                do {
                    c = this.skipB(c);
                    if (this.err == -1) {
                        return -1;
                    }
                    c = this.skipC(c);
                    c = this.skipB(c);
                    if (this.err == -1) {
                        return -1;
                    }
                } while (this.b_skip || this.c_skip);

                if (c == '}') {
                    id = 28;
                    this.li = "}";
                    this.lv = "}";
                    return id;
                } else {
                    this.pos = oldPos;
                }
            } else {
                id = -1;
            }
            return id;
        },
        lookahead: function (ahc) {
            var oldPos = this.pos;
            var c = ' ';
            if (this.pos < this.len) {
                c = this.s.charAt(this.pos);
                ++this.pos;

                do {
                    c = this.skipB(c);
                    if (this.err == -1) {
                        return false;
                    }
                    c = this.skipC(c);
                    c = this.skipB(c);
                    if (this.err == -1) {
                        return false;
                    }
                } while (this.b_skip || this.c_skip);

                if (c == ahc) {
                    this.pos = oldPos;
                    return true;
                } else {
                    this.pos = oldPos;
                }
            }
            this.pos = oldPos;
            return false;
        },
        neg: function () {
            return (this.lastID === -1 || (this.lastID >= 0 && this.lastID <= 13)
                || this.lastID === 17 || this.lastID === 19);
        },
        resolveConst: function (t) {
            if (Expr.eq(t.toLowerCase(), "true")) {
                this.lv = "true";
                this.type = Expr.T_BOOL;
                return 16;
            } else if (Expr.eq(t.toLowerCase(), "false")) {
                this.lv = "false";
                this.type = Expr.T_BOOL;
                return 16;
            }
            return -1;
        },
        resolveID: function (t) {
            var idx = t.indexOf('.');

            if (idx > 0) {
                var first = t.substring(0, idx);
                var second = t.substring(idx + 1);
                t = second;
                this.obj = first;
                this.lv = second;
            } else {
                this.obj = null;
                this.lv = t;
            }

            var id = -1;
            if (Expr.eq(t, "if")) {
                id = 21;
            } else if (Expr.eq(t, "else")) {
                id = 22;
            } else if (Expr.eq(t, "while")) {
                id = 23;
            } else if (Expr.eq(t, "var")) {
                id = 24;
            } else if (Expr.eq(t, "return")) {
                id = 29;
            } else if (Expr.eq(t, "break")) {
                id = 30;
            } else if (Expr.eq(t, "loop")) {
                id = 31;
            } else if (Expr.eq(t, "switch")) {
                id = 33;
            } else if (Expr.eq(t, "case")) {
                id = 34;
            }

            return id;
        },
        next: function (slAsString) {
            this.err = 0;
            this.obj = null;
            var oldPos = this.pos;
            var id = -1;
            var c;
            this.start = this.pos;

            if (this.pos >= this.len)
                return -1;

            c = this.s.charAt(this.pos);
            ++this.pos;

            do {
                c = this.skipB(c);
                if (this.err == -1) {
                    return -1;
                }
                c = this.skipC(c);
                c = this.skipB(c);
                if (this.err == -1) {
                    return -1;
                }
            } while (this.b_skip || this.c_skip);

            var cnt = 1;
            switch (c) {
                case '+':
                    id = 0;
                    this.li = "+";
                    this.lv = "+";
                    break;
                case '-':
                    if (this.neg()) {
                        var tmpC = ' ';
                        if (this.pos < this.len) {
                            tmpC = this.s.charAt(this.pos);
                        }
                        if (tmpC >= '0' && tmpC <= '9') {
                            var isInt = true;
                            if (this.pos < this.len) {
                                c = this.s.charAt(this.pos);
                            }
                            while ((c >= '0' && c <= '9') || c == '.') {
                                if (c == '.')
                                    isInt = false;
                                ++cnt;
                                ++this.pos;
                                if (this.pos >= this.len) {
                                    break;
                                }
                                c = this.s.charAt(this.pos);
                            }

                            id = 16;
                            this.li = "const";
                            this.lv = this.s.substring(this.start, this.start + cnt);
                            if (isInt)
                                if (this.lv.length > 10) {
                                    this.type = Expr.T_NUM;
                                } else {
                                    this.type = Expr.T_INT;
                                }
                            else
                                this.type = Expr.T_NUM;
                        } else {
                            id = 2;
                            this.li = "-";
                            this.lv = "-";
                        }
                    } else {
                        id = 2;
                        this.li = "-";
                        this.lv = "-";
                    }

                    break;
                case '*':
                    id = 3;
                    this.li = "*";
                    this.lv = "*";
                    break;
                case '/':
                    id = 4;
                    this.li = "/";
                    this.lv = "/";
                    break;
                case '(':
                    id = 17;
                    this.li = "(";
                    this.lv = "(";
                    break;
                case '{':
                    if (slAsString) {
                        var deep = 1;
                        do {
                            if (this.pos < this.len) {
                                c = this.s.charAt(this.pos);
                                if (c == '{') {
                                    ++deep;
                                } else if (c == '}') {
                                    --deep;
                                }
                                ++this.pos;
                                ++cnt;
                            } else {
                                this.err = 1;
                                return -1;
                            }
                        } while (c != '}' || deep != 0);

                        id = 16;
                        this.type = Expr.T_STR;
                        this.li = "const";
                        this.lv = this.s.substring(this.start + 1, this.start + cnt - 1);
                    } else {
                        id = 27;
                        this.li = "{";
                        this.lv = "{";
                    }
                    break;
                case ')':
                    id = 18;
                    this.li = ")";
                    this.lv = ")";
                    break;
                case '}':
                    id = 28;
                    this.li = "}";
                    this.lv = "}";
                    break;
                case ',':
                    id = 19;
                    this.li = ",";
                    this.lv = ",";
                    break;
                case ';':
                    id = 26;
                    this.li = ";";
                    this.lv = ";";
                    id = this.lookSemi();
                    break;
                case '!':
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        if (c == '=') {
                            id = 9;
                            this.li = "<>";
                            this.lv = "<>";
                            ++this.pos;
                        } else {
                            id = 25;
                            this.li = "!";
                            this.lv = "!";
                        }
                    } else {
                        id = 25;
                        this.li = "!";
                        this.lv = "!";
                    }
                    break;
                case '=':
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        if (c == '=') {
                            id = 7;
                            this.li = "==";
                            this.lv = "==";
                            ++this.pos;
                        } else {
                            id = 8;
                            this.li = "=";
                            this.lv = "=";
                        }
                    } else {
                        id = 8;
                        this.li = "=";
                        this.lv = "=";
                    }
                    break;
                case '&':
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        if (c == '&') {
                            id = 6;
                            this.li = "&&";
                            this.lv = "&&";
                            ++this.pos;
                        } else {
                            id = 1;
                            this.li = "&";
                            this.lv = "&";
                        }
                    } else {
                        id = 1;
                        this.li = "&";
                        this.lv = "&";
                    }
                    break;
                case '|':
                    id = -1;
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        if (c == '|') {
                            id = 5;
                            this.li = "||";
                            this.lv = "||";
                            ++this.pos;
                        }
                    }
                    break;
                case '>':
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        if (c == '=') {
                            id = 11;
                            this.li = ">=";
                            this.lv = ">=";
                            ++this.pos;
                        } else {
                            id = 10;
                            this.li = ">";
                            this.lv = ">";
                        }
                    } else {
                        id = 10;
                        this.li = ">";
                        this.lv = ">";
                    }
                    break;
                case '<':
                    if (this.pos < this.len) {
                        c = this.s.charAt(this.pos);
                        if (c == '=') {
                            id = 13;
                            this.li = "<=";
                            this.lv = "<=";
                            ++this.pos;
                        } else if (c == '>') {
                            id = 9;
                            this.li = "<>";
                            this.lv = "<>";
                            ++this.pos;
                        } else {
                            id = 12;
                            this.li = "<";
                            this.lv = "<";
                        }
                    } else {
                        id = 12;
                        this.li = "<";
                        this.lv = "<";
                    }
                    break;
                case '\'':
                    do {
                        if (this.pos < this.len) {
                            c = this.s.charAt(this.pos);
                            ++this.pos;
                            ++cnt;
                        } else {
                            this.err = 1;
                            return -1;
                        }
                    } while (c != '\'');

                    id = 16;
                    this.li = "const";
                    this.type = Expr.T_STR;
                    this.lv = this.s.substring(this.start + 1, this.start + cnt - 1);
                    break;
                case '"':
                    do {
                        if (this.pos < this.len) {
                            c = this.s.charAt(this.pos);
                            ++this.pos;
                            ++cnt;
                        } else {
                            this.err = 1;
                            return -1;
                        }
                    } while (c != '"');

                    id = 16;
                    this.type = Expr.T_STR;
                    this.li = "const";
                    this.lv = this.s.substring(this.start + 1, this.start + cnt - 1);
                    break;
                case ':':
                    id = 35;
                    this.li = ":";
                    this.lv = ":";
                    break;
                default:
                    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {
                        var hasColon = false;
                        if (this.pos < this.len) {
                            c = this.s.charAt(this.pos);
                            while ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '.'
                                || c == '_' || c == ':') {
                                if (c == ':') {
                                    hasColon = true;
                                }
                                ++cnt;
                                ++this.pos;
                                if (this.pos >= this.len) {
                                    break;
                                }
                                c = this.s.charAt(this.pos);
                            }
                        }

                        if (hasColon) {
                            id = 32;
                            this.li = "range";
                            this.lv = this.s.substring(this.start, this.start + cnt);
                        } else {
                            id = 15;
                            this.li = "id";
                            this.lv = this.s.substring(this.start, this.start + cnt);
                            var nID = -1;
                            nID = this.resolveConst(this.lv);
                            if (nID != -1) {
                                id = nID;
                                this.li = "const";
                            } else {
                                nID = this.resolveID(this.lv);
                                if (nID != -1) {
                                    id = nID;
                                    this.li = this.lv;
                                } else {
                                    if (this.lookahead('(')) {
                                        id = 14;
                                        this.li = "fun";
                                    }
                                }
                            }
                        }
                    } else if (c >= '0' && c <= '9') {
                        var isInteger = true;
                        if (this.pos < this.len) {
                            c = this.s.charAt(this.pos);
                            while ((c >= '0' && c <= '9') || c == '.') {
                                if (c == '.')
                                    isInteger = false;
                                ++cnt;
                                ++this.pos;
                                if (this.pos >= this.len) {
                                    break;
                                }
                                c = this.s.charAt(this.pos);
                            }
                        }

                        id = 16;
                        if (isInteger) {
                            this.type = Expr.T_INT;
                        } else {
                            this.type = Expr.T_NUM;
                        }
                        this.li = "const";
                        this.lv = this.s.substring(this.start, this.start + cnt);
                    }
                    break;
            }
            // 如果上次的符号是}，那么如果符号不是(-1)、(;)、(else)、(})，则需要补充(;)，此时需要回退输出缓冲区
            if (this.lastID == Expr.R_BR) {
                if (id != -1 && id != Expr.SEMI && id != Expr.ELSE && id != Expr.R_BR) {
                    id = Expr.SEMI;
                    this.li = ";";
                    this.lv = ";";
                    this.pos = oldPos;
                }
            }

            this.lastID = id;
            return id;
        },
        getLexID: function () {
            return this.li;
        },
        getLexValue: function () {
            return this.lv;
        },
        getType: function () {
            return this.type;
        },
        getErr: function () {
            return this.err;
        },
        getObj: function () {
            return this.obj;
        }
    });

    Expr.Factor = function (id, name, ter) {
        this.id = id;
        this.name = name;
        this.ter = ter;
    };

    Lang.impl(Expr.Factor, {
        get: function () {
            return this.id;
        },
        isTer: function () {
            return this.ter;
        },
        getName: function () {
            return this.name;
        }
    });

    Expr.Lookup = function (fid) {
        this.fid = fid;
        this.inMap = null;
        this.exID = -1;
        this.exRule = null;
    };

    Lang.impl(Expr.Lookup, {
        getIn: function (ffID) {
            return this.inMap == null ? null : this.inMap[ffID];
        },
        addIn: function (ffID, r) {
            this.inMap = this.inMap || new Array(Expr.MAX);
            this.inMap[ffID] = r;
        },
        getEx: function (ffID) {
            if (this.exID == -1) {
                return null;
            }
            return this.exID == ffID ? null : this.exRule;
        },
        addEx: function (ffID, r) {
            this.exID = ffID;
            this.exRule = r;
        }
    });

    Expr.Rule = function (idx, l, rs, closeRule) {
        this.idx = idx;
        this.l = l;
        this.rs = rs;
        this.closeRule = closeRule;
        this.foMap = null;
        this.flag = 0;
        this.slAsString = true;
    };

    Lang.impl(Expr.Rule, {
        index: function () {
            return this.idx;
        },
        left: function () {
            return this.l;
        },
        right: function () {
            return this.rs;
        },
        rightAt: function (idx) {
            return this.rs[idx];
        },
        rightLen: function () {
            return this.rs.length;
        },
        isClose: function () {
            return this.closeRule;
        },
        setFlag: function (flag) {
            this.flag = flag;
        },
        getFlag: function () {
            return this.flag;
        },
        setSLAsString: function (slAsString) {
            this.slAsString = slAsString;
        },
        isSLAsString: function () {
            return this.slAsString;
        }
    });

    Expr.ParserRules = function () {
        this.fMap = new Array(Expr.MAX);
        this.rs = new Array(
            // SL -> E
            this.RULE(0, true, true, this.SL, [this.E]),
            // SL -> E ; SL
            this.RULE(1, false, true, this.SL, [this.E, this.SEMI, this.SL]),
            // E -> E + E
            this.RULE(2, false, true, this.E, [this.E, this.ADD, this.E]),
            // E -> E - E
            this.RULE(3, false, true, this.E, [this.E, this.SUB, this.E]),
            // E -> E * E
            this.RULE(4, false, true, this.E, [this.E, this.MUL, this.E]),
            // E -> E / E
            this.RULE(5, false, true, this.E, [this.E, this.DIV, this.E]),
            // E -> E & E
            this.RULE(6, false, true, this.E, [this.E, this.STRCAT, this.E]),
            // E -> ( E )
            this.RULE(7, false, true, this.E, [this.LB, this.E, this.RB]),
            // E -> ! E
            this.RULE(8, false, true, this.E, [this.NOT, this.E]),
            // E -> E || E
            this.RULE(9, false, true, this.E, [this.E, this.OR, this.E]),
            // E -> E && E
            this.RULE(10, false, true, this.E, [this.E, this.AND, this.E]),
            // E -> E == E
            this.RULE(11, false, true, this.E, [this.E, this.EQ, this.E]),
            // E -> E <> E
            this.RULE(12, false, true, this.E, [this.E, this.NEQ, this.E]),
            // E -> E > E
            this.RULE(13, false, true, this.E, [this.E, this.GT, this.E]),
            // E -> E >= E
            this.RULE(14, false, true, this.E, [this.E, this.GT_EQ, this.E]),
            // E -> E < E
            this.RULE(15, false, true, this.E, [this.E, this.LT, this.E]),
            // E -> E <= E
            this.RULE(16, false, true, this.E, [this.E, this.LT_EQ, this.E]),
            // E -> const
            this.RULE(17, false, true, this.E, [this.CONST]),
            // E -> id
            this.RULE(18, false, true, this.E, [this.ID]),
            // E -> FUNC_HEAD FUNC_TAIL
            this.RULE(19, false, true, this.E, [this.FUN_H, this.FUN_T]),
            // FUNC_HEAD -> function (
            this.RULE(20, false, true, this.FUN_H, [this.FUN, this.LB]),
            // FUNC_TAIL -> )
            this.RULE(21, false, true, this.FUN_T, [this.RB]),
            // FUNC_TAIL -> PL )
            this.RULE(22, false, true, this.FUN_T, [this.PL, this.RB]),
            // PL -> E
            this.RULE(23, true, true, this.PL, [this.E]),
            // PL -> E , PL
            this.RULE(24, false, true, this.PL, [this.E, this.COMMA, this.PL]),
            // E -> var id = E
            this.RULE(25, false, true, this.E, [this.VAR, this.ID, this.ASSIGN, this.E]),
            // E -> IF_HEAD
            this.RULE(26, false, true, this.E, [this.IF_HEAD]),
            // E -> IF_HEAD IF_TAIL
            this.RULE(27, false, true, this.E, [this.IF_HEAD, this.IF_TAIL]),
            // IF_HEAD -> if ( E ) { SL }
            this.RULE(28, false, false, this.IF_HEAD, [this.IF, this.LB, this.E, this.RB, this.L_BRACE, this.SL, this.R_BRACE]),
            // IF_TAIL -> else { SL }
            this.RULE(29, false, false, this.IF_TAIL, [this.ELSE, this.L_BRACE, this.SL, this.R_BRACE]),
            // E -> while ( E ) { SL }
            this.RULE(30, false, false, this.E, [this.WHILE, this.LB, this.E, this.RB, this.L_BRACE, this.SL, this.R_BRACE]),
            // E -> E = E
            this.RULE(31, false, true, this.E, [this.E, this.ASSIGN, this.E]),
            // E -> return E
            this.RULE(32, false, true, this.E, [this.RETURN, this.E]),
            // E -> break
            this.RULE(33, false, true, this.E, [this.BREAK]),
            // E -> loop E ( E ) { SL }
            this.RULE(34, false, false, this.E, [this.LOOP, this.E, this.LB, this.E, this.RB, this.L_BRACE, this.SL, this.R_BRACE]),
            // E -> RANGE
            this.RULE(35, false, true, this.E, [this.RANGE]),
            // E -> switch ( E ) { CASE_SL }
            this.RULE(36, false, false, this.E, [this.SWITCH, this.LB, this.E, this.RB, this.L_BRACE, this.CASE_SL, this.R_BRACE]),
            // CASE_SL -> CASE_S
            this.RULE(37, false, true, this.CASE_SL, [this.CASE_S]),
            // CASE_SL -> CASE_S ; CASE_SL
            this.RULE(38, false, true, this.CASE_SL, [this.CASE_S, this.SEMI, this.CASE_SL]),
            // CASE_S -> case E : { SL }
            this.RULE(39, false, false, this.CASE_S, [this.CASE, this.E, this.COLON, this.L_BRACE, this.SL, this.R_BRACE])
        );
    };

    Lang.impl(Expr.ParserRules, {
        first: function (id) {
            return this.fMap[id];
        },
        at: function (idx) {
            return this.rs[idx];
        },
        RULE: function (idx, closeRule, slAsString, l, rs) {
            var r = new Expr.Rule(idx, l, rs, closeRule);
            r.setSLAsString(slAsString);
            var len = rs.length;
            for (var i = 0; i < len; ++i) {
                var rrf = rs[i];
                if (i == 0 && rrf.isTer()) {
                    this.fMap[rrf.get()] = r;
                }
            }
            return r;
        },
        SL: new Expr.Factor(Expr.SL, "SL", false),
        E: new Expr.Factor(Expr.E, "E", false),
        IF_HEAD: new Expr.Factor(Expr.IF_H, "IF_HEAD", false),
        IF_TAIL: new Expr.Factor(Expr.IF_T, "IF_TAIL", false),
        FUN_H: new Expr.Factor(Expr.FUN_H, "FUNC_HEAD", false),
        FUN_T: new Expr.Factor(Expr.FUN_T, "FUNC_TAIL", false),
        PL: new Expr.Factor(Expr.PL, "PL", false),
        ADD: new Expr.Factor(0, "+", true),
        STRCAT: new Expr.Factor(1, "&", true),
        SUB: new Expr.Factor(2, "-", true),
        MUL: new Expr.Factor(3, "*", true),
        DIV: new Expr.Factor(4, "/", true),
        OR: new Expr.Factor(5, "||", true),
        AND: new Expr.Factor(6, "&&", true),
        EQ: new Expr.Factor(7, "==", true),
        ASSIGN: new Expr.Factor(8, "=", true),
        NEQ: new Expr.Factor(9, "<>", true),
        GT: new Expr.Factor(10, ">", true),
        GT_EQ: new Expr.Factor(11, ">=", true),
        LT: new Expr.Factor(12, "<", true),
        LT_EQ: new Expr.Factor(13, "<=", true),
        FUN: new Expr.Factor(14, "fun", true),
        ID: new Expr.Factor(15, "id", true),
        CONST: new Expr.Factor(16, "const", true),
        LB: new Expr.Factor(17, "(", true),
        RB: new Expr.Factor(18, ")", true),
        COMMA: new Expr.Factor(19, ",", true),
        IF: new Expr.Factor(21, "if", true),
        ELSE: new Expr.Factor(22, "else", true),
        WHILE: new Expr.Factor(23, "while", true),
        VAR: new Expr.Factor(24, "var", true),
        NOT: new Expr.Factor(25, "!", true),
        SEMI: new Expr.Factor(26, ";", true),
        L_BRACE: new Expr.Factor(27, "{", true),
        R_BRACE: new Expr.Factor(28, "}", true),
        RETURN: new Expr.Factor(29, "return", true),
        BREAK: new Expr.Factor(30, "break", true),
        LOOP: new Expr.Factor(31, "loop", true),
        RANGE: new Expr.Factor(32, "range", true),
        SWITCH: new Expr.Factor(33, "switch", true),
        CASE: new Expr.Factor(34, "case", true),
        COLON: new Expr.Factor(35, ":", true),
        CASE_S: new Expr.Factor(58, "CASE_S", false),
        CASE_SL: new Expr.Factor(59, "CASE_SL", false)
    });

    Expr.Heap = function () {
        this.varMap = new HashMap();
    };

    Lang.impl(Expr.Heap, {
        put: function (name, value) {
            this.varMap.put(name, value);
        },
        get: function (name) {
            return this.varMap.get(name);
        },
        contains: function (name) {
            return this.varMap.containsKey(name);
        }
    });

    Expr.Scope = function (parent) {
        this.parent = parent;
        this.paras = null;
        this.heap = new Expr.Heap();
    };

    Lang.impl(Expr.Scope, {
        getHeap: function () {
            return this.heap;
        },
        getParent: function () {
            return this.parent;
        },
        addPara: function (key, value) {
            if (this.paras == null) {
                this.paras = new HashMap();
            }
            this.paras.put(key, value);
        },
        getPara: function (key) {
            return this.paras != null ? this.paras.get(key) : null;
        }
    });

    Expr.Item = function (f, r) {
        this.f = f;
        this.r = r;
        this.cl = null;
        this.obj = null;
        this.lv = null;
        this.value = null;
        this.ctrl = false;
    };

    Lang.impl(Expr.Item, {
        rule: function () {
            return this.r;
        },
        factor: function () {
            return this.f;
        },
        add: function (factor) {
            this.cl = this.cl || new Array();
            this.cl.push(factor);
        },
        all: function () {
            return this.cl;
        },
        size: function () {
            return this.cl == null ? 0 : this.cl.length;
        },
        item: function (idx) {
            return this.cl[idx];
        },
        set: function (value) {
            this.value = value;
        },
        get: function () {
            return this.value;
        },
        setLex: function (lv) {
            this.lv = lv;
        },
        getLex: function () {
            return this.lv;
        },
        setCtrl: function (ctrl) {
            this.ctrl = ctrl;
        },
        isCtrl: function () {
            return this.ctrl;
        },
        setObj: function (obj) {
            this.obj = obj;
        },
        getObj: function () {
            return this.obj;
        },
        setChild: function (idx, value) {
            this.cl[idx].set(value);
        },
        setChildLex: function (idx, obj, lv) {
            var child = this.cl[idx];
            child.setObj(obj);
            child.setLex(lv);
        },
        setChildCtrl: function (idx, ctrl) {
            this.cl[idx].setCtrl(ctrl);
        },
        merge: function (childFactor) {
            this.r = childFactor.rule();
            this.cl = childFactor.all();
        },
        replace: function (idx, factorList) {
            this.cl.splice(idx, 1);
            var len = factorList.length;
            for (var i = 0; i < len; ++i) {
                this.cl.splice(idx + i, 0, factorList[i]);
            }
        }
    });

    Expr.Tree = function () {
        this.stack = new Stack();
        this.root = null;
    };

    Lang.impl(Expr.Tree, {
        get: function () {
            return this.root;
        },
        push: function (factor) {
            this.stack.push(factor);
        },
        peek: function () {
            return this.stack.peek();
        },
        pop: function () {
            return this.stack.pop();
        },
        extract: function () {
            if (!this.stack.empty()) {
                this.root = this.stack.pop();
            }
        },
        opti1: function (p) {
            var SL = p.item(2);
            p.replace(2, SL.all());
        },
        opti19: function (p) {
            var FT = p.item(1);
            p.replace(1, FT.all());

            var FH = p.item(0);
            p.replace(0, FH.all());
        },
        opti22: function (p) {
            var PL = p.item(0);
            p.replace(0, PL.all());
        },
        opti23: function (p) {
            var PL = p.item(2);
            p.replace(2, PL.all());
        },
        opti26: function (p) {
            var IH = p.item(0);
            p.replace(0, IH.all());
        },
        opti27: function (p) {
            var IT = p.item(1);
            p.replace(1, IT.all());

            var IH = p.item(0);
            p.replace(0, IH.all());
        },
        opti36: function (p) {
            var CASE_SL = p.item(5);
            p.replace(5, CASE_SL.all());
        },
        opti38: function (p) {
            var CASE_SL = p.item(2);
            p.replace(2, CASE_SL.all());
        },
        optiItem: function (p) {
            var r = p.rule();
            if (r == null) {
                return;
            }

            var childList = p.all();
            if (childList != null) {
                var childFactor = null;
                var len = childList.length;
                for (var i = 0; i < len; ++i) {
                    childFactor = childList[i];
                    this.optiItem(childFactor);
                }
            }

            // 优化主要针对参数列表
            var ruleIndex = r.index();
            switch (ruleIndex) {
                case 1:
                    this.opti1(p);
                    break;
                case 19:
                    this.opti19(p);
                    break;
                case 22:
                    this.opti22(p);
                    break;
                case 24:
                    this.opti23(p);
                    break;
                case 26:
                    this.opti26(p);
                    break;
                case 27:
                    this.opti27(p);
                    break;
                case 36:
                    this.opti36(p);
                    break;
                case 38:
                    this.opti38(p);
                    break;
            }
        },
        opti: function () {
            this.optiItem(this.root);
        }
    });

    Expr.RuleTrace = function (r) {
        this.r = r;
        this.p = -1;
    };

    Lang.impl(Expr.RuleTrace, {
        rule: function () {
            return this.r;
        },
        pos: function () {
            return this.p;
        },
        matched: function () {
            return this.p == this.r.rightLen() - 1;
        },
        consum: function () {
            ++this.p;
            return this.p;
        },
        match: function (li) {
            var rf = this.r.rightAt(this.pos() + 1);
            return rf.get() == li;
        },
        left: function () {
            return this.r.left().get();
        },
        isClose: function () {
            return this.r.isClose();
        },
        print: function () {
            var left = this.r.left();
            var leftString = left.getName();
            var rightString = null;

            var vRight = this.r.right();
            var length = vRight.length;

            for (var i = 0; i < length; ++i) {
                if (rightString == null) {
                    rightString = vRight[i].getName();
                } else {
                    rightString += " " + vRight[i].getName();
                }
                if (this.p == i) {
                    rightString += " ^ ";
                }
            }
            var result = null;
            if (this.p == -1) {
                result = leftString + " -> ^ " + rightString;
            } else {
                result = leftString + " -> " + rightString;
            }
            //console.log(result);
        }
    });

    Expr.IEvalContext = function () {
    };

    /**
     * EvalEnv函数成员说明
     * 1.getValue(cxt, id)，函数的目的是为了取得id所表示的值
     *    参数：
     *    cxt 上下文
     *    id 标识符
     *    返回值:
     *    返回id所表示的标识值的值，在客户端为id对应组件(或者单元格)的值
     * 2.setValue(cxt, id, value)，函数的目的是为了给标识符id赋值
     *    参数：
     *    cxt 上下文
     *    id 标识符
     *    value 值
     *    返回值：无
     * 3.checkMacro(cxt, name),函数的目的是为了检查name是否是宏公式
     *    参数：
     *    cxt 上下文
     *    name 名称
     *    返回值：
     *    如果name定义为宏，返回宏定义，否则返回null作为判断是否为宏的依据
     * 4.evalMacro(cxt, scope, name, macro, args)，解析宏公式
     *    参数：
     *    cxt 上下文
     *    scope 作用域
     *    name 宏名称
     *    macro 宏定义
     *    args 参数集
     *    返回值：宏公式的返回值
     * 5.getLoop(cxt, name, obj)，根据函数名称和对象取得循环对象
     *    参数：
     *    cxt 上下文
     *    name 函数名称
     *    obj 循环对象标识
     *    返回值：IObjectLoop接口的循环对象
     * 6.resolveObject(self, scope, obj)，解析对象上下文
     *    参数：
     *    self 当前上下文
     *    scope 作用域
     *    obj 对象标识
     *    返回值：根据obj返回的新的上下文
     * 7.evalObject(cxt, obj, name, args)，执行对象操作，在js上不能使用
     *    参数：
     *    cxt 上下文
     *    obj 对象标识
     *    name 对象名称
     *    args 参数列表
     *    返回值：执行结果
     **/
    Expr.IEvalEnv = function () {
    };

    /**
     * IObjectLoop成员函数说明：
     * 1.hasNext(),返回是否还有下一个对象
     * 2.next(),移到下一个对象
     * 3.clean(),清理环境
     */
    Expr.IObjectLoop = function () {
    };

    Expr.InnerFuns = (function () {
        var funs = {};
        funs.InList = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var r = false;
            var v = args[0];
            var isStr = typeof(v) == 'string';
            var l = args.length;
            for (var i = 1; i < l; ++i) {
                var tv = args[i];
                if (isStr) {
                    if (v == tv.toString()) {
                        r = true;
                        break;
                    }
                } else {
                    if (v instanceof Decimal && tv instanceof  Decimal) {
                        if (v.equals(tv)) {
                            r = true;
                            break;
                        }
                    } else if (v == tv) {
                        r = true;
                        break;
                    }
                }

            }
            return r;
        };
        funs.Left = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var s = args[0];
            var l = args[1];
            if ( s != null && l <= s.length ) {
                 return s.substring(0, l);
            } else {
            	throw new Error("String index out of range：" + l);
            }
           
        };
        funs.Right = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var s = args[0];
            var l = args[1];
            if (s != null && l <= s.length ) {
                return s.substring(s.length - l);
            } else {
            	throw new Error("String index out of range：" + l);
            }
            
        };
        funs.Mid = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var s = args[0];
            var p = args[1];
            var l = args[2];
            if (s != null && l < s.length && p + l <= s.length) {
                return s.substring(p, p + l);
            } else {
            	throw new Error("String index out of range：" + (p + l));
            }
            
        };
        funs.Length = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var s = YIUI.TypeConvertor.toString(args[0]);
            return s.length;
        };
        funs.IndexOf = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var fs = args[0];
            var ss = args[1];
            return fs.indexOf(ss);
        };
        funs.ToInt = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var v = args[0];
            var r = YIUI.TypeConvertor.toInt(v == null ? 0 : v);
            return r;
        };
        funs.ToDecimal = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var v = YIUI.TypeConvertor.toDecimal(args[0]);
            var r = new Decimal(v == null ? 0 : v);
            return r;
        };
        funs.ToLong = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var v = args[0];
            var r = YIUI.TypeConvertor.toLong(v == null ? 0 : v);
            return r;
        };
        funs.ToString = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var v = args[0];
            var r = YIUI.TypeConvertor.toString(v);
            return r;
        };
        funs.IIF = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var cv = YIUI.TypeConvertor.toBoolean(args[0]);
            var v = null;
            if (cv) {
                v = args[1];
            } else if (args.length > 2) {
                v = args[2];
            }
            return v;
        };
        funs.IIFS = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var v = null;
            var l = args.length;
            var cv = YIUI.TypeConvertor.toBoolean(args[0]);
            for (var i = 0; i < l; ++i) {
                if (i % 2 == 0) {
                    cv = YIUI.TypeConvertor.toBoolean(args[i]);
                } else if (cv) {
                    v = args[i];
                    break;
                }
            }
            return v;
        };
        funs.OUT = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
        	var text = YIUI.TypeConvertor.toString(args[0]);
            if (window.console && text != "") {
                console.log(text);
            }
            return true;
        };
        funs.IsNull = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            return args[0] == null || args[0] == undefined;
        };
        funs.ToUpper = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var value = args[0];
            var result = value.toUpperCase();
            return result;
        };
        funs.ToLower = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var value = args[0];
            var result = value.toLowerCase();
            return result;
        };
        funs.Trim = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var value = args[0];
            var result = value.trim();
            return result;
        };
        funs.ToBool = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            return YIUI.TypeConvertor.toBoolean(args[0]);
        };

        /**
         * Decimal时format的值同DecimalFormat格式定义
         * @returns {string}
         * @constructor
         */
        funs.Format = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var value = args[0];
            var format = null;
            if (args.length > 1) {
                format = args[1];
            }
            var s = "";
            if (value != null) {
                if (value instanceof Decimal) {
                 var nfm = new YIUI.NumberFormat();
                 nfm.applyPattern(format);

                 var v = parseFloat(value.toString());
                 s = nfm.format(v);
                } else if ($.isNumeric(value)) {
                    s = value.toString();
                } else if ($.isBoolean(value)) {
                    s = value.toString();
                } else if (value instanceof Date) {
                    if (format == null) {
                        s = value.Format("yyyy-MM-dd HH:mm:ss");
                    } else {
                        s = value.Format(format);
                    }
                }
            }
            return s;
        };
        funs.DateAdd = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var interval = args[1].toString().toLowerCase(),
                number = parseInt(args[2]),
            date = YIUI.TypeConvertor.toDate(args[0]);
            //IE浏览器直接用Date型去new Date会忽略毫秒数
            var datedetail = date.getTime();
            date = new Date(datedetail);
            switch (interval) {
                case "d":
                case "dd":
                    date.setDate(date.getDate() + number);
                    break;
                case "m":
                case "mm":
                	var month = date.getMonth();
                	var oldDate = date.getDate();
                	var fullYear = date.getFullYear();
                	date.setMonth(date.getMonth() + number);
                	var newDateYear = date.getFullYear();
                	var newDate;
                	if (fullYear == newDateYear){
                		newDate = new Date(newDateYear, month + number + 1, 0);
                	} else {
                		newDate = new Date(newDateYear, month + number + 13, 0);
                	}
                	var newDateDay = newDate.getDate();
                	if(oldDate > newDateDay){
                		date = newDate;
                	}
                    break;
                case "yyyy":
                    date.setYear(date.getFullYear() + number);
                    break;
                case "h":
                    date.setHours(date.getHours() + number);
                    break;
                case "n":
                    date.setMinutes(date.getMinutes() + number);
                    break;
                case "s":
                    date.setSeconds(date.getSeconds() + number);
                    break;
                case "q":
                    date.setMonth(date.getMonth() + number * 3);
                    break;
                case "ww":
                    date.setDate(date.getDate() + number * 7);
                    break;
                default :
                    alert("DateAdd " + interval + " not impl")
                    break;
            }
            return date;
        };
        funs.DateDiff = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var startDate = YIUI.TypeConvertor.toDate(args[0]),
                endDate = YIUI.TypeConvertor.toDate(args[1]),
                unit = args[2].toLowerCase(),
                value = -1;
            if ( !unit || !startDate || !endDate ){
            	throw new YIUI.ViewException(YIUI.ViewException.Date_Diff_Param_Error,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.Date_Diff_Param_Error));
            }
            switch (unit) {
                case "yyyy":
                    value = endDate.getFullYear() - startDate.getFullYear();
                    break;
                case "m":
                    var date1 = startDate.getFullYear() * 12 + startDate.getMonth();
                    var date2 = endDate.getFullYear() * 12 + endDate.getMonth();
                    value = date2 - date1;
                    break;
                case "d":
                    value = (endDate - startDate) / (24 * 60 * 60 * 1000);
                    break;
                case "h":
                    value = (endDate - startDate) / (60 * 60 * 1000);
                    break;
                case "n":
                    value = (endDate - startDate) / (60 * 1000);
                    break;
                case "s":
                    value = (endDate - startDate) / 1000;
                    break;
            }
            return Math.floor(value);
        };
        funs.DayOfWeek = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var date = YIUI.TypeConvertor.toDate(args[0]);
            return date.getDay() + 1;
        };
        // 支持 yyyy-MM-dd & yyyy-MM-dd hh:mm:ss
        funs.ToDate = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var s = YIUI.TypeConvertor.toString(args[0]);

            return YIUI.TypeConvertor.toDate(s);
        };
        funs.Replace = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var str = args[0].toString(),    // 要被替换的字符串
                subStr = args[1].toString(), // 要替换的字符串
                newStr = args[2].toString(), // 新的字符串
                p, // 字符出现位置
                s; // 下一次搜索的起始位置

            while( (p = str.indexOf(subStr,s)) > -1 ) {
                s = p + newStr.length;
                str = str.replace(subStr,newStr);
            }

            return str;
        };
        funs.Round = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var bd = YIUI.TypeConvertor.toDecimal(args[0]),
                dp = (args[1] == undefined ? 0 : parseInt(args[1])),
                rm = YIUI.NUMBEREDITOR_ROUNDINGMODE.parseStr(args[2]);
            return bd.round(dp, rm);
        };
        funs.And = function (name,cxt,args) {
            var result = true;
            for( var i = 0,size = args.length;i < size;i++ ) {
                result = YIUI.TypeConvertor.toBoolean(args[i]);
                if( !result ) {
                    result = false;
                    break;
                }
            }
            return result;
        };
        funs.GetAmountInWords = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var bd = YIUI.TypeConvertor.toDecimal(args[0]);
            return YIUI.NumericUtil.getAmountInWords(bd);
        };
        funs.ReplaceByPos = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var format = args[0];
            return YIUI.UIUtil.format(format, args, 1);
        };
        funs.UUID = function (name, cxt, args) {
            funs.UUID.F = funs.UUID.F || function (a,b) {
                    return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(a, b);
                };
            return funs.UUID.F(/[xy]/g, function (a) {
                var b = 16 * Math.random() | 0, c = "x" == a ? b : 3 & b | 8;
                return c.toString(16)
            });
        };
        funs.RaiseErr = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var info = args[0];
            $.error(info);
        };
        return funs;
    })();

    Expr.Evaluator = function (implMap, evalEnv, tree, scope) {
        this.implMap = implMap;
        this.evalEnv = evalEnv;
        this.tree = tree;
        this.scope = scope;
        this.ctrlFlow = -1;
    };

    Lang.impl(Expr.Evaluator, {
        eval: function (cxt) {
            var v = null;
            this.exec(cxt, this.tree.get());
            v = this.tree.get().get();
            return v;
        },
        exec: function (cxt, p) {
            var r = p.rule();
            var rIdx = -1;
            if (r != null) {
                rIdx = r.index();
                switch (rIdx) {
                    case 0:
                        this.exec0(cxt, p);
                        break;
                    case 1:
                        this.exec1(cxt, p);
                        break;
                    case 2:
                        this.exec2(cxt, p);
                        break;
                    case 3:
                        this.exec3(cxt, p);
                        break;
                    case 4:
                        this.exec4(cxt, p);
                        break;
                    case 5:
                        this.exec5(cxt, p);
                        break;
                    case 6:
                        this.exec6(cxt, p);
                        break;
                    case 7:
                        this.exec7(cxt, p);
                        break;
                    case 8:
                        this.exec8(cxt, p);
                        break;
                    case 9:
                        this.exec9(cxt, p);
                        break;
                    case 10:
                        this.exec10(cxt, p);
                        break;
                    case 11:
                        this.exec11(cxt, p);
                        break;
                    case 12:
                        this.exec12(cxt, p);
                        break;
                    case 13:
                        this.exec13(cxt, p);
                        break;
                    case 14:
                        this.exec14(cxt, p);
                        break;
                    case 15:
                        this.exec15(cxt, p);
                        break;
                    case 16:
                        this.exec16(cxt, p);
                        break;
                    case 17:
                        this.exec17(cxt, p);
                        break;
                    case 18:
                        this.exec18(cxt, p);
                        break;
                    case 19:
                        this.exec19(cxt, p);
                        break;
                    case 20:
                        this.exec20(cxt, p);
                        break;
                    case 21:
                        this.exec21(cxt, p);
                        break;
                    case 22:
                        this.exec22(cxt, p);
                        break;
                    case 23:
                        this.exec23(cxt, p);
                        break;
                    case 24:
                        this.exec24(cxt, p);
                        break;
                    case 25:
                        this.exec25(cxt, p);
                        break;
                    case 26:
                        this.exec26(cxt, p);
                        break;
                    case 27:
                        this.exec27(cxt, p);
                        break;
                    case 28:
                        this.exec28(cxt, p);
                        break;
                    case 29:
                        this.exec29(cxt, p);
                        break;
                    case 30:
                        this.exec30(cxt, p);
                        break;
                    case 31:
                        this.exec31(cxt, p);
                        break;
                    case 32:
                        this.exec32(cxt, p);
                        break;
                    case 33:
                        this.exec33(cxt, p);
                        break;
                    case 34:
                        this.exec34(cxt, p);
                        break;
                    case 35:
                        this.exec35(cxt, p);
                        break;
                    case 36:
                        this.exec36(cxt, p);
                        break;
                    case 37:
                        this.exec37(cxt, p);
                        break;
                    case 38:
                        this.exec38(cxt, p);
                        break;
                    case 39:
                        this.exec39(cxt, p);
                        break;
                }
            }
        },

        isNull: function (v) {
            return (v == undefined || v == null);
        },

        getCpType: function (v1, v2) {
            var type = -1;
            if (this.isNull(v1)) {
                var temp = v2;
                v2 = v1;
                v1 = temp;
            }
            // if (this.isNull(v1)) {
            //     type = DataType.NUMERIC;
            // } else 
            if (typeof v1 == "string") {
                if ($.isNumeric(v1)) {
                    type = DataType.STRING;
                } else {
                    type = DataType.STRING;
                }
            } else if (typeof v1 == "number") {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else if(typeof v2 == "number") {
                    type = DataType.INT;
                } else if(v2 instanceof Decimal) {
                    type = DataType.NUMERIC;
                } else if(v2 instanceof Date) {
    				throw new Error("Incompatible type");
    			}
            } else if (typeof  v1 == "boolean") {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "number" || v2 instanceof Decimal) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else if (typeof v2 == "boolean") {
                    type = DataType.BOOLEAN;
                } else if(v2 instanceof Date) {
    				throw new Error("Incompatible type");
    			}
            } else if (v1 instanceof Decimal) {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "number" || v2 instanceof Decimal) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else if (typeof v2 == "boolean") {
                    type = DataType.BOOLEAN;
                } else if(v2 instanceof Date) {
    				throw new Error("Incompatible type");
    			}
            } else if(v1 instanceof Date) {
            	if (v2 == null || v2 instanceof Date) {
    				type = DataType.DATETIME;
    			} else {
    				throw new Error("Incompatible type");
    			}
            }
            return type;
        },
        // SL -> E
        exec0: function (cxt, p) {
            var E = p.item(0);
            this.exec(cxt, E);
            if (this.ctrlFlow != Expr.F_RETURN) {
                p.set(E.get());
            }
        },
        // SL -> E ; SL
        exec1: function (cxt, p) {
            var l = (p.size() + 1) / 2;
            var v = null;
            for (var i = 0; i < l; ++i) {
                var E = p.item(i * 2);
                this.exec(cxt, E);
                if (this.ctrlFlow != -1) {
                    break;
                }
                v = E.get();
            }
            if (this.ctrlFlow != Expr.F_RETURN) {
                p.set(v);
            }
        },
        // E -> E + E
        exec2: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.STRING:
                    v = YIUI.TypeConvertor.toString(v1) + YIUI.TypeConvertor.toString(v2);
                    break;
	            case  DataType.INT:
	            	v = YIUI.TypeConvertor.toInt(v1) + YIUI.TypeConvertor.toInt(v2);
	                break;
                case DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).plus(YIUI.TypeConvertor.toDecimal(v2));
                    break;
            }
            p.set(v);
        },
        // E -> E - E
        exec3: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
	            case  DataType.INT:
	            	v = YIUI.TypeConvertor.toInt(v1) - YIUI.TypeConvertor.toInt(v2);
	                break;
                case  DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).minus(YIUI.TypeConvertor.toDecimal(v2));
                    break;
            }
            p.set(v);
        },
        // E -> E * E
        exec4: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
	            case  DataType.INT:
	            	v = YIUI.TypeConvertor.toInt(v1) * YIUI.TypeConvertor.toInt(v2);
	                break;
                case  DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).times(YIUI.TypeConvertor.toDecimal(v2));
                    break;
            }
            p.set(v);
        },
        // E -> E / E
        exec5: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = YIUI.TypeConvertor.toDecimal(E1.get()), v2 = YIUI.TypeConvertor.toDecimal(E2.get());
            p.set(v1.dividedBy(v2));
        },
        // E -> E & E
        exec6: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var e1 = E1.get(), e2 = E2.get();
            var type = this.getCpType(e1, e2), v;
            if (type == DataType.STRING) {
                var v1 = YIUI.TypeConvertor.toString(e1), v2 = YIUI.TypeConvertor.toString(e2);
                p.set(v1 + v2);
            }
        },
        // E -> ( E )
        exec7: function (cxt, p) {
            var E = p.item(1);
            this.exec(cxt, E);

            p.set(E.get());
        },
        // E -> ! E
        exec8: function (cxt, p) {
            var E = p.item(1);
            this.exec(cxt, E);

            var value = YIUI.TypeConvertor.toBoolean(E.get());
            p.set(!value);
        },
        // E -> E || E
        exec9: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);

            var b1 = YIUI.TypeConvertor.toBoolean(E1.get());
            var b2 = false;
            if(!b1){
                this.exec(cxt, E2);
                b2 = YIUI.TypeConvertor.toBoolean(E2.get());
            }
            p.set(b1 || b2);
        },
        // E -> E && E
        exec10: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);

            var b1 = YIUI.TypeConvertor.toBoolean(E1.get());
            var b2 = false;
            if ( b1 ) {
            	this.exec(cxt, E2);
            	b2 = YIUI.TypeConvertor.toBoolean(E2.get());
            }
            p.set(b1 && b2);
        },
        // E -> E == E
        exec11: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.NUMERIC:
                    if (!$.isNumeric(v2)) {
                        v = false;
                    } else {
                        v = YIUI.TypeConvertor.toDecimal(v1).equals(YIUI.TypeConvertor.toDecimal(v2));
                    }
                    break;
                case DataType.STRING:
                    var s1 = YIUI.TypeConvertor.toString(v1);
                    var s2 = YIUI.TypeConvertor.toString(v2);
                    v = Expr.eq(s1, s2);
                    break;
                case DataType.DATETIME:
                	var d1 = YIUI.TypeConvertor.toDate(v1);
                	var d2 = YIUI.TypeConvertor.toDate(v2);
                    if(d1 == null){
                        v = (d2 == null ? true : false);
                    } else if ( d2 == null ) {
                        v = false;
                    } else {
                        v = d1.getTime() == d2.getTime(); 
                    }
                	break;
                default:
                    v = (v1 == v2);
                    break;
            }
            p.set(v);
        },
        // E -> E <> E
        exec12: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.NUMERIC:
                    v = !YIUI.TypeConvertor.toDecimal(v1).equals(YIUI.TypeConvertor.toDecimal(v2));
                    break;
                case DataType.STRING:
                    var s1 = YIUI.TypeConvertor.toString(v1);
                    var s2 = YIUI.TypeConvertor.toString(v2);
                    v = !Expr.eq(s1, s2);
                    break;
                default:
                    v = (v1 != v2);
                    break;
            }
            p.set(v);
        },
        // E -> E > E
        exec13: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).greaterThan(YIUI.TypeConvertor.toDecimal(v2));
                    break;
                case DataType.STRING:
                    var s1 = YIUI.TypeConvertor.toString(v1).toLowerCase();
                    var s2 = YIUI.TypeConvertor.toString(v2).toLowerCase();
                    v = s1.localeCompare(s2) == 1;
                    break;
                case DataType.DATETIME:
                	var d1 = YIUI.TypeConvertor.toDate(v1);
                	var d2 = YIUI.TypeConvertor.toDate(v2);
                    if( d1 == null ) {
                        v = false;
                    } else if ( d2 == null ) {
                        v = true;
                    } else {
                        v = d1.getTime() > d2.getTime();
                    }
                	break;
                default:
                    v = (v1 > v2);
                    break;
            }
            p.set(v);
        },
        // E -> E >= E
        exec14: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).greaterThanOrEqualTo(YIUI.TypeConvertor.toDecimal(v2));
                    break;
                case DataType.STRING:
                    var s1 = YIUI.TypeConvertor.toString(v1).toLowerCase();
                    var s2 = YIUI.TypeConvertor.toString(v2).toLowerCase();
                    v = (s1.localeCompare(s2) == 0) || (s1.localeCompare(s2) == 1);
                    break;
                case DataType.DATETIME:
                	var d1 = YIUI.TypeConvertor.toDate(v1);
                	var d2 = YIUI.TypeConvertor.toDate(v2);
                    if( d1 == null ) {
                        v = (d2 == null ? true : false);
                    } else if ( d2 == null ) {
                        v = true;
                    } else {
                        v = d1.getTime() >= d2.getTime();
                    }
                	break;
                default:
                    v = (v1 >= v2);
                    break;
            }
            p.set(v);
        },
        // E -> E < E
        exec15: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).lessThan(YIUI.TypeConvertor.toDecimal(v2));
                    break;
                case DataType.STRING:
                    var s1 = YIUI.TypeConvertor.toString(v1).toLowerCase();
                    var s2 = YIUI.TypeConvertor.toString(v2).toLowerCase();
                    v = s1.localeCompare(s2) == -1;
                    break;
                case DataType.DATETIME:
                	var d1 = YIUI.TypeConvertor.toDate(v1);
                	var d2 = YIUI.TypeConvertor.toDate(v2);
                	if( d1 == null ) {
                	    v == (d2 == null ? false : true);
                    } else if ( d2 == null ) {
                	    v = false;
                    } else {
                        v = d1.getTime() < d2.getTime();
                    }
                	break;
                default:
                    v = (v1 < v2);
                    break;
            }
            p.set(v);
        },
        // E -> E <= E
        exec16: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = E1.get(), v2 = E2.get(), type = this.getCpType(v1, v2), v;
            switch (type) {
                case DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).lessThanOrEqualTo(YIUI.TypeConvertor.toDecimal(v2));
                    break;
                case DataType.STRING:
                    var s1 = YIUI.TypeConvertor.toString(v1).toLowerCase();
                    var s2 = YIUI.TypeConvertor.toString(v2).toLowerCase();
                    v = (s1.localeCompare(s2) == 0) || (s1.localeCompare(s2) == -1);
                    break;
                case DataType.DATETIME:
                	var d1 = YIUI.TypeConvertor.toDate(v1);
                	var d2 = YIUI.TypeConvertor.toDate(v2);
                	if( d1 == null ) {
                	    v = true;
                    } else if ( d2 == null ) {
                	    v = false;
                    } else {
                        v = d1.getTime() <= d2.getTime();
                    }
                	break;
                default:
                    v = (v1 <= v2);
                    break;
            }
            p.set(v);
        },
        // E -> const
        exec17: function (cxt, p) {
            var cf = p.item(0);
            p.set(cf.get());
        },
        // E -> id
        exec18: function (cxt, p) {
            var idf = p.item(0);
            var id = idf.getLex();
            var obj = idf.getObj();

            var found = false;
            var value = null;
            var heap = this.scope.getHeap();
            if (heap.contains(id)) {
                value = heap.get(id);
                found = true;
            }
            if (!found) {
                value = this.evalEnv.get(cxt, id, this.scope, obj);
            }

            p.set(value);
        },
        // E -> FUNC_HEAD FUNC_TAIL
        exec19: function (cxt, p) {
            this.execFun(cxt, p, 0, null);
        },
        // FUNC_HEAD -> function (
        exec20: function (cxt, p) {
        },
        // FUNC_TAIL -> )
        exec21: function (cxt, p) {
        },
        // FUNC_TAIL -> PL )
        exec22: function (cxt, p) {
        },
        // PL -> E
        exec23: function (cxt, p) {
        },
        // PL -> E , PL
        exec24: function (cxt, p) {
        },
        // E -> var id = E
        exec25: function (cxt, p) {
            var id = p.item(1);
            var E = p.item(3);
            this.exec(cxt, E);

            this.scope.getHeap().put(id.getLex(), E.get());
        },
        // E -> IF_HEAD
        exec26: function (cxt, p) {
            // if ( E ) { SL }
            var E = p.item(2);
            this.exec(cxt, E);
            if (E.get()) {
                var SL = p.item(5);
                this.exec(cxt, SL);
                if ( this.ctrlFlow != Expr.F_RETURN ) {
                    p.set(SL.get());
                }
            }
        },
        // E -> IF_HEAD IF_TAIL
        exec27: function (cxt, p) {
            // if ( E } { SL1 } else { SL2 }
            var E = p.item(2);
            this.exec(cxt, E);
            if (E.get()) {
                var SL1 = p.item(5);
                this.exec(cxt, SL1);
                if ( this.ctrlFlow != Expr.F_RETURN ) {
                    p.set(SL1.get());
                }
            } else {
                var SL2 = p.item(9);
                this.exec(cxt, SL2);
                if ( this.ctrlFlow != Expr.F_RETURN ) {
                    p.set(SL2.get());
                }
            }
        },
        // IF_HEAD -> if ( E ) { SL }
        exec28: function (cxt, p) {
            var E = p.item(2);
            this.exec(cxt, E);
            if (E.get()) {
                var SL = p.item(5);
                this.exec(cxt, SL);
                if (this.ctrlFlow != Expr.F_RETURN) {
                    p.set(SL.get());
                }
            }
        },
        // IF_TAIL -> else { SL }
        exec29: function (cxt, p) {
        },
        // E -> while ( E ) { SL }
        exec30: function (cxt, p) {
            var E = p.item(2);
            var SL = p.item(5);
            this.exec(cxt, E);
            while (E.get()) {
                this.exec(cxt, SL);
                if (this.ctrlFlow != -1) {
                    break;
                }
                this.exec(cxt, E);
            }
            if (this.ctrlFlow == Expr.F_BREAK) {
                this.ctrlFlow = -1;
            }
        },
        // E -> E = E
        exec31: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            var idf = E1.item(0);
            var id = "";
            if (idf.factor().get() == 15) {
                id = idf.getLex();
            } else {
                this.exec(cxt, E1);
                id = E1.get();
            }
            var obj = idf.getObj();

            this.exec(cxt, E2);

            var heap = this.scope.getHeap();
            if (heap.contains(id)) {
                heap.put(id, E2.get());
            } else {
                this.evalEnv.set(cxt, id, E2.get(), this.scope, obj);
            }
        },
        // E -> return E
        exec32: function (cxt, p) {
            var E = p.item(1);
            this.exec(cxt, E);
            this.tree.get().set(E.get());

            this.ctrlFlow = Expr.F_RETURN ;
        },
        // E -> break
        exec33: function (cxt, p) {
            this.ctrlFlow = Expr.F_BREAK;
        },
        // E -> loop E ( E ) { SL }
        exec34: function (cxt, p) {
            var fun = p.item(0);
            var name = fun.getLex();
            var OE = p.item(1);
            this.exec(cxt, OE);

            var CE = p.item(3);
            var SL = p.item(6);
            var obj = OE.get();
            var loopObject = this.evalEnv.getLoop(cxt, name, 0, obj);
            while (loopObject.hasNext()) {
                loopObject.next();

                this.exec(cxt, CE);
                if (CE.get()) {
                    this.exec(cxt, SL);
                }

                // 如果执行了break和return，退出循环
                if (this.ctrlFlow != -1) {
                    break;
                }
            }
            loopObject.clean();

            // 恢复break状态
            if (this.ctrlFlow == 1) {
                this.ctrlFlow = -1;
            }
        },
        // E -> RANGE
        exec35: function (cxt, p) {
            var r = p.item(0);
            p.set(r.get());
        },
        // E -> switch ( E ) { CASE_SL }
        exec36: function (cxt, p) {
            var E = p.item(2);
            this.exec(cxt, E);
            var condition = E.get();

            var childCount = p.size();
            // 减去固定位置(不包括最后一个}，这个用于跟case ; case 中的;配对)，剩下CASE_SL位置的数量
            childCount -= 5;
            // 求case分支的数量
            var length = childCount / 2;
            // 语法树结构如下：
            // switch ( E ) { case 1; case 2; case 3...}
            for (var i = 0; i < length; ++i) {
                var caseIndex = 5 + i * 2;
                var CASE_S = p.item(caseIndex);
                if (this.execCase(cxt, condition, CASE_S)) {
                    p.set(CASE_S.get());
                    break;
                }
            }
        },
        execCase: function (cxt, condition, factor) {
            // case E : { SL }
            var E = factor.item(1);
            this.exec(cxt, E);
            var value = E.get();

            var matched = false;
            var type = this.getCpType(condition, value);
            switch (type) {
                case  DataType.NUMERIC:
                    matched = YIUI.TypeConvertor.toDecimal(condition).equals(YIUI.TypeConvertor.toDecimal(value));
                    break;
                case DataType.STRING:
                    matched = Expr.eq(condition.toString(), value.toString());
                    break;
                default:
                    matched = (condition == value);
                    break;
            }
            if (matched) {
                var SL = factor.item(4);
                this.exec(cxt, SL);
                factor.set(SL.get());
            }

            return matched;
        },
        // CASE_SL -> CASE_S
        exec37: function (cxt, p) {
        },
        // CASE_SL -> CASE_S ; CASE_SL
        exec38: function (cxt, p) {
        },
        // CASE_S -> case E : { SL }
        exec39: function (cxt, p) {
        },
        execFun: function (cxt, p, postfixCount, extInfo) {
            var fun = p.item(0);
            // 转小写
            var name = fun.getLex();
            var obj = fun.getObj();
            var cv = false;

            var impl = null;
            var newCxt = null;

            if (obj != null) {
                newCxt = this.evalEnv.resolveObject(cxt, this.scope, obj);
                impl = this.evalEnv.evalFuncImpl(cxt, this.scope, obj, name);
                if (impl == null) {
                    impl = this.implMap.get(name);
                }
            } else {
                newCxt = cxt;
                impl = this.implMap.get(name);
            }

            // if ( 1, 2, 3, 4 )
            var l = (p.size() - 2) / 2;
            l = Math.floor(l);
            var args = new Array(l);
            for (var i = 0; i < l; ++i) {
                var P = p.item(2 + i * 2);
                if (fun.isCtrl()) {
                    if (Expr.eq(Expr.IIF, name)) {
                        if (i == 0) {
                            this.exec(cxt, P);
                            cv = P.get();
                            args[i] = cv;
                        } else if (cv) {
                            if (i == 1) {
                                this.exec(cxt, P);
                                args[i] = P.get();
                            }
                        } else {
                            if (i == 2) {
                                this.exec(cxt, P);
                                args[i] = P.get();
                            }
                        }
                    } else {
                        if (i % 2 == 0) {
                            this.exec(cxt, P);
                            cv = YIUI.TypeConvertor.toBoolean(P.get());
                            args[i] = cv;
                        } else {
                            if (cv) {
                                this.exec(cxt, P);
                                args[i] = P.get();
                                break;
                            }
                        }
                    }
                } else {
                    this.exec(cxt, P);
                    args[i] = P.get();
                }
            }

            var r = null;
            if (impl != null) {
                r = impl(name, newCxt, args);
            } else {
            	var macroCxt = newCxt;
            	if ( macroCxt == null ) {
            		macroCxt = cxt;
            	}
                // 如果是宏公式
                var macro = this.evalEnv.checkMacro(macroCxt, name);
                if (macro != null) {
                    r = this.evalEnv.evalMacro(macroCxt, this.scope, name, macro, args);
                } else {
                    //TODO 若存在与其他form、project、commondef中，则后台请求取宏公式
                    if (obj != null) {
                        r = this.evalEnv.evalObject(cxt, obj, name, args);
                    } else {
                        alert("未实现表达式： " + name);
                    }
                }
            }

            p.set(r);
        }
    });

    Expr.Parser = function (implMap) {
        this.implMap = implMap;
    };

    Lang.impl(Expr.Parser, {
        eval: function (env, script, tree, cxt, scope) {
            var r = null;
            if (this.parse(script, tree)) {
                tree.opti();
                var evaluator = new Expr.Evaluator(this.implMap, env, tree, scope);
                evaluator.eval(cxt);
                r = tree.get().get();
            }
            return r;
        },
        evalByTree: function (env, tree, cxt, scope) {
            var evaluator = new Expr.Evaluator(this.implMap, env, tree, scope);
            evaluator.eval(cxt);
            return tree.get().get();
        },
        slAsString: function (top) {
            return top != null ? top.rule().isSLAsString() : true;
        },
        printStack: function (stack) {
            if (true) {
                return;
            }
            var v = stack.values();
            var length = v.length;
            for (var i = 0; i < length; ++i) {
                var trace = v[i];
                trace.print();
            }
            //console.log("    ");
            //console.log("    ");
        },
        parse: function (script, tree) {
            var lex = new Expr.Lexer(script);
            var rules = Expr.rules();
            var obj = null;
            var lv = null;

            var li = lex.next(true);
            var oli = -1;
            obj = lex.getObj();
            lv = lex.getLexValue();
            var dataType = lex.getType();

            var topTrace = null;
            var delayTrace = null;
            var curTrace = null;

            var successed = false;
            var refLexID = new Expr.RefInt(-1);
            var delayID = -1;
            var consumPos = -1;

            var handled = false;

            var finish = li == -1;
            var stack = new Stack();
            while (!finish) {
                handled = false;
                if (delayTrace != null) {
                    if (this.pre(rules, stack, tree, delayTrace, delayID)) {
                        delayTrace = null;
                        handled = true;
                    }
                }

                topTrace = stack.empty() ? null : stack.peek();
                this.printStack(stack);

                refLexID.set(li);
                oli = li;
                var needPre = this.checkPre(stack, topTrace, refLexID, tree, lv);
                li = refLexID.get();

                // 被消耗
                if (li == -1) {
                    li = lex.next(this.slAsString(topTrace));
                    obj = lex.getObj();
                    lv = lex.getLexValue();
                    dataType = lex.getType();
                    delayID = li;
                    finish = li == -1;
                    if (oli != -1 || li != -1) {
                        handled = true;
                    }
                }

                if (needPre) {
                    var predictRule = rules.first(li);
                    if (predictRule != null) {
                        var preTrace = new Expr.RuleTrace(predictRule);
                        stack.push(preTrace);
                        topTrace = preTrace;

                        consumPos = preTrace.consum(li);
                        var terFactor = this.putToTree(tree, preTrace);
                        this.dealLex(li, terFactor, consumPos, dataType, obj, lv);

                        li = lex.next(this.slAsString(topTrace));
                        obj = lex.getObj();
                        lv = lex.getLexValue();
                        dataType = lex.getType();
                        finish = li == -1;

                        this.printStack(stack);

                        // 因为有新的元素加入，之前需要预测的不再有效
                        delayTrace = null;

                        handled = true;
                    } else {
                        if (topTrace != null && topTrace.matched()) {
                            delayTrace = topTrace;
                            delayID = li;
                            this.printStack(stack);
                        }
                    }
                }

                // 如果栈顶成功匹配，那么将其出栈，并且让上一级规则来消费匹配的语法因子
                if (topTrace.matched()) {
                    curTrace = topTrace;
                    stack.pop();
                    if (li != -1 && this.needMore(rules, stack, topTrace, li)) {
                        stack.push(curTrace);
                        delayTrace = curTrace;
                        delayID = li;
                        handled = true;
                        this.printStack(stack);
                    } else {
                        var fullMatched = false;
                        var consumed = false;
                        if (!stack.empty()) {
                            topTrace = stack.peek();
                            if (!topTrace.matched() && topTrace.match(curTrace.left())) {
                                consumed = true;
                                this.consum(tree, topTrace, curTrace);
                                curTrace = topTrace;
                                stack.pop();

                                this.printStack(stack);

                                while (curTrace.matched()) {
                                    if (li != -1 && this.needMore(rules, stack, curTrace, li)) {
                                        delayTrace = curTrace;
                                        delayID = li;
                                        handled = true;
                                        this.printStack(stack);
                                        break;
                                    }
                                    if (!stack.empty()) {
                                        topTrace = stack.peek();
                                        if (li != -1 && this.needMore(rules, stack, curTrace, li)) {
                                            stack.push(curTrace);
                                            break;
                                        }

                                        if (topTrace.match(curTrace.left())) {
                                            this.consum(tree, topTrace, curTrace);
                                            curTrace = topTrace;
                                            stack.pop();
                                            this.printStack(stack);
                                        } else {
                                            break;
                                        }
                                    } else {
                                        fullMatched = true;
                                        stack.push(curTrace);
                                        break;
                                    }
                                }
                            }
                        }

                        if (!consumed) {
                            if (delayTrace != null && !handled) {
                                break;
                            }
                            stack.push(curTrace);
                            delayTrace = curTrace;
                            delayID = li;
                            this.printStack(stack);
                        } else {
                            if (!fullMatched) {
                                stack.push(curTrace);
                                delayTrace = curTrace;
                                delayID = li;
                            } else {
                                successed = true;
                                if (li == -1) {
                                    li = lex.next(this.slAsString(topTrace));
                                    lv = lex.getLexValue();
                                    dataType = lex.getType();
                                }
                                if (li != -1) {
                                    topTrace = stack.pop();
                                    if (this.needMore(rules, stack, topTrace, li)) {
                                        stack.push(topTrace);

                                        delayTrace = topTrace;
                                        delayID = li;
                                        this.printStack(stack);
                                    } else {
                                        successed = false;
                                        this.moreInput(rules, stack, li, lv);
                                        break;
                                    }
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }

                if (li == -1) {
                    li = lex.next(this.slAsString(topTrace));
                    obj = lex.getObj();
                    lv = lex.getLexValue();
                    dataType = lex.getType();
                    delayID = li;
                    finish = li == -1;

                    if (li == -1) {
                        if (!stack.empty()) {
                            topTrace = stack.peek();
                            if (!topTrace.matched()) {
                                this.notMatch(rules, stack);
                                break;
                            } else {
                                if (stack.size() == 1) {
                                    successed = true;
                                    break;
                                } else if (delayTrace != null) {
                                    finish = false;
                                }
                            }
                        }
                    }
                }
            }

            if (successed) {
                tree.extract();
            }
            return successed;
        },
        dealLex: function (li, factor, pos, dataType, obj, lv) {
            factor.setChildLex(pos, obj, lv);
            if (li == 14) {
                if (Expr.eq(Expr.IIF, lv)
                    || Expr.eq(Expr.IIFS, lv)) {
                    factor.setChildCtrl(pos, true);
                }
            }
            switch (li) {
                case 16 :
                {
                    var value = null;
                    switch (dataType) {
                        case Expr.T_BOOL:
                        {
                            value = Expr.eq("true", lv);
                        }
                            break;
                        case Expr.T_INT:
                        {
                            value = parseInt(lv == null ? 0 : lv);
                        }
                            break;
                        case Expr.T_NUM:
                        {
                            value = new Decimal(lv == null ? 0 : lv);
                        }
                            break;
                        case Expr.T_STR:
                        {
                            value = lv;
                        }
                            break;
                    }
                    factor.setChild(pos, value);
                }
                    break;
                case 32:
                {
                    factor.setChild(pos, lv);
                }
                    break;
            }
        },
        putToTree: function (tree, ruleTrace) {
            var r = ruleTrace.rule();
            var factor = new Expr.Item(r.left(), r);
            var rs = r.right();
            var length = rs.length;
            for (var i = 0; i < length; ++i) {
                var childFactor = new Expr.Item(rs[i]);
                factor.add(childFactor);
            }
            tree.push(factor);
            return factor;
        },
        pre: function (rules, stack, tree, delayTrace, fid) {
            var result = false;
            stack.pop();
            var topFactor = tree.pop();
            var delayRule = this.resolveDelay(rules, stack, delayTrace, fid);
            if (delayRule != null) {
                var ruleTrace = new Expr.RuleTrace(delayRule);
                stack.push(ruleTrace);

                this.putToTree(tree, ruleTrace);
                tree.push(topFactor);
                this.consum(tree, ruleTrace, delayTrace);
                result = true;
            } else {
                stack.push(delayTrace);
                tree.push(topFactor);
                result = false;
            }
            return result;
        },
        notMatch: function (rules, stack) {
        },
        moreInput: function (rules, stack, li, lv) {
        },
        checkPre: function (stack, topTrace, li, tree, lv) {
            var b = true;
            if (topTrace != null) {
                if (!topTrace.matched()) {
                    if (topTrace.match(li.get())) {
                        var cpos = topTrace.consum(li.get());
                        var ti = tree.peek();
                        ti.setChildLex(cpos, null, lv);

                        li.set(-1);
                        b = false;
                    }
                } else {
                    if (topTrace.isClose() || li.get() == -1) {
                        b = false;
                    }
                }
            }
            return b;
        },
        resolveDelay: function (rules, stack, delayRule, li) {
            var factorID = delayRule.left();
            var rule = null;
            if (delayRule.matched()) {
                switch (factorID) {
                    case Expr.E:
                    {
                        switch (li) {
                            case Expr.SEMI:
                                // rule 1: SL -> E ; SL
                                rule = rules.at(1);
                                break;
                            // rule 2: E -> E + E
                            case Expr.ADD:
                                rule = rules.at(2);
                                break;
                            // rule 3: E -> E - E
                            case Expr.SUB:
                                rule = rules.at(3);
                                break;
                            // rule 4: E -> E * E
                            case Expr.MUL:
                                rule = rules.at(4);
                                break;
                            // rule 5: E -> E / E
                            case Expr.DIV:
                                rule = rules.at(5);
                                break;
                            // rule 6: E -> E & E
                            case Expr.STRCAT:
                                rule = rules.at(6);
                                break;
                            // rule 9: E -> E || E
                            case Expr.OR:
                                rule = rules.at(9);
                                break;
                            // rule 10: E -> E && E
                            case Expr.AND:
                                rule = rules.at(10);
                                break;
                            // rule 11: E -> E == E
                            case Expr.EQ:
                                rule = rules.at(11);
                                break;
                            // rule 12: E -> E <> E
                            case Expr.NEQ:
                                rule = rules.at(12);
                                break;
                            // rule 13: E -> E > E
                            case Expr.GT:
                                rule = rules.at(13);
                                break;
                            // rule 14: E -> E >= E
                            case Expr.GT_EQ:
                                rule = rules.at(14);
                                break;
                            // rule 15: E -> E < E
                            case Expr.LT:
                                rule = rules.at(15);
                                break;
                            // rule 16: E -> E <= E
                            case Expr.LT_EQ:
                                rule = rules.at(16);
                                break;
                            // rule 24: PL -> E , PL
                            case Expr.COMMA:
                                rule = rules.at(24);
                                break;
                            // rule 31: E -> E = E
                            case Expr.ASSIGN:
                                rule = rules.at(31);
                                break;
                            // )
                            case Expr.RB:
                            {
                                if (delayRule.rule().index() == 7) {
                                    // rule 7: E -> ( E )
                                    rule = null;
                                } else {
                                    // rule 23: PL -> E
                                    rule = rules.at(23);
                                }
                            }
                                break;
                            default:
                                // rule 0: SL -> E
                                rule = rules.at(0);
                                break;
                        }
                    }
                        break;
                    case Expr.FUN_H:
                    {
                        // rule 19: E -> FUNC_HEAD FUNC_TAIL
                        rule = rules.at(19);
                    }
                        break;
                    case Expr.PL:
                    {
                        // rule 22: FUNC_TAIL -> PL )
                        if (li == Expr.RB) {
                            rule = rules.at(22);
                        }
                    }
                        break;
                    case Expr.IF_H:
                        // rule 27: E -> IF_HEAD IF_TAIL
                        if (li == Expr.ELSE) {
                            rule = rules.at(27);
                        } else {
                            // rule 26: E -> IF_HEAD
                            rule = rules.at(26);
                        }
                        break;
                    case Expr.CASE_S:
                        // rule 38: CASE_SL -> CASE_S ; CASE_SL
                        if (li == Expr.SEMI) {
                            rule = rules.at(38);
                        } else {
                            // rule 37: CASE_SL -> CASE_S
                            rule = rules.at(37);
                        }
                        break;
                }
            }

            return rule;
        },
        needMore: function (rules, stack, r, li) {
            var tr = null;
            if (!stack.empty()) {
                tr = stack.peek().rule();
            }

            var has = false;
            switch (r.left()) {
                case Expr.E:
                    switch (li) {
                        // rule 1: SL -> E ; SL
                        case 26:
                            has = true;
                            if (tr != null) {

                                switch (tr.index()) {
                                    // rule 2: E -> E + E
                                    // rule 3: E -> E - E
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    // rule 6: E -> E & E
                                    // rule 9: E -> E || E
                                    // rule 10: E -> E && E
                                    // rule 11: E -> E == E
                                    // rule 12: E -> E <> E
                                    // rule 13: E -> E > E
                                    // rule 14: E -> E >= E
                                    // rule 15: E -> E < E
                                    // rule 16: E -> E <= E
                                    // rule 24: PL -> E , PL
                                    // rule 25: E -> var id = E
                                    // rule 31: E -> E = E
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 5:
                                    case 6:
                                    case 9:
                                    case 10:
                                    case 11:
                                    case 12:
                                    case 13:
                                    case 14:
                                    case 15:
                                    case 16:
                                    case 24:
                                    case 25:
                                    case 31:
                                        has = false;
                                        break;
                                }
                            }
                            break;
                        // +(加),-(减)运算的优先级只比*(乘),/(除)低，也比栈内优先级低
                        // rule 2: E -> E + E
                        case 0:
                        // rule 3: E -> E - E
                        case 2:
                            has = true;
                            if (tr != null) {
                                switch (tr.index()) {
                                    // rule 2: E -> E + E
                                    // rule 3: E -> E - E
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 5:
                                        has = false;
                                        break;
                                }
                            }
                            break;
                        // *(乘),/(除)运算具有最高的优先级，但比栈内优先级低
                        // rule 4: E -> E * E
                        case 3:
                        // rule 5: E -> E / E
                        case 4:
                            has = true;
                            if (tr != null) {
                                switch (tr.index()) {
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    case 4:
                                    case 5:
                                        has = false;
                                }
                            }
                            break;
                        // rule 6: E -> E & E
                        case 1:
                            has = true;
                            break;
                        // ||(逻辑或)的优先级低于所有算术运算、关系运算和逻辑与，逻辑非
                        // rule 9: E -> E || E
                        case 5:
                            has = true;
                            if (tr != null) {
                                switch (tr.index()) {
                                    // rule 2: E -> E + E
                                    // rule 3: E -> E - E
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    // rule 6: E -> E & E
                                    // rule 8: E -> ! E
                                    // rule 10: E -> E && E
                                    // rule 11: E -> E == E
                                    // rule 12: E -> E <> E
                                    // rule 13: E -> E > E
                                    // rule 14: E -> E >= E
                                    // rule 15: E -> E < E
                                    // rule 16: E -> E <= E
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 5:
                                    case 6:
                                    case 8:
                                    case 10:
                                    case 11:
                                    case 12:
                                    case 13:
                                    case 14:
                                    case 15:
                                    case 16:
                                        has = false;
                                        break;
                                }
                            }
                            break;
                        // &&(逻辑与)的优先级低于所有算术运算和关系运算
                        // rule 10: E -> E && E
                        case 6:
                            has = true;
                            if (tr != null) {
                                switch (tr.index()) {
                                    // rule 2: E -> E + E
                                    // rule 3: E -> E - E
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    // rule 6: E -> E & E
                                    // rule 8: E -> ! E
                                    // rule 11: E -> E == E
                                    // rule 12: E -> E <> E
                                    // rule 13: E -> E > E
                                    // rule 14: E -> E >= E
                                    // rule 15: E -> E < E
                                    // rule 16: E -> E <= E
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 5:
                                    case 6:
                                    case 8:
                                    case 11:
                                    case 12:
                                    case 13:
                                    case 14:
                                    case 15:
                                    case 16:
                                        has = false;
                                        break;
                                }
                            }
                            break;
                        // 关系运算的优先级低于所有运算运算
                        // rule 11: E -> E == E
                        case 7:
                        // rule 12: E -> E <> E
                        case 9:
                        // rule 13: E -> E > E
                        case 10:
                        // rule 14: E -> E >= E
                        case 11:
                        // rule 15: E -> E < E
                        case 12:
                        // rule 16: E -> E <= E
                        case 13:
                            has = true;
                            if (tr != null) {
                                switch (tr.index()) {
                                    // rule 2: E -> E + E
                                    // rule 3: E -> E - E
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    // rule 6: E -> E & E
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 5:
                                    case 6:
                                        has = false;
                                        break;
                                }
                            }
                            break;
                        // rule 24: PL -> E , PL
                        case 19:
                            has = true;
                            // ,的优先级低于所有运算符，除了;
                            if (tr != null) {
                                switch (tr.index()) {
                                    // rule 2: E -> E + E
                                    // rule 3: E -> E - E
                                    // rule 4: E -> E * E
                                    // rule 5: E -> E / E
                                    // rule 6: E -> E & E
                                	// rule 8: E -> ! E
                                    // rule 9: E -> E || E
                                    // rule 10: E -> E && E
                                    // rule 11: E -> E == E
                                    // rule 12: E -> E <> E
                                    // rule 13: E -> E > E
                                    // rule 14: E -> E >= E
                                    // rule 15: E -> E < E
                                    // rule 16: E -> E <= E
                                    // rule 31: E -> E = E
                                    case 2:
                                    case 3:
                                    case 4:
                                    case 5:
                                    case 6:
                                    case 8:
                                    case 9:
                                    case 10:
                                    case 11:
                                    case 12:
                                    case 13:
                                    case 14:
                                    case 15:
                                    case 16:
                                    case 31:
                                        has = false;
                                        break;
                                }
                            }
                            break;
                        // rule 31: E -> E = E
                        case 8:
                            has = true;
                            break;
                    }
                    break;
            }

            return has;
        },
        consum: function (tree, srt, ft) {
            srt.consum(ft.left());
            var pos = srt.pos();
            var ff = tree.pop();
            var sf = tree.peek();
            var cf = sf.item(pos);
            cf.merge(ff);
        }
    });
})();


