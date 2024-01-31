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
        return s1.toString().toLowerCase() == s2.toString().toLowerCase();
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
                                }
                                r = c;
                                found = true;
                            }
                        } else if (c == '*') {
                            if (this.pos < this.len) {
                                c = this.s.charAt(this.pos);
                                ++this.pos;
                                ++this.start;
                                while (c != '*' && this.pos < this.len) {
                                    if (this.pos < this.len) {
                                        c = this.s.charAt(this.pos);
                                        ++this.pos;
                                        ++this.start;
                                    }
                                }
                                ++this.pos;
                                ++this.start;
                                if (this.pos < this.len) {
                                    c = this.s.charAt(this.pos);
                                    ++this.pos;
                                    ++this.start;
                                }
                                r = c;
                                found = true;
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
                case '$':
                    id = 20;
                    this.li = "$";
                    this.lv = "$";
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
            var s = args[0];
            var l = args[1];
            var r = s.substring(0, l);
            return r;
        };
        funs.Right = function (name, cxt, args) {
            var s = args[0];
            var l = args[1];
            var r = s.substring(s.length - l);
            return r;
        };
        funs.Mid = function (name, cxt, args) {
            var s = args[0];
            var p = args[1];
            var l = args[2];
            var r = s.substring(p, p + l);
            return r;
        };
        funs.Length = function (name, cxt, args) {
            var s = args[0];
            return s.length;
        };
        funs.IndexOf = function (name, cxt, args) {
            var fs = args[0];
            var ss = args[1];
            return fs.indexOf(ss);
        };
        funs.ToInt = function (name, cxt, args) {
            var v = args[0];
            var r = YIUI.TypeConvertor.toDecimal(v == null ? 0 : v);
            return r;
        };
        funs.ToDecimal = function (name, cxt, args) {
            var v = YIUI.TypeConvertor.toDecimal(args[0]);
            var r = new Decimal(v == null ? 0 : v);
            return r;
        };
        funs.ToLong = function (name, cxt, args) {
            var v = args[0];
            var r = YIUI.TypeConvertor.toDecimal(v == null ? 0 : v);
            return r;
        };
        funs.ToString = function (name, cxt, args) {
            var v = args[0];
            var r = YIUI.TypeConvertor.toString(v);
            return r;
        };
        funs.IIF = function (name, cxt, args) {
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
            if (window.console && args[0] && args[0] !== null) {
                console.log(args[0].toString());
            }
        };
        funs.IsNull = function (name, cxt, args) {
            return args[0] == null || args[0] == undefined;
        };
        funs.ToUpper = function (name, cxt, args) {
            var value = args[0];
            var result = value.toUpperCase();
            return result;
        };
        funs.ToLower = function (name, cxt, args) {
            var value = args[0];
            var result = value.toLowerCase();
            return result;
        };
        funs.Trim = function (name, cxt, args) {
            var value = args[0];
            var result = value.trim();
            return result;
        };
        funs.ToBool = function (name, cxt, args) {
            return YIUI.TypeConvertor.toBoolean(args[0]);
        };
        funs.Format = function (name, cxt, args) {
            var form = cxt.form;
            var value = args[0];
            var format = null;
            if (args.length > 1) {
                format = args[1];
            }
            var s = "", date = null;
            if (value != null) {
                if (value instanceof Decimal) {
                    //TODO 如何格式化
                } else if ($.isNumeric(value) || typeof value == "boolean") {
                    s = value.toString();
                } else if (value instanceof Date) {
                    date = value;
                    if (format == null) {
                        s = date.Format("yyyy-MM-dd HH:mm:ss");
                    } else {
                        s = date.Format(format);
                    }
                }
            }
            return s;
        };
        funs.DateAdd = function (name, cxt, args) {
            var interval = args[1].toString().toLowerCase(),
                number = parseInt(args[2]), date = args[0];
            date = new Date(date);
            switch (interval) {
                case "d":
                case "dd":
                    date.setDate(date.getDate() + number);
                    break;
                case "m":
                case "mm":
                    date.setMonth(date.getMonth() + number);
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
        funs.DaysOfMonth = function (name, cxt, args) {
            var date;
            if (args.length == 0 || args[0] == null || args[0] == undefined || args[0].toString().length == 0) {
                date = new Date();
            } else {
                date = new Date(args[0].toString());
            }
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        };
        funs.FirstDayOfMonth = function (name, cxt, args) {
            var date;
            if (args.length == 0 || args[0] == null || args[0] == undefined || args[0].toString().length == 0) {
                date = new Date();
            } else {
                date = new Date(args[0].toString());
            }
            return date.setDate(1);
        };
        funs.LastDayOfMonth = function (name, cxt, args) {
            var date;
            if (args.length == 0 || args[0] == null || args[0] == undefined || args[0].toString().length == 0) {
                date = new Date();
            } else {
                date = new Date(args[0].toString());
            }
            date.setMonth(date.getMonth() + 1);
            date.setDate(0);
            return date;
        };
        funs.DateDiff = function (name, cxt, args) {
            var startDate = YIUI.TypeConvertor.toDate(args[0]),
                endDate = YIUI.TypeConvertor.toDate(args[1]),
                unit = args[2].toLowerCase(),
                value = -1;
            if (unit == null || unit == undefined || unit.length == 0) {
                YIUI.ViewException.throwException(YIUI.ViewException.Date_Diff_Param_Error);
            }
            switch (unit) {
                case "yyyy":
                    value = Math.abs(endDate.getFullYear() - startDate.getFullYear());
                    break;
                case "m":
                    var date1 = startDate.getFullYear() * 12 + startDate.getMonth();
                    var date2 = endDate.getFullYear() * 12 + endDate.getMonth();
                    value = Math.abs(date2 - date1);
                    break;
                case "d":
                    value = (Math.abs(endDate - startDate)) / (24 * 60 * 60 * 1000);
                    break;
                case "h":
                    value = (Math.abs(endDate - startDate)) / (60 * 60 * 1000);
                    break;
                case "n":
                    value = (Math.abs(endDate - startDate)) / (60 * 1000);
                    break;
                case "s":
                    value = (Math.abs(endDate - startDate)) / 1000;
                    break;
            }
            value = Math.floor(value);
            return value;
        };
        funs.DayOfWeek = function (name, cxt, args) {
            var date = new Date(args[0]);
            return date.getDay() + 1;
        };
        funs.ToDate = function (name, cxt, args) {
            var s = args[0];
            s = s.replace(/-/g, "/");
            var format = "yyyy-MM-dd";
            if (args.length > 1) {
                format = args[1];
            }
            return new Date(s);
        };
        funs.Replace = function (name, cxt, args) {
            var string = args[0].toString(),
                placeholder = args[1].toString(),
                replacement = args[2].toString();
            return string.replace(placeholder, replacement);
        };
        funs.Round = function (name, cxt, args) {
            var bd = YIUI.TypeConvertor.toDecimal(args[0]),
                dp = (args[1] == undefined ? 0 : parseInt(args[1])),
                rm = YIUI.NUMBEREDITOR_ROUNDINGMODE.parseStr(args[2]);
            return bd.toDecimalPlaces(dp, rm);
        };
        funs.GetAmountInWords = function (name, cxt, args) {
            var bd = YIUI.TypeConvertor.toDecimal(args[0]);
            YIUI.NumericUtil.getAmountInWords(bd);
            return;
        };
        funs.ReplaceByPos = function (name, cxt, args) {
            var format = args[0];
            return YIUI.UIUtil.format(format, args, 1);
        };
        funs.RaiseErr = function (name, cxt, args) {
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
            if (this.isNull(v1)) {
                type = DataType.NUMERIC;
            } else if (typeof v1 == "string") {
                if ($.isNumeric(v1)) {
                    type = DataType.NUMERIC;
                } else {
                    type = DataType.STRING;
                }
            } else if (typeof v1 == "number") {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else {
                    type = DataType.NUMERIC;
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
        },// E -> E + E
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
            var v1 = YIUI.TypeConvertor.toDecimal(E1.get()), v2 = YIUI.TypeConvertor.toDecimal(E2.get());
            p.set(v1.minus(v2));
        },
        // E -> E * E
        exec4: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);
            var v1 = YIUI.TypeConvertor.toDecimal(E1.get()), v2 = YIUI.TypeConvertor.toDecimal(E2.get());
            p.set(v1.times(v2));
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
            var v1 = YIUI.TypeConvertor.toString(E1.get()), v2 = YIUI.TypeConvertor.toString(E2.get());
            p.set(v1 + v2);
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
            this.exec(cxt, E2);

            var b1 = YIUI.TypeConvertor.toBoolean(E1.get());
            var b2 = YIUI.TypeConvertor.toBoolean(E2.get());
            p.set(b1 || b2);
        },
        // E -> E && E
        exec10: function (cxt, p) {
            var E1 = p.item(0);
            var E2 = p.item(2);
            this.exec(cxt, E1);
            this.exec(cxt, E2);

            var b1 = YIUI.TypeConvertor.toBoolean(E1.get());
            var b2 = YIUI.TypeConvertor.toBoolean(E2.get());
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
                case  DataType.NUMERIC:
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
                case  DataType.NUMERIC:
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
                case  DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).greaterThan(YIUI.TypeConvertor.toDecimal(v2));
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
                case  DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).greaterThanOrEqualTo(YIUI.TypeConvertor.toDecimal(v2));
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
                case  DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).lessThan(YIUI.TypeConvertor.toDecimal(v2));
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
                case  DataType.NUMERIC:
                    v = YIUI.TypeConvertor.toDecimal(v1).lessThanOrEqualTo(YIUI.TypeConvertor.toDecimal(v2));
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
                if ( this.ctrlFlow != Expr.RETURN ) {
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
                if ( this.ctrlFlow != Expr.RETURN ) {
                    p.set(SL1.get());
                }
            } else {
                var SL2 = p.item(9);
                this.exec(cxt, SL2);
                if ( this.ctrlFlow != Expr.RETURN ) {
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
                if (this.ctrlFlow != 29) {
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
            if (this.ctrlFlow == 30) {
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
                // 如果是宏公式
                var macro = this.evalEnv.checkMacro(cxt, name);
                if (macro != null) {
                    r = this.evalEnv.evalMacro(cxt, this.scope, name, macro, args);
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
                var eval = new Expr.Evaluator(this.implMap, env, tree, scope);
                eval.eval(cxt);
                r = tree.get().get();
            }
            return r;
        },
        evalByTree: function (env, tree, cxt, scope) {
            var eval = new Expr.Evaluator(this.implMap, env, tree, scope);
            eval.eval(cxt);
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


YIUI.ExprUtil = (function () {
    var Return = {
        //仅拿来处理Dict值
        getImplValue: function (form, key, cxt) {
            var comp = form.getComponent(key), clt = form.getCellLocation(key), value = form.getValue(key);
            value = this.convertValue(value);
//            if (clt) {
//                comp = form.getComponent(clt.key);
//                if (comp.type == YIUI.CONTROLTYPE.GRID) {
//                    var ri = cxt.rowIndex == undefined ? comp.getFocusRowIndex() : cxt.rowIndex;
//                    if (comp.dataModel.data[ri] !== undefined) {
//                        var cellKey = comp.dataModel.data[ri].cellKeys[clt.column],
//                            editOpt = comp.dataModel.colModel.cells[cellKey];
//                        if (editOpt && editOpt.edittype == "dict" && value !== null && value !== undefined) {
//                            value = (typeof  value == "object") ? value.oid : JSON.parse(value).oid;
//                        }
//                    }
//                }
//            }
            return value;
        },
        setImplValue: function(form, key, value, cxt) {
        	var cmp = form.getComponent(key);
    		var cell = form.getCellLocation(key);
        	if(cmp) {
        		form.setComponentValue(key, value);
        	} else if(cell) {
        		var rowIndex = cxt.rowIndex;
        		form.setCellValByKey(cell.key, rowIndex, key, value);
        	}
        	
        },
        convertValue: function(value) {
        	if (value && value instanceof YIUI.ItemData) {
                value = value.getOID();
            } else if($.isObject(value) && value.oid) {
            	value = value.oid;
            }
    		return value;
    	}
    };
    return Return;
})();var View = View || {};
(function () {
	var TblFuns = {
		insert: function(name, cxt, args) {
			var table = cxt.obj;
			var row = table.addRow();
			return row;
		},
		append: function(name, cxt, args) {
			var table = cxt.obj;
			var row = table.addRow();
			return row;
		},
		beforefirst: function(name, cxt, args) {
			var table = cxt.obj;
			table.beforeFirst();
			return true;
		},
		next: function(name, cxt, args) {
			var table = cxt.obj;
			var result = table.next();
			return result;
		},
		size: function(name, cxt, args) {
			var table = cxt.obj;
			return table.size();
		}
	};
	View.TblFunImpl = new HashMap();
	Expr.regCluster(View.TblFunImpl, TblFuns);

	var DocFuns = {
		get: function(name, cxt, args) {
			var doc = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			var table = doc.getByKey(key);
			return table;
		},
		set: function(name, cxt, args) {
			var doc = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			var table = args[1];
			doc.setByKey(key, table);
			return true;
		}
	};
	View.DocFunImpl = new HashMap();
	Expr.regCluster(View.DocFunImpl, TblFuns);

	var JSONObjFuns = {
		length: function(name, cxt, args) {
			var obj = cxt.obj;
			return Object.getOwnPropertyNames(obj).length;
		},
		get: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			return obj[key];
		},
		has: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			return obj.hasOwnProperty(key);
		},
		put: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			var value = args[1];
			obj[key] = value;
			return obj;
		},
		remove: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			delete obj[key];
			return obj;
		}
	};
	View.JSONObjFunImpl = new HashMap();
	Expr.regCluster(View.JSONObjFunImpl, JSONObjFuns);

	var JSONArrFuns = {
		length: function(name, cxt, args) {
			var obj = cxt.obj;
			return obj.length;
		},
		get: function(name, cxt, args) {
			var obj = cxt.obj;
			var index = YIUI.TypeConvertor.toInt(args[0]);
			return obj[index];
		},
		put: function(name, cxt, args) {
			var obj = cxt.obj;
			var index = YIUI.TypeConvertor.toInt(args[0]);
			var value = args[1];
			obj[index] = value;
			return obj;
		},
		remove: function(name, cxt, args) {
			var obj = cxt.obj;
			var index = YIUI.TypeConvertor.toInt(args[0]);
			obj.splice(index, 1);
			return obj;
		}
	};
	View.JSONArrFunImpl = new HashMap();
	Expr.regCluster(View.JSONArrFunImpl, JSONArrFuns);
})();
(function () {
	YIUI.TblValImpl = function (options) {
		var Return = {
	        getValue: function (tbl, id) {
	        	return tbl.getByKey(id);
	        },
	        setValue: function(tbl, id, value) {
	        	tbl.setByKey(id, value);
	        }
	    };
	    return Return;
    };
	YIUI.DocValImpl = function (options) {
		var Return = {
	        getValue: function (doc, id) {
	        	return doc.getByKey(id);
	        },
	        setValue: function(doc, id, value) {
	        	doc.setByKey(id, value);
	        }
	    };
	    return Return;
    };
	YIUI.JSONObjValImpl = function (options) {
		var Return = {
	        getValue: function (json, id) {
	        	return json[id];
	        },
	        setValue: function(json, id, value) {
	        	json[id] = value;
	        }
	    };
	    return Return;
    };
    YIUI.JSONArrValImpl = function (options) {
    	var Return = {
			getValue: function (arr, id) {
				return arr.get(id);
			},
			setValue: function(arr, id, value) {
				arr.put(id, value);
			}
    	};
    	return Return;
    };
})();
UI.BaseFuns = (function () {
    var funs = {};
    var splitPara = function (para) {
        if(!para){
            return null;
        }

        var mapCallback = {}, len = para.length,
                key = "", deep = 0, start = 0;
        for (var i = 0; i < len; i++) {
            var c = para.charAt(i);
            if (c == ':' && deep === 0) {
                key = para.substring(start, i).trim();
            } else if (c == ',' && deep === 0) {
                start = ++i;
            } else if (c == '{') {
                if (deep === 0) {
                    start = ++i;
                }
                deep++;
            } else if (c == '}') {
                deep--;
                if (deep == 0) {
                    mapCallback[key] = para.substring(start, i);
                }
            }
        }

        return mapCallback;
    };
    var processPara = function (cxt) {
        var form = cxt.form;
        if (form != null) {
            var paraCollection = form.getParaCollection();
            if (paraCollection != null) {
                for (var i = 0, len = paraCollection.length; i < len; i++) {
                    var para = paraCollection[i], value;
                    switch (para.type) {
                        case YIUI.ParameterSourceType.CONST:
                            value = para.value;
                            break;
                        case YIUI.ParameterSourceType.FORMULA:
                            value = form.eval(para.formula, cxt);
                            break;
                    }
                    form.setPara(para.key, value);
                }
            }
        }
    };

    funs.Confirm = function (name, cxt, args) {

        //提示框显示样式
        var type = YIUI.Dialog_MsgType.DEFAULT;
        if (args.length > 1) {
            if (args[1] == "YES_NO") {
                type = YIUI.Dialog_MsgType.YES_NO;
            } else if (args[1] == "YES_NO_CANCEL") {
                type = YIUI.Dialog_MsgType.YES_NO_CANCEL;
            }
        }

        var options = {
            msg: YIUI.TypeConvertor.toString(args[0]),
            msgType: type
        };
        var dialog = new YIUI.Control.Dialog(options);
        dialog.render();
        
        var optKey = cxt.optKey;
		if(optKey){
			var option = cxt.form.getOptMap()[optKey];
			if(option) {
				var excpAction = option.opt.excpAction;
				dialog.regExcp(excpAction);
			}
		}
		
        var mapCallback = {};
        if (args.length > 2) {
            if (args[2]) {
                mapCallback = splitPara(args[2]);
            }
        }
        var form = cxt.form;
		dialog.setOwner(form);
        for (var o in mapCallback) {
            dialog.regEvent(o, function (opt) {
                form.eval(mapCallback[opt].trim(), cxt, null);
            });
        }
    };

    funs.GetFormByType = function (name, cxt, args) {
        var paras = {
            cmd: "GetFormByType",
            service: "PureMeta",
            filter: args[0]
        };
        var list = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return list.items;
    };

    funs.GetDictValue = function (name, cxt, args) {
        var itemKey = args[0];
        var oid = args[1];
        var fieldKey = args[2];
        return YIUI.DictService.getDictValue(itemKey, oid, fieldKey);

    };

    funs.GetDictOID = function (name, cxt, args) {
        var itemKey = args[0];
        var fieldKey = args[1];
        var value = args[2];

        var oid = 0;
        var item = YIUI.DictService.locate(itemKey, fieldKey, value);
        if (item) {
            oid = item.oid;
        }

        return oid;
    };

    funs.ClearSelection = function (name, cxt, args) {
        var controlKey = args[0];
        var form = cxt.form;
        var cmp = form.getComponent(controlKey);
        if (cmp && cmp.type == YIUI.CONTROLTYPE.DICTVIEW) {
            cmp.clearSelection();
        }
    };

    funs.CopyNew = function (name, cxt, args) {
        var form = cxt.form;
        var opt = new YIUI.CopyNewOpt(form);
        opt.doOpt();
        return true;
    };

    funs.ClearAllRows = function (name, cxt, args) {
        var form = cxt.form, key = args[0], comp = form.getComponent(key);
        if (comp) {
            switch (comp.type) {
                case YIUI.CONTROLTYPE.LISTVIEW:
                    comp.clearAllRows();
                    comp.repaint();
                    break;
                case YIUI.CONTROLTYPE.GRID:
                    var grid = comp;
                    var row, len = grid.getRowCount();
                    for (var i = len - 1; i >= 0; i--) {
                        row = grid.getRowDataAt(i);
                        if (row.isDetail && row.bookmark !== undefined) {
                            grid.clearAllSubDetailData(i);
                            grid.deleteGridRow(i);
                        }
                    }
                    grid.refreshGrid();
                    break;
                default:
                    break;
            }
        }

    };

    funs.ToLongArray = function (name, cxt, args) {
        //参数
        var arrs = [];
        var obj = args[0];
        if ($.isString(obj)) {
            var str = obj.split(",");
            for (var i = 0, len = str.length; i < len; i++) {
                var arr = YIUI.TypeConvertor.toLong(str[i]);
                arrs.push(arr);
            }
        } else if ($.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                var arr;
                var o = obj[i];
                if (o instanceof YIUI.ItemData) {
                    arr = o.getOID();
                }
                arrs.push(arr);
            }
        }
        return arrs;
    };

    funs.ToJSONArray = function (name, cxt, args) {
        var arrs = [];
        var obj = args[0];
        if ($.isString(obj)) {
            var str = obj.split(",");
            for (var i = 0, len = str.length; i < len; i++) {
                var arr = $.toJSON(str[i]);
                arrs.push(arr);
            }
        } else if ($.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                var arr;
                var o = obj[i];
                if (o instanceof YIUI.ItemData) {
                    arr = o.toJSON();
                }
                arrs.push(arr);
            }
        }
        return arrs;
    };

    funs.UICheck = function (name, cxt, args) {
        var form = cxt.form, uiCheckOpt = new YIUI.UICheckOpt(form);
        uiCheckOpt.doOpt();
    };

    funs.ChangePWD = function (name, cxt, args) {
        var operatorID = args[0];
        var password = args[1];
        var newPassword = args[2];

        var rsa = new RSAKey();
        var publicKey = Svr.SvrMgr.getPublicKey({async: false});
        rsa.setPublic(publicKey.modulus, publicKey.exponent);
        password = rsa.encrypt(password);
        password = BASE64.encoder(password);

        newPassword = rsa.encrypt(newPassword);
        newPassword = BASE64.encoder(newPassword);

        var paras = {
            service: "SessionRights",
            cmd: "ChangePWD",
            operatorID: operatorID.toString(),
            password: password,
            newPassword: newPassword
        };
        Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
    };
    funs.New = function (name, cxt, args) {
        var formKey = args[0];
        var target = YIUI.FormTarget.NEWTAB;
        if (args.length > 1) {
            target = YIUI.FormTarget.parse(args[1]);
        }
        var tsParas;
        if (args.length > 2) {
            tsParas = args[2];
        }
        if (target != YIUI.FormTarget.SELF) {
            var params = {formKey: formKey, cmd: "PureNewForm"};
            if (tsParas) {
                tsParas = splitPara(tsParas);
                for (var key in tsParas) {
                    var value = cxt.form.eval(tsParas[key], cxt);
                    cxt.form.setCallPara(key, value);
                }
                var callParas = cxt.form.getCallParas();
                params.callParas = JSON.stringify(callParas.getMap());
            }
            var success = function (jsonObj) {
                var form = YIUI.FormBuilder.build(jsonObj, target, cxt.form.formID);
                var container = cxt.form.getContainer();
                if (target != YIUI.FormTarget.MODAL) {
                    if (target == YIUI.FormTarget.STACK) {
                    	form.isStack = true;
                    }
                    container.build(form);
                }
                form.setOperationState(YIUI.Form_OperationState.New);
                form.resetUIStatus(YIUI.FormUIStatusMask.ENABLE | YIUI.FormUIStatusMask.VISIBLE | YIUI.FormUIStatusMask.OPERATION);
                form.getUIProcess().checkAll();
                form.initFirstFocus();
            };
            Svr.SvrMgr.dealWithPureForm(params, success);

        } else {
            var opt = new YIUI.NewOpt(cxt.form, true);
            opt.doOpt();
        }

    };

    funs.Show = function (name, cxt, args) {
        var form = cxt.form;
        var formKey = args[0];
        var container = form.getContainer();
        var target = YIUI.FormTarget.NEWTAB;
        if (args.length > 1) {
            target = YIUI.FormTarget.parse(args[1]);
        }
        var params = {formKey: formKey, cmd: "PureShowForm"};
        var success = function (jsonObj) {
            var newForm = YIUI.FormBuilder.build(jsonObj, target, form.formID);
            var container = form.getContainer();
            if (target != YIUI.FormTarget.MODAL) {
            	if (target == YIUI.FormTarget.STACK) {
            		newForm.isStack = true;
                }
                container.build(newForm);
            }
            newForm.resetUIStatus(YIUI.FormUIStatusMask.ENABLE | YIUI.FormUIStatusMask.VISIBLE | YIUI.FormUIStatusMask.OPERATION);
            newForm.getUIProcess().checkAll();
            newForm.initFirstFocus();
        };
        Svr.SvrMgr.dealWithPureForm(params, success);
        return true;
    };

    funs.Load = function (name, cxt, args) {
        var form = cxt.form;
        var loadOpt = new YIUI.LoadOpt(form);
        loadOpt.doOpt();
    };

    funs.Edit = function (name, cxt, args) {
        var form = cxt.form;
        var editOpt = new YIUI.EditOpt(form);
        editOpt.doOpt();
    };

    funs.Open = function (name, cxt, args) {
        var form = cxt.form;
        var formKey = args[0], OID = args[1];
        var container = form.getContainer();
        var target = YIUI.FormTarget.NEWTAB;
        if (args.length > 2) {
            target = YIUI.FormTarget.parse(args[2]);
        }
        var tsParas;
        if (args.length > 3) {
            tsParas = args[3];
        }
        var params = {formKey: formKey, oid: OID.toString(), cmd: "PureOpenForm"};
        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = form.eval(tsParas[key], cxt);
                cxt.form.setCallPara(key, value);
            }
            var callParas = form.getCallParas();
            params.callParas = JSON.stringify(callParas.getMap());
        }
        var success = function (jsonObj) {
            if (target == YIUI.FormTarget.SELF) {
                YIUI.UIUtil.replaceForm(form, jsonObj, cxt);
                return;
            }
            var newForm = YIUI.FormBuilder.build(jsonObj, target, form.formID);
            if (target != YIUI.FormTarget.MODAL) {
            	if (target == YIUI.FormTarget.STACK) {
            		newForm.isStack = true;
                }
                container.build(newForm);
            }
            newForm.setOperationState(YIUI.Form_OperationState.Default);
            newForm.pFormID = form.formID;
        };
        Svr.SvrMgr.dealWithPureForm(params, success);
        return true;
    };

    funs.Save = function (name, cxt, args) {
        var saveOpt = YIUI.SaveOpt(cxt.form);
        saveOpt.doOpt();
    };

    funs.SaveData = function (name, cxt, args) {
        var form = cxt.form, uiCheckOpt = new YIUI.UICheckOpt(form);
        if (!uiCheckOpt.doOpt()) return false;
        var formDocument = form.getDocument(),
            copyDoc = $.extend(true, {}, formDocument);
        var gridMap = form.getGridInfoMap(), tableKey, shadowTableKey, shadowTable;
        for (var i = 0, len = gridMap.length; i < len; i++) {
            tableKey = gridMap[i].tableKey;
            shadowTableKey = YIUI.DataUtil.getShadowTableKey(tableKey);
            shadowTable = copyDoc.getByKey(shadowTableKey);
            if (shadowTable != undefined || shadowTable != null) {
                copyDoc.remove(tableKey);
                shadowTable.key = tableKey;
            }
        }
        var document = YIUI.DataUtil.toJSONDoc(copyDoc);
        processPara(cxt);
        var paras = form != null ? form.getParas() : null;
        var params = {
            cmd: "PureSaveData",
            parameters: paras.toJSON(),
            document: $.toJSON(document),
            formKey: form.getFormKey()
        };
        var resultJson = Svr.SvrMgr.dealWithPureData(params);
        YIUI.UIUtil.replaceForm(form, resultJson, cxt);
        return true;
    };

    funs.LoadData = function (name, cxt, args) {
        var form = cxt.form;
        processPara(cxt);
        var paras = form != null ? form.getParas() : null;
        var params = {
            cmd: "PureLoadData",
            oid: form.getDocument().oid,
            form: form.toJSON(),
            formKey: form.getFormKey(),
            parameters: paras.toJSON(),
            filterMap: $.toJSON(form.getFilterMap()),
            condition: $.toJSON(form.getCondParas())
        };
        var result = Svr.SvrMgr.loadFormData(params);

        if ($.isEmptyObject(result.form)) return;

        YIUI.FormBuilder.diff(form, result);
//        var newForm = YIUI.FormBuilder.build(result);
//        cxt.form = newForm;
//        YIUIContainer.close(form);
//        YIUIContainer.add(newForm);
//        newForm.resetUIStatus(YIUI.FormUIStatusMask.ENABLE | YIUI.FormUIStatusMask.VISIBLE | YIUI.FormUIStatusMask.OPERATION);
//        newForm.getUIProcess().checkAll();
//        newForm.initFirstFocus();


    };

    funs.ShowData = function (name, cxt, args) {
        var form = cxt.form;
//		form.showDocument();

    };

    funs.DealCondition = function (name, cxt, args) {

        var isParent = false;
        if (args.length > 0) {
            isParent = args[0];
        }
        var form = cxt.form;
        var target = (isParent && form.getParentForm() != null) ? form.getParentForm() : form;
        var condFomKey = null;
        condFomKey = form.getFormKey();
        var paras = target.getCondParas();
        if ($.isEmptyObject(paras)) {
            paras = new ConditionParas();
            target.setCondParas(paras);
        } else {
            paras.clear();
        }
        paras.setCondFormKey(condFomKey);
        var comp = null;
        var condition = null;
        var condItem = null;
        var value = null;
        var compList = form.getComponentList();
        for (var i in compList) {
            var cmp = compList[i];
            if (cmp.value && cmp.condition) {
                condition = cmp.condition;
                value = cmp.value;
                if (cmp.type == YIUI.CONTROLTYPE.DATEPICKER) {
                    value = cmp.getValue().getTime();
                } else if (cmp.type == YIUI.CONTROLTYPE.NUMBEREDITOR) {
                    if (value == 0) continue;
                } else if (cmp.type == YIUI.CONTROLTYPE.COMPDICT
                    || cmp.type == YIUI.CONTROLTYPE.DICT
                    || cmp.type == YIUI.CONTROLTYPE.DYNAMICDICT) {

                    if (cmp.multiSelect) {
                        if (value.length == 1 && value[0].oid == 0) {
                            continue;
                        }
                        //多选的情况 添加界面过滤条件。 汇总节点选中， 并非所有子节点 都显示。
                        cmp.checkDict();
                        var filter = cmp.getDictTree().dictFilter;
                        if (filter != null) {
                            condition.filter = filter;
                        }
                    }
                    condition.itemKey = cmp.itemKey;
                    condition.stateMask = cmp.stateMask;
                }
                condition.value = value;
                paras.add(condition);
            } else if (cmp.condition && cmp.condition.limitToSource) {
                condition = cmp.condition;
                if (cmp.type == YIUI.CONTROLTYPE.COMPDICT
                    || cmp.type == YIUI.CONTROLTYPE.DICT
                    || cmp.type == YIUI.CONTROLTYPE.DYNAMICDICT) {

                    //多选的情况 添加界面过滤条件。 汇总节点选中， 并非所有子节点 都显示。
                    cmp.checkDict();
                    var filter = cmp.getDictTree().dictFilter;
                    if (filter == null) {
                        continue;
                    }

                    condition.filter = filter;
                    condition.itemKey = cmp.itemKey;
                    condition.stateMask = cmp.stateMask;
                    paras.add(condition);
                }

            }
        }
        var filterMap = form.getFilterMap().filterMap;
        for (var i = 0, len = filterMap.length; i < len; i++) {
            filterMap[i].startRow = 0;
        }
    };

    funs.ReadOnly = function (name, cxt, args) {
        var form = cxt.form;
        var operationState = -1;
        if (form != null) {
            operationState = form.getOperationState();
        }
        return operationState == YIUI.Form_OperationState.Default;
    };

    funs.Cancel = function (name, cxt, args) {
        var form = cxt.form;
        if (form.getOperationState() == YIUI.Form_OperationState.New) {
            form.close();
        } else if (form.getOperationState() == YIUI.Form_OperationState.Edit) {
            var formKey = form.formKey,
                OID = form.OID;
            var params = {formKey: formKey, oid: OID, cmd: "PureOpenForm", async: false};
            var success = function (jsonObj) {
                if (form.getContainer()) {
                    YIUI.UIUtil.replaceForm(form, jsonObj, cxt);
                } else {
                    YIUI.FormBuilder.diff(form, jsonObj);
                }
            };
            Svr.SvrMgr.dealWithPureForm(params, success);
        }
    };

    funs.SetEnable = function (name, cxt, args) {
        var form = cxt.form,
            controlKey = args[0],
            enable = args[1],
            cmp = form.getComponent(controlKey);
        if (cmp != null) {
            cmp.setEnable(enable);
        }
    };

    funs.GetClusterID = function (name, cxt, args) {
        var id = $.cookie("clusterid") || -1;
        return parseInt(id);
    };

    funs.OpenDict = function (name, cxt, args) {
        var pForm = cxt.form;
        var formKey = args[0],
            OID = YIUI.TypeConvertor.toString(args[1]);
        //参数3保留

        var tsParas;
        if (args.length > 3) {
            tsParas = args[3];
        }

        var params = {
            async: false,
            formKey: formKey,
            oid: OID,
            cmd: "PureOpenForm"
        };

        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = pForm.eval(tsParas[key], cxt);
                pForm.setCallPara(key, value);
            }
            var callParas = pForm.getCallParas();
            params.callParas = JSON.stringify(callParas.getMap());
        }

        var success = function (jsonObj) {
            var form = YIUI.FormBuilder.build(jsonObj);
            var container = pForm.getDefContainer();
            if (!container) {
                container = pForm.getContainer();
            }
            container.build(form, null, pForm.formID);
            if (pForm.mergeOpt) {
                var expOpts = {
                    formID: form.formID,
                    items: form.options
                };
                pForm.expOpts = expOpts;
            }
            pForm.getUIProcess().resetUIStatus(YIUI.FormUIStatusMask.OPERATION);
        };
        Svr.SvrMgr.dealWithPureForm(params, success);

    };

    funs.NewDict = function (name, cxt, args) {
        var formKey = args[0];
        var pForm = cxt.form;
        //参数2保留
        var tsParas;
        if (args.length > 2) {
            tsParas = args[2];
        }

        var params = {
            async: false,
            formKey: formKey,
            cmd: "PureNewForm"
        };

        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = pForm.eval(tsParas[key], cxt);
                pForm.setCallPara(key, value);
            }
            var callParas = pForm.getCallParas();
            params.callParas = JSON.stringify(callParas.getMap());
        }

        var success = function (jsonObj) {
            var form = YIUI.FormBuilder.build(jsonObj, null, pForm.formID);
            var container = pForm.getDefContainer();
            if (!container) {
                container = pForm.getContainer();
            }
            container.build(form);
            if (pForm.mergeOpt) {
                var expOpts = {
                    formID: form.formID,
                    items: form.options
                };
                pForm.expOpts = expOpts;
            }
            pForm.getUIProcess().resetUIStatus(YIUI.FormUIStatusMask.OPERATION);
        };
        var resultJson = Svr.SvrMgr.dealWithPureForm(params, success);
    };

    var doMap = function (name, cxt, args) {
        if (args.length < 2)
            YIUI.ViewException.throwException(YIUI.ViewException.NO_KEY_TARGET_BILL);
        var form = cxt.form,
            mapKey = args[0],
            toNewForm = true,
            tgFormKey = args[1],
            formDoc = form.getDocument() ,
            copyDoc = formDoc.clone();
        var gridMap = form.getGridInfoMap(), tableKey, shadowTableKey, shadowTable;
        for (var i = 0, len = gridMap.length; i < len; i++) {
            tableKey = gridMap[i].tableKey;
            shadowTableKey = YIUI.DataUtil.getShadowTableKey(tableKey);
            shadowTable = copyDoc.getByKey(shadowTableKey);
            if (shadowTable != undefined || shadowTable != null) {
                copyDoc.remove(tableKey);
                shadowTable.key = tableKey;
            }
        }
        var doc = YIUI.DataUtil.toJSONDoc(copyDoc);
        var params = {
            tgFormKey: tgFormKey,
            srcFormKey: form.formKey,
            srcDoc: $.toJSON(doc),
            cmd: "PureMap",
            toNewForm: toNewForm,
            mapKey: mapKey
        };
        var resultJson = Svr.SvrMgr.doMapEvent(params);
        var newForm = YIUI.FormBuilder.build(resultJson);
        var container = form.getContainer();
        container.build(newForm);
        newForm.pFormID = form.formID;

        var mapWorkitemInfo = false;
        if (args.length > 2)
            mapWorkitemInfo = YIUI.TypeConvertor.toBoolean(args[2]);

        if (mapWorkitemInfo) {
            var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
            var newDoc = newForm.getDocument();
            newDoc.putExpandData(YIUI.BPMKeys.SaveBPMMap_KEY, info.WorkitemID);
            newDoc.expDataType[YIUI.BPMKeys.SaveBPMMap_KEY] = YIUI.ExpandDataType.LONG;
        }
		if (args.length > 3){
			var postFormula = YIUI.TypeConvertor.toString(args[3]);
			newForm.eval(postFormula, {form: newForm}, null);
		}
    };

    funs.Map = function (name, cxt, args) {
        doMap(name, cxt, args);
    };

    funs.MidMap = function (name, cxt, args) {
        doMap(name, cxt, args);
    };

    funs.MapEx = function (name, cxt, args) {
        var form = cxt.form;
        var mapKey = YIUI.TypeConvertor.toString(args[0]);
        if (args.length < 2) {
            YIUI.ViewException.throwException(YIUI.ViewException.MAP_MISS_FORMKEY);
        }
        var formKey = YIUI.TypeConvertor.toString(args[1]);
        var srcOID = YIUI.TypeConvertor.toLong(args[2]);
        var params = {
            formKey: formKey,
            srcOID: srcOID,
            cmd: "PureMapEx",
            mapKey: mapKey
        };
        var resultJson = Svr.SvrMgr.doMapEvent(params);
        var newForm = YIUI.FormBuilder.build(resultJson);
        var container = form.getContainer();
        container.build(newForm);
        newForm.pFormID = form.formID;

        return true;
    };

    funs.AutoMap = function (name, cxt, args) {
        var mapKey = YIUI.TypeConvertor.toString(args[0]);
        var form = cxt.form,
            formKey = form.formKey,
            formDoc = form.getDocument(),
            copyDoc = formDoc.clone();
        var gridMap = form.getGridInfoMap(), tableKey, shadowTableKey, shadowTable;
        for (var i = 0, len = gridMap.length; i < len; i++) {
            tableKey = gridMap[i].tableKey;
            shadowTableKey = YIUI.DataUtil.getShadowTableKey(tableKey);
            shadowTable = copyDoc.getByKey(shadowTableKey);
            if (shadowTable != undefined || shadowTable != null) {
                copyDoc.remove(tableKey);
                shadowTable.key = tableKey;
            }
        }
        var doc = YIUI.DataUtil.toJSONDoc(copyDoc);

        // 执行数据映射
        var params = {
            formKey: formKey,
            cmd: "PureAutoMap",
            srcDoc: $.toJSON(doc),
            mapKey: mapKey
        };
        var resultJson = Svr.SvrMgr.doMapEvent(params);
        return true;
    };

    var mapInForm = function (form, mapKey, formKey, toNewForm) {
        var tgFormKey = null,
            toNewForm = toNewForm;
        var formDoc = null;
        var pForm = null;
        if (!toNewForm) {
            pForm = YIUI.FormStack.getForm(form.pFormID);
            tgFormKey = pForm.formKey;
        } else {
            tgFormKey = formKey;
        }
        formDoc = form.getDocument();
        var copyDoc = formDoc.clone();
        var gridMap = form.getGridInfoMap(), tableKey, shadowTableKey, shadowTable;
        for (var i = 0, len = gridMap.length; i < len; i++) {
            tableKey = gridMap[i].tableKey;
            shadowTableKey = YIUI.DataUtil.getShadowTableKey(tableKey);
            shadowTable = copyDoc.getByKey(shadowTableKey);
            if (shadowTable != undefined || shadowTable != null) {
                copyDoc.remove(tableKey);
                shadowTable.key = tableKey;
            }
        }
        var doc = YIUI.DataUtil.toJSONDoc(copyDoc);

        var params = {
            tgFormKey: tgFormKey,
            srcFormKey: form.formKey,
            srcDoc: $.toJSON(doc),
            cmd: "PureMap",
            toNewForm: toNewForm,
            mapKey: mapKey
        };
        if (toNewForm) {
            var resultJson = Svr.SvrMgr.doMapEvent(params);
            var newForm = YIUI.FormBuilder.build(resultJson);
            var container = form.getContainer();
            container.build(newForm);
        } else {
            var result = Svr.SvrMgr.doMapEvent(params);
            var gridKey = result.key;
            var pGrid = pForm.getComponent(gridKey), dataTable;
            if (result.dataTable) {
                dataTable = YIUI.DataUtil.fromJSONDataTable(result.dataTable);
                //            pForm.getDocument().setByKey(pGrid.tableKey, dataTable);
            }
            pGrid.addGridRows(result.data, dataTable, false);

            var calcProcess = new YIUI.UICalcProcess(pForm);
            var affectItems = pForm.dependency.calcTree.affectItems,
                item, expItems, expItem, value, comp;
            for (var i = 0, len = affectItems.length; i < len; i++) {
                item = affectItems[i];
                var col = pGrid.dataModel.colModel.cells[item.key];
                if (!col) continue;
                expItems = item.expItems;
                for (var j = 0, length = expItems.length; j < length; j++) {
                    expItem = expItems[j];
                    comp = pForm.getComponent(expItem.source);
                    if (comp && comp.type != YIUI.CONTROLTYPE.GRID) {
                        value = calcProcess.getCalcValue(expItem);
                        comp.setValue(value, true, false);
                    }
                }
            }
        }
    };

    funs.ViewMap = function (name, cxt, args) {
        if (args.length > 1) {
            var toNewForm = YIUI.TypeConvertor.toBoolean(args[1]);
            if (toNewForm) {
                YIUI.ViewException.throwException(YIUI.ViewException.DATA_BINDING_ERROR);
            }
        }
        return UI.BaseFuns.MapToForm(name, cxt, args);
    };

    funs.MapToForm = function (name, cxt, args) {
        var form = cxt.form,
            mapKey = args[0];
        mapInForm(form, mapKey, null, false);
        return true;
    };

    funs.HasDataMaped = function (name, cxt, args) {
        var form = cxt.form;
        var doc = form.getDocument();
        if (doc.isNew())
            return false;
        var tbls = doc.tbls;
        for (var i = 0, len = tbls.length; i < len; i++) {
            var tbl = tbls[i];
            if (!tbl) continue;
            tbl.beforeFirst();
            while (tbl.next()) {
                var count = tbl.getByKey(YIUI.SystemField.MAPCOUNT_SYS_KEY);
                if (count && count > 0)
                    return true;
            }
        }
        return false;
    };

    {
        //ViewBatchProcessFunction
        funs.BatchDeleteData = function (name, cxt, args) {
            var form = cxt.form;
            var objectKey = YIUI.TypeConvertor.toString(args[0]);
            var tableKey = YIUI.TypeConvertor.toString(args[1]);
            var OIDFieldKey = YIUI.SystemField.OID_SYS_KEY;
            if (args.length > 2)
                OIDFieldKey = YIUI.TypeConvertor.toString(args[2]);
            var OIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, OIDFieldKey, false);
            var params = {
                cmd: "BatchDeleteData",
                ObjectKey: objectKey,
                OIDListStr: $.toJSON(OIDList)
            };
            Svr.SvrMgr.delPureData(params);
            return true;
        };
        funs.BatchMap = function (name, cxt, args) {
            var mapKey = args[0];
            var tblKey = args[1];
            var fieldKey = args[2];
            var form = cxt.form;

            var comp;
            var lv = form.getListView(tblKey);
            var grid = form.getGridInfoByTableKey(tblKey);
            var oids = [];
            if (lv) {
                oids = lv.getFieldArray(form, fieldKey);
            } else if (grid) {
                oids = grid.getFieldArray(form, fieldKey);
            }

            var paras = {
                mapKey: mapKey,
                cmd: "PureBatchMap",
                oidList: $.toJSON(oids)
            };
            var resultJson = Svr.SvrMgr.doMapEvent(paras);

        };
    }

    funs.ShowModal = function (name, cxt, args) {
        var pForm = cxt.form, formKey = args[0], tsParas = args[1], callbackList = args[2];
        var paras = {formKey: formKey, cmd: "PureShowForm"}, callBack = {};
        if (callbackList) {
            paras.callbackList = callbackList;
            callBack = splitPara(callbackList);
        }
        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = pForm.eval(tsParas[key], cxt);
                pForm.setCallPara(key, value);
            }
            var callParas = pForm.getCallParas();
            paras.callParas = JSON.stringify(callParas.getMap());
        }
        var success = function (jsonObj) {
            var newForm = YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, pForm.formID);
            for (var o in callBack) {
                newForm.regEvent(o, function (opt) {
                    pForm.eval(callBack[opt].trim(), cxt, null);
                });
            }
        };
        Svr.SvrMgr.dealWithPureForm(paras, success);

    };

    funs.doEventCallback = function (name, cxt, args) {
        var form = cxt.form;
        var event = form.getEventCallback(args[0]);
        event.doTask();
    };

    funs.CloseTo = function (name, cxt, args) {
    	var form = cxt.form;
        var targetKey = args[0];
        var container = form.getContainer();
        container.closeTo(targetKey);
    };

    funs.Close = function (name, cxt, args) {
        var form = cxt.form;
        form.fireClose();
    };

    funs.Para = function (name, cxt, args) {
        var form = cxt.form;
        return form.getPara(args[0]);
    };

    funs.GetDataObjectKey = function (name, cxt, args) {
        var form = cxt.form;
        var formKey = form.formKey;
        if (args.length > 0) {
        } else {
            return form.getDataObjectKey();
        }
        if (args[0]) {
            formKey = args[0];
        }
        var params = {formKey: formKey, cmd: "GetDBKey"};
        var dbKey = Svr.SvrMgr.doDictViewEvent(params);
        return dbKey;
    };

    funs.GetOID = function (name, cxt, args) {
        var form = cxt.form;
        var oid = -1;
        if (form) {
            var doc = form.getDocument();
            if (doc) {
                oid = doc.oid;
            }
        }
        return oid;
    };

    funs.GetInitOperationState = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getInitOperationState();
        }

        return state;
    };

    funs.DeleteData = function (name, cxt, args) {
        var form = cxt.form;
        var formDoc = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(formDoc);
        var oid = doc.oid;
        processPara(cxt);
        var paras = form != null ? form.getParas() : null;
        var params = {
            oid: oid,
            cmd: "DeleteFormData",
            parameters: paras.toJSON(),
            formKey: form.getFormKey()
        };
        Svr.SvrMgr.delPureData(params);

        form.setInitOperationState(YIUI.Form_OperationState.Delete);
        form.setOperationState(YIUI.Form_OperationState.Delete);


        return true;
    };

    funs.ShowDictView = function (name, cxt, args) {
        var form = cxt.form;

    };


    funs.EnabledDict = function (name, cxt, args) {
        var form = cxt.form;
        var itemKey = args[0];
        var oid = args[1];
        var enable = 1;
        var allChildren = true;

        if (args.length > 2) {
            enable = args[2];
        }

        if (args.length > 3) {
            allChildren = args[3];
        }

        YIUI.DictService.enableDict(itemKey, oid, enable, allChildren);
        form.setInitOperationState(YIUI.Form_OperationState.Edit);
        return true;

    };

    funs.IsNew = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getOperationState();
        }
        return state == YIUI.Form_OperationState.New;
    };

    funs.IsNewOrEdit = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getOperationState();
        }
        return state == YIUI.Form_OperationState.Edit || state == YIUI.Form_OperationState.New;

    };

    funs.SetValue = function (name, cxt, args) {
        var form = cxt.form;
        var controlKey = args[0], value = args[1];

        var fireEvent = false;
        if (args.length > 2) {
            if (args[2] === true || args[2] === "true") fireEvent = true;
        }
        form.setComponentValue(controlKey, value, fireEvent);
    };

    funs.GetValue = function (name, cxt, args) {
        var form = cxt.form;
        var controlKey = args[0];
        return YIUI.ExprUtil.getImplValue(form, controlKey, cxt);
    };

    funs.CommitValue = function (name, cxt, args) {
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var comp = form.getComponent(key);
        comp.commitValue();
        return true;
    };

    funs.RollbackValue = function (name, cxt, args) {
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var comp = form.getComponent(key);
        comp.rollbackValue();
        return true;
    };

    funs.SumExpand = function (name, cxt, args) {
        var count = new Decimal(0), form = cxt.form, cellKey = args[0], ri = cxt.rowIndex,
            cLoc = form.getCellLocation(cellKey), grid = form.getComponent(cLoc.key);
        if (grid == undefined) return count;
        var gr = grid.getRowDataAt(ri), isMatch = false, cellV;
        if (gr) {
            for (var i = 0, len = gr.cellKeys.length; i < len; i++) {
                if (gr.cellKeys[i] == cellKey) {
                    cellV = grid.getValueAt(ri, i);
                    if (cellV != null) {
                        count = count.plus(cellV);
                    }
                    isMatch = true;
                } else {
                    if (isMatch)break;
                }
            }
        }
        return count;
    };

    funs.Sum = function (name, cxt, args) {
        var form = cxt.form, cellKey = args[0].toString(),
            cellLoc = form.getCellLocation(cellKey),
            grid = form.getComponent(cellLoc.key);
        if (grid == undefined) return 0;
        var sumInGrid = function (grid, rowIndex, colIndex) {
            var count = new Decimal(0), len = grid.getRowCount(), rowData = grid.getRowDataAt(rowIndex), value;
            switch (rowData.rowType) {
                case "Fix":
                case "Total":
                    var colInfoes = grid.getColInfoByKey(cellKey), isMatch = false;
                    if (colInfoes != null) {
                        for (var j = 0, jlen = colInfoes.length; j < jlen; j++) {
                            if (colIndex == colInfoes[j].colIndex) {
                                isMatch = true;
                                break;
                            }
                        }
                    }
                    if (isMatch) {
                        for (var i = 0, rlen = grid.getRowCount(); i < rlen; i++) {
                            rowData = grid.getRowDataAt(i);
                            if (rowData.isDetail && rowData.bookmark != null) {
                                value = rowData.data[colIndex][0];
                                if (value !== null) {
                                    count = count.plus(value);
                                }
                            }
                        }
                    } else {
                        sumOutGrid(grid, cellKey);
                    }
                    break;
                case "Group":
                    if (rowData.isGroupHead) {
                        for (var nextRi = rowIndex + 1; nextRi < len; nextRi++) {
                            var nextRD = grid.getRowDataAt(nextRi);
                            if (nextRD.rowGroupLevel == rowData.rowGroupLevel) {
                                break;
                            }
                            if (nextRD.isDetail && nextRD.bookmark != null) {
                                value = nextRD.data[colIndex][0];
                                if (value !== null) {
                                    count = count.plus(value);
                                }
                            }
                        }
                    } else if (rowData.isGroupTail) {
                        for (var preRi = rowIndex - 1; preRi >= 0; preRi--) {
                            var preRD = grid.getRowDataAt(preRi);
                            if (preRD.rowGroupLevel == rowData.rowGroupLevel) {
                                break;
                            }
                            if (preRD.isDetail && preRD.bookmark != null) {
                                value = preRD.data[colIndex][0];
                                if (value !== null) {
                                    count = count.plus(value);
                                }
                            }
                        }
                    }
                    break;
            }
            return count;
        };
        var sumOutGrid = function (grid, cellKey) {
            var rowData, colInfoes, colIndex, count = new Decimal(0), value;
            for (var i = 0, len = grid.getRowCount(); i < len; i++) {
                rowData = grid.getRowDataAt(i);
                if (rowData.isDetail && rowData.bookmark != null) {
                    colInfoes = grid.getColInfoByKey(cellKey);
                    if (colInfoes == null) continue;
                    for (var j = 0, jlen = colInfoes.length; j < jlen; j++) {
                        colIndex = colInfoes[j].colIndex;
                        value = rowData.data[colIndex][0];
                        if (value !== null) {
                            count = count.plus(value);
                        }
                    }
                }
            }
            return count;
        };
        var targetCellLocation = form.getCellLocation(cxt.target);
        if (targetCellLocation == null || targetCellLocation.key != grid.key) {
            return sumOutGrid(grid, cellKey);
        } else if (cxt.rowIndex !== undefined && cxt.colIndex != undefined && cellLoc !== undefined) {
            return sumInGrid(grid, cxt.rowIndex, cxt.colIndex);
        } else {
            return sumOutGrid(grid, cellKey);
        }
    };

    funs.UpdateView = function (name, cxt, args) {
        updateView(cxt);
    };

    var updateView = function (cxt) {
        var form = cxt.form;
        var tag = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW);
        if (tag == YIUI.BPMConstants.WORKITEM_VIEW) {
            return;
        }
        var pFormID = form.pFormID;
        if (!pFormID) {
            return true;
        }
        var viewForm = YIUI.FormStack.getForm(pFormID);
        if (!viewForm || viewForm.type != YIUI.Form_Type.View) {
            return;
        }

        var doc = form.getDocument();
        var viewDoc = viewForm.getDocument();
        var OID = doc.oid;
        var viewFound = false;
        var mTblKey = viewForm.mainTableKey;
        var listView = null;
        if (mTblKey) {
            listView = viewForm.getListView(mTblKey);
        } else {
            listView = viewForm.getListView(0);
        }
        if (!listView) return;
        var rowCount = listView.getRowCount();
        var row = -1, colKey;
        for (var cInfo, ci = 0, len = listView.columnInfo.length; ci < len; ci++) {
            cInfo = listView.columnInfo[ci];
            if (cInfo.columnKey == YIUI.SystemField.OID_SYS_KEY) {
                colKey = cInfo.key;
                break;
            }
        }
        if (!colKey) return;
        for (var i = 0; i < rowCount; i++) {
            if (listView.getValByKey(i, colKey) == OID) {
                row = i;
                break;
            }
        }
        if (form.getOperationState() == YIUI.Form_OperationState.Delete) {
            listView.deleteRow(row);
        } else {
            var data = {};
            var compList = form.getComponentList();
            var columnInfo = listView.columnInfo;

            $.each(columnInfo, function (i, column) {
                var tbl, val;
                //下拉框 多选下拉框 字典 数值框 日期控件， 因为值和显示值不一致， 先从控件取  ， 之后再填到界面上
                if (column.columnType == YIUI.CONTROLTYPE.COMBOBOX
                    || column.columnType == YIUI.CONTROLTYPE.CHECKLISTBOX
                    || column.columnType == YIUI.CONTROLTYPE.DICT
                    || column.columnType == YIUI.CONTROLTYPE.NUMBEREDITOR
                    || column.columnType == YIUI.CONTROLTYPE.DATEPICKER
                    || column.columnType == YIUI.CONTROLTYPE.TEXTEDITOR) {
                    var exists = false;
                    $.each(compList, function (i, comp) {
                        if (column.columnKey && comp.getMetaObj().columnKey == column.columnKey) {
                            var text = comp.getText();
                            var value = comp.getValue();
                            if (column.columnType == YIUI.CONTROLTYPE.NUMBEREDITOR) {
                                var settings = {
                                    //组大小
                                    dGroup: column.groupingSize,
                                    //小数位数
                                    mDec: column.decScale,
                                    //四舍五入方式
                                    mRound: column.roundingMode
                                };
                                text = YIUI.DecimalFormat.format(value, settings);
                            } else if (column.columnType == YIUI.CONTROLTYPE.TEXTEDITOR) {
                                text = YIUI.TextFormat.format(value, column);
                            } else if (column.columnType == YIUI.CONTROLTYPE.DATEPICKER) {
                                text = YIUI.DateFormat.format(value, column);
                            }
                            data[column.key] = {
                                'value': value,
                                'caption': text
                            };
                            exists = true;
                            return;
                        }
                    });

                    if (!exists) {
                        tbl = doc.getByKey(column.tableKey);
                        if (tbl && tbl.first() && column.columnKey) {
                            val = tbl.getByKey(column.columnKey);
                            data[column.key] = {
                                'value': val,
                                'caption': val
                            };
                        }
                    }
                } else {
                    data[column.key] = {
                        'value': column.value || "",
                        'caption': column.value || column.caption || ""
                    };
                    if (column.defaultValue) {
                        data[column.key] = {
                            'value': column.defaultValue,
                            'caption': column.defaultValue
                        };
                    }
                    if (column.defaultFormula) {
                        var value = viewForm.eval(column.defaultFormula, {form: viewForm, rowIndex: row}, null);
                        data[column.key] = {
                            'value': YIUI.TypeConvertor.toString(value),
                            'caption': YIUI.TypeConvertor.toString(value)
                        };
                    }
                    if (column.tableKey) {
                        tbl = doc.getByKey(column.tableKey);
                        if (tbl && tbl.first() && column.columnKey) {
                            val = tbl.getByKey(column.columnKey);
                            if (val) {
                                data[column.key] = {
                                    'value': val,
                                    'caption': val
                                };
                            }
                        }
                    }

                }
            });

            //未找到行
            if (row == -1) {
                listView.addNewRow(data);
            } else {
                $.each(columnInfo, function (i, column) {
                    var cv = data[column.key];
                    if (cv) {
                        var caption = cv.caption;
                        listView.setValByKey(row, column.key, caption, true, true);
                    }
                });
            }

        }

    };

    funs.GetSelectedValue = function (name, cxt, args) {
        var form = cxt.form;
        var controlKey = args[0];
        var colKey = null;
        if (args.length > 1) {
            colKey = args[1];
        }
        var comp = form.getComponent(controlKey);
        if (comp.type == YIUI.CONTROLTYPE.DICTVIEW) {
            var value = comp.getSelectedValue(colKey);
            return value;
        }
        return null;
    };

    funs.RefreshDictView = function (name, cxt, args) {
        var form = cxt.form;
        var controlKey = args[0];
        var itemKey = args[1];
        var oid = args[2];
        var optState = args[3] || YIUI.Form_OperationState.Default;
        var dictView = form.getComponent(controlKey);

        var itemData = {};
        itemData.itemKey = itemKey;
        itemData.oid = oid.toString();

        var curID = itemData.itemKey + '_' + itemData.oid;
        if (dictView.type == YIUI.CONTROLTYPE.DICTVIEW) {
            switch (optState) {
                case YIUI.Form_OperationState.New:
                    //目前 不同字典 是通过重新加载 父节点来实现 刷新的。
                    if (dictView.isChainDict()) {
                        var item = YIUI.DictService.getItem(itemData.itemKey, itemData.oid);
                        dictView.addNodeByItem(null, item);
                    } else {
                        //获取当前节点所有父节点
                        var parents = YIUI.DictService.getParentPath(dictView.itemKey, itemData);
                        parents = parents[0];
                        var last = parents[parents.length - 1];
                        var id = last.itemKey + '_' + last.oid;
                        //父节点
                        if (dictView.find(id)) {
                            dictView.expandNode(id, true);
                        } else {
                            for (var i = 0; i < parents.length; i++) {
                                id = parents[i].itemKey + '_' + parents[i].oid;
                                dictView.expandNode(id);
                            }
                        }
                    }
                    //选中当前节点
                    dictView.focusNode(curID);
                    break;
                case YIUI.Form_OperationState.Delete:
                    // 修改previd属性
                    dictView.removeNode(itemData.itemKey + '_' + itemData.oid);
                    break;
                default:
                    if (dictView.isChainDict()) {
                        var item = YIUI.DictService.getItem(itemData.itemKey, itemData.oid);
                        //dictView.removeNode( itemData.itemKey+'_'+itemData.oid);
                        //dictView.addNodeByItem(null,item);
                        dictView.refreshNode(itemData.itemKey + '_' + itemData.oid);
                    } else {
                        //删除原来的节点
                        dictView.removeNode(itemData.itemKey + '_' + itemData.oid);

                        //获取当前节点所有父节点
                        var parents = YIUI.DictService.getParentPath(dictView.itemKey, itemData);
                        parents = parents[0];
                        var last = parents[parents.length - 1];
                        var id = last.itemKey + '_' + last.oid;
                        //父节点
                        if (dictView.find(id)) {
                            dictView.expandNode(id, true);
                        } else {
                            for (var i = 0; i < parents.length; i++) {
                                id = parents[i].itemKey + '_' + parents[i].oid;
                                dictView.expandNode(id);
                            }
                        }

                        var node = dictView.getNode(curID);
                        if (node.attr('enable') == 1) {
                            for (var i = 0; i < parents.length; i++) {
                                id = parents[i].itemKey + '_' + parents[i].oid;
                                var parent = dictView.getNode(id);

                                parent.attr('enable', 1);
                                parent.removeClass('invalid').removeClass('disabled');
                            }
                        }

                    }
                    dictView.focusNode(curID);
            }
        }
    };

    funs.IsEnable = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        var enable = false;
        if (comp != null) {
            enable = comp.enable;
        }
        return enable;
    };

    funs.GetRowCount = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        var includeEmpty = false;
        if (comp.type == YIUI.CONTROLTYPE.LISTVIEW) {
            return comp.totalRowCount;
        } else if (comp.type == YIUI.CONTROLTYPE.GRID) {
            var rowCount = comp.getRowCount();
            if (args.length > 1) {
                includeEmpty = args[1];
            }
            if (!includeEmpty) {
                var data, count = 0;
                for (var i = 0, len = rowCount; i < len; i++) {
                    data = comp.getRowDataAt(i);
                    if (data.isDetail && data.bookmark !== undefined) {
                        count++;
                    }
                }
                return count;
            }
            return rowCount;
        }
        return -1;
    };

    funs.SetVisible = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var visible = YIUI.TypeConvertor.toBoolean(args[1]);
        var comp = form.getComponent(key);
        if (comp) {
            comp.setVisible(visible);
            var ownerCt = comp.ownerCt;
            if (ownerCt.type == YIUI.CONTROLTYPE.FLUIDTABLELAYOUTPANEL) {
                ownerCt.reLayout();
            }
        }
        return true;
    };
    funs.IsVisible = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        var visible = false;
        if (comp != null) {
            visible = comp.visible;
        }
        return visible;
    };
    funs.SetFocus = function (name, cxt, args) {
        var key = args[0];
        var focus = args[1];
        var form = cxt.form;
        var comp = form.getComponent(key);
        if (comp != null && focus) {
            $("input", comp.el).focus();
        }
        return true;
    };
    funs.IsControlNull = function (name, cxt, args) {
        var key = args[0];
        var form = cxt.form;
        var comp = form.getComponent(key);
        if (comp != null) {
            return $.isEmptyObject(comp.value);
        }
        var location = form.getCellLocation(key);
        if (location != null) {
            var gridKey = location.key;
            var grid = form.getComponent(gridKey);
            var focusRowIndex = grid.getFocusRowIndex();
            if (focusRowIndex != -1) {
                return grid.isCellNull(focusRowIndex, key);
            }
        }
        return false;
    };
    funs.SetCellValue = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var rowIndex = parseInt(args[1].toString());
        var comp = form.getComponent(key);
        if (rowIndex == undefined || rowIndex == null || rowIndex == -1) {
            rowIndex = cxt.rowIndex;
        }
        if ((rowIndex == undefined || rowIndex == null || rowIndex == -1) && comp) {
            rowIndex = comp.getFocusRowIndex();
        }
        var fireEvent = true;
        var col = args[2].toString();
        if ($.isNumeric(col)) {
            var value = args[3];
            if (args.length > 4) {
                fireEvent = YIUI.TypeConvertor.toBoolean(args[4]);
            }
            form.setCellValByIndex(key, rowIndex, parseInt(col), value, fireEvent);
        } else {
            var value = args[3];
            if (args.length > 4) {
                fireEvent = YIUI.TypeConvertor.toBoolean(args[4]);
            }
            form.setCellValByKey(key, rowIndex, col, value, fireEvent);
        }
        return true;
    };
    funs.GetCellValue = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var rowIndex = args[1].toString();
        var comp = form.getComponent(key);
        if (rowIndex == -1 && comp) {
            rowIndex = comp.getFocusRowIndex();
        }
        var result = null;
        var col = args[2].toString();
        if ($.isNumeric(col)) {
            result = form.getCellValByIndex(key, rowIndex, col);
        } else {
            result = form.getCellValByKey(key, rowIndex, col);
        }
        result = YIUI.ExprUtil.convertValue(result);
        return result;
    };
    funs.GetOperationState = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getOperationState();
        }
        return state;
    };

    funs.ApplyNewOID = function (name, cxt, args) {
        var form = cxt.form;
        var paras = {};
        paras.service = "ApplyNewOID";
        var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        var oid = result.OID;
        return oid;
    };

    funs.RunValueChanged = function (name, cxt, args) {
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var cmp = form.getComponent(key);
        var cell = form.getCellLocation(key);
        var valueChange = "";
        if (cmp) {
            valueChange = cmp.valueChanged;
            valueChange && form.eval(valueChange, cxt, null);
        } else if (cell) {
            var compKey = cell.key;
            var grid = form.getComponent(compKey);
            if (grid.type == YIUI.CONTROLTYPE.GRID) {
                var rowIndex = grid.getFocusRowIndex();
                if (rowIndex == -1) return;
                var row = grid.dataModel.data[rowIndex], cellKey = key,
                    editOpt = grid.dataModel.colModel.cells[cellKey],
                    meatRow = grid.metaRowInfo.rows[row.metaRowIndex];

                var colIndex = grid.getColInfoByKey(cellKey)[0].colIndex;

//			    form.uiProcess.doCellValueChanged(grid, rowIndex, colIndex, cellKey);
                YIUI.GridSumUtil.evalAffectSum(form, grid, rowIndex, colIndex);

                var cellCEvent = meatRow.cells[colIndex].valueChanged;
                if (cellCEvent !== undefined && cellCEvent.length > 0) {
                    form.eval($.trim(cellCEvent), {form: form, rowIndex: rowIndex}, null);
                }
            }
        }

        return true;
    };

    funs.RunClick = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        switch (comp.type) {
            case YIUI.CONTROLTYPE.BUTTON:
            case YIUI.CONTROLTYPE.HYPERLINK:
                var clickContent = comp.clickContent;
                clickContent && form.eval(clickContent, cxt, null);
                break;
        }
        return true;
    };
    funs.RunOpt = function (name, cxt, args) {
        var form = cxt.form;
        var optKey = args[0];
        //toolbar
        var optInfo = form.getOptMap()[optKey], tbr;
        if (optInfo) {
            var action = optInfo.opt.action;
            action && form.eval(action, cxt, null);
        }
        return true;
    };

    funs.SetOID = function (name, cxt, args) {
        var form = cxt.form;
        var filterMap = form.getFilterMap();
        var OID = YIUI.TypeConvertor.toInt(args[0]);
        filterMap.setOID(OID);
        return true;
    };
    funs.ResetCondition = function (name, cxt, args) {
        var form = cxt.form;
        var compList = form.getComponentList();
        var cmp = null;
        for (var i in compList) {
            cmp = compList[i];
            if (cmp.condition) {
                cmp.setValue("", true, false);
            }
        }
        return true;
    };

    funs.GetStatusItems = function (name, cxt, args) {
        return cxt.form.statusItems;
    };

    funs.GetGroupValue = function (name, cxt, args) {
        var form = cxt.form;
        var groupKey = YIUI.TypeConvertor.toString(args[0]);
        var paraGroups = form.paraGroups;
        var items = null;
        if (paraGroups) {
            items = paraGroups[groupKey];
        }
        return items;
    };

    funs.SetClose = function (name, cxt, args) {
        var form = cxt.form;
        form.showFlag = YIUI.FormShowFlag.Close;
        return true;
    };

    funs.GetFormKey = function (name, cxt, args) {
        var form = cxt.form;
        return form.getFormKey();
    };

    funs.GetRelationFormKey = function (name, cxt, args) {
        var formKey = YIUI.TypeConvertor.toString(args[0]);
        var dataObjKey = YIUI.TypeConvertor.toString(args[1]);
        var paras = {
            cmd: "GetRelationFormKey",
            service: "PureMeta",
            dataObjKey: dataObjKey,
            formKey: formKey
        };
        var key = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return key;
    };

    funs.GetFormRelation = function (name, cxt, args) {
        var formKey = YIUI.TypeConvertor.toString(args[0]);
        var paras = {
            cmd: "GetFormRelation",
            service: "PureMeta",
            formKey: formKey
        };
        var sRet = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return sRet;
    };

    funs.GetTag = function (name, cxt, args) {
        return cxt.tag;
    };

    funs.GetCellCaption = function (name, cxt, args) {
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var rowIndex = YIUI.TypeConvertor.toInt(args[1]);
        var grid = form.getComponent(key);
        // 从环境中取出表格的当前行
        if (rowIndex == -1) {
            rowIndex = grid.getFocusRowIndex();
        }
        if (rowIndex == -1) {
            return "";
        }
        var cell = null;
        var caption = "";
        var column = args[2];
        if ($.isNumeric(column)) {
            var colIndex = YIUI.TypeConvertor.toInt(column);
            cell = grid.getCellDataAt(rowIndex, colIndex);
            caption = cell[1];
        } else if (column instanceof String) {
            var cellKey = column.toString();
            cell = grid.getCellDataByKey(rowIndex, cellKey);
            caption = cell[1];
        }
        return caption;
    };

    funs.GetFocusRow = function (name, cxt, args) {
        var form = cxt.form;
        var gridKey = YIUI.TypeConvertor.toString(args[0]);
        var grid = form.getComponent(gridKey);
        if (grid == null) {
            YIUI.ViewException.throwException(YIUI.ViewException.COMPONENT_NOT_EXISTS);
        }
        return grid.getFocusRowIndex();
    };

    funs.GetFocusColumn = function (name, cxt, args) {
        var form = cxt.form;
        var gridKey = YIUI.TypeConvertor.toString(args[0]);
        var grid = form.getComponent(gridKey);
        if (grid == null) {
            YIUI.ViewException.throwException(YIUI.ViewException.COMPONENT_NOT_EXISTS);
        }
        return grid.getFocusColIndex();
    };

