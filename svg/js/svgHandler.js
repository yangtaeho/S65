var $VG = (function() {
    var nsSVG = 'http://www.w3.org/2000/svg',
        nsXlink = 'http://www.w3.org/1999/xlink',
        buffer = document.createElementNS(nsSVG, 'svg'),
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
        t = t || '<svg>';
        if(t instanceof SVGHandler) {
            return t;
        } else if(this instanceof SVGFactory) {
            var r = /<.*>/g.exec(t);
            if(r instanceof Array) {
                buffer.innerHTML = r[0];
                t = buffer.firstElementChild;
            } else if(typeof t == 'string') {
                return new SVGCollection(document.querySelectorAll(t));
            }
            
            if(!types[t.tagName]) throw new Error(t.tagName + ' is not a valid SVG element!');
            return new types[t.tagName](t);
        } else {
            return new SVGFactory(t);
        }
    }
    
    // svg collection
    function SVGCollection(l) {
        for(var i=0; i<l.length; ++i)
            this[i] = SVGFactory(l[i]);
        this.length = l.length;
    }
    var iterator = function(fn) {
        return function() {
            var ret = [], i;
            for(i=0; i<this.length; i++)
                this[i][fn] && ret.push(this[i][fn].apply(this[i], arguments));
            return new SVGCollection(ret);
        };
    };
    SVGCollection.prototype = {
        forEach: Array.prototype.forEach,
        filter: Array.prototype.filter,
        first: function() { return this[0]; },
        css: iterator('css'),
        id: iterator('id'),
        className: iterator('className'),
        fill: iterator('fill'),
        fillRule: iterator('fillRule'),
        stroke: iterator('stroke'),
        strokeWidth: iterator('strokeWidth'),
        dashArray: iterator('dashArray'),
        lineCap: iterator('lineCap'),
        lineJoin: iterator('lineJoin'),
        appendTo: iterator('appendTo'),
        before: iterator('before'),
        after: iterator('after')
    };
    
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
    SVGShape.prototype.fill = function(v) { return this.css('fill', v); };
    SVGShape.prototype.fillRule = function(v) { return this.css('fill-rule', v); };
    SVGShape.prototype.stroke = function(v) { return this.css('stroke', v); }; // TODO: stroke parser 만들어야징
    SVGShape.prototype.strokeWidth = function(v) { return this.css('stroke-width', v); };
    SVGShape.prototype.dashArray = function() { return this.css('stroke-dasharray', [].slice.call(arguments).join(' ')); };
    SVGShape.prototype.lineCap = function(v) { return this.css('stroke-linecap', v); };
    SVGShape.prototype.lineJoin = function(v) { return this.css('stroke-linejoin', v); };
    
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
        SVGFactory(t).appendTo(buffer);
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
    SVGPath.prototype.moveBy = function(x, y) { return this.addPath('m', x, y); };
    SVGPath.prototype.lineTo = function(x, y) { return this.addPath('L', x, y); };
    SVGPath.prototype.lineBy = function(x, y) { return this.addPath('l', x, y); };
    SVGPath.prototype.qBezTo = function(x1, y1, x2, y2) { return this.addPath('Q', x1, y1, x2, y2); };
    SVGPath.prototype.qBezBy = function(x1, y1, x2, y2) { return this.addPath('q', x1, y1, x2, y2); };
    SVGPath.prototype.cBezTo = function(x1, y1, x2, y2, x3, y3) { return this.addPath('C', x1, y1, x2, y2, x3, y3); };
    SVGPath.prototype.cBezBy = function(x1, y1, x2, y2, x3, y3) { return this.addPath('c', x1, y1, x2, y2, x3, y3); };
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