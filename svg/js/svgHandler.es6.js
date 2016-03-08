'use strict';

var SVG = (() => {

    const nsSVG = 'http://www.w3.org/2000/svg',
        pool = new Map(),
        sgvPrivateVar = new WeakMap();

    let getCommonPrivate = (instance) => {
        return sgvPrivateVar.get(instance) || {};
    };

    // common methods
    class SVGCommon {

        constructor(tag) {
            let props = {
                element: null,
                parent: null
            };
            sgvPrivateVar.set(this, props);
            props.element = pool.has(tag) ? pool.get(tag) : document.createElementNS(nsSVG, tag);
        }

        get element() {
            return getCommonPrivate(this).element;
        }

        set element(element) {
            return getCommonPrivate(this).element = element;
        }

        get parent() {
            return getCommonPrivate(this).parent;
        }

        set parent(element) {
            return getCommonPrivate(this).parent = parent;
        }

        setParent(p) {
            this.parent = p;
            return this;
        }

        id(str) {
            this.element.setAttribute('id', str); return this;
        }

        css(st, def) {
            this.element.style[st] = def; return this;
        }

        cssText(str) {
            this.element.style.cssText = str; return this;
        }

        className(str) {
            this.element.className.baseVal = str; return this;
        }

        release() {
            this.element.parentElement.removeChild(this.element);
            this.parent && this.parent.removeChild(this);
            pool.set(this.element.tagName, this.element);
            sgvPrivateVar.delete(this);
        }

        fill(fill, fillRule) {
            fill && this.element.setAttribute('fill', fill);
            fillRule && this.element.setAttribute('fill-rule', fillRule);
            return this;
        }

        stroke(color, width, dashArray, lineCap, lineJoin) {
            color && this.element.setAttribute('stroke', color);
            width && this.element.setAttribute('stroke-width', width);
            dashArray && this.element.setAttribute('stroke-dasharray', dashArray);
            lineCap && this.element.setAttribute('stroke-linecap', lineCap);
            lineJoin && this.element.setAttribute('stroke-linejoin', lineJoin);
            return this;
        }
    }

    class SVGRoot extends SVGCommon {

        constructor(tag) {
            super(tag || 'svg');
            this.children = new Set();
        }

        get children() {
            return getCommonPrivate(this).children;
        }

        set children(children) {
            return getCommonPrivate(this).children = children;
        }

        viewBox(t, l, w, h) {
            this.element.setAttribute('viewBox', [t, l, w, h].join(' '));
            return this;
        }

        appendTo(el) {

            if(typeof el ===  'string') {
                el = document.querySelector(el);
            }

            if(el instanceof HTMLElement) {
                el.appendChild(this.element);
                return this;
            }

            throw new Error();
        }

        child(hint) {
            return this.children[hint];
        }

        removeChild(svgElement) {
            this.children.has(svgElement) ? this.children.delete(svgElement) : null;
            return this;
        }

        // add shapes
        _add(shape) {
            this.element.appendChild(shape.element);
            this.children.add(shape);
            shape.parent = this;
            return shape;
        }

        addLine() {
            let line = new SVGLine();
            this._add(line);
            return line;
        }

        addRect() {
            let rect = new SVGRect();
            this._add(rect);
            return rect;
        }

        addEllipse() {
            let ellipse = new SVGEllipse();
            this._add(ellipse);
            return ellipse;
        }

        addPath() {
            let path = new SVGPath();
            this._add(path);
            return path;
        }

        addGroup() {
            let group = new SVGGroup();
            this._add(group);
            return group;
        }
    }

    class SVGLine extends SVGCommon {

        constructor() {
            super('line');
        }

        pos(x1, y1, x2, y2) {
            this.element.setAttribute('x1', x1);
            this.element.setAttribute('y1', y1);
            this.element.setAttribute('x2', x2);
            this.element.setAttribute('y2', y2);
            return this;
        }
    }

    class SVGRect extends SVGCommon {

        constructor() {
            super('rect');
        }

        pos(x, y, width, height) {
            this.element.setAttribute('x', x);
            this.element.setAttribute('y', y);
            this.element.setAttribute('width', width);
            this.element.setAttribute('height', height);
            return this;
        }

        radius(rx, ry) {
            this.element.setAttribute('rx', rx);
            this.element.setAttribute('ry', ry || rx);
            return this;
        }
    }

    class SVGEllipse extends SVGCommon {

        constructor() {
            super('ellipse');
        }

        pos(cx, cy, rx, ry) {
            this.element.setAttribute('cx', cx);
            this.element.setAttribute('cy', cy);
            this.element.setAttribute('rx', rx);
            this.element.setAttribute('ry', ry || rx);
            return this;
        }
    }

    class SVGPath extends SVGCommon {

        constructor() {
            super('path');
            this.path = [];
        }

        set path(path) {
            getCommonPrivate(this).path = path || [];
        }

        get path() {
            return getCommonPrivate(this).path;
        }

        pos(cx, cy, rx, ry) {
            this.element.setAttribute('cx', cx);
            this.element.setAttribute('cy', cy);
            this.element.setAttribute('rx', rx);
            this.element.setAttribute('ry', ry || rx);
            return this;
        }

        _addCommand(cmd, arg) {
            this.path.push({ cmd: cmd, arg: arg });
            this._draw();
            return this;
        }

        _draw() {
            var d = '';
            this.path.forEach(function(data) {
                d += data.cmd + data.arg.join(' ') + ' ';
            });
            this.element.setAttribute('d', d);
        }

        moveTo(x, y) {
            return this._addCommand('M', [x, y]);
        }

        moveBy(x, y) {
            return this._addCommand('m', [x, y]);
        }

        lineTo(x, y) {
            return this._addCommand('L', [x, y]);
        }

        lineBy(x, y) { r
            return this._addCommand('l', [x, y]);
        }

        qBezTo(x1, y1, x2, y2) {
            return this._addCommand('Q', [x1, y1, x2, y2]);
        }

        qBezBy(x1, y1, x2, y2) {
            return this._addCommand('q', [x1, y1, x2, y2]);
        }

        cBezTo(x1, y1, x2, y2, x3, y3) {
            return this._addCommand('C', [x1, y1, x2, y2, x3, y3]);
        }

        cBezBy(x1, y1, x2, y2, x3, y3) {
            return this._addCommand('c', [x1, y1, x2, y2, x3, y3]);
        }

        close() {
            return this._addCommand('Z', []);
        }

        clear() {
            this.path=[]; return this;
        }
    }

    class SVGGroup extends SVGRoot {
        constructor() {
            super('g');
        }

    }

    return SVGRoot;

})();

