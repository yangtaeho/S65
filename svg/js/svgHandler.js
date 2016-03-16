var $VG = (function() {
    var nsSVG = 'http://www.w3.org/2000/svg',
        nsXlink = 'http://www.w3.org/1999/xlink',
        generator = document.createElementNS(nsSVG, 'svg'),
        types = {
            'svg': SVGRoot,
            'g': SVGGroup,
            'line': SVGLine,
            'rect': SVGRect,
            'ellipse': SVGEllipse,
            'path': SVGPath,
            'text': SVGText
        };
    
    // svg factory function
    function SVGFactory(t) {
        var r;
        switch(true) {
            case t instanceof SVGHandler:
                return t;
            case t instanceof SVGElement:
                return new types[t.tagName](t);
            case !!(r = /<.*>/g.exec(t || '<svg>')):
                generator.innerHTML = r[0];
                return new types[generator.firstElementChild.tagName](generator.firstElementChild);
                //return new SVGCollection(generator.children);
            default:
                return new SVGCollection(document.querySelectorAll(t));
        }
    }
    
    // svg collection
    function SVGCollection(l) {
        for(var i=0; i<l.length; ++i)
            this[i] = SVGFactory(l[i]);
        this.length = l.length;
    }
    
    SVGCollection.prototype = new (function() {
        this.iterator = function(fn) {
            return function() {
                for(var i=0; i<this.length; i++)
                    this[i][fn] && this[i][fn].apply(this[i], arguments);
                return this;
            };
        };
        this.forEach = Array.prototype.forEach;
        this.first = function() { return this[0]; };
        ['attr', 'css', 'id', 'className', 'fill', 'fillRule',
         'stroke', 'strokeWidth', 'dashArray', 'lineCap', 'lineJoin',
         'appendTo', 'before', 'after'].forEach(function(v) {
            this[v] = this.iterator(v);
        }, this);
    })();
    
    // base constructor
    function SVGHandler(el) { this.element = el; }
    SVGHandler.prototype = {
        attr: function(k, v) {
            if(k instanceof Object)
                for(var kk in k)
                    this.element.setAttribute(kk, k[kk]);
            else if(typeof v == 'undefined')
                return this.element.getAttribute(k) || '';
            else
                this.element.setAttribute(k, v);
            return this;
        },
        css: function(k, v) {
            if(k instanceof Object)
                for(var kk in k)
                    this.element.style[kk] = k[kk];
            else if(typeof v == 'undefined')
                return this.element.style[k];
            else
                this.element.style[k] = v;
            return this;
        },
        id: function(v) { return this.attr('id', v); },
        className: function(v) { this.element.className.baseVal = v; return this; },
        appendTo: function(t) {
            t = SVGFactory(t);
            if(t instanceof SVGParent)
                t.element.appendChild(this.element);
            else
               throw new Error('cannot append SVG element to a HTMLElement');
            return this;
        },
        before: function(t) {
            t = SVGFactory(t);
            if(t instanceof SVGHandler)
                this.element.insertBefore(t.element);
            return this;
        },
        after: function(t) {
            t = SVGFactory(t);
            if(t instanceof SVGHandler)
                this.element.insertAfter(t.element);
        }
    };
    
    // common props for SVG shapes
    function SVGShape() {}
    SVGShape.prototype = new SVGHandler();
    // fill & stroke
    SVGShape.prototype.fill = function(v) { return this.css('fill', v); };
    SVGShape.prototype.fillRule = function(v) { return this.css('fill-rule', v); };
    SVGShape.prototype.stroke = function(v) { return this.css('stroke', v); };
    SVGShape.prototype.strokeWidth = function(v) { return this.css('stroke-width', v); };
    SVGShape.prototype.dashArray = function() { return this.css('stroke-dasharray', [].slice.call(arguments).join(' ')); };
    SVGShape.prototype.lineCap = function(v) { return this.css('stroke-linecap', v); };
    SVGShape.prototype.lineJoin = function(v) { return this.css('stroke-linejoin', v); };
    // transform  
    SVGShape.prototype.transform = function(v) { return this.attr('transform', this.attr('transform') + ' ' + v); };
    SVGShape.prototype.matrix = function(a, b, c, d, e, f) { return this.transform(['matrix(', a, b, c, d, e, f,')'].join(' ')); };
    SVGShape.prototype.translate = function(x, y) { return this.transform(['translate(', x, y||0, ')'].join(' ')); };
    SVGShape.prototype.scale = function(x, y) { return this.transform(['scale(', x, y||x, ')'].join(' ')); };
    SVGShape.prototype.rotate = function(a, x, y) { return this.transform(['rotate(', a, x||0, y||0, ')'].join(' ')); };
    SVGShape.prototype.skewX = function(a) { return this.transform(['skewX(', a, ')'].join(' '))};
    SVGShape.prototype.skewY = function(a) { return this.transform(['skewY(', a, ')'].join(' '))};
    
    SVGShape.prototype.flattenMatrix = function() {
        var prod = function(t) {
            s = [ s[0]*t[0] + s[2]*t[1], s[1]*t[0] + s[3]*t[1],
                  s[0]*t[2] + s[2]*t[3], s[1]*t[2] + s[3]*t[3],
                  s[0]*t[4] + s[2]*t[5] + s[4], s[1]*t[4] + s[3]*t[5] + s[5] ];
        };
        
        var s = [1, 0, 0, 1, 0, 0];
        for(var i in k = this.attr('transform').match(/\w+\s*\([^)]*\)/g)) {
            var c = k[i].match(/\w+/)[0], a = k[i].match(/-?\d+/g).map(function(v) { return parseFloat(v); });
            switch(c) {
                case 'matrix':
                    if(a.length!=6) continue;
                    prod(a);
                    break;
                case 'translate':
                    if(a.length!=1 && a.length!=2) continue;
                    prod([1, 0, 0, 1, a[0], a[1]]);
                    break;
                case 'scale':
                    if(a.length!=1 && a.length!=2) continue;
                    prod([a[0], 0, 0, a[1] || a[0], 0, 0]);
                    break;
                case 'rotate':
                    if(a.length!=1 && a.length!=3) continue;
                    var d = a[0]*Math.PI/180, x = a[1], y = a[2];
                    prod([1, 0, 0, 1, x, y]);
                    prod([Math.cos(d), Math.sin(d), -Math.sin(d), Math.cos(d), 0, 0]);
                    prod([1, 0, 0, 1, -x, -y]);
                    break;
                case 'skewX':
                    if(a.length!=1) continue;
                    prod([1, 0, Math.tan(a[0]*Math.PI/180), 1, 0, 0]);
                    break;
                case 'skewY':
                    if(a.length!=1) continue;
                    prod([1, Math.tan(a[0]*Math.PI/180), 0, 1, 0, 0]);
                    break;
                default:
            }
        }
        
        return this.attr('transform', 'matrix(' + s.join(' ') + ')');
    };
    
    // common props for <svg>, <g>
    function SVGParent() {}
    SVGParent.prototype = new SVGHandler();
    SVGParent.prototype.children = function() {
        return new SVGCollection(this.element.children);
    };
    SVGParent.prototype.find = function(q) {
        if(!q) return this.children();
        return new SVGCollection(this.element.querySelectorAll(q));
    };
    SVGParent.prototype.append = function(t) {
        return SVGFactory(t).appendTo(this);
    };
    SVGParent.prototype.remove = function(t) {
        SVGFactory(t).appendTo(generator);
        return this;
    };
    SVGParent.prototype.addLine = function() { return this.append('<line>'); };
    SVGParent.prototype.addRect = function() { return this.append('<rect>'); };
    SVGParent.prototype.addEllipse = function() { return this.append('<ellipse>'); };
    SVGParent.prototype.addPath = function() { return this.append('<path>'); };
    SVGParent.prototype.addText = function() { return this.append('<text>'); };
    //SVGParent.prototype.addImage = function() { return this.append('<image>'); };
    SVGParent.prototype.addGroup = function() { return this.append('<g>'); };
    
    /**
     * implementations
     **********************************/
    function SVGRoot(el) { SVGHandler.call(this, el); }
    SVGRoot.prototype = new SVGParent();
    SVGRoot.prototype.viewBox = function(t, l, w, h) { return this.attr('viewBox', [t, l, w, h].join(' ')); };
    // override
    SVGRoot.prototype.appendTo = function(t) {
        if(typeof t == 'string')
            t = document.getElementById(t) || document.querySelector(t);
        if(t instanceof HTMLElement)
            t.appendChild(this.element);
        else
            throw new Error('<svg> must be appended to a HTMLElement');
        return this;
    };
    
    function SVGGroup(el) { SVGHandler.call(this, el); }
    SVGGroup.prototype = new SVGParent();
    SVGGroup.prototype.fill = SVGShape.prototype.fill;
    SVGGroup.prototype.fillRule = SVGShape.prototype.fillRule;
    SVGGroup.prototype.stroke = SVGShape.prototype.stroke;
    SVGGroup.prototype.strokeWidth = SVGShape.prototype.strokeWidth;
    SVGGroup.prototype.dashArray = SVGShape.prototype.dashArray;
    SVGGroup.prototype.lineCap = SVGShape.prototype.lineCap;
    SVGGroup.prototype.lineJoin = SVGShape.prototype.lineJoin;
    
    function SVGLine(el) { SVGHandler.call(this, el); }
    SVGLine.prototype = new SVGShape();
    SVGLine.prototype.pos = function(x1, y1, x2, y2) { return this.attr({ x1:x1, y1:y1, x2:x2, y2:y2 }); };
    
    function SVGRect(el) { SVGHandler.call(this, el); }
    SVGRect.prototype = new SVGShape();
    SVGRect.prototype.pos = function(x, y, w, h) { return this.attr({ x:x, y:y, width:w, height:h }); };
    SVGRect.prototype.radius = function(rx, ry) { return this.attr({ rx:rx, ry:ry||rx }); };
    
    function SVGEllipse(el) { SVGHandler.call(this, el); }
    SVGEllipse.prototype = new SVGShape();
    SVGEllipse.prototype.pos = function(cx, cy, rx, ry) { return this.attr({ cx:cx, cy:cy, rx:rx, ry:ry||rx }); };
    
    function SVGPath(el) { SVGHandler.call(this, el); }
    SVGPath.prototype = new SVGShape();
    SVGPath.prototype.addPath = function() { return this.attr('d', [this.attr('d')].concat([].slice.call(arguments)).join(' ')); };
    SVGPath.prototype.moveTo = function(x, y) { return this.addPath('M', x, y); };
    SVGPath.prototype.moveBy = function() { return this.addPath('m', x, y); };
    SVGPath.prototype.lineTo = function() {
        var a = arguments, l=a.length-1, i=0;
        for(; i<l; i++) this.addPath('L', a[i], a[++i]);
        return this;
    };
    SVGPath.prototype.lineBy = function() {
        var a=arguments, l=a.length-1, i=0;
        for(; i<l; i++) this.addPath('l', a[i], a[++i]);
        return this;
    };
    SVGPath.prototype.qBezTo = function() {
        var a=arguments, l=a.length-1, i=4;
        this.addPath('Q', a[0], a[1], a[2], a[3]);
        for(; i<l; i++) this.addPath('T', a[i], a[++i]);
        return this;
    };
    SVGPath.prototype.qBezBy = function() {
        var a=arguments, l=a.length-1, i=4;
        this.addPath('q', a[0], a[1], a[2], a[3]);
        for(; i<l; i++) this.addPath('t', a[i], a[++i]);
        return this;
    };
    SVGPath.prototype.cBezTo = function() {
        var a=arguments, l=a.length-3, i=6;
        this.addPath('C', a[0], a[1], a[2], a[3], a[4], a[5]);
        for(; i<l; i++) this.addPath('S', a[i], a[++i], a[++i], a[++i]);
        return this;
    };
    SVGPath.prototype.cBezBy = function() {
        var a=arguments, l=a.length-3, i=6;
        this.addPath('c', a[0], a[1], a[2], a[3], a[4], a[5]);
        for(; i<l; i++) this.addPath('s', a[i], a[++i], a[++i], a[++i]);
        return this;
    };
    SVGPath.prototype.close = function() { return this.addPath('Z'); };
    SVGPath.prototype.clear = function() { this.element.removeAttribute('d', ''); return this; };
    
    function SVGText(el) { SVGHandler.call(this, el); }
    SVGText.prototype = new SVGShape();
    SVGText.prototype.pos = function(x, y) { return this.attr({ x:x, y:y }); };
    SVGText.prototype.text = function(c) {
        this.element.textContent = c;
        return this;
    };
    SVGText.prototype.fontSize = function(v) { return this.css('font-size', v); };
    SVGText.prototype.fontFamily = function(v) { return this.css('font-family', v); };
    SVGText.prototype.fontWeight = function(v) { return this.css('font-weight', v); };
    
    return SVGFactory;
})();

if(typeof module!='undefined' && module.exports) module.exports($VG);