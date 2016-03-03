var SVG = (function(ns) {
    var nsSVG = 'http://www.w3.org/2000/svg'
    var nsXlink = 'http://www.w3.org/1999/xlink';
    var pool = [];
    
    // common methods
    var SVGCommon = {
        create: function(tag) {
            for(var i in pool)
                if(pool[i].tagName == tag.toLowerCase)
                    return pool.splice(i, 1)[0];
            return document.createElementNS(nsSVG, tag);
        },
        setParent: function(p) { this.parent = p; return this; },
        id: function(str) { this.element.setAttribute('id', str); return this; },
        css: function(st, def) { this.element.style[st] = def; return this; },
        cssText: function(str) { this.element.style.cssText = str; return this; },
        className: function(str) { this.element.className.baseVal = str; return this; },
        release: function() {
            this.element.parentElement.removeChild(this.element);
            this.parent && this.parent.removeChild(this);
            pool.push(this.element);
            this.element = null;
        },
        fill: function(fill, fillrule) {
            fill && this.element.setAttribute('fill', fill);
            fillrule && this.element.setAttribute('fill-rule', fillrule);
            return this;
        },
        stroke: function(color, width, dasharray, linecap, linejoin) {
            color && this.element.setAttribute('stroke', color);
            width && this.element.setAttribute('stroke-width', width);
            dasharray && this.element.setAttribute('stroke-dasharray', dasharray);
            linecap && this.element.setAttribute('stroke-linecap', linecap);
            linejoin && this.element.setAttribute('stroke-linejoin', linejoin);
            return this;
        }
    };
    
    // SVG root
    var SVGRoot = function(el) {
        if(this instanceof SVGRoot) {
            if(typeof el=='string') el = document.getElementById(el);
            !el && (el = SVGCommon.create('svg'));
            if(el instanceof SVGElement) {
                this.element = el;
                this.children = [];
                return this;
            }
            throw new Error();
        }
        return new SVGRoot(el);
    };
    SVGRoot.prototype = {
        id: SVGCommon.id,
        css: SVGCommon.css,
        cssText: SVGCommon.cssText,
        viewBox: function(t, l, w, h) {
            this.element.setAttribute('viewBox', [t, l, w, h].join(' '));
            return this;
        },
        appendTo: function(el) {
            if(typeof el=='string') el = document.querySelector(el);
            if(el instanceof HTMLElement) {
                el.appendChild(this.element);
                return this;
            }
            throw new Error();
        },
        release: SVGCommon.release,
        child: function(hint) { return this.children[hint]; },
        removeChild: function(svgElement) {
            for(var i in this.children)
                if(this._child(i) == svgElement)
                    this.children.splice(i, 1)[0].release();
            return this;
        },
        
        // add shapes
        _add: function(shape) {
            this.element.appendChild(shape.element);
            this.children.push(shape);
            shape.setParent(this);
            return shape;
        },
        addLine: function() { return this._add(new SVGLine()); },
        addRect: function() { return this._add(new SVGRect()); },
        addEllipse: function() { return this._add(new SVGEllipse()); },
        addPath: function() { return this._add(new SVGPath()); },
        addGroup: function() { return this._add(new SVGGroup()); }
    };
    
    // line
    var SVGLine = function() { this.element = SVGCommon.create('line'); };
    SVGLine.prototype = {
        setParent: SVGCommon.setParent,
        id: SVGCommon.id,
        css: SVGCommon.css,
        cssText: SVGCommon.cssText,
        className: SVGCommon.className,
        release: SVGCommon.release,
        fill: SVGCommon.fill,
        stroke: SVGCommon.stroke,
        pos: function(x1, y1, x2, y2) {
            this.element.setAttribute('x1', x1);
            this.element.setAttribute('y1', y1);
            this.element.setAttribute('x2', x2);
            this.element.setAttribute('y2', y2);
            return this;
        }
    };
    
    // rect
    var SVGRect = function() { this.element = SVGCommon.create('rect'); };
    SVGRect.prototype = {
        setParent: SVGCommon.setParent,
        id: SVGCommon.id,
        css: SVGCommon.css,
        cssText: SVGCommon.cssText,
        className: SVGCommon.className,
        release: SVGCommon.release,
        fill: SVGCommon.fill,
        stroke: SVGCommon.stroke,
        pos: function(x, y, width, height) {
            this.element.setAttribute('x', x);
            this.element.setAttribute('y', y);
            this.element.setAttribute('width', width);
            this.element.setAttribute('height', height);
            return this;
        },
        radius: function(rx, ry) {
            this.element.setAttribute('rx', rx);
            this.element.setAttribute('ry', ry || rx);
            return this;
        }
    };
    
    // ellipse
    var SVGEllipse = function() { this.element = SVGCommon.create('ellipse'); };
    SVGEllipse.prototype = {
        setParent: SVGCommon.setParent,
        id: SVGCommon.id,
        css: SVGCommon.css,
        cssText: SVGCommon.cssText,
        className: SVGCommon.className,
        release: SVGCommon.release,
        fill: SVGCommon.fill,
        stroke: SVGCommon.stroke,
        pos: function(cx, cy, rx, ry) {
            this.element.setAttribute('cx', cx);
            this.element.setAttribute('cy', cy);
            this.element.setAttribute('rx', rx);
            this.element.setAttribute('ry', ry || rx);
            return this;
        }
    };
    
    // path
    var SVGPath = function() {
        this.element = SVGCommon.create('path');
        this.path = [];
    };
    SVGPath.prototype = {
        setParent: SVGCommon.setParent,
        id: SVGCommon.id,
        css: SVGCommon.css,
        cssText: SVGCommon.cssText,
        className: SVGCommon.className,
        release: SVGCommon.release,
        fill: SVGCommon.fill,
        stroke: SVGCommon.stroke,
        _addCommand: function(cmd, arg) {
            this.path.push({ cmd: cmd, arg: arg });
            this._draw();
            return this;
        },
        _draw: function() {
            var d = '';
            this.path.forEach(function(data) {
                d += data.cmd + data.arg.join(' ') + ' ';
            });
            this.element.setAttribute('d', d);
        },
        moveTo: function(x, y) { return this._addCommand('M', [x, y]); },
        moveBy: function(x, y) { return this._addCommand('m', [x, y]); },
        lineTo: function(x, y) { return this._addCommand('L', [x, y]); },
        lineBy: function(x, y) { return this._addCommand('l', [x, y]); },
        qBezTo: function(x1, y1, x2, y2) { return this._addCommand('Q', [x1, y1, x2, y2]); },
        qBezBy: function(x1, y1, x2, y2) { return this._addCommand('q', [x1, y1, x2, y2]); },
        cBezTo: function(x1, y1, x2, y2, x3, y3) { return this._addCommand('C', [x1, y1, x2, y2, x3, y3]); },
        cBezBy: function(x1, y1, x2, y2, x3, y3) { return this._addCommand('c', [x1, y1, x2, y2, x3, y3]); },
        close: function() { return this._addCommand('Z', []); },
        clear: function() { this.path=[]; return this; }
        
    };
    
    // group
    var SVGGroup = function() {
        this.element = SVGCommon.create('g');
        this.children = [];
    };
    SVGGroup.prototype = {
        setParent: SVGCommon.setParent,
        id: SVGCommon.id,
        css: SVGCommon.css,
        cssText: SVGCommon.cssText,
        className: SVGCommon.className,
        release: SVGCommon.release,
        child: SVGRoot.prototype.child,
        removeChild: SVGRoot.prototype.removeChild,
        
        fill: SVGCommon.fill,
        stroke: SVGCommon.stroke,
        _add: SVGRoot.prototype._add,
        addLine: SVGRoot.prototype.addLine,
        addRect: SVGRoot.prototype.addRect,
        addEllipse: SVGRoot.prototype.addEllipse,
        addPath: SVGRoot.prototype.addPath,
        addGroup: SVGRoot.prototype.addGroup
    };
    
    return SVGRoot;
})();