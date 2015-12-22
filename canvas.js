var pi = Math.PI;
var tau = 2*Math.PI;
var sin = Math.sin;
var cos = Math.cos;

function rgb(r, g, b) {
    r = Math.round(r*255);
    g = Math.round(g*255);
    b = Math.round(b*255);
    return '#' + hexByte(r) + hexByte(g) + hexByte(b);
}

function hsv(h, s, v) {
    var rgbVals = hsv2rgb(h, s, v);
    var r = rgbVals[0]; var g = rgbVals[1]; var b = rgbVals[2];
    return rgb(r, g, b);
}

function hsv2rgb(h, s, v) {
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r, g, b];
}

function hexByte(n) {
    var digs = '0123456789abcdef';
    var hex = '';
    for (var i = 0; i < 2; i++) {
        hex = digs[n%16] + hex;
        n = Math.floor(n/16);
    }
    return hex;
}

function car(x, y) {
    return {
        x: x,
        y: y,
        r: Math.sqrt(x*x + y*y),
        t: Math.atan2(x, y)
    };
}

function pol(r, t) {
    return {
        x: r*Math.cos(t),
        y: r*Math.sin(t),
        r: r,
        t: t
    };
}

function range(n) {
    var arr = [];
    for (var ind = 0; ind < n; ind++) {
        arr.push(ind);
    }
    return arr;
}

Array.prototype.concatMap = function (f) { return this.map(f).reduce((l, r) => l.concat(r)); };

function canvas(id, attrs) {
    attrs = attrs || {};
    var _id = id;
    var _element = document.getElementById(id);
    var _ctx = _element.getContext('2d');

    var _width = attrs['width'] || 500;
    var _height = attrs['height'] || 500;
    var _background = attrs['background'] || '#000000';

    function _center(coor) {
        var x = coor.x; var y = coor.y;
        return [_width/2 + x, _height/2 - y];
    }

    var _defaults = {
        strokeStyle: '#ffffff',
        fillStyle: '#ffffff'
    };

    function _setup(attrs) {
        attrs = attrs || {};

        var strokeStyle = attrs['strokeStyle'] || _defaults['strokeStyle'];
        var fillStyle = attrs['fillStyle'] || _defaults['fillStyle'];

        _ctx.strokeStyle = strokeStyle;
        _ctx.fillStyle = fillStyle;

        return {
            strokeStyle: strokeStyle,
            fillStyle: fillStyle
        };
    }

    var _line = function (coor1, coor2, attrs) {
        car1 = _center(coor1);
        car2 = _center(coor2);
        var x1 = car1[0]; var y1 = car1[1];
        var x2 = car2[0]; var y2 = car2[1];

        attrs = _setup(attrs);

        _ctx.moveTo(x1, y1);
        _ctx.lineTo(x2, y2);
        _ctx.stroke();
    };

    var _circle = function (coor, r, attrs) {
        car = _center(coor);
        var x = car[0]; var y = car[1];

        attrs = _setup(attrs);
        var makeStroke = attrs['strokeStyle'] !== null;
        var makeFill = attrs['fillStyle'] !== null;

        _ctx.beginPath();
        _ctx.arc(x, y, r, 0, 2*pi);
        if (makeStroke) _ctx.stroke();
        if (makeFill) _ctx.fill();
        _ctx.closePath();

        return self;
    };

    function funcOrConst(f) {
        return typeof(f) === 'function' ? f : t => f;
    }

    var _makeCircle = function (coor, r, col) {
        coor = funcOrConst(coor);
        r = funcOrConst(r);
        col = funcOrConst(col);
        return t => self.circle(coor(t), r(t), {strokeStyle: col(t), fillStyle: col(t)});
    }

    var _makeLine = function (coor1, coor2, col) {
        coor1 = funcOrConst(coor1);
        coor2 = funcOrConst(coor2);
        col = funcOrConst(col);
        return t => self.line(coor1(t), coor2(t), {strokeStyle: col(t), fillStyle: col(t)});
    }

    var _animate = function (draw, t) {
        t = t || 0;
        self.clear();
        draw(t);
        window.requestAnimationFrame(() => _animate(draw, t+1));
    };

    var _animateAll = function (draws) {
        _animate(
            t => draws.map(draw => draw(t)),
            0
        );
    }

    var _clear = function () {
        _ctx.clearRect(0, 0, _width, _height);
        _ctx.fillStyle = _background;
        _ctx.fillRect(0, 0, _width, _height);
        return self;
    };

    _element.setAttribute('width', _width);
    _element.setAttribute('height', _height);
    _clear();

    var self = {
        animate: _animate,
        animateAll: _animateAll,
        makeLine: _makeLine,
        makeCircle: _makeCircle,
        clear: _clear,
        line: _line,
        circle: _circle
    };

    return self;
}