//    funs.StartTimerTask = function (name, cxt, args) {
//    	
//    };
//    
//    funs.StopTimerTask = function (name, cxt, args) {
//    	
//    };
//    
//    funs.IsTimerTaskStarted = function (name, cxt, args) {
//    	
//    };

    funs.Format = function (name, cxt, args) {
        var value = args[0], formatStr = args[1], result = value;
        if (value != null && value instanceof Date) {
            result = YIUI.DateFormat.format(value, {isOnlyDate: false});
        }
        return result;
    };

    funs.ServerDate = function (name, cxt, args) {
        var form = cxt.form;
        var paras = {};
        paras.service = "DateService";
        paras.cmd = "ServerDate";
        var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return new Date(result);
    };

    funs.ServerDBDate = function (name, cxt, args) {
        var form = cxt.form;
        var paras = {};
        paras.service = "DateService";
        paras.cmd = "ServerDBDate";
        var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return new Date(result);
    };

    funs.LocalDate = function (name, cxt, args) {
        return new Date().getTime();
    };

    funs.GetStatus = function (name, cxt, args) {
        var form = cxt.form, doc = form.getDocument(), mtKey = form.mainTableKey, mtTable = doc.getByKey(mtKey);
        var status = null;
        if (mtTable && mtTable.getRowCount() > 0) {
            mtTable.first();
            status = mtTable.getByKey("Status");
        }
        return status;
    };

    funs.SetPara = function (name, cxt, args) {
        var form = cxt.form, key = args[0], value = args[1];
        form.setPara(key, value);
    };

    funs.PushPara = function (name, cxt, args) {
        var form = cxt.form, key = args[0], value = args[1];
        form.setCallPara(key, value);
    };

    funs.GetPara = function (name, cxt, args) {
        var form = cxt.form, key = args[0];
        return form.getPara(key);
    };

    funs.Para = function (name, cxt, args) {
        var form = cxt.form, key = args[0];
        return form.getPara(key);
    };

    funs.GetParentOID = function (name, cxt, args) {
        var form = cxt.form, ptForm = YIUI.FormStack.getForm(form.pFormID);
        if (ptForm) {
            return ptForm.OID;
        }
        return -1;
    };

    funs.RollData = function (name, cxt, args) {
        var form = cxt.form, key = args[0], endPeriod = "";
        if (args.length > 1) {
            endPeriod = args[1];
        }
        var paras = {};
        paras.service = "Migration";
        paras.cmd = "RollData";
        paras.dataObjectKey = key;
        paras.endPeriod = endPeriod;
        Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.SetRowIndex = function (name, cxt, args) {
        var form = cxt.form,
            key = args[0],
            rowIndex = parseInt(args[1].toString() || 0),
            com = form.getComponent(key);
        if (com && com.type == YIUI.CONTROLTYPE.GRID) {
            com.setFocusRowIndex(rowIndex);
        }
    };

    funs.IsEmptyRow = function (name, cxt, args) {
        var form = cxt.form,
            key = args[0],
            rowIndex = parseInt(args[1].toString() || 0),
            com = form.getComponent(key);
        if (com && com.type == YIUI.CONTROLTYPE.GRID) {
            if (rowIndex == -1) {
                rowIndex = com.getFocusRowIndex();
            }
            var gr = com.getRowDataAt(rowIndex);
            return gr.isDetail && (gr.bookmark == undefined);
        }
        return false;
    };

    funs.CheckDuplicate = function (name, cxt, args) {
        var form = cxt.form;
        if (args.length > 0) {
            var cellKey = args[0],
                cl = form.getCellLocation(cellKey),
                grid = form.getComponent(cl.key);
            if (grid) {
                var datas = [], length = grid.getRowCount(), row, cv, values;
                for (var i = 0; i < length; i++) {
                    row = grid.getRowDataAt(i);
                    values = [];
                    if (row.isDetail && row.bookmark !== undefined) {
                        for (var j = 0; j < args.length; j++) {
                            cellKey = args[j];
                            cl = form.getCellLocation(cellKey);
                            cv = grid.getValueAt(i, cl.column);
                            values.push(cv);
                        }
                        datas.push(values);
                    }
                }
                var data_A, data_B, data1, data2;
                for (var m = 0; m < datas.length; m++) {
                    data_A = datas[m];
                    for (var n = m + 1; n < datas.length; n++) {
                        data_B = datas[n];
                        for (var k = 0; k < data_A.length; k++) {
                            data1 = data_A[k];
                            data2 = data_B[k];
                            var cpType = YIUI.UIUtil.getCompareType(data1, data2), isBreak = false;
                            switch (cpType) {
                                case DataType.STRING:
                                    isBreak = YIUI.TypeConvertor.toString(data1) != YIUI.TypeConvertor.toString(data2);
                                    break;
                                case DataType.NUMERIC:
                                    isBreak = !YIUI.TypeConvertor.toDecimal(data1).equals(YIUI.TypeConvertor.toDecimal(data2))
                                    break;
                                case DataType.BOOLEAN:
                                    isBreak = YIUI.TypeConvertor.toBoolean(data1) != YIUI.TypeConvertor.toBoolean(data2);
                                    break;
                                default:
                                    if ((data1 == null && data2 != null) || (data1 != null && data2 == null)) {
                                        isBreak = true;
                                    } else {
                                        if (typeof data1 == "object" && typeof data2 == "object") {
                                            isBreak = data1.oid != data2.oid;
                                        }
                                    }
                                    break;
                            }
                            if (isBreak) break;
                            if (k == data_A.length - 1) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    funs.InsertRow = function (name, cxt, args) {
        var form = cxt.form, key = args[0], rowIndex = -1;
        var comp = form.getComponent(key);
        if (args.length > 1) {
            rowIndex = parseInt(args[1].toString() || -1, 10);
        }
        var newRi = -1, afterCur = true;
        if (comp == undefined) return newRi;
        switch (comp.type) {
            case  YIUI.CONTROLTYPE.LISTVIEW:
                break;
            case YIUI.CONTROLTYPE.GRID:
                if (rowIndex == -1 && afterCur && args.length == 1) {
                    rowIndex = comp.getFocusRowIndex();
                }
                newRi = comp.addGridRow(null, rowIndex);
                newRi = comp.getRowIndexByID(newRi.rowID);
                comp.setFocusRowIndex(newRi);
                break;
        }
        return newRi;
    };

    funs.DeleteRow = function (name, cxt, args) {
        var form = cxt.form, key = args[0], rowIndex = -1;
        if (args.length > 1) {
            rowIndex = parseInt(args[1].toString() || 0, 10);
        }
        var com = form.getComponent(key);
        if (com == undefined) return;
        switch (com.type) {
            case  YIUI.CONTROLTYPE.LISTVIEW:
                break;
            case YIUI.CONTROLTYPE.GRID:
                if (rowIndex == -1) {
                    rowIndex = com.getFocusRowIndex();
                }
                com.deleteGridRow(rowIndex);
                break;
        }
        return true;
    };

    funs.CopyGridRow = function (name, cxt, args) {
        var form = cxt.form, gridKey = args[0], rowIndex = parseInt(args[1].toString() || 0, 10), splitKeys = [] , splitValues;
        var grid = form.getComponent(gridKey);
        if (grid) {
            if (grid.hasColExpand) return -1;
            if (rowIndex == -1) {
                rowIndex = (cxt.rowIndex == undefined ? -1 : cxt.rowIndex);
            }
            if (rowIndex == -1) {
                rowIndex = grid.getFocusRowIndex();
            }
            if (rowIndex == -1) return -1;
            if (args.length > 2) {
                var splitKeyString = args[2], size = splitKeyString.split(",").length, count = 0;
                for (var j = 0, len = grid.getColumnCount(); j < len; j++) {
                    var metaCell = grid.getMetaCellInDetail(j);
                    if (splitKeyString.indexOf(metaCell.key) >= 0) {
                        splitKeys.push(metaCell.columnKey);
                        count++;
                    }
                    if (count == size)
                        break;
                }
            }
            if (args.length > 3) {
                splitValues = [];
                for (var i = 3; i < args.length; i++) {
                    splitValues.push(args[i]);
                }
            }
            var layer = -1, dtlRi = grid.metaRowInfo.dtlRowIndex, metaDtlRow = grid.metaRowInfo.rows[dtlRi];
            if (metaDtlRow.defaultLayer !== -1) {
                var bookmark = grid.getRowDataAt(rowIndex).bookmark;
                var table = form.getDocument().getByKey(grid.tableKey);
                table.setByBkmk(bookmark);
                layer = parseInt(table.get(table.indexByKey("Layer")), 10);
            }
            return grid.gridHandler.copyRow(form, grid, rowIndex, splitKeys, splitValues, layer);
        }
        return -1;
    };

    funs.SetNewEmptyRow = function (name, cxt, args) {
        var form = cxt.form;
        var gridKey = YIUI.TypeConvertor.toString(args[0]);
        var flag = YIUI.TypeConvertor.toBoolean(args[1]);
        var grid = form.getComponent(gridKey);
        if (grid == null) {
            YIUI.ViewException.throwException(YIUI.ViewException.COMPONENT_NOT_EXISTS);
        }
        grid.newEmptyRow = flag;
        grid.removeAutoRowAndGroup();
        grid.setGridEnable(grid.isEnable());
        return true;
    };

    funs.IsInBounds = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var point = args[1];
        var map = form.getComponent(key);
        map.IsInBounds(point);
    };

    funs.ClearMap = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        map.clear();
    };

    funs.SetDriveRoute = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        var start = args[1];
        var end = args[2];
        var waypoints = args[3];
        map.setDriveRoute(start, end, waypoints);
    };

    funs.DrawMarker = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        var marker = YIUI.TypeConvertor.toString(args[1]);
        map.drawMarker(marker);
    };

    funs.DrawPolyline = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        var polyline = YIUI.TypeConvertor.toString(args[1]);
        map.drawPolyline(polyline);
    };

    funs.DrawPolygon = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        var polygon = YIUI.TypeConvertor.toString(args[1]);
        map.drawPolygon(polygon);
    };


    funs.GetMapInfo = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        var mapInfo = map.getMapInfo();
        return mapInfo;
    };

    funs.ShowMapInfo = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        var mapInfo = YIUI.TypeConvertor.toString(args[1]);
        map.showMapInfo(mapInfo);
    };

    funs.BPMMap = function (name, cxt, args) {
        if (args.length < 2)
            YIUI.ViewException.throwException(YIUI.ViewException.NO_KEY_TARGET_BILL);
        var form = cxt.form,
            mapKey = args[0],
            toNewForm = true,
            tgFormKey = args[1];
        var formDoc = null;
        var pForm = null;
        formDoc = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(formDoc);
        var tableKey = form.mapGrids[mapKey];
        var gridMap = form.getGridInfoMap(), grid, gMap, oids = [];
        for (var i = 0, len = gridMap.length; i < len; i++) {
            gMap = gridMap[i];
            grid = form.getComponent(gMap.key);
            if (gMap.tableKey == tableKey) {
                oids = grid.getFieldArray(form, YIUI.SystemField.OID_SYS_KEY);
                break;
            }
        }
        var params = {
            tgFormKey: tgFormKey,
            srcFormKey: form.formKey,
            srcDoc: $.toJSON(doc),
            oidList: $.toJSON(oids),
            cmd: "PureMap",
            toNewForm: toNewForm,
            mapKey: mapKey
        };
        var resultJson = Svr.SvrMgr.doMapEvent(params);
        var newForm = YIUI.FormBuilder.build(resultJson);

        var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
        var WID = info.WorkitemID;
        var newDoc = newForm.getDocument();
        var expKey = "SaveBPMMap";
        newDoc.expData[expKey] = WID;
        newDoc.expDataType[expKey] = YIUI.ExpandDataType.LONG;
        var container = form.getContainer();
        container.build(newForm);
        return true;
    };

    funs.GetFormCaption = function (name, cxt, args) {
        var form = cxt.form;
        return form.getFormCaption();
    };

    funs.GetFormAbbrCaption = function (name, cxt, args) {
        var form = cxt.form;
        return form.getAbbrCaption();
    };

    funs.StatusValue = function (name, cxt, args) {
        var form = cxt.form;
        var statusKey = args[0];

        var status = form.statusItems;
        for (var i = 0, len = status.length; i < len; i++) {
            if (status[i].key == statusKey) {
                return status[i].value;
            }
        }
        return null;
    };

    funs.SetResult = function (name, cxt, args) {
        var form = cxt.form;
        var result = args[0];
        form.setResult(result);
        return true;
    };

    funs.GetResult = function (name, cxt, args) {
        var form = cxt.form;
        var result = form.getResult();
        return result;
    };

    funs.GetCaption = function (name, cxt, args) {
        var caption = "";
        var key = args[0];
        var form = cxt.form;
        var comp = form.getComponent(key);
        if (comp != null) {
            caption = comp.caption;
        }
        return caption;
    };

    funs.ReplaceTable = function (name, cxt, args) {
        var form = cxt.form;
        var document = form.getDocument();
        var key = args[0];
        var table = args[1];
        if (!(table instanceof DataDef.DataTable)) {
            table = YIUI.DataUtil.fromJSONDataTable(table);
        }
        document.remove(key);
        document.remove(YIUI.DataUtil.getShadowTableKey(key));
        table.key = key;
        document.add(key, table);
        return true;
    };

    funs.ReloadTable = function (name, cxt, args) {
        var tableKey = args[0];
        var form = cxt.form;
        form.reloadTable(tableKey);
    };

    funs.RefreshControl = function (name, cxt, args) {
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        var type = comp.type;
        switch (type) {
            case YIUI.CONTROLTYPE.GRID:
                comp.rootGroupBkmk = [];
                comp.reload();
                break;
            case YIUI.CONTROLTYPE.LISTVIEW:
                comp.repaint();
                break;
            default:
                var tableKey = comp.tableKey;
                var table = form.getDocument().getByKey(tableKey);
                if (table != null) {
                    var value = YIUI.UIUtil.getCompValue(comp, table);
                    comp.setValue(value, false, false);
                }
                break;
        }
        return true;
    };

    funs.GetOperator = function (name, cxt, args) {
        return $.cookie("userID");
    };

    funs.DBUpdate = function (name, cxt, args) {
        var form = cxt.form;
        var SQL = args[0];
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }
        var paras = {
            service: "PureWebDB",
            cmd: "PureDBUpdate",
            SQL: SQL,
            values: $.toJSON(values)
        };
        var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return result;
    };

    funs.DBNamedUpdate = function (name, cxt, args) {
        var form = cxt.form;
        var SQLName = YIUI.TypeConvertor.toString(args[0]);
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }
        var paras = {
            service: "PureWebDB",
            cmd: "PureDBNamedUpdate",
            formKey: form.getFormKey(),
            SQLName: SQLName,
            values: $.toJSON(values)
        };
        var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        return result;
    };

    funs.DBQuery = function (name, cxt, args) {
        var form = cxt.form;
        var SQL = args[0];
        var values = [];
        for (var i = 1; i < args.length; i++) {
            values.push(args[i]);
        }
        var paras = {
            service: "PureWebDB",
            cmd: "PureDBQuery",
            SQL: SQL,
            values: $.toJSON(values)
        };
        var tableJson = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (!tableJson) return null;
        var table = YIUI.DataUtil.fromJSONDataTable(tableJson);
        if (table) {
            table.first();
        }
        return table;

    };

    funs.DBNamedQuery = function (name, cxt, args) {
        var form = cxt.form;
        var sqlName = args[0];
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }
        var paras = {
            service: "PureWebDB",
            cmd: "PureDBNamedQuery",
            SQLName: sqlName,
            formKey: form.getFormKey(),
            values: $.toJSON(values)
        };
        var tableJson = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (!tableJson) return null;
        var table = YIUI.DataUtil.fromJSONDataTable(tableJson);
        if (table) {
            table.first();
        }
        return table;
    };

    funs.DBQueryValue = function (name, cxt, args) {
        var form = cxt.form;
        var SQL = YIUI.TypeConvertor.toString(args[0]);
        //值
        var list = [];
        for (var i = 1, len = args.length; i < len; i++) {
            list.push(args[i]);
        }
        var paras = {
            service: "PureWebDB",
            cmd: "PureDBQuery",
            SQL: SQL,
            values: $.toJSON(list)
        };
        var tableJson = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (!tableJson) return null;
        var table = YIUI.DataUtil.fromJSONDataTable(tableJson);
        var obj = null;
        if (table.first()) {
            table.setPos(0);
            obj = table.get(0);
        }
        return obj;
    };

    funs.DBNamedQueryValue = function (name, cxt, args) {
        var form = cxt.form;
        var sqlName = args[0];
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }
        var paras = {
            service: "PureWebDB",
            cmd: "PureDBNamedQuery",
            SQLName: sqlName,
            formKey: form.formKey,
            values: $.toJSON(values)
        };
        var tableJson = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (!tableJson) return null;
        var table = YIUI.DataUtil.fromJSONDataTable(tableJson);
        var obj = null;
        if (table.first()) {
            table.setPos(0);
            obj = table.get(0);
        }
        return obj;
    };

    funs.SetColumnCaption = function (name, cxt, args) {
        var form = cxt.form, key = args[0],
            columnKey = args[1], caption = args[2],
            comp = form.getComponent(key);
        if (comp == undefined) return;
        if (comp.type == YIUI.CONTROLTYPE.GRID || comp.type == YIUI.CONTROLTYPE.LISTVIEW) {
            comp.setColumnCaption(columnKey, caption);
        }
    };

    funs.SetColumnVisible = function (name, cxt, args) {
        var form = cxt.form, key = args[0],
            columnKey = args[1], visible = args[2],
            comp = form.getComponent(key);
        if (comp == undefined) return;
        if (comp.type == YIUI.CONTROLTYPE.GRID || comp.type == YIUI.CONTROLTYPE.LISTVIEW) {
            comp.setColumnVisible(columnKey, visible);
        }
    };

    funs.RepaintGrid = function (name, cxt, args) {
        var form = cxt.form, gridKey = args[0],
            grid = form.getComponent(gridKey);
        grid && grid.repaint();
    };
    funs.ReloadGrid = function (name, cxt, args) {
        var form = cxt.form, doc = form.getDocument(), gridKey = YIUI.TypeConvertor.toString(args[0]), sourceKey = "", state = 0;
        if (doc == null) return;
        if (args.length > 2) {
            sourceKey = YIUI.TypeConvertor.toString(args[2]);
        }
        if (args.length > 3) {
            if ("new" == YIUI.TypeConvertor.toString(args[3]).toLowerCase()) {
                state = 1;
            }
        }
        var grid = form.getComponent(gridKey);
        if (grid == null) {
            YIUI.ViewException.throwException(YIUI.ViewException.COMPONENT_NOT_EXISTS);
        }
        var tableKey = grid.tableKey, filterMap = form.filterMap;
        filterMap.setType(YIUI.DocumentType.DETAIL);

        var dataTable = doc.getByKey(tableKey);
        if (dataTable == null) return;
        var tableFilter = filterMap.getTblFilter(tableKey);
        tableFilter.SourceKey = sourceKey;
        var params = {
            cmd: "PureLoadData",
            oid: form.getDocument().oid,
            form: form.toJSON(),
            formKey: form.getFormKey(),
            parameters: form.getParas().toJSON(),
            filterMap: $.toJSON(filterMap),
            condition: $.toJSON(form.getCondParas())
        };
        var result = Svr.SvrMgr.loadFormData(params);
        if ($.isEmptyObject(result.form) || $.isEmptyObject(result.document)) return;
        var newDoc = YIUI.DataUtil.fromJSONDoc(result.document),
            newTable = newDoc.getByKey(tableKey);
        if (state == 1) {
            newTable.setNew();
        }
        doc.remove(tableKey);
        doc.add(tableKey, newTable);
        grid.getHandler().diffFromFormJson(grid, result.form);
    };
    funs.SetForeColor = function (name, cxt, args) {
        var key = YIUI.TypeConvertor.toString(args[0]);
        var color = "";
        if (args.length > 1) {
            color = YIUI.TypeConvertor.toString(args[1]);
        }
        var form = cxt.form;
        var comp = form.getComponent(key);
        if (comp != null) {
            comp.setForeColor(color);
        }
    };

    funs.SetBackColor = function (name, cxt, args) {
        var key = YIUI.TypeConvertor.toString(args[0]);
        var color = "";
        if (args.length > 1) {
            color = YIUI.TypeConvertor.toString(args[1]);
        }
        var form = cxt.form;
        var comp = form.getComponent(key);
        if (comp != null) {
            comp.setBackColor(color);
        }
    };
    funs.RefreshUIStatus = function (name, cxt, args) {
        cxt.form.resetUIStatus(YIUI.FormUIStatusMask.ENABLE | YIUI.FormUIStatusMask.VISIBLE | YIUI.FormUIStatusMask.OPERATION);
        return true;
    };
    funs.RefreshOperation = function (name, cxt, args) {
        cxt.form.resetUIStatus(YIUI.FormUIStatusMask.OPERATION);
        return true;
    };
    funs.GetDocument = function (name, cxt, args) {
        var form = cxt.form;
        return form.getDocument();
    };
    funs.SetDocument = function (name, cxt, args) {
        var form = cxt.form;
        if (args[0] instanceof DataDef.Document) {
            var doc = args[0];
            form.setDocument(doc);
            return true;
        } else {
            return false;
        }
    };
    funs.PushPara = function (name, cxt, args) {
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var value = args[1];
        form.setCallPara(key, value);
        return true;
    };

    funs.EvalMidExp = function (name, cxt, args) {
        var form = cxt.form;
        var withDoc = false;
        withDoc = YIUI.TypeConvertor.toBoolean(args[0]);
        var exp = "";
        exp = YIUI.TypeConvertor.toString(args[1]);
        var doc = null;
        if (withDoc) {
            doc = form.getDocument();
        }
        var count = args.length - 2;
        if (count < 0) {
            count = 0;
        }

        var newArgs = [];
        for (var i = 2, size = args.length; i < size; ++i) {
            newArgs.push(args[i]);
        }
        doc = YIUI.DataUtil.toJSONDoc(doc);
        var formParas = form != null ? form.getParas() : null;
        var paras = {
            service: "PureMid",
            cmd: "pureEvalMidExp",
            exp: exp,
            document: $.toJSON(doc),
            paras: $.toJSON(newArgs),
            formParas: formParas.toJSON()
        };
        return Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.InvokeService = function (name, cxt, args) {
        var form = cxt.form;
        var serviceName = YIUI.TypeConvertor.toString(args[0]);
        var withDoc = false;
        if (args.length > 1) {
            withDoc = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        var refresh = false;
        if (args.length > 2) {
            refresh = YIUI.TypeConvertor.toBoolean(args[2]);
        }

        var paras = null;
        var mapParas = null;
        if (args.length == 4) {
            if (args[3]) {
                var map = {};
                mapParas = splitPara(args[3]);
            }
        }

       var data = {
            service: "InvokeService",
            extSvrName: serviceName,
            paras: $.toJSON(paras)
        };

        if($.isEmptyObject(mapParas)){
            if(args.length > 3){
                paras = [];
                for (var i = 3; i < args.length; i++) {
                    var para = args[i];
                    paras.push(para);
                }
                 paras = YIUI.YesJSONUtil.toJSONArray(paras);
            }
 
        }else{
            for (var key in mapParas) {
                var value = form.eval(mapParas[key], cxt);
                map[key] = value;
            }
            paras = YIUI.YesJSONUtil.toJSONObject(map);
            data.cmd="InvokeExtService2";
        }

        data.paras = $.toJSON(paras);

        var doc = null;
        if (withDoc) {
            doc = form.getDocument();
            doc = YIUI.DataUtil.toJSONDoc(doc);
            data.document = $.toJSON(doc);
        }
        //返回值为document

        var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data);
        if (refresh && result.isDoc) {
            var doc = YIUI.DataUtil.fromJSONDoc(result);
            form.setDocument(doc);
            form.showDocument();
        }
        return result;
    };

    funs.NewJSONObject = function (name, cxt, args) {
        var content = "";
        if (args.length > 0) {
            content = YIUI.TypeConvertor.toString(args[0]);
        }
        var obj = null;
        if (content) {
            obj = new YIUI.JSONObject(content);
        } else {
            obj = new YIUI.JSONObject();
        }
        return obj;
    };

    funs.NewJSONArray = function (name, cxt, args) {
        var content = "";
        if (args.length > 0) {
            content = YIUI.TypeConvertor.toString(args[0]);
        }
        var obj = null;
        if (content) {
            obj = new YIUI.JSONArray(content);
        } else {
            obj = new YIUI.JSONArray();
        }
        return obj;
    };

    funs.SetSessionPara = function (name, cxt, args) {
        var key = YIUI.TypeConvertor.toString(args[0]);
        var value = args[1];
        var paras = $.parseJSON($.cookie("sessionParas"));
        paras[key] = value;
        $.cookie("sessionParas", $.toJSON(paras));
        return true;
    };

    funs.GetSessionPara = function (name, cxt, args) {
        var key = YIUI.TypeConvertor.toString(args[0]);
        var paras = $.parseJSON($.cookie("sessionParas"));
        return paras[key];
    };

    funs.ImportExcel = function (name, cxt, args) {
    	var needResult = false;
    	if (args.length > 0) {
    		needResult = YIUI.TypeConvertor.toBoolean(args[0]);
    	}
    	
        var callback = null;
        if (needResult) {
            callback = function () {
                var options = {
                    msg: "导入成功！",
                    msgType: YIUI.Dialog_MsgType.DEFAULT
                };
                var dialog = new YIUI.Control.Dialog(options);
                dialog.render();
            };
        }
        var clearOriginalData = true;
        if (args.length > 1) {
            clearOriginalData = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        var fileChooser = new YIUI.FileChooser();
        var options = {
            clearOriginalData: clearOriginalData
        };
        fileChooser.upload(options, callback);
    };

    funs.Print = function (name, cxt, args) {
        var form = cxt.form;
        var paras = {};
        paras.service = "PrintService";
        paras.cmd = "Print";
        paras.OID = form.OID;
        paras.formKey = form.formKey;

        var reportKey = "";
        if (args.length > 0) {
            reportKey = YIUI.TypeConvertor.toString(args[0]);
        }
        paras.reportKey = reportKey;
        var fillEmptyPrint = false;
        if (args.length > 1) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        paras.fillEmptyPrint = fillEmptyPrint;

        var url = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        YIUI.Print.print(url, form.formKey);
    };

    funs.PrintPreview = function (name, cxt, args) {
        var form = cxt.form;
        var paras = {};
        paras.service = "PrintService";
        paras.cmd = "Print";
        paras.OID = form.OID;
        paras.formKey = form.formKey;

        var reportKey = "";
        if (args.length > 0) {
            reportKey = YIUI.TypeConvertor.toString(args[0]);
        }
        paras.reportKey = reportKey;
        var fillEmptyPrint = false;
        if (args.length > 1) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        paras.fillEmptyPrint = fillEmptyPrint;

        var url = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        url = url.replace(/\\/g, "/");
        var opts = {
            formKey: form.formKey,
            url: url
        };
        var pv = new YIUI.PrintPreview(opts);

    };

    {  //BPM函数
        funs.GetProcessKey = function (name, cxt, args) {
            var form = cxt.form, processKey = "",
                doc = form.getDocument(),
                expData = doc.getExpDataInfo("BPM").data,
                table = YIUI.DataUtil.fromJSONDataTable(expData);
            if (table && table.getRowCount() > 0) {
                table.first();
                processKey = table.getByKey("ProcessKey");
            }
            return processKey;
        };

        funs.GetProcessVer = function (name, cxt, args) {
            var form = cxt.form, processVer = -1, tempVer = -1,
                doc = form.getDocument(),
                expData = doc.getExpDataInfo("BPM").data,
                table = YIUI.DataUtil.fromJSONDataTable(expData);
            if (table && table.getRowCount() > 0) {
                table.first();
                tempVer = table.getByKey("Version");
                if (tempVer) {
                    processVer = parseInt(tempVer);
                }
            }
            return processVer;
        };

        funs.AddDelegateData = function (name, cxt, args) {
            var index = 0;
            var delegateType = args[index++].toString();
            var srcOperatorID = args[index++].toString();
            var tgtOperatorID = args[index++].toString();
            var objectType = args[index++].toString();
            var objectKey = args[index++];
            var nodeKey = args[index++];
            var StartTime = args[index++];
            var alwaysValid = args[index++];
            var EndTime = alwaysValid ? new Date(0) : args[index++];
            var paras = {
                delegateType: delegateType,
                srcOperatorID: srcOperatorID,
                tgtOperatorID: tgtOperatorID,
                objectType: objectType,
                objectKey: objectKey,
                nodeKey: nodeKey,
                StartTime: StartTime ? StartTime.getTime() : null,
                alwaysValid: alwaysValid,
                EndTime: EndTime ? EndTime.getTime() : null,
                cmd: "PureAddDelegateData",
                service: "PureWebBPM"
            };
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);

        };

        funs.DeleteDelegateData = function (name, cxt, args) {
            var paras = {
                delegateID: args[0].toString(),
                cmd: "PureDeleteDelegateData",
                service: "PureWebBPM"
            };
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        };

        funs.GetActiveWorkitemID = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var WID = info.WorkitemID;
            return WID;
        };

        funs.GetActiveInstanceID = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var instanceID = info.InstanceID;
            return instanceID;
        };

        var getActiveWorkitem = function (cxt, args) {
            var fromParent = false;
            if (args.length > 0) {
                fromParent = YIUI.TypeConvertor.toBoolean(args[0]);
            }
            var form = cxt.form;
            if (fromParent) {
                var pFormID = form.pFormID;
                form = YIUI.FormStack.getForm(pFormID);
            }
            var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
            if (!info) {
                YIUI.BPMException.throwException(YIUI.BPMException.NO_ACTIVE_WORKITEM);
            }
            return info;
        };

        funs.GetActiveWorkitemFormKey = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var formKey = info.FormKey;
            return formKey;
        };

        funs.RestartInstanceByOID = function (name, cxt, args) {
            var instanceOID = null;
            if (args.length > 0) {
                instanceOID = YIUI.TypeConvertor.toInt(args[0]);
            } else {
                var form = cxt.form;
                if (form) {
                    var doc = form.getDocument();
                    if (doc) {
                        instanceOID = doc.oid;
                    }
                }
            }
            var paras = {};
            paras.service = "PureWebBPM";
            paras.cmd = "PureRestartInstanceByOID";
            paras.formKey = form.formKey;
            paras.oid = form.OID;
            paras.instanceOID = instanceOID;
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            YIUI.UIUtil.replaceForm(form, result, cxt);

        };

        funs.IsInstanceStarted = function (name, cxt, args) {
            var OID = null;
            if (args.length > 0) {
                OID = YIUI.TypeConvertor.toInt(args[0]);
            } else {
                var form = cxt.form;
                if (form) {
                    var doc = form.getDocument();
                    if (doc) {
                        OID = doc.oid;
                    }
                }
            }
            var paras = {};
            paras.service = "BPM";
            paras.cmd = "IsInstanceStarted";
            paras.OID = OID;
            var json = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            var started = YIUI.TypeConvertor.toBoolean(json.result);
            return started;
        };

        funs.DisableDelegateData = function (name, cxt, args) {
            var form = cxt.form;
            var delegateID = YIUI.TypeConvertor.toInt(args[0]);
            var paras = {};
            paras.service = "BPM";
            paras.cmd = "UpdateDelegateDataState";
            paras.delegateID = delegateID;
            paras.onUse = false;
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return true;
        };

        funs.SetDelegateDataInUse = function (name, cxt, args) {
            var form = cxt.form;
            var delegateID = YIUI.TypeConvertor.toInt(args[0]);
            var paras = {};
            paras.service = "BPM";
            paras.cmd = "UpdateDelegateDataState";
            paras.delegateID = delegateID;
            paras.onUse = true;
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return true;
        };

        funs.OpenWorkitem = function (name, cxt, args) {
            var form = cxt.form;
            var onlyOpen = false;
            if (args.length > 1) {
                onlyOpen = YIUI.TypeConvertor.toBoolean(args[1]);
            }

            var paras = {
                WID: args[0].toString(),
                onlyOpen: onlyOpen,
                cmd: "PureOpenWorkitem",
                service: "PureWebBPM"
            };
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            var newForm = YIUI.FormBuilder.build(result);
            var container = form.getDefContainer();
            if (container == null) {
                container = form.getContainer();
            }
            newForm.setContainer(container);
            newForm.setSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW, YIUI.BPMConstants.WORKITEM_VIEW);
            newForm.pFormID = form.formID;
            container.build(newForm);
        };

        var CommitWorkitem = function (cxt, args) {
            var form = cxt.form;
            var WID = args[0].toString();
            var info = null;
            var paras = {
                WID: WID,
                cmd: "PureCommitWorkitem",
                service: "PureWebBPM"
            };
            if (WID == -1) {
                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                WID = info.WorkitemID;
                info.AuditResult = args[1];
                info.UserInfo = args[2];
                paras.workitemInfo = $.toJSON(info);
            } else {
                paras.AuditResult = args[1];
                paras.UserInfo = args[2];
            }

            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            viewReload(form, result, cxt);

        };

        funs.AuditWorkitem = function (name, cxt, args) {
            CommitWorkitem(cxt, args);
        };

        funs.CommitWorkitem = function (name, cxt, args) {
            CommitWorkitem(cxt, args);
        };

        funs.BatchCommitWorkitem = function (name, cxt, args) {
            var form = cxt.form;
            var OIDList = null;
            var result = 1;
            var userInfo = "";
            if (args.length == 3) {
                OIDList = [];
                var list = args[0];
                for (var i = 0, len = list.length; i < len; i++) {
                    OIDList.push(YIUI.TypeConvertor.toLong(list[i]));
                }
                result = YIUI.TypeConvertor.toInt(args[1]);
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            } else {
                var tableKey = YIUI.TypeConvertor.toString(args[0]);
                var OIDFieldKey = YIUI.TypeConvertor.toString(args[1]);
                OIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, OIDFieldKey, true);
                result = YIUI.TypeConvertor.toInt(args[2]);
                userInfo = YIUI.TypeConvertor.toString(args[3]);
            }

            var paras = {
                userInfo: userInfo,
                result: result,
                WIDList: $.toJSON(OIDList),
                cmd: "PureBatchCommitWorkitem",
                service: "PureWebBPM"
            };
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return true;
        };

        funs.StartInstance = function (name, cxt, args) {
            var form = cxt.form;
            var paras = {};
            paras.service = "PureWebBPM";
            paras.cmd = "PureStartInstance";
            paras.formKey = form.formKey;
            paras.processKey = args[0];
            paras.oid = form.OID;
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            viewReload(form, result, cxt);
        };

        funs.RestartInstance = function (name, cxt, args) {
            var form = cxt.form;
            var instanceID = YIUI.TypeConvertor.toInt(args[0]);
            if (instanceID == -1) {
                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;
            }
            var paras = {};
            paras.service = "PureWebBPM";
            paras.cmd = "PureRestartInstance";
            paras.formKey = form.formKey;
            paras.oid = form.OID;
            paras.instanceID = instanceID;
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            viewReload(form, result, cxt);
            return true;
        };

        funs.KillInstance = function (name, cxt, args) {
            var instanceID = args[0].toString();
            if (instanceID == -1) {
                var form = cxt.form;
                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;
            }
            var paras = {
                instanceID: instanceID,
                cmd: "PureKillInstance",
                service: "PureWebBPM"
            };
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            viewReload(form, result, cxt);
        };

        var viewReload = function (form, newFormJson, cxt) {
            var container = form.getDefContainer();
            if (container == null) {
                container = form.getContainer();
            }
            var newForm = YIUI.UIUtil.replaceForm(form, newFormJson, cxt);

            var tag = newForm.getSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW);
            // 如果这个工作项是代办页面打开的，提交工作项之后刷新代办页面
            if (tag == YIUI.BPMConstants.WORKITEM_VIEW) {
                var pFormID = newForm.pFormID;
                var viewForm = YIUI.FormStack.getForm(pFormID);
                if (!viewForm || viewForm.type != YIUI.Form_Type.View) {
                    return;
                }
                var old = viewForm.getOperationState();

                var loadParent = new YIUI.LoadOpt(viewForm);
                loadParent.doOpt();

                viewForm.setOperationState(old);
                viewForm.showDocument();
            }
            // 获取载入前数据的版本号
            var originDocContainVerID = false;
            var originVerID = -1;
            var originDoc = newForm.getDocument();
            if (originDoc) {
                //MainTable
                var mtKey = newForm.mainTableKey;
                var mt = originDoc.getByKey(mtKey);
                if (mt && mt.getRowCount() > 0) {
                    originVerID = mt.getByKey(YIUI.SystemField.VERID_SYS_KEY);
                    if (originVerID >= 0)
                        originDocContainVerID = true;
                }
            }

            var loadParent = new YIUI.LoadOpt(newForm);
            loadParent.doOpt();

            // 原始数据无版本信息，那么就不要执行UpdateView
            if (!originDocContainVerID)
                return;

            // 获取载入后数据的版本号，如果发生了变化,那么执行UpdateView
            var activeDoc = newForm.getDocument();
            if (activeDoc != null) {
                var mtKey = newForm.mainTableKey;
                var mt = activeDoc.getByKey(mtKey);
                if (mt && mt.getRowCount() > 0) {
                    var newVerID = mt.getByKey(YIUI.SystemField.VERID_SYS_KEY);
                    if (parseInt(newVerID) > parseInt(originVerID)) {
                        updateView(cxt);
                    }
                }
            }

        };

        funs.RollbackToWorkitem = function (name, cxt, args) {
            var form = cxt.form;
            var WID = YIUI.TypeConvertor.toInt(args[0]);
            var logicCheck = false;
            if (args.length > 1) {
                logicCheck = YIUI.TypeConvertor.toBoolean(args[1]);
            }
            var paras = {
                WID: WID,
                logicCheck: logicCheck,
                formKey: form.formKey,
                OID: form.OID,
                cmd: "PureRollbackToWorkitem",
                service: "PureWebBPM"
            };
            var ps = form.paras;
            paras.paras = JSON.stringify(ps.getMap());

            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            viewReload(form, result, cxt);
            return true;
        };

        funs.AssignNextNodeParticipator = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var role = false;
            if (args.length > 2) {
                role = YIUI.TypeConvertor.toBoolean(args[2]);
            }
            var table = new DataDef.DataTable();
            var user_type = YIUI.DataUtil.dataType2JavaDataType(YIUI.DataType.STRING);
            table.addCol(YIUI.PPObject_Type.ColumnType, YIUI.DataType.STRING, user_type);
            table.addCol(YIUI.PPObject_Type.ColumnInfo, YIUI.DataType.STRING, user_type);

            var pp = new YIUI.PPObject(table);

            var opStr = YIUI.TypeConvertor.toString(args[1]);
            table.addRow();

            table.setByKey(YIUI.PPObject_Type.ColumnType, role ? YIUI.PPObject_Type.DicRole : YIUI.PPObject_Type.DicOperator);
            table.setByKey(YIUI.PPObject_Type.ColumnInfo, opStr);

            info.NextOpStr = $.toJSON(pp.toJSON());
            return true;
        };

        funs.SetCustomKey = function (name, cxt, args) {
            var customKey = YIUI.TypeConvertor.toString(args[0]);
            var form = cxt.form;
            var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
            info.OperationKey = customKey;
            return true;
        };

        funs.BatchStateAction = function (name, cxt, args) {
            var form = cxt.form;
            var processKey = YIUI.TypeConvertor.toString(form.getPara(YIUI.BatchBPM.BPM_PROCESS_KEY));
            var actionNodeKey = YIUI.TypeConvertor.toString(form.getPara(YIUI.BatchBPM.BPM_ACTION_NODE_KEY));
            var lv = null;
            var mTblKey = form.mainTableKey;
            if (mTblKey) {
                lv = form.getListView(mTblKey);
            } else {
                lv = form.getListView(0);
            }
            var OIDList = lv.getFieldArray(form, YIUI.SystemField.OID_SYS_KEY);
            var result = YIUI.TypeConvertor.toInt(args[0]);
            var userInfo = YIUI.TypeConvertor.toString(args[1]);
            var paras = {
                processKey: processKey,
                actionNodeKey: actionNodeKey,
                result: result,
                userInfo: userInfo,
                OIDList: $.toJSON(OIDList),
                cmd: "PureBatchStateAction",
                service: "PureViewMap"
            };
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return true;
        };

        funs.GetProcessPath = function (name, cxt, args) {
            var OID = null;
            if (args.length > 0) {
                OID = YIUI.TypeConvertor.toInt(args[0]);
            } else {
                var form = cxt.form;
                if (form) {
                    var doc = form.getDocument();
                    if (doc) {
                        OID = doc.getOID();
                    }
                }
            }
            var paras = {
                OID: OID,
                cmd: "PureLoadProcessPath",
                service: "PureViewMap"
            };
            var rs = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return rs;
        };
        
        funs.RegisterAttachment = function (name, cxt, args) {
        	var OID = YIUI.TypeConvertor.toLong(args[0]);
			var key = YIUI.TypeConvertor.toString(args[1]);
			var attachmentOID = YIUI.TypeConvertor.toLong(args[2]);

			var attachmentPara = "";
			if (args.length > 3)
				attachmentPara = YIUI.TypeConvertor.toString(args[3]);
			var attachmentInfo = "";
			if (args.length > 4)
				attachmentInfo = YIUI.TypeConvertor.toString(args[4]);

			 var paras = {
                OID: OID,
                Key: key,
                AttachmentOID: attachmentOID,
                AttachmentInfo: attachmentInfo,
                AttachmentPara: attachmentPara,
                cmd: "RegisterAttachment",
                service: "BPM"
            };
            var rs = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            
//            var newForm = YIUI.FormBuilder.build(result);
//            var container = form.getDefContainer();
//            if (container == null) {
//                container = form.getContainer();
//            }
//            newForm.setContainer(container);
//            newForm.setSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW, YIUI.BPMConstants.WORKITEM_VIEW);
//            newForm.pFormID = form.formID;
//            container.build(newForm);
            
			return true;
        };
    }

    { //Detail相关
        funs.OpenDetail = function (name, cxt, args) {
            var detailFormKey = YIUI.TypeConvertor.toString(args[0]),
                OID = YIUI.TypeConvertor.toString(args[1]),
                DOID = YIUI.TypeConvertor.toString(args[2]),
                form = cxt.form;
            if (DOID == undefined || DOID == "" || DOID == null) return;
            var paras = {cmd: "PureOpenDetail", OID: OID, DOID: DOID, detailFormKey: detailFormKey};
            var success = function (jsonObj) {
                YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, form.formID);
            };
            Svr.SvrMgr.dealWithPureForm(paras, success);
        };
        funs.OpenDetailInGrid = function (name, cxt, args) {
            var detailFormKey = YIUI.TypeConvertor.toString(args[0]),
                OID = YIUI.TypeConvertor.toString(args[1]),
                DOID = YIUI.TypeConvertor.toString(args[2]),
                form = cxt.form, rowIndex = cxt.rowIndex;
            var paras = {cmd: "PureOpenDetail", OID: OID, DOID: DOID, inGrid: true, detailFormKey: detailFormKey};
            var success = function (jsonObj) {
                var newForm = YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, form.formID);
                newForm.getDocument().oid = OID;
                newForm.getDocument().clear();
                var pTable = form.getDocument().getByKey(newForm.refTableKey);
                var pGrid = form.getGridInfoByTableKey(newForm.refTableKey);
                pGrid = form.getComponent(pGrid.key);
                if (rowIndex == undefined) {
                    rowIndex = pGrid.getFocusRowIndex();
                } else {
                    pGrid.setFocusRowIndex(rowIndex);
                }
                var focusRow = pGrid.getRowDataAt(rowIndex);
                pTable.setByBkmk(focusRow.bookmark);
                var nTable = new DataDef.DataTable();
                $.extend(true, nTable.cols, pTable.cols);
                nTable.key = pTable.key;
                nTable.addRow();
                for (var i = 0, len = nTable.cols.length; i < len; i++) {
                    nTable.set(i, pTable.get(i));
                }
                nTable.batchUpdate();
                newForm.getDocument().add(newForm.refTableKey, nTable);
                newForm.showDocument();
            };
            Svr.SvrMgr.dealWithPureForm(paras, success);
        };
        funs.SaveDetail = function (name, cxt, args) {
            var direct = false, form = cxt.form, doc = form.getDocument(),
                refTableKey = form.refTableKey, isStandalone = form.isStandalone();
            var pForm = YIUI.FormStack.getForm(form.pFormID);
            if (args.length > 0) {
                direct = YIUI.TypeConvertor.toBoolean(args[0]);
            }
            var uiCheckOpt = new YIUI.UICheckOpt(form);
            if (!uiCheckOpt.doOpt()) return false;
            if (direct) {
                doc.docType = DataDef.D_ObjDtl;
                doc.setModified();
                var document = YIUI.DataUtil.toJSONDoc(doc);
                var params = {
                    cmd: "PureSaveData",
                    document: $.toJSON(document),
                    formKey: form.getFormKey()
                };
                var resultJson = Svr.SvrMgr.dealWithPureData(params);
                YIUI.FormBuilder.diff(form, resultJson);
                if (!isStandalone) {
                    pForm.reloadTable(refTableKey);
                    pForm.showDocument();
                }
            } else {
                if (!isStandalone) {
                    var pGrid = pForm.getGridInfoByTableKey(refTableKey);
                    pGrid = pForm.getComponent(pGrid.key);
                    var nTable = form.getDocument().getByKey(refTableKey),
                        pTable = pForm.getDocument().getByKey(refTableKey), rowData;
                    if (form.getOperationState() == YIUI.Form_OperationState.New) {
                        pTable.addRow();
                        var row , lastRowIndex = -1;
                        for (var dlen = pGrid.getRowCount(), di = dlen - 1; di >= 0; di--) {
                            row = pGrid.getRowDataAt(di);
                            if (row.isDetail && row.bookmark != null) {
                                lastRowIndex = di + 1;
                                break;
                            }
                        }
                        rowData = pGrid.addGridRow(null, lastRowIndex, false);
                        rowData.bookmark = pTable.getBkmk();
                    } else {
                        rowData = pGrid.getRowDataAt(pGrid.getFocusRowIndex());
                    }
                    pTable.setByBkmk(rowData.bookmark);
                    nTable.first();
                    for (var i = 0, len = nTable.cols.length; i < len; i++) {
                        pTable.set(i, nTable.get(i));
                    }
                    pGrid.showDetailRow(pGrid.getRowIndexByID(rowData.rowID), true);
                }
            }
        };
        funs.EditDetail = function (name, cxt, args) {
            var detailFormKey = YIUI.TypeConvertor.toString(args[0]),
                OID = YIUI.TypeConvertor.toString(args[1]),
                DOID = YIUI.TypeConvertor.toString(args[2]),
                form = cxt.form;
            if (DOID == undefined || DOID == "" || DOID == null) return;
            var paras = {cmd: "PureOpenDetail", OID: OID, DOID: DOID, doEdit: true, detailFormKey: detailFormKey};
            var success = function (jsonObj) {
                YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, form.formID);
            };
            Svr.SvrMgr.dealWithPureForm(paras, success);
        };
        funs.EditDetailInGrid = function (name, cxt, args) {
            var detailFormKey = YIUI.TypeConvertor.toString(args[0]),
                OID = YIUI.TypeConvertor.toString(args[1]),
                DOID = YIUI.TypeConvertor.toString(args[2]),
                form = cxt.form, rowIndex = cxt.rowIndex;
            var paras = {cmd: "PureOpenDetail", OID: OID, DOID: DOID, inGrid: true, doEdit: true, detailFormKey: detailFormKey};
            var success = function (jsonObj) {
                var newForm = YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, form.formID);
                newForm.getDocument().oid = OID;
                newForm.getDocument().clear();
                var pTable = form.getDocument().getByKey(newForm.refTableKey);
                var pGrid = form.getGridInfoByTableKey(newForm.refTableKey);
                pGrid = form.getComponent(pGrid.key);
                if (rowIndex == undefined) {
                    rowIndex = pGrid.getFocusRowIndex();
                } else {
                    pGrid.setFocusRowIndex(rowIndex);
                }
                var focusRow = pGrid.getRowDataAt(rowIndex);
                pTable.setByBkmk(focusRow.bookmark);
                var nTable = new DataDef.DataTable();
                $.extend(true, nTable.cols, pTable.cols);
                nTable.key = pTable.key;
                nTable.addRow();
                for (var i = 0, len = nTable.cols.length; i < len; i++) {
                    nTable.set(i, pTable.get(i));
                }
                nTable.batchUpdate();
                newForm.getDocument().add(newForm.refTableKey, nTable);
                newForm.showDocument();
            };
            Svr.SvrMgr.dealWithPureForm(paras, success);
        };
        funs.NewDetail = function (name, cxt, args) {
            var detailFormKey = YIUI.TypeConvertor.toString(args[0]),
                OID = YIUI.TypeConvertor.toString(args[1]), form = cxt.form, doc = form.getDocument();
            var paras = {cmd: "PureNewDetail", OID: OID, VERID: doc.verid, DVERID: doc.dverid, detailFormKey: detailFormKey};
            var success = function (jsonObj) {
                YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, form.formID);
            };
            Svr.SvrMgr.dealWithPureForm(paras, success);
        };
        funs.NewDetailInGrid = function (name, cxt, args) {
            var detailFormKey = YIUI.TypeConvertor.toString(args[0]),
                OID = YIUI.TypeConvertor.toString(args[1]), form = cxt.form, doc = form.getDocument();
            var paras = {cmd: "PureNewDetail", OID: OID, VERID: doc.verid, DVERID: doc.dverid, inGrid: true, detailFormKey: detailFormKey};
            var success = function (jsonObj) {
                YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, form.formID);
            };
            Svr.SvrMgr.dealWithPureForm(paras, success);
        };
    }

    { //BPMExtendFunction BPM扩展公式
        funs.TransferTask = function (name, cxt, args) {
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
                operatorID = parseFloat(args[1].toString()),
                createRecord = false;
            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
            if (args.length > 2) {
                createRecord = args[2];
            }
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, {
                service: "BPMExtend",
                cmd: "TransferTask",
                WorkitemID: WID,
                OperatorID: operatorID,
                CreateRecord: createRecord
            });
        };
        funs.EndorseTask = function (name, cxt, args) {
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
                operatorID = parseFloat(args[1].toString()),
                launchInfo = "";
            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
            if (args.length > 2) {
                launchInfo = args[2].toString();
            }
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, {
                service: "BPMExtend",
                cmd: "EndorseTask",
                WorkitemID: WID,
                OperatorID: operatorID,
                LaunchInfo: launchInfo
            });
        };
        funs.LaunchTask = function (name, cxt, args) {
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
                nodeKey = args[1].toString(),
                operatorID = parseFloat(args[2].toString()),
                launchInfo = args[3].toString(),
                hideActiveWorkitem = args[4];
            var ppObject = {Type: 1, OperatorID: operatorID};
            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, {
                service: "BPMExtend",
                cmd: "LaunchTask",
                WorkitemID: WID,
                NodeKey: nodeKey,
                LaunchInfo: launchInfo,
                HideActiveWorkitem: hideActiveWorkitem,
                PPObject: JSON.stringify(ppObject)
            });
        };
        funs.FillGrid = function (name, cxt, args) {
            var form = cxt.form, gridKey = args[0].toString(), fields = [], dataTable = args[1], grid = form.getComponent(gridKey);
            for (var i = 2, len = args.length; i < len; i++) {
                fields.push(args[i].toString());
            }
            var convertData = function (cell, value) {
                var cellType = cell.edittype, result = value;
                if (cellType == "dict") {
                    var itemKey = cell.itemKey;
                    result = YIUI.UIUtil.convertDictValue(itemKey, cell, value);
                }
                return result;
            };
            dataTable.beforeFirst();
            while (dataTable.next()) {
                var index = grid.getLastDetailRowIndex();
                for (var j = 0, jLen = fields.length; j < jLen; j++) {
                    var cellKey = fields[j],
                        value = dataTable.get(j);
                    var cell = grid.dataModel.colModel.cells[cellKey];
                    value = convertData(cell, value);
                    grid.setValueByKey(index, cellKey, value, true, true);
                }
            }
        };
        funs.FillGridData = function (name, cxt, args) {
            var form = cxt.form, dataTable = args[1], doc = form.getDocument(),
                clearOldData = false, gridKey = args[0].toString(), grid = form.getComponent(gridKey);
            if (args.length > 2) {
                clearOldData = YIUI.TypeConvertor.toBoolean(args[2]);
            }
            if (grid == null) {
                YIUI.ViewException.throwException(YIUI.ViewException.COMPONENT_NOT_EXISTS);
            }
            var tableKey = grid.tableKey, oldTable = doc.getByKey(tableKey);
            if (oldTable != null) {
                if (clearOldData) {
                    YIUI.DataUtil.deleteAllRow(oldTable);
                }
                YIUI.DataUtil.append(dataTable, oldTable);
                oldTable.beforeFirst();
                grid.rootGroupBkmk = [];
                grid.reload();
            }
        }
    }
    return funs;
})();




