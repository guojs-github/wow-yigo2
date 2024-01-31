/*!
 * bean.js - copyright Jacob Thornton 2011
 * https://github.com/fat/bean
 * MIT License
 * special thanks to:
 * dean edwards: http://dean.edwards.name/
 * dperini: https://github.com/dperini/nwevents
 * the entire mootools team: github.com/mootools/mootools-core
 */
/*global module:true, define:true*/
!function (a, b, c)
{
    typeof module != "undefined" ? module.exports = c(a, b) : typeof define == "function" && typeof define.amd == "object" ? define(c) : b[a] = c(a, b)
}
("bean", this, function (a, b)
{
    var c = window,
    d = b[a],
    e = /over|out/,
    f = /[^\.]*(?=\..*)\.|.*/,
    g = /\..*/,
    h = "addEventListener",
    i = "attachEvent",
    j = "removeEventListener",
    k = "detachEvent",
    l = document || {},
    m = l.documentElement || {},
    n = m[h],
    o = n ? h : i,
    p = Array.prototype.slice,
    q = /click|mouse|menu|drag|drop/i,
    r = /^touch|^gesture/i,
    s =
    {
        one : 1
    },
    t = function (a, b, c)
    {
        for (c = 0; c < b.length; c++)
            a[b[c]] = 1;
        return a
    }
    ({}, ("click dblclick mouseup mousedown contextmenu mousewheel DOMMouseScroll mouseover mouseout mousemove selectstart selectend keydown keypress keyup orientationchange focus blur change reset select submit load unload beforeunload resize move DOMContentLoaded readystatechange error abort scroll " + (n ? "show input invalid touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend message readystatechange pageshow pagehide popstate hashchange offline online afterprint beforeprint dragstart dragenter dragover dragleave drag drop dragend loadstart progress suspend emptied stalled loadmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate play pause ratechange volumechange cuechange checking noupdate downloading cached updateready obsolete " : "")).split(" ")),
    u = function ()
    {
        function a(a, b)
        {
            while ((b = b.parentNode) !== null)
                if (b === a)
                    return !0;
            return !1
        }
        function b(b)
        {
            var c = b.relatedTarget;
            return c ? c !== this && c.prefix !== "xul" && !/document/.test(this.toString()) && !a(this, c) : c === null
        }
        return
        {
            mouseenter : {
                base : "mouseover",
                condition : b
            },
            mouseleave : {
                base : "mouseout",
                condition : b
            },
            mousewheel : {
                base : /Firefox/.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel"
            }
        }
    }
    (),
    v = function ()
    {
        var a = "altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which".split(" "),
        b = a.concat("button buttons clientX clientY dataTransfer fromElement offset
                X offsetY pageX pageY screenX screenY toElement".split(" ")),
        c = a.concat("char charCode key keyCode".split(" ")),
        d = a.concat("touches targetTouches changedTouches scale rotation".split(" ")),
        f = "preventDefault",
        g = function (a)
        {
            return function ()
            {
                a[f] ? a[f]() : a.returnValue = !1
            }
        },
        h = "stopPropagation",
        i = function (a)
        {
            return function ()
            {
                a[h] ? a[h]() : a.cancelBubble = !0
            }
        },
        j = function (a)
        {
            return function ()
            {
                a[f](),
                a[h](),
                a.stopped = !0
            }
        },
        k = function (a, b, c)
        {
            var d,
            e;
            for (d = c.length; d--; )
                e = c[d], !(e in b) && e in a && (b[e] = a[e])
        };
        return function (n, o)
        {
            var p =
            {
                originalEvent : n,
                isNative : o
            };
            if (!n)
                return p;
            var s,
            t = n.type,
            u = n.target || n.srcElement;
            p[f] = g(n),
            p[h] = i(n),
            p.stop = j(p),
            p.target = u && u.nodeType === 3 ? u.parentNode : u;
            if (o)
            {
                if (t.indexOf("key") !== -1)
                    s = c, p.keyCode = n.which || n.keyCode;
                else if (q.test(t))
                {
                    s = b,
                    p.rightClick = n.which === 3 || n.button === 2,
                    p.pos =
                    {
                        x : 0,
                        y : 0
                    };
                    if (n.pageX || n.pageY)
                        p.clientX = n.pageX, p.clientY = n.pageY;
                    else if (n.clientX || n.clientY)
                        p.clientX = n.clientX + l.body.scrollLeft + m.scrollLeft, p.clientY = n.clientY + l.body.scrollTop + m.scrollTop;
                    e.test(t) && (p.relatedTarget = n.relatedTarget || n[(t === "mouseover" ? "from" : "to") + "Element"])
                }
                else
                    r.test(t) && (s = d);
                k(n, p, s || a)
            }
            return p
        }
    }
    (),
    w = function (a, b)
    {
        return !n && !b && (a === l || a === c) ? m : a
    },
    x = function ()
    {
        function a(a, b, c, d, e)
        {
            this.element = a,
            this.type = b,
            this.handler = c,
            this.original = d,
            this.namespaces = e,
            this.custom = u[b],
            this.isNative = t[b] && a[o],
            this.eventType = n || this.isNative ? b : "propertychange",
            this.customType = !n && !this.isNative && b,
            this.target = w(a, this.isNative),
            this.eventSupport = this.target[o]
        }
        return a.prototype =
        {
            inNamespaces : function (a)
            {
                var b,
                c;
                if (!a)
                    return !0;
                if (!this.namespaces)
                    return !1;
                for (b = a.length; b--; )
                    for (c = this.namespaces.length; c--; )
                        if (a[b] === this.namespaces[c])
                            return !0;
                return !1
            },
            matches : function (a, b, c)
            {
                return this.element === a && (!b || this.original === b) && (!c || this.handler === c)
            }
        },
        a
    }
    (),
    y = function ()
    {
        var a = {},
        b = function (c, d, e, f, g)
        {
            if (!d || d === "*")
                for (var h in a)
                    h.charAt(0) === "$" && b(c, h.substr(1), e, f, g);
            else
            {
                var i = 0,
                j,
                k = a["$" + d],
                l = c === "*";
                if (!k)
                    return;
                for (j = k.length; i < j; i++)
                    if (l || k[i].matches(c, e, f))
                        if (!g(k[i], k, i, d))
                            return
            }
        },
        c = function (b, c, d)
        {
            var e,
            f = a["$" + c];
            if (f)
                for (e = f.length; e--; )
                    if (f[e].matches(b, d, null))
                        return !0;
            return !1
        },
        d = function (a, c, d)
        {
            var e = [];
            return b(a, c, d, null, function (a)
            {
                return e.push(a)
            }
            ),
            e
        },
        e = function (b)
        {
            return (a["$" + b.type] || (a["$" + b.type] = [])).push(b),
            b
        },
        f = function (c)
        {
            b(c.element, c.type, null, c.handler, function (b, c, d)
            {
                return c.splice(d, 1),
                c.length === 0 && delete a["$" + b.type],
                !1
            }
            )
        },
        g = function ()
        {
            var b,
            c = [];
            for (b in a)
                b.charAt(0) === "$" && (c = c.concat(a[b]));
            return c
        };
        return
        {
            has : c,
            get : d,
            put : e,
            del : f,
            entries : g
        }
    }
    (),
    z = n ? function (a, b, c, d)
    {
        a[d ? h : j](b, c, !1)
    }
     : function (a, b, c, d, e)
    {
        e && d && a["_on" + e] === null && (a["_on" + e] = 0),
        a[d ? i : k]("on" + b, c)
    },
    A = function (a, b, d)
    {
        return function (e)
        {
            return e = v(e || ((this.ownerDocument || this.document || this).parentWindow || c).event, !0),
            b.apply(a, [e].concat(d))
        }
    },
    B = function (a, b, d, e, f, g)
    {
        return function (h)
        {
            if (e ? e.apply(this, arguments) : n ? !0 : h && h.propertyName === "_on" + d || !h)
                h && (h = v(h || ((this.ownerDocument || this.document || this).parentWindow || c).event, g)), b.apply(a, h && (!f || f.length === 0) ? arguments : p.call(arguments, h ? 0 : 1).concat(f))
        }
    },
    C = function (a, b, c, d, e)
    {
        return function ()
        {
            a(b, c, e),
            d.apply(this, arguments)
        }
    },
    D = function (a, b, c, d)
    {
        var e,
        f,
        h,
        i = b && b.replace(g, ""),
        j = y.get(a, i, c);
        for (e = 0, f = j.length; e < f; e++)
            j[e].inNamespaces(d) && ((h = j[e]).eventSupport && z(h.target, h.eventType, h.handler, !1, h.type), y.del(h))
    },
    E = function (a, b, c, d, e)
    {
        var h,
        i = b.replace(g, ""),
        j = b.replace(f, "").split(".");
        if (y.has(a, i, c))
            return a;
        i === "unload" && (c = C(D, a, i, c, d)),
        u[i] && (u[i].condition && (c = B(a, c, i, u[i].condition, !0)), i = u[i].base || i),
        h = y.put(new x(a, i, c, d, j[0] && j)),
        h.handler = h.isNative ? A(a, h.handler, e) : B(a, h.handler, i, !1, e, !1),
        h.eventSupport && z(h.target, h.eventType, h.handler, !0, h.customType)
    },
    F = function (a, b, c)
    {
        return function (d)
        {
            var e,
            f,
            g = typeof a == "string" ? c(a, this) : a;
            for (e = d.target; e && e !== this; e = e.parentNode)
                for (f = g.length; f--; )
                    if (g[f] === e)
                        return b.apply(e, arguments)
        }
    },
    G = function (a, b, c)
    {
        var d,
        e,
        h,
        i,
        j,
        k = D,
        l = b && typeof b == "string";
        if (l && b.indexOf(" ") > 0)
        {
            b = b.split(" ");
            for (j = b.length; j--; )
                G(a, b[j], c);
            return a
        }
        h = l && b.replace(g, ""),
        h && u[h] && (h = u[h].type);
        if (
            !b || l)
        {
            if (i = l && b.replace(f, ""))
                i = i.split(".");
            k(a, h, c, i)
        }
        else if (typeof b == "function")
            k(a, null, b);
        else
            for (d in b)
                b.hasOwnProperty(d) && G(a, d, b[d]);
        return a
    },
    H = function (a, b, c, d, e)
    {
        var f,
        g,
        h,
        i,
        j = c,
        k = c && typeof c == "string";
        if (b && !c && typeof b == "object")
            for (f in b)
                b.hasOwnProperty(f) && H.apply(this, [a, f, b[f]]);
        else
        {
            i = arguments.length > 3 ? p.call(arguments, 3) : [],
            g = (k ? c : b).split(" "),
            k && (c = F(b, j = d, e)) && (i = p.call(i, 1)),
            this === s && (c = C(G, a, b, c, j));
            for (h = g.length; h--; )
                E(a, g[h], c, j, i)
        }
        return a
    },
    I = function ()
    {
        return H.apply(s, arguments)
    },
    J = n ? function (a, b, d)
    {
        var e = l.createEvent(a ? "HTMLEvents" : "UIEvents");
        e[a ? "initEvent" : "initUIEvent"](b, !0, !0, c, 1),
        d.dispatchEvent(e)
    }
     : function (a, b, c)
    {
        c = w(c, a),
        a ? c.fireEvent("on" + b, l.createEventObject()) : c["_on" + b]++
    },
    K = function (a, b, c)
    {
        var d,
        e,
        h,
        i,
        j,
        k = b.split(" ");
        for (d = k.length; d--; )
        {
            b = k[d].replace(g, "");
            if (i = k[d].replace(f, ""))
                i = i.split(".");
            if (!i && !c && a[o])
                J(t[b], b, a);
            else
            {
                j = y.get(a, b),
                c = [!1].concat(c);
                for (e = 0, h = j.length; e < h; e++)
                    j[e].inNamespaces(i) && j[e].handler.apply(a, c)
            }
        }
        return a
    },
    L = function (a, b, c)
    {
        var d = 0,
        e = y.get(b, c),
        f = e.length;
        for (; d < f; d++)
            e[d].original && H(a, e[d].type, e[d].original);
        return a
    },
    M =
    {
        add : H,
        one : I,
        remove : G,
        clone : L,
        fire : K,
        noConflict : function ()
        {
            return b[a] = d,
            this
        }
    };
    if (c[i])
    {
        var N = function ()
        {
            var a,
            b = y.entries();
            for (a in b)
                b[a].type && b[a].type !== "unload" && G(b[a].element, b[a].type);
            c[k]("onunload", N),
            c.CollectGarbage && c.CollectGarbage()
        };
        c[i]("onunload", N)
    }
    return M
}
);