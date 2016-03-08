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
        }
    
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
                t = document.querySelector(t);  // TODO: collection으로 반환
            }
            
            if(!types[t.tagName]) throw new Error(t.tagName + ' is not a valid SVG element!');
            return new types[t.tagName](t);
        } else {
            return new SVGFactory(t);
        }
    }
    
    // svg collection
    function SVGCollection() {}
    SVGCollection.prototype = {
        first: function() { return this[0]; },
        forEach: Array.prototype.forEach,
        map: Array.prototype.map,
        filter: Array.prototype.filter,
        css: function() {},
        cssText: function() {},
        className: function() {},
        appendTo: function() {}
    };

    
    // base constructor
    function SVGHandler(el) { this.element = el; }
    SVGHandler.prototype = {
        id: function(v) { this.element.setAttribute('id', v); return this; },
        css: function(k, v) { this.element.style[k] = v; return this; },
        cssText: function(v) { this.element.style.cssText = v; return this; },
        className: function(v) { this.element.className.baseVal = v; return this; },
        appendTo: function(t) {
            t = SVGFactory(t);
            if(t instanceof SVGParent)
                t.append(this);
            else
               throw new Error('cannot append SVG element to a HTMLElement');
            return this;
        }
    };
    
    // common props for SVG shapes
    function SVGShape() {}
    SVGShape.prototype = new SVGHandler();
    SVGShape.prototype.fill = function(fill, fillrule) {
        fill && this.element.setAttribute('fill', fill);
        fillrule && this.element.setAttribute('fill-rule', fillrule);
        return this;
    };
    SVGShape.prototype.stroke = function(color, width, dasharray, linecap, linejoin) {
        color && this.element.setAttribute('stroke', color);
        width && this.element.setAttribute('stroke-width', width);
        dasharray && this.element.setAttribute('stroke-dasharray', dasharray);
        linecap && this.element.setAttribute('stroke-linecap', linecap);
        linejoin && this.element.setAttribute('stroke-linejoin', linejoin);
        return this;
    };
    
    // common props for <svg>, <g>
    function SVGParent() {}
    SVGParent.prototype = new SVGHandler();
    SVGParent.prototype.children = function() {
        var c = this.element.children, ret = [], i;
        for(i=0; i<c.length; ++i)
            ret.push(SVGFactory(c[i]));
        return ret;
    };
    SVGParent.prototype.append = function(t) {
        t = SVGFactory(t);
        this.element.appendChild(t.element);
        return t;
    };
    SVGParent.prototype.remove = function(t) {
        t = SVGFactory(t);
        this.element.removeChild(t.element);
        return this;
    };
    SVGParent.prototype.addLine = function() { return this.append('<line>'); };
    SVGParent.prototype.addRect = function() { return this.append('<rect>'); };
    SVGParent.prototype.addEllipse = function() { return this.append('<ellipse>'); };
    SVGParent.prototype.addPath = function() { return this.append('<path>'); };
    //SVGParent.prototype.addText = function() { return this.append('<text>'); };
    //SVGParent.prototype.addImage = function() { return this.append('<image>'); };
    SVGParent.prototype.addGroup = function() { return this.append('<g>'); };
    
    /**
     * implementations
     **********************************/
    function SVGRoot(t) { SVGHandler.call(this, t); }
    SVGRoot.prototype = new SVGParent();
    SVGRoot.prototype.viewBox = function(t, l, w, h) {
        this.element.setAttribute('viewBox', [t, l, w, h].join(' '));
        return this;
    };
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
    
    function SVGGroup(t) { SVGHandler.call(this, t); }
    SVGGroup.prototype = new SVGParent();
    SVGGroup.prototype.fill = SVGShape.prototype.fill;
    SVGGroup.prototype.stroke = SVGShape.prototype.stroke;
    
    function SVGLine(t) { SVGHandler.call(this, t); }
    SVGLine.prototype = new SVGShape();
    SVGLine.prototype.pos = function(x1, y1, x2, y2) {
        this.element.setAttribute('x1', x1);
        this.element.setAttribute('y1', y1);
        this.element.setAttribute('x2', x2);
        this.element.setAttribute('y2', y2);
        return this;
    };
    
    function SVGRect(t) { SVGHandler.call(this, t); }
    SVGRect.prototype = new SVGShape();
    SVGRect.prototype.pos = function(x, y, width, height) {
        this.element.setAttribute('x', x);
        this.element.setAttribute('y', y);
        this.element.setAttribute('width', width);
        this.element.setAttribute('height', height);
        return this;
    };
    SVGRect.prototype.radius = function(rx, ry) {
        this.element.setAttribute('rx', rx);
        this.element.setAttribute('ry', ry || rx);
        return this;
    };
    
    function SVGEllipse(t) { SVGHandler.call(this, t); }
    SVGEllipse.prototype = new SVGShape();
    SVGEllipse.prototype.pos = function(cx, cy, rx, ry) {
        this.element.setAttribute('cx', cx);
        this.element.setAttribute('cy', cy);
        this.element.setAttribute('rx', rx);
        this.element.setAttribute('ry', ry || rx);
        return this;
    };
    
    function SVGPath(t) { SVGHandler.call(this, t); }
    SVGPath.prototype = new SVGShape();
    SVGPath.prototype.addPath = function() {
        var d = this.element.getAttribute('d') || '';
        d += ' ' + Array.prototype.join.call(arguments, ' ');
        this.element.setAttribute('d', d);
        return this;
    };
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
    
    function SVGText(t) { SVGHandler.call(this, t); }
    SVGText.prototype = new SVGShape();
    SVGText.prototype.pos = function(x, y) {
        this.element.setAttribute('x', x);
        this.element.setAttribute('y', y);
        return this;
    };
    SVGText.prototype.text = function(t) {
        this.element.textContent = t;
        return this;
    };
    SVGText.prototype.fontSize = function(s) {
        this.element.style.fontSize = s;
        return this;
    };
    SVGText.prototype.fontFamily = function(s) {
        this.element.style.fontFamily = s;
        return this;
    };
    
    return SVGFactory;
})();

if(typeof module!='undefined' && module.exports) module.exports($VG);