var View = View || {};

(function() {
	View.FuncMap = new HashMap();
	Expr.regCluster(View.FuncMap, Expr.InnerFuns);
	Expr.regCluster(View.FuncMap, UI.BaseFuns);

	View.EvalEnv = function(form) {
		this.form = form;
        this.parser = new Expr.Parser(View.FuncMap);
	};

	Lang.impl(View.EvalEnv, {
		get : function(cxt, id, scope, obj){
			var form = cxt.form;
            var result = null;
    		if ( obj ) {
    			var heap = scope.getHeap();
    			if (heap.contains(obj)) {
    				var variable = heap.get(obj);
    				var valueImpl = null;
    				var para = scope.getPara(obj);
    				if ( para != null ) {
    					valueImpl = para;
    				} else {
    					if ( variable instanceof DataDef.DataTable ) {
    						valueImpl = new YIUI.TblValImpl();
    						scope.addPara(obj, valueImpl);
    					} else if ( variable instanceof DataDef.Document ) {
    						valueImpl = new YIUI.DocValImpl();
    						scope.addPara(obj, valueImpl);
    					} else if ( $.isObject(variable) ) {
    						valueImpl = new YIUI.JSONObjValImpl();
    						scope.addPara(obj, valueImpl);
    					} else if ( $.isArray(variable) ) {
    						valueImpl = new YIUI.JSONArrValImpl();
    						scope.addPara(obj, valueImpl);
    					}
    				}
    				result = valueImpl.getValue(variable, id);
    			} else {
    				result = YIUI.ExprUtil.getImplValue(form, id, cxt);
    			}
    		} else {
    			result = YIUI.ExprUtil.getImplValue(form, id, cxt);
    		}
    		return result;
		},
		set : function(cxt, id, value, scope, obj){
			var form = cxt.form;
			if ( obj ) {
				var heap = scope.getHeap();
				if ( heap.contains(obj) ) {
					var variable = heap.get(obj);
					var valueImpl = null;
					var para = scope.getPara(obj);
					if ( para ) {
						valueImpl = para;
					} else {
						if ( variable instanceof DataDef.DataTable ) {
							valueImpl = new YIUI.TblValImpl();
							scope.addPara(obj, valueImpl);
						} else if ( variable instanceof DataDef.Document ) {
							valueImpl = new YIUI.DocValImpl();
							scope.addPara(obj, valueImpl);
						} else if ( $.isObject(variable) ) {
    						valueImpl = new YIUI.JSONObjValImpl();
    						scope.addPara(obj, valueImpl);
    					}
					}
					valueImpl.setValue(variable, id, value);
				} else {
					YIUI.ExprUtil.setImplValue(form, id, value, cxt);
				}
			} else {
				YIUI.ExprUtil.setImplValue(form, id, value, cxt);
			}
		},
		checkMacro: function(cxt, name) {
            var macro, form = cxt.form;
            if (form !== null && form !== undefined) {
                macro = (form.macroMap == undefined) ? null : form.macroMap[name];
                
                if (macro == null) {
                    var paras = {
                        service: "PureMeta",
                        cmd: "GetMacro",
                        formKey: form.getFormKey(),
                        macroName: name
                    };
                    macro = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
        		}
        		
            }
            return macro;
		},
        evalMacro: function (cxt, scope, name, macro, args) {
            var newScope = new Expr.Scope(scope);
            var argsList = macro.args;
            if (argsList !== null && argsList !== undefined && argsList.length > 0) {
                var heap = newScope.getHeap();
                for (var i = 0; i < argsList.length; i++) {
                    heap.put(argsList[i], args[i]);
                }
            }
            return this.parser.eval(this, $.trim(macro.content), new Expr.Tree(), cxt, newScope);
        },
		getLoop: function(cxt, name,loop, obj) {
            var objectLoop = null;
            switch (loop) {
                case 0:
                    var key = obj.toString(), sepPos = key.indexOf(':'), para = null, comp;
                    if (sepPos > 0) {
                        para = key.substring(sepPos + 1);
                        key = key.substring(0, sepPos);
                    }
                    comp = cxt.form.getComponent(key);
                    if (comp.type == YIUI.CONTROLTYPE.LISTVIEW) {
                        objectLoop = new OBJLOOP.ListViewLoop(cxt, comp);
                    } else if (comp.type == YIUI.CONTROLTYPE.GRID) {
                        var includeEmptyRow = false;
                        if ("empty" == para) {
                            includeEmptyRow = true;
                        }
                        objectLoop = new OBJLOOP.GridLoop(cxt, comp, includeEmptyRow);
                    }
                    break;
            }
            return objectLoop;
		},
		resolveObject: function(self, scope, obj) {
			var newCxt = null;
			var form = self.form;
			if (Expr.S_SELF == obj.toLowerCase()) {
				newCxt = self;
			} else if (Expr.S_PARENT == obj.toLowerCase()) {
				var parent = form.getParentForm();
				newCxt = {form: parent};
			} else {
				var comp = form.getComponent(obj);
				if (comp && comp.tagName ==  "stackcontainer") {
					var activeForm = comp.getActivePane();
					if (activeForm) {
						newCxt = activeForm.newCxt();
					} else {
						var viewCxt = {parent: form};
						newCxt = viewCxt;
					}
				} else {
					var v = scope.getHeap().get(obj);
					if ( v != null ) {
						newCxt = {obj: v};
					}
				}
			}
			return newCxt;
		},
		evalObject: function(cxt, obj, name, args) {
			return null;
		},
		evalFuncImpl: function(cxt, scope, obj, name) {
			var impl = null;
			var v = scope.getHeap().get(obj);
			if ( v ) {
				if ( v instanceof DataDef.DataTable ) {
					impl = View.TblFunImpl.get(name);
				} else if ( v instanceof DataDef.Document ) {
					impl = View.DocFunImpl.get(name);
				} else if ( $.isObject(v) ) {
					impl = View.JSONObjFunImpl.get(name);
				} else if ( $.isArray(v) ) {
					impl = View.JSONArrFunImpl.get(name);
				}
			}
			return impl;
		}
	});

	View.Parser = function(form) {
		this.form = form;
		this.parser = new Expr.Parser(View.FuncMap);
		this.env = new View.EvalEnv(form);
	};

	Lang.impl(View.Parser, {
        eval: function (script, cxt, hack) {
            var tree = new Expr.Tree();
            var scope = new Expr.Scope();
            return this.parser.eval(this.env, script, tree, cxt, scope);
        },
        evalByTree: function (tree, cxt, hack) {
            var scope = new Expr.Scope();
            return this.parser.evalByTree(this.env, tree, cxt, scope);
        },
        getSyntaxTree: function (script) {
            var tree = new Expr.Tree();
            this.parser.parse(script, tree);
            tree.opti();
            return tree;
        }
    });
})();
var OBJLOOP = OBJLOOP || {};
(function () {
    OBJLOOP.DataTableLoop = function (table) {
        this.table = table;
    };
    Lang.impl(OBJLOOP.DataTableLoop, {
        hasNext: function () {
            return this.table.getRowCount() > 0 && !this.table.isLast();
        },
        next: function () {
            this.table.next();
        },
        clean: function () {

        }
    });
    OBJLOOP.GridLoop = function (cxt, grid, includeEmptyRow) {
        this.index = -1;
        this.context = cxt;
        this.includeEmptyRow = includeEmptyRow;
        this.key = grid.key;
        this.count = 0;
        if (this.includeEmptyRow) {
            this.count = grid.getRowCount();
        } else {
            for (var i = 0, tmpCount = grid.getRowCount(); i < tmpCount; i++) {
                var row = grid.dataModel.data[i];
                if (!(row.isDetail && row.bookmark == undefined)) {
                    this.count++;
                }
            }
        }
    };
    Lang.impl(OBJLOOP.GridLoop, {
        hasNext: function () {
            return this.count > 0 && this.index < this.count - 1;
        },
        next: function () {
            ++this.index;
            this.context.key = this.key;
            this.context.rowIndex = this.index;
        },
        clean: function () {

        }
    });
    OBJLOOP.ListViewLoop = function (cxt, listView) {
        this.index = -1;
        this.context = cxt;
        this.key = listView.key;
        this.count = listView.data.length;
    };
    Lang.impl(OBJLOOP.ListViewLoop, {
        hasNext: function () {
            return this.count > 0 && this.index < this.count - 1;
        },
        next: function () {
            ++this.index;
            this.context.key = this.key;
            this.context.rowIndex = this.index;
        },
        clean: function () {

        }
    });
})();YIUI.UIUtil = (function () {
    var Return = {
        getCompValue: function (control, table) {
            var compValue = null;
            var value = null;

            var columnKey = control.columnKey;

            if (table.isValid()) {
                value = table.getByKey(columnKey);
            }
            if (value == null) {
                return value;
            }
            var type = control.type;
            var itemKey;
            switch (type) {
                case YIUI.CONTROLTYPE.DICT:
                case YIUI.CONTROLTYPE.COMPDICT:
                case YIUI.CONTROLTYPE.DYNAMICDICT:
                    itemKey = control.itemKey;
                    if (control.multiSelect) {
                        if ($.isEmptyObject(value)) {
                            break;
                        }
                        if (type == YIUI.CONTROLTYPE.DYNAMICDICT) {
                            itemKey = table.getByKey(columnKey + "ItemKey");
                        }

                        if (type == YIUI.CONTROLTYPE.COMPDICT) {
                            YIUI.ViewException.throwException(YIUI.ViewException.COMPDICT_CANNOT_SET_MULTIDICT, control.key);
                        }
                    } else {
                        if ((parseInt(value)) <= 0) {
                            break;
                        }
                        if (type == YIUI.CONTROLTYPE.DYNAMICDICT) {
                            itemKey = table.getByKey(columnKey + "ItemKey");

                            if (itemKey == null || itemKey.length() == 0) {
                                YIUI.ViewException.throwException(YIUI.ViewException.DYNAMICDICT_ITEMKEY_NULL, control.key);
                            }
                        } else if (type == YIUI.CONTROLTYPE.COMPDICT) {
                            itemKey = table.getByKey(columnKey + "ItemKey");
                            if (itemKey == null || itemKey.length() == 0) {
                                YIUI.ViewException.throwException(YIUI.ViewException.COMPDICT_ITEMKEY_NULL, control.key);
                            }

                            if (dict.isAllowMultiSelection()) {
                                YIUI.ViewException.throwException(YIUI.ViewException.COMPDICT_CANNOT_SET_MULTIDICT, control.key);
                            }

                        }
                    }

                    //是否有预加载的caption字段
                    var captionKey = columnKey + "_caption";
                    var columnIndex = table.indexByKey(captionKey);

                    compValue = convertDictValue(itemKey, dict, value);

                    break;
                default:
                    compValue = value;
            }
            return compValue;
        },

        convertDictValue: function (itemKey, dict, value) {
            var ret = null;
            if (dict.multiSelect) {
                var ids = value;
                if (ids.length > 0) {
                    var oids = ids.split(",");
                    if (oids.length > 0) {
                        var list = [];
                        var data = null;
                        for (var i = 0, len = oids.length; i < len; i++) {
                            data = {
                                itemKey: itemKey,
                                oid: oids[i]
                            };
                            list.add(data);
                        }
                        ret = list;
                    }
                }
            } else {
                var oid = parseFloat(value);
                var data = {
                    itemKey: itemKey,
                    oid: oid
                };
                ret = data;
            }
            return ret;
        },


        format: function (format, args, startPos) {
            var result = "";
            var length = format.length;
            var Para = function () {
                this.index = -1;
                this.setIndex = function (index) {
                    this.index = index;
                };
                this.getIndex = function () {
                    return this.index;
                }
            };
            var v = [];
            var l_i = 0;
            var i = 0;
            while (i < length) {
                var c = format.charAt(i);
                if (c == '{') {
                    var s_b = i;
                    var s_e = -1;
                    // 潜在的参数
                    ++i;
                    if (i < length) {
                        c = format.charAt(i);
                        if ($.isNumeric(c)) {
                            while ($.isNumeric(c) && i < length) {
                                ++i;
                                c = format.charAt(i);
                            }
                            if (i < length) {
                                if (c == '}') {
                                    s_e = i;
                                }
                                ++i;
                            }
                        } else {
                            ++i;
                        }
                    }
                    if (s_e != -1) {
                        // 生成之前的字符串
                        if (l_i < s_b) {
                            v.push(format.substring(l_i, s_b));
                        }

                        // 找到一个参数
                        var p = new Para();
                        var s = format.substring(s_b + 1, s_e);
                        p.setIndex(parseInt(s));
                        v.push(p);
                        l_i = s_e + 1;
                    }
                } else {
                    ++i;
                }
            }
            if (l_i < i) {
                v.push(format.substring(l_i));
            }

            var obj;
            for (var vi = 0, len = v.length; vi < len; vi++) {
                obj = v[vi];
                if (obj instanceof  Para) {
                    result += args[obj.getIndex() - 1 + startPos];
                } else {
                    result += obj;
                }
            }

            return result;
        },

        /**
         * form: 被替换的form对象
         * formJson: 需要替换成的form的json序列化
         * cxt: 上下文环境
         */
        replaceForm: function (form, formJson, cxt) {
            if (form.formKey != formJson.form.key) return form;
            var container = form.getContainer();
            var newForm = null;
            if (container) {
                var el = form.getRoot().el;
                var selLi = $("li.aria-selected[aria-controls=" + el.attr("id") + "]");
                var ul = selLi.parent();
                var prevLi = selLi.prev();
                var nextLi = selLi.next();

                container.removeForm(form);

                formJson.form.formID = form.formID;
                newForm = YIUI.FormBuilder.build(formJson);
                newForm.pFormID = form.pFormID;
                newForm.entryKey = form.entryKey;
                newForm.initOperationState = form.initOperationState;
                container.isReplace = true;
                container.build(newForm);
                var newEl = newForm.getRoot().el;
                var newLi = $("li[aria-controls=" + newEl.attr("id") + "]", ul);
                if (prevLi.length > 0) {
                    prevLi.after(newLi);
                } else {
                    nextLi.before(newLi);
                }
            } else {
                var parent = form.getRoot().el.parent();
                parent.empty();
                YIUI.FormStack.removeForm(form.formID);
                newForm = YIUI.FormBuilder.build(formJson);
                newForm.getRoot().render(parent);
            }
            newForm.target = form.target;
            if (newForm.target == 2) {
                $("#" + form.formID).attr("id", newForm.formID);
            }
            newForm.dictCaption = form.dictCaption;
            var sysExpVals = $.extend(form.sysExpVals, newForm.sysExpVals);
            newForm.sysExpVals = sysExpVals;
            cxt.form = newForm;
            return newForm;
        },
        isNull: function (v) {
            return (v == undefined || v == null);
        },
        getCompareType: function (v1, v2) {
            var type = -1;
            if (this.isNull(v1)) {
                var temp = v2;
                v2 = v1;
                v1 = temp;
            }
            if (this.isNull(v1)) {
                type = DataType.NUMERIC;
            } else if (typeof v1 == "string") {
                if ($.isNumeric(v1)) {
                    type = DataType.NUMERIC;
                } else {
                    type = DataType.STRING;
                }
            } else if (typeof v1 == "number") {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else {
                    type = DataType.NUMERIC;
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
                }
            }
            return type;
        }
    };

    return Return;
})();YIUI.BatchUtil = (function () {
    var Return = {
    		getViewSelOIDs: function(form, defaultValue) {
    			
    		},
    		getSelectOIDs: function(form, tblKey, oidKey, defaultValue) {
    			var oids = new Array();
    			var doc = form.getDocument();
    			var table = doc.getByKey(tblKey);
    			
    			var s_Key = YIUI.DataUtil.getShadowTableKey(tblKey);
    			var s_Tbl = doc.getByKey(s_Key);
    			
    			// 如果有影子表格,直接取影子表数据
    			if( s_Tbl != null ) {
    				s_Tbl.beforeFirst();
    				while( s_Tbl.next() ) {
    					var OID = s_Tbl.getByKey(oidKey);
    					oids.push(OID);
    				}
    			} else {
    				var lv = form.getListView(tblKey);
    		        var grid = form.getGridInfoByTableKey(tblKey);
    		        if (lv) {
    		            oids = lv.getFieldArray(form, oidKey);
    		        } else if (grid) {
    		            oids = grid.getFieldArray(form, oidKey);
    		        }
    			}
    			return oids;
    		
    		}
    };
    return Return;
})();