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

function range(n) {
    var arr = [];
    for (var ind = 0; ind < n; ind++) {
        arr.push(ind);
    }
    return arr;
}

function canvas(id, attrs) {
    attrs = attrs || {};
    var _id = id;
    var _element = document.getElementById(id);
    var _ctx = _element.getContext('2d');

    var _width = attrs['width'] || 500;
    var _height = attrs['height'] || 500;
    var _background = attrs['background'] || '#000000';

    function _center(car) {
        var x = car[0]; var y = car[1];
        return [_width/2 + x, _height/2 - y];
    }

    function _pol2Car(pol) {
        var r = pol[0]; var t = pol[1];
        return [r*cos(t), r*sin(t)];
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

    var _lineCartesian = function (car1, car2, attrs) {
        car1 = _center(car1);
        car2 = _center(car2);
        var x1 = car1[0]; var y1 = car1[1];
        var x2 = car2[0]; var y2 = car2[1];

        attrs = _setup(attrs);

        _ctx.moveTo(x1, y1);
        _ctx.lineTo(x2, y2);
        _ctx.stroke();
    };

    var _circleCartesian = function (car, r, attrs) {
        car = _center(car);
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

    var _linePolar = function (pol1, pol2, attrs) {
        return _lineCartesian(_pol2Car(pol1), _pol2Car(pol2), attrs);
    };

    var _circlePolar = function (pol, r, attrs) {
        return _circleCartesian(_pol2Car(pol), r, attrs);
    };

    function funcOrConst(f) {
        return typeof(f) === 'function' ? f : t => f;
    }

    var _makeCircle = function (pol, r, col) {
        pol = funcOrConst(pol);
        r = funcOrConst(r);
        col = funcOrConst(col);
        return (canvas, t) => canvas.circlePolar(pol(t), r(t), {fillStyle: col(t)});
    }

    var _makeLine = function (pol1, pol2, col) {
        pol1 = funcOrConst(pol1);
        pol2 = funcOrConst(pol2);
        col = funcOrConst(col);
        return (canvas, t) => canvas.linePolar(pol1(t), pol2(t), {fillStyle: col(t)});
    }

    var _animate = function (draw, t) {
        t = t || 0;
        self.clear();
        draw(self, t);
        window.requestAnimationFrame(() => _animate(draw, t+1));
    };

    var _animateAll = function (draws) {
        _animate(
            (canvas, t) => draws.map(draw => draw(canvas, t)),
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
        lineCartesian: _lineCartesian,
        linePolar: _linePolar,
        circleCartesian: _circleCartesian,
        circlePolar: _circlePolar
    };

    return self;
}