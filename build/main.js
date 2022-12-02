var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.CDE = {}));
})(this, function(exports2) {
  var _canvas, _activeTool, _events, _mousedown, _mousemoved, _lastPos, _diff, _event, event_fn, _checkBounds, checkBounds_fn, _buffer, _vertices, _shapebuffer, _textBuffer, _pos, _generate, _generateUniqSerial, _shapes, _buffer2, _points, _selectedPointIndex, _dragOldPos, _originalShape, _onPlace, onPlace_fn, _onDrag, onDrag_fn, _generate2, generate_fn, _buffer3, _selectedPointIndex2, _dragOldPos2, _generate3, generate_fn2, _buffer4, _vertices2, _generate4, generate_fn3, _buffer5, _renderer, _tiles, _createInset, createInset_fn, _createOutset, createOutset_fn, _getMargin, getMargin_fn, _sleep, _generateTiles, generateTiles_fn, _canBePlaced, canBePlaced_fn, _isColliding, isColliding_fn, _isInside, isInside_fn, _getTile, getTile_fn, _actions, _index, _options, _elem, _loadEvent;
  "use strict";
  const _Vector2 = class {
    constructor(x = 0, y = 0) {
      __publicField(this, "x", 0);
      __publicField(this, "y", 0);
      __publicField(this, "magnitude", () => {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      });
      __publicField(this, "normalized", () => {
        var mag = this.magnitude();
        return new _Vector2(this.x / mag, this.y / mag);
      });
      __publicField(this, "getCopy", () => {
        return new _Vector2(this.x, this.y);
      });
      __publicField(this, "toAngle", () => {
        return Math.atan2(Math.abs(this.x), Math.abs(this.y)) * 180 / Math.PI;
      });
      __publicField(this, "minMax", (v1, v2) => {
        this.x = this.x < v1.x ? v1.x : this.x;
        this.y = this.y < v1.y ? v1.y : this.y;
        this.x = this.x > v2.x ? v2.x : this.x;
        this.y = this.y > v2.y ? v2.y : this.y;
        return this;
      });
      __publicField(this, "add", (v) => {
        this.x += v.x;
        this.y += v.y;
        return this;
      });
      __publicField(this, "remove", (v) => {
        this.x -= v.x;
        this.y -= v.y;
        return this;
      });
      __publicField(this, "multiply", (v) => {
        this.x *= v.x;
        this.y *= v.y;
        return this;
      });
      __publicField(this, "devide", (v) => {
        this.x /= v.x;
        this.y /= v.y;
        return this;
      });
      __publicField(this, "equals", (v) => {
        return this.x == v.x && this.y == v.y;
      });
      this.x = x;
      this.y = y;
    }
  };
  let Vector2 = _Vector2;
  __publicField(Vector2, "zero", () => {
    return new _Vector2(0, 0);
  });
  __publicField(Vector2, "one", () => {
    return new _Vector2(1, 1);
  });
  __publicField(Vector2, "up", () => {
    return new _Vector2(0, 1);
  });
  __publicField(Vector2, "right", () => {
    return new _Vector2(1, 0);
  });
  __publicField(Vector2, "down", () => {
    return new _Vector2(0, -1);
  });
  __publicField(Vector2, "left", () => {
    return new _Vector2(-1, 0);
  });
  __publicField(Vector2, "copy", (v) => {
    return new _Vector2(v.x, v.y);
  });
  __publicField(Vector2, "angle", (v1, v2) => {
    return Math.atan((v1.x - v2.x) / (v1.y - v2.y));
  });
  __publicField(Vector2, "distance", (v1, v2) => {
    return new _Vector2(v1.x - v2.x, v1.y - v2.y).magnitude();
  });
  __publicField(Vector2, "min", (v1, v2) => {
    return v1.magnitude() < v2.magnitude() ? _Vector2.copy(v1) : _Vector2.copy(v2);
  });
  __publicField(Vector2, "max", (v1, v2) => {
    return v1.magnitude() > v2.magnitude() ? _Vector2.copy(v1) : _Vector2.copy(v2);
  });
  __publicField(Vector2, "add", (v1, v2) => {
    return new _Vector2(v1.x + v2.x, v1.y + v2.y);
  });
  __publicField(Vector2, "remove", (v1, v2) => {
    return new _Vector2(v1.x - v2.x, v1.y - v2.y);
  });
  __publicField(Vector2, "multiply", (v1, v2) => {
    return new _Vector2(v1.x * v2.x, v1.y * v2.y);
  });
  __publicField(Vector2, "devide", (v1, v2) => {
    return new _Vector2(v1.x / v2.x, v1.y / v2.y);
  });
  __publicField(Vector2, "equals", (v1, v2) => {
    return v1.x == v2.x && v1.y == v2.y;
  });
  __publicField(Vector2, "copyAll", (arr) => {
    var tmp = [];
    for (let i = 0; i < arr.length; i++) {
      tmp.push(new _Vector2(arr[i].x, arr[i].y));
    }
    return tmp;
  });
  class Collision {
    static pointPoint(x1, y1, x2, y2) {
      if (x1 == x2 && y1 == y2) {
        return true;
      }
      return false;
    }
    static pointCircle(px, py, cx, cy, cr) {
      var distX = px - cx;
      var distY = py - cy;
      var dist = Math.sqrt(distX * distX + distY * distY);
      if (dist <= cr) {
        return true;
      }
      return false;
    }
    static circleCircle(c1x, c1y, c1r, c2x, c2y, c2r) {
      var distX = c1x - c2x;
      var distY = c1y - c2y;
      var dist = Math.sqrt(distX * distX + distY * distY);
      if (dist <= c1r + c2r) {
        return true;
      }
      return false;
    }
    static pointRectangle(px, py, rx, ry, rw, rh) {
      if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) {
        return true;
      }
      return false;
    }
    static RectangleRectangle(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
      if (r1x + r1w >= r2x && r1x <= r2x + r2w && r1y + r1h >= r2y && r1y <= r2y + r2h) {
        return true;
      }
      return false;
    }
    static circleRectangle(cx, cy, cr, rx, ry, rw, rh) {
      var testX = cx;
      var testY = cy;
      if (cx < rx) {
        testX = rx;
      } else if (cx > rx + rw) {
        testX = rx + rw;
      }
      if (cy < ry) {
        testY = ry;
      } else if (cy > ry + rh) {
        testY = ry + rh;
      }
      var distX = cx - testX;
      var distY = cy - testY;
      var dist = sqrt(distX * distX + distY * distY);
      if (dist <= cr) {
        return true;
      }
      return false;
    }
    static linePoint(x1, y1, x2, y2, px, py) {
      var dist1 = Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
      var dist2 = Math.sqrt(Math.pow(px - x2, 2) + Math.pow(py - y2, 2));
      var lineLength = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      var buffer = 1;
      if (dist1 + dist2 >= lineLength - buffer && dist1 + dist2 <= lineLength + buffer) {
        return true;
      }
      return false;
    }
    static lineCircle(x1, y1, x2, y2, cx, cy, cr) {
      var isInsideP1 = this.pointCircle(x1, y1, cx, cy, cr);
      var isInsideP2 = this.pointCircle(x2, y2, cx, cy, cr);
      if (isInsideP1 || isInsideP2) {
        return true;
      }
      var distX = x1 - x2;
      var distY = y1 - y2;
      var length = Math.sqrt(distX * distX + distY * distY);
      var dot = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(length, 2);
      var closestX = x1 + dot * (x2 - x1);
      var closestY = y1 + dot * (y2 - y1);
      var onSegment = this.linePoint(x1, y1, x2, y2, closestX, closestY);
      if (!onSegment) {
        return false;
      }
      distX = closestX - cx;
      distY = closestY - cy;
      var dist = Math.sqrt(distX * distX + distY * distY);
      if (dist <= cr) {
        return true;
      }
      return false;
    }
    static lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
      var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
      }
      return false;
    }
    static lineRectangle(x1, y1, x2, y2, rx, ry, rw, rh) {
      var left = this.lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      var right = this.lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
      var top = this.lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      var bottom = this.lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
      if (left || right || top || bottom) {
        return true;
      }
      return false;
    }
    static polygonPoint(vertices, px, py) {
      var collision = false;
      var next = 0;
      for (let current = 0; current < vertices.length; current++) {
        next = current + 1;
        if (next == vertices.length) {
          next = 0;
        }
        const vc = vertices[current];
        const vn = vertices[next];
        if ((vc.y >= py && vn.y < py || vc.y < py && vn.y >= py) && px < (vn.x - vc.x) * (py - vc.y) / (vn.y - vc.y) + vc.x) {
          collision = !collision;
        }
      }
      return collision;
    }
    static polygonCircle(vertices, cx, cy, cr) {
      var next = 0;
      for (let current = 0; current < vertices.length; current++) {
        next = current + 1;
        if (next == vertices.length) {
          next = 0;
        }
        const vc = vertices[current];
        const vn = vertices[next];
        var collision = this.lineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, cr);
        if (collision) {
          return true;
        }
      }
      var centerInside = this.polygonPoint(vertices, cx, cy);
      if (centerInside) {
        return true;
      }
      return false;
    }
    static polygonRectangle(vertices, rx, ry, rw, rh) {
      var next = 0;
      for (let current = 0; current < vertices.length; current++) {
        next = current + 1;
        if (next == vertices.length) {
          next = 0;
        }
        const vc = vertices[current];
        const vn = vertices[next];
        var collision = this.lineRectangle(vc.x, vc.y, vn.x, vn.y, rx, ry, rw, rh);
        if (collision) {
          return true;
        }
      }
      return false;
    }
    static polygonLine(vertices, x1, y1, x2, y2) {
      var next = 0;
      for (let current = 0; current < vertices.length; current++) {
        next = current + 1;
        if (next == vertices.length) {
          next = 0;
        }
        const x3 = vertices[current].x;
        const y3 = vertices[current].y;
        const x4 = vertices[next].x;
        const y4 = vertices[next].y;
        var hit = this.lineLine(x1, y1, x2, y2, x3, y3, x4, y4);
        if (hit) {
          return true;
        }
      }
      return false;
    }
    static polygonPolygon(v1, v2) {
      var next = 0;
      for (let current = 0; current < v1.length; current++) {
        next = current + 1;
        if (next == v1.length) {
          next = 0;
        }
        const vc = v1[current];
        const vn = v1[next];
        var collision = this.polygonLine(v2, vc.x, vc.y, vn.x, vn.y);
        if (collision) {
          return true;
        }
        collision = this.polygonPoint(v1, v2[0].x, v2[0].y);
        if (collision) {
          return true;
        }
      }
      return false;
    }
    static trianglePoint(x1, y1, x2, y2, x3, y3, px, py) {
      var areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));
      var area1 = Mathf.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
      var area2 = Mathf.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
      var area3 = Mathf.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));
      if (area1 + area2 + area3 == areaOrig) {
        return true;
      }
      return false;
    }
  }
  class Color$1 {
    constructor(string = null, r = 0, g = 0, b = 0, a = 1) {
      __publicField(this, "string", "");
      __publicField(this, "value", []);
      this.string = string;
      if (string == null) {
        this.value = [r, g, b, a];
      }
    }
    rgba() {
      value = this.value;
      if (this.string != null) {
        var value = getComputedStyle(document.body).getPropertyValue(this.string);
        this.value = value.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
      }
      return { r: parseFloat(this.value[0]), g: parseFloat(this.value[1]), b: parseFloat(this.value[2]), a: parseFloat(this.value[3]) };
    }
    rgb() {
      var rgba = this.rgba();
      delete rgba["a"];
      return rgba;
    }
  }
  const _Settings$1 = class {
  };
  let Settings$1 = _Settings$1;
  _canvas = new WeakMap();
  _activeTool = new WeakMap();
  __publicField(Settings$1, "mapSizeX", 5e3);
  __publicField(Settings$1, "mapSizeY", 5e3 / 16 * 9);
  __publicField(Settings$1, "bufferMargin", 50);
  __publicField(Settings$1, "gridSizeS", 10);
  __publicField(Settings$1, "gridSizeL", 100);
  __publicField(Settings$1, "zoom", 1);
  __publicField(Settings$1, "bufferMargin", 50);
  __publicField(Settings$1, "cursorSize", 10);
  __publicField(Settings$1, "gridBackground", new Color$1("--grid-background"));
  __publicField(Settings$1, "gridLines", new Color$1("--grid-lines"));
  __publicField(Settings$1, "shapeAllowed", new Color$1("--shape-allowed"));
  __publicField(Settings$1, "shapeForbidden", new Color$1("--shape-forbidden"));
  __publicField(Settings$1, "tileBackground", new Color$1("--tile-background"));
  __privateAdd(Settings$1, _canvas, null);
  __publicField(Settings$1, "setCanvas", (c) => {
    __privateSet(_Settings$1, _canvas, c);
  });
  __publicField(Settings$1, "getCanvas", () => {
    return __privateGet(_Settings$1, _canvas);
  });
  __privateAdd(Settings$1, _activeTool, null);
  __publicField(Settings$1, "setActiveTool", (c) => {
    __privateSet(_Settings$1, _activeTool, c);
  });
  __publicField(Settings$1, "getActiveTool", () => {
    return __privateGet(_Settings$1, _activeTool);
  });
  class EventSystem {
    constructor(events) {
      __privateAdd(this, _events, {});
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        __privateGet(this, _events)[event] = document.createEvent("Event");
        __privateGet(this, _events)[event].initEvent("c_" + event, true, true);
      }
    }
    subscribe(event, func) {
      document.addEventListener("c_" + event, func, false);
    }
    unsubscribe(event, func) {
      document.removeEventListener("c_" + event, func);
    }
    invoke(event, e) {
      var keys = Object.keys(__privateGet(this, _events));
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key == event) {
          var ce = new CustomEvent("c_" + key, { "detail": e });
          document.dispatchEvent(ce);
          return;
        }
      }
    }
  }
  _events = new WeakMap();
  const _Cursor$1 = class {
    constructor() {
      __privateAdd(this, _event);
      __privateAdd(this, _checkBounds);
      __publicField(this, "events", null);
      __publicField(this, "position", null);
      __publicField(this, "offset", null);
      __publicField(this, "isDisabled", false);
      __privateAdd(this, _mousedown, false);
      __privateAdd(this, _mousemoved, false);
      __privateAdd(this, _lastPos, null);
      __privateAdd(this, _diff, null);
      __publicField(this, "local", () => {
        var rect = Settings.getCanvas().elt.getBoundingClientRect();
        return new Vector2(this.position.x - rect.left, this.position.y - rect.top);
      });
      __publicField(this, "global", () => {
        var x = window.pageXOffset + Settings.getCanvas().elt.getBoundingClientRect().left;
        var y = window.pageYOffset + Settings.getCanvas().elt.getBoundingClientRect().top;
        var pos = this.local();
        return new Vector2(x + pos.x, y + pos.y);
      });
      _Cursor$1.get = () => {
        return this;
      };
      this.events = new EventSystem(["click", "dragStart", "dragMove", "dragEnd", "scroll"]);
      this.position = Vector2.zero();
      __privateSet(this, _lastPos, Vector2.zero());
      __privateSet(this, _diff, Vector2.zero());
      this.resetOffset();
      document.addEventListener("mousemove", (e) => {
        this.position = new Vector2(e.clientX, e.clientY);
      });
      document.addEventListener("mousemove", (event) => {
        __privateMethod(this, _event, event_fn).call(this, event, "mousemove");
      });
      document.addEventListener("mousedown", (event) => {
        __privateMethod(this, _event, event_fn).call(this, event, "mousedown");
      });
      document.addEventListener("mouseup", (event) => {
        __privateMethod(this, _event, event_fn).call(this, event, "mouseup");
      });
      document.addEventListener("touchmove", (event) => {
        __privateMethod(this, _event, event_fn).call(this, event, "mousemove");
      });
      document.addEventListener("touchstart", (event) => {
        __privateMethod(this, _event, event_fn).call(this, event, "mousedown");
      });
      document.addEventListener("touchend", (event) => {
        __privateMethod(this, _event, event_fn).call(this, event, "mouseup");
      });
      document.addEventListener("wheel", (event) => {
        this.events.invoke("scroll", event);
      });
      this.events.subscribe("scroll", (e) => {
        if (this.isDisabled) {
          __privateMethod(this, _checkBounds, checkBounds_fn).call(this);
          return;
        }
        const { x, y, deltaY } = e.detail;
        const direction = deltaY > 0 ? -1 : 1;
        const factor = 0.05;
        const zoom = 1 * direction * factor;
        if (Math.round((Settings.zoom + zoom) * 100) / 100 < 0.5) {
          return;
        }
        if (Math.round((Settings.zoom + zoom) * 100) / 100 > 1.5) {
          return;
        }
        const wx = (x - this.offset.x) / (width * Settings.zoom);
        const wy = (y - this.offset.y) / (height * Settings.zoom);
        this.offset.x -= wx * width * zoom;
        this.offset.y -= wy * height * zoom;
        Settings.zoom += zoom;
        __privateMethod(this, _checkBounds, checkBounds_fn).call(this);
      });
    }
    update() {
    }
    resetOffset() {
      this.offset = new Vector2(-Settings.mapSizeX / 8, -Settings.mapSizeY / 8);
    }
  };
  let Cursor$1 = _Cursor$1;
  _mousedown = new WeakMap();
  _mousemoved = new WeakMap();
  _lastPos = new WeakMap();
  _diff = new WeakMap();
  _event = new WeakSet();
  event_fn = function(e, type) {
    if (this.isDisabled) {
      return;
    }
    var newPos = this.local();
    if (type == "mousemove") {
      if (__privateGet(this, _mousedown) && !__privateGet(this, _mousemoved)) {
        __privateSet(this, _lastPos, Vector2.copy(newPos));
        __privateSet(this, _mousemoved, true);
        this.events.invoke("dragStart", e);
      }
      if (__privateGet(this, _mousedown) && __privateGet(this, _mousemoved)) {
        if (!_Cursor$1.disableOffset) {
          __privateSet(this, _diff, Vector2.remove(newPos, __privateGet(this, _lastPos)));
          this.offset.add(__privateGet(this, _diff));
          __privateMethod(this, _checkBounds, checkBounds_fn).call(this);
          __privateSet(this, _lastPos, Vector2.copy(newPos));
        }
        this.events.invoke("dragMove", e);
      }
    } else if (type == "mousedown") {
      __privateSet(this, _mousemoved, false);
      __privateSet(this, _mousedown, true);
    } else if (type == "mouseup") {
      if (__privateGet(this, _mousemoved)) {
        this.events.invoke("dragEnd", e);
      } else {
        this.events.invoke("click", e);
      }
      __privateSet(this, _mousemoved, false);
      __privateSet(this, _mousedown, false);
    }
  };
  _checkBounds = new WeakSet();
  checkBounds_fn = function() {
    this.offset.minMax(new Vector2(-Settings.mapSizeX, -Settings.mapSizeY), new Vector2(Settings.mapSizeX, Settings.mapSizeY));
  };
  __publicField(Cursor$1, "disableOffset", false);
  __publicField(Cursor$1, "get", () => {
    return null;
  });
  __publicField(Cursor$1, "toGrid", (pos) => {
    var size = Settings.gridSizeS;
    return new Vector2(Math.round(pos.x / size) * size, Math.round(pos.y / size) * size);
  });
  class Grid {
    constructor() {
      __privateAdd(this, _buffer, null);
      __privateSet(this, _buffer, createGraphics(Settings.mapSizeX, Settings.mapSizeY));
      __privateGet(this, _buffer).canvas.id = "grid-buffer";
      var rgb = Settings.gridBackground.rgb();
      __privateGet(this, _buffer).background(rgb.r, rgb.g, rgb.b);
      var rgba = Settings.gridLines.rgba();
      __privateGet(this, _buffer).stroke(rgba.r, rgba.g, rgba.b, rgba.a);
      for (let i = 0; i < Settings.mapSizeX; i++) {
        __privateGet(this, _buffer).strokeWeight(i % Settings.gridSizeL == 0 ? 1 : 0.25);
        if (i % Settings.gridSizeS == 0 || i % Settings.gridSizeL == 0) {
          var fromPos = Cursor.toGrid(new Vector2(i, 0));
          var toPos = Cursor.toGrid(new Vector2(i, Settings.mapSizeY));
          __privateGet(this, _buffer).line(fromPos.x, fromPos.y, toPos.x, toPos.y);
        }
      }
      for (let i = 0; i < Settings.mapSizeY; i++) {
        __privateGet(this, _buffer).strokeWeight(i % Settings.gridSizeL == 0 ? 1 : 0.25);
        if (i % Settings.gridSizeS == 0 || i % Settings.gridSizeL == 0) {
          var fromPos = Cursor.toGrid(new Vector2(0, i));
          var toPos = Cursor.toGrid(new Vector2(Settings.mapSizeX, i));
          __privateGet(this, _buffer).line(fromPos.x, fromPos.y, toPos.x, toPos.y);
        }
      }
    }
    update() {
      image(__privateGet(this, _buffer), 0, 0);
    }
  }
  _buffer = new WeakMap();
  const _Shape = class {
    constructor(vertices = [], color = new Color$1(null, 255, 255, 255), id = null, isGenerated = false, buffer = null) {
      __publicField(this, "id", null);
      __publicField(this, "color", null);
      __publicField(this, "showData", false);
      __publicField(this, "isAllowed", true);
      __publicField(this, "isGenerated", false);
      __privateAdd(this, _vertices, null);
      __privateAdd(this, _shapebuffer, null);
      __privateAdd(this, _textBuffer, null);
      __privateAdd(this, _pos, null);
      __privateAdd(this, _generate, () => {
        const xArr = __privateGet(this, _vertices).map((a) => a.x);
        const yArr = __privateGet(this, _vertices).map((a) => a.y);
        const width2 = Math.max(...xArr) - Math.min(...xArr) + Settings.bufferMargin;
        const height2 = Math.max(...yArr) - Math.min(...yArr) + Settings.bufferMargin;
        __privateSet(this, _pos, new Vector2(Math.min(...xArr) - Settings.bufferMargin / 2, Math.min(...yArr) - Settings.bufferMargin / 2));
        if (__privateGet(this, _shapebuffer) == null || __privateGet(this, _textBuffer) == null) {
          __privateSet(this, _shapebuffer, createGraphics(width2, height2));
          __privateGet(this, _shapebuffer).canvas.id = "ShapesBufferGraphics_" + this.id;
          __privateSet(this, _textBuffer, createGraphics(width2, height2));
          __privateGet(this, _textBuffer).canvas.id = "TEXT_" + __privateGet(this, _shapebuffer).canvas.id;
        } else {
          __privateGet(this, _shapebuffer).clear();
          __privateGet(this, _textBuffer).clear();
        }
        __privateGet(this, _shapebuffer).beginShape();
        for (let i = 0; i < __privateGet(this, _vertices).length; i++) {
          const v = __privateGet(this, _vertices)[i];
          __privateGet(this, _shapebuffer).vertex(v.x - __privateGet(this, _pos).x, v.y - __privateGet(this, _pos).y);
        }
        __privateGet(this, _shapebuffer).vertex(__privateGet(this, _vertices)[0].x - __privateGet(this, _pos).x, __privateGet(this, _vertices)[0].y - __privateGet(this, _pos).y);
        var rgba = this.color.rgba();
        __privateGet(this, _shapebuffer).fill(rgba.r, rgba.g, rgba.b, rgba.a);
        __privateGet(this, _shapebuffer).endShape();
        var next = 0;
        for (let i = 0; i < __privateGet(this, _vertices).length; i++) {
          next = i + 1;
          if (next >= __privateGet(this, _vertices).length) {
            next = 0;
          }
          const v1 = __privateGet(this, _vertices)[i];
          const v2 = __privateGet(this, _vertices)[next];
          var pos = v1.getCopy().add(v2).devide(new Vector2(2, 2));
          pos.remove(__privateGet(this, _pos));
          var dist = (Vector2.distance(v1, v2) * 10).toFixed("0");
          __privateGet(this, _textBuffer).fill(0);
          __privateGet(this, _textBuffer).textSize(12);
          __privateGet(this, _textBuffer).text(dist + " mm", pos.x - (dist + "").length * 6, pos.y);
        }
      });
      __privateAdd(this, _generateUniqSerial, () => {
        return "xxxx-xxxx-xxx-xxxx".replace(/[x]/g, (c) => {
          const r = Math.floor(Math.random() * 16);
          return r.toString(16);
        });
      });
      this.id = id;
      this.color = color;
      this.showData = true;
      this.isAllowed = true;
      this.isGenerated = isGenerated;
      __privateSet(this, _shapebuffer, buffer);
      __privateSet(this, _textBuffer, buffer);
      if (this.id == null) {
        this.id = __privateGet(this, _generateUniqSerial).call(this);
      }
      __privateSet(this, _vertices, vertices);
      __privateGet(this, _generate).call(this);
    }
    update() {
      image(__privateGet(this, _shapebuffer), __privateGet(this, _pos).x, __privateGet(this, _pos).y);
    }
    updateText() {
      if (!this.showData) {
        return;
      }
      image(__privateGet(this, _textBuffer), __privateGet(this, _pos).x, __privateGet(this, _pos).y);
    }
    getId() {
      return __privateGet(this, _shapebuffer).canvas.id.split("_")[1];
    }
    getVertices() {
      return __privateGet(this, _vertices);
    }
    getBoundingBox() {
      const xArr = __privateGet(this, _vertices).map((a) => a.x);
      const yArr = __privateGet(this, _vertices).map((a) => a.y);
      const width2 = Math.max(...xArr) - Math.min(...xArr);
      const height2 = Math.max(...yArr) - Math.min(...yArr);
      return { "x": __privateGet(this, _pos).x + Settings.bufferMargin / 2, "y": __privateGet(this, _pos).y + Settings.bufferMargin / 2, "w": width2, "h": height2 };
    }
    clone() {
      return new _Shape(Vector2.copyAll(__privateGet(this, _vertices)), this.color, this.id);
    }
    redraw() {
      __privateGet(this, _generate).call(this);
    }
    reCalculate(vertices = [], color = new Color$1(null, 255, 255, 255)) {
      if (__privateGet(this, _shapebuffer) != null) {
        __privateGet(this, _shapebuffer).clear();
        __privateGet(this, _shapebuffer).elt.parentNode.removeChild(__privateGet(this, _shapebuffer).elt);
        __privateSet(this, _shapebuffer, null);
        __privateGet(this, _textBuffer).clear();
        __privateGet(this, _textBuffer).elt.parentNode.removeChild(__privateGet(this, _textBuffer).elt);
        __privateSet(this, _textBuffer, null);
      }
      __privateSet(this, _vertices, vertices);
      this.color = color;
      __privateGet(this, _generate).call(this);
    }
  };
  let Shape = _Shape;
  _vertices = new WeakMap();
  _shapebuffer = new WeakMap();
  _textBuffer = new WeakMap();
  _pos = new WeakMap();
  _generate = new WeakMap();
  _generateUniqSerial = new WeakMap();
  const _Renderer$1 = class {
    constructor() {
      __privateAdd(this, _shapes, null);
      _Renderer$1.instance = this;
      __privateSet(this, _shapes, []);
      this.add(new Shape([
        new Vector2(750, 750),
        new Vector2(750 + 50 * 15, 750),
        new Vector2(750 + 50 * 10, 750 + 50 * 10),
        new Vector2(750 + 50 * 15, 750 + 50 * 12),
        new Vector2(750 + 50 * 15, 750 + 50 * 15),
        new Vector2(750, 750 + 50 * 15)
      ], new Color(null, 255, 255, 255, 255)));
      var forbidden = new Shape([
        new Vector2(750 + 50 * 1, 750 + 50 * 1),
        new Vector2(750 + 50 * 5, 750 + 50 * 1),
        new Vector2(750 + 50 * 5, 750 + 50 * 5),
        new Vector2(750 + 50 * 1, 750 + 50 * 5)
      ], new Color(null, 255, 0, 0, 255));
      forbidden.isAllowed = false;
      this.add(forbidden);
    }
    update() {
      var keys = Object.keys(__privateGet(this, _shapes));
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        var shape = __privateGet(this, _shapes)[key];
        shape.update();
      }
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        var shape = __privateGet(this, _shapes)[key];
        shape.updateText();
      }
    }
    add(target) {
      __privateGet(this, _shapes).push(target);
    }
    remove(target) {
      for (let i = 0; i < __privateGet(this, _shapes).length; i++) {
        const shape = __privateGet(this, _shapes)[i];
        if (shape.getId() == target.getId()) {
          __privateGet(this, _shapes).splice(i, 1);
          return;
        }
      }
    }
    replace(target, value) {
      for (let i = 0; i < __privateGet(this, _shapes).length; i++) {
        const shape = __privateGet(this, _shapes)[i];
        if (shape.getId() == target.getId()) {
          __privateGet(this, _shapes)[i] = value;
          return;
        }
      }
    }
    getAll() {
      return __privateGet(this, _shapes);
    }
    get(id) {
      for (let i = 0; i < __privateGet(this, _shapes).length; i++) {
        const shape = __privateGet(this, _shapes)[i];
        if (shape.getId() == id) {
          return shape;
        }
      }
      return null;
    }
  };
  let Renderer$1 = _Renderer$1;
  _shapes = new WeakMap();
  __publicField(Renderer$1, "instance", null);
  class Action {
    constructor(name, undo, redo) {
      __publicField(this, "name", "");
      __publicField(this, "undo", null);
      __publicField(this, "redo", null);
      this.name = name;
      this.undo = undo;
      this.redo = redo;
    }
  }
  class DrawingTool {
    constructor() {
      __privateAdd(this, _onPlace);
      __privateAdd(this, _onDrag);
      __privateAdd(this, _generate2);
      __publicField(this, "isEnabled", false);
      __publicField(this, "canAdd", true);
      __publicField(this, "canDelete", true);
      __publicField(this, "canInsert", true);
      __publicField(this, "canMove", true);
      __privateAdd(this, _buffer2, null);
      __privateAdd(this, _points, []);
      __privateAdd(this, _selectedPointIndex, null);
      __privateAdd(this, _dragOldPos, null);
      __privateAdd(this, _originalShape, null);
      __privateSet(this, _buffer2, createGraphics(Settings.mapSizeX, Settings.mapSizeY));
      document.addEventListener("keyup", (event) => {
        if (__privateGet(this, _points).length > 0 && event.key == "Escape") {
          this.setData([]);
        }
      });
      var cursor = Cursor.get();
      cursor.events.subscribe("click", (e) => {
        if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3) {
          return;
        }
        if (e.detail.shiftKey) {
          if (this.isEnabled) {
            this.disable();
          } else {
            this.enable();
          }
          return;
        }
        if (this.isEnabled) {
          __privateMethod(this, _onPlace, onPlace_fn).call(this, e);
        }
      });
      cursor.events.subscribe("dragStart", (e) => {
        if (this.isEnabled && this.canMove) {
          var cursor2 = Cursor.get();
          var pos = cursor2.local().remove(cursor2.offset);
          pos.x /= Settings.zoom;
          pos.y /= Settings.zoom;
          if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) {
            return;
          }
          __privateSet(this, _selectedPointIndex, null);
          for (let i = 0; i < __privateGet(this, _points).length; i++) {
            const point2 = __privateGet(this, _points)[i];
            const dist = Vector2.distance(pos, point2);
            if (dist <= Settings.cursorSize) {
              __privateSet(this, _selectedPointIndex, i);
              __privateSet(this, _dragOldPos, point2.getCopy());
              Cursor.disableOffset = true;
              break;
            }
          }
        }
      });
      cursor.events.subscribe("dragMove", (e) => {
        if (this.isEnabled && __privateGet(this, _selectedPointIndex) != null) {
          __privateMethod(this, _onDrag, onDrag_fn).call(this, e);
        }
      });
      cursor.events.subscribe("dragEnd", (e) => {
        if (this.isEnabled) {
          if (__privateGet(this, _selectedPointIndex) != null) {
            var newPos = __privateGet(this, _points)[__privateGet(this, _selectedPointIndex)].getCopy();
            var oldPos = __privateGet(this, _dragOldPos).getCopy();
            var index = __privateGet(this, _selectedPointIndex);
            var action = new Action(
              "Moved Coordinates",
              () => {
                __privateGet(this, _points)[index] = oldPos;
                __privateMethod(this, _generate2, generate_fn).call(this);
              },
              () => {
                __privateGet(this, _points)[index] = newPos;
                __privateMethod(this, _generate2, generate_fn).call(this);
              }
            );
            HistoryTool.add(action);
          }
          __privateSet(this, _selectedPointIndex, null);
          Cursor.disableOffset = false;
        }
      });
    }
    update() {
      __privateMethod(this, _generate2, generate_fn).call(this);
      image(__privateGet(this, _buffer2), 0, 0);
    }
    enable() {
      var action = new Action(
        "Enabled Drawing tool",
        () => {
          this.isEnabled = false;
          __privateSet(this, _originalShape, null);
          __privateSet(this, _dragOldPos, null);
        },
        () => {
          this.isEnabled = true;
          __privateSet(this, _originalShape, null);
          __privateSet(this, _dragOldPos, null);
        }
      );
      HistoryTool.add(action);
      action.redo();
    }
    disable() {
      var points = Vector2.copyAll(__privateGet(this, _points));
      var action = new Action(
        "Disable Drawing tool",
        () => {
          this.isEnabled = true;
          __privateSet(this, _originalShape, null);
          __privateSet(this, _dragOldPos, null);
          __privateSet(this, _points, points);
          __privateMethod(this, _generate2, generate_fn).call(this);
        },
        () => {
          this.isEnabled = false;
          __privateSet(this, _originalShape, null);
          __privateSet(this, _dragOldPos, null);
          __privateSet(this, _points, []);
          __privateMethod(this, _generate2, generate_fn).call(this);
        }
      );
      HistoryTool.add(action);
      action.redo();
    }
    setData(points) {
      __privateSet(this, _points, points);
      __privateMethod(this, _generate2, generate_fn).call(this);
    }
  }
  _buffer2 = new WeakMap();
  _points = new WeakMap();
  _selectedPointIndex = new WeakMap();
  _dragOldPos = new WeakMap();
  _originalShape = new WeakMap();
  _onPlace = new WeakSet();
  onPlace_fn = function(e) {
    var cursor = Cursor.get();
    var pos = cursor.local().remove(cursor.offset);
    pos.x /= Settings.zoom;
    pos.y /= Settings.zoom;
    pos = Cursor.toGrid(pos);
    if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) {
      return;
    }
    var hasFound = false;
    for (let i = 0; i < __privateGet(this, _points).length; i++) {
      const point2 = __privateGet(this, _points)[i];
      const dist = Vector2.distance(pos, point2);
      if (dist <= Settings.cursorSize) {
        if (i != 0) {
          hasFound = true;
          if (this.canDelete) {
            var original = Vector2.copyAll(__privateGet(this, _points));
            var tmp = Vector2.copyAll(__privateGet(this, _points));
            tmp.splice(i, 1);
            var action = new Action(
              "Deleted Coordinates",
              () => {
                __privateSet(this, _points, original);
                __privateMethod(this, _generate2, generate_fn).call(this);
              },
              () => {
                __privateSet(this, _points, tmp);
                __privateMethod(this, _generate2, generate_fn).call(this);
              }
            );
            HistoryTool.add(action);
            action.redo();
          }
          break;
        } else if (__privateGet(this, _points).length > 1) {
          hasFound = true;
          var shape = new Shape(__privateGet(this, _points), Settings.shapeAllowed);
          var points = Vector2.copyAll(__privateGet(this, _points));
          var action = new Action(
            "Created Shape",
            () => {
              Renderer.instance.remove(shape);
              __privateSet(this, _points, points);
              __privateMethod(this, _generate2, generate_fn).call(this);
            },
            () => {
              Renderer.instance.add(shape);
              __privateSet(this, _points, []);
              __privateGet(this, _buffer2).clear();
            }
          );
          HistoryTool.add(action);
          action.redo();
          return;
        } else {
          var points = Vector2.copyAll(__privateGet(this, _points));
          var action = new Action(
            "Deleted Shape",
            () => {
              __privateSet(this, _points, points);
              __privateMethod(this, _generate2, generate_fn).call(this);
            },
            () => {
              __privateSet(this, _points, []);
              __privateGet(this, _buffer2).clear();
              __privateMethod(this, _generate2, generate_fn).call(this);
            }
          );
          HistoryTool.add(action);
          action.redo();
          return;
        }
      }
    }
    if (!hasFound) {
      var realPos = cursor.local().remove(cursor.offset);
      for (let i = 0; i < __privateGet(this, _points).length; i++) {
        const next = __privateGet(this, _points)[i + 1 < __privateGet(this, _points).length - 1 ? i + 1 : 0];
        const prev = __privateGet(this, _points)[i];
        if (Collision.linePoint(next.x, next.y, prev.x, prev.y, realPos.x, realPos.y)) {
          hasFound = true;
          if (this.canInsert) {
            var action = new Action(
              "Inserted Coordinates",
              () => {
                __privateGet(this, _points).splice(i + 1, 1);
                __privateMethod(this, _generate2, generate_fn).call(this);
              },
              () => {
                __privateGet(this, _points).splice(i + 1, 0, pos);
                __privateMethod(this, _generate2, generate_fn).call(this);
              }
            );
            HistoryTool.add(action);
            action.redo();
          }
          break;
        }
      }
      if (!hasFound) {
        if (__privateGet(this, _originalShape) == null) {
          if (this.canAdd) {
            var action = new Action(
              "Added Coordinates",
              () => {
                __privateGet(this, _points).splice(__privateGet(this, _points).length - 1, 1);
                __privateMethod(this, _generate2, generate_fn).call(this);
              },
              () => {
                __privateGet(this, _points).push(pos);
                __privateMethod(this, _generate2, generate_fn).call(this);
              }
            );
            HistoryTool.add(action);
            action.redo();
          }
        }
      }
    }
  };
  _onDrag = new WeakSet();
  onDrag_fn = function(e) {
    var cursor = Cursor.get();
    var pos = cursor.local().remove(cursor.offset);
    pos.x /= Settings.zoom;
    pos.y /= Settings.zoom;
    if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) {
      return;
    }
    var oldPos = __privateGet(this, _points)[__privateGet(this, _selectedPointIndex)];
    if (!oldPos || !point) {
      return;
    }
    __privateGet(this, _points)[__privateGet(this, _selectedPointIndex)] = Cursor.toGrid(pos);
    if (!oldPos.equals(__privateGet(this, _points)[__privateGet(this, _selectedPointIndex)])) {
      __privateMethod(this, _generate2, generate_fn).call(this);
    }
  };
  _generate2 = new WeakSet();
  generate_fn = function() {
    __privateGet(this, _buffer2).clear();
    __privateGet(this, _buffer2).translate(0);
    __privateGet(this, _buffer2).scale(1);
    for (let i = 1; i < __privateGet(this, _points).length; i++) {
      const p1 = __privateGet(this, _points)[i];
      const p2 = __privateGet(this, _points)[i - 1 >= 0 ? i - 1 : __privateGet(this, _points).length - 1];
      __privateGet(this, _buffer2).line(p1.x, p1.y, p2.x, p2.y);
    }
    if (__privateGet(this, _points).length >= 1 && this.canAdd) {
      var cursor = Cursor.get();
      var pos = cursor.local().remove(cursor.offset);
      pos.x /= Settings.zoom;
      pos.y /= Settings.zoom;
      pos = Cursor.toGrid(pos);
      var lastPos = __privateGet(this, _points)[__privateGet(this, _points).length - 1];
      __privateGet(this, _buffer2).push();
      __privateGet(this, _buffer2).line(lastPos.x, lastPos.y, pos.x, pos.y);
      __privateGet(this, _buffer2).fill(255, 0, 0);
      __privateGet(this, _buffer2).circle(pos.x, pos.y, 5);
      var dist = Vector2.distance(lastPos, pos) * 10;
      __privateGet(this, _buffer2).fill(0);
      __privateGet(this, _buffer2).text(dist.toFixed("0") + " mm", pos.x, pos.y + 30);
      __privateGet(this, _buffer2).pop();
    }
    for (let i = 0; i < __privateGet(this, _points).length; i++) {
      const p1 = __privateGet(this, _points)[i];
      __privateGet(this, _buffer2).circle(p1.x, p1.y, 10);
      if (i == 0) {
        __privateGet(this, _buffer2).push();
        __privateGet(this, _buffer2).fill(255, 0, 0);
        __privateGet(this, _buffer2).circle(p1.x, p1.y, 5);
        __privateGet(this, _buffer2).pop();
      }
    }
    if (__privateGet(this, _points).length >= 2) {
      for (let i = 1; i < __privateGet(this, _points).length; i++) {
        const p1 = __privateGet(this, _points)[i];
        const p2 = __privateGet(this, _points)[i - 1 >= 0 ? i - 1 : __privateGet(this, _points).length - 1];
        var dist = Vector2.distance(p1, p2) * 10;
        var textPos = p1.getCopy().add(p2).devide(new Vector2(2, 2));
        __privateGet(this, _buffer2).text(dist.toFixed("0") + " mm", textPos.x, textPos.y);
      }
    }
  };
  class SelectorTool {
    constructor() {
      __privateAdd(this, _generate3);
      __publicField(this, "isEnabled", false);
      __publicField(this, "shape", null);
      __publicField(this, "canAdd", true);
      __publicField(this, "canDelete", true);
      __publicField(this, "canInsert", true);
      __publicField(this, "canMove", true);
      __privateAdd(this, _buffer3, null);
      __privateAdd(this, _selectedPointIndex2, null);
      __privateAdd(this, _dragOldPos2, null);
      this.isEnabled = false;
      __privateSet(this, _buffer3, createGraphics(Settings.mapSizeX, Settings.mapSizeY));
      var cursor = Cursor.get();
      cursor.events.subscribe("click", (e) => {
        var cursor2 = Cursor.get();
        var pos = cursor2.local().remove(cursor2.offset);
        pos.x /= Settings.zoom;
        pos.y /= Settings.zoom;
        pos = Cursor.toGrid(pos);
        if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3) {
          return;
        }
        if (this.isEnabled) {
          var shapes = Renderer.instance.getAll();
          var sameShape = false;
          for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            var vertices = shape.getVertices();
            if (Collision.polygonCircle(vertices, pos.x, pos.y, Settings.cursorSize)) {
              if (this.shape == null) {
                var action = new Action(
                  "Selected shape",
                  () => {
                    this.shape.showData = true;
                    this.shape = null;
                    __privateGet(this, _buffer3).clear();
                  },
                  () => {
                    this.shape = shape;
                    this.shape.showData = false;
                    __privateMethod(this, _generate3, generate_fn2).call(this);
                  }
                );
                HistoryTool.add(action);
                action.redo();
                return;
              } else if (this.shape.getId() != shape.getId()) {
                var oldShape = this.shape.clone();
                var action = new Action(
                  "Selected different shape",
                  () => {
                    this.shape.showData = true;
                    this.shape = Renderer.instance.get(oldShape.getId());
                    this.shape.showData = false;
                    __privateMethod(this, _generate3, generate_fn2).call(this);
                  },
                  () => {
                    this.shape.showData = true;
                    this.shape = shape;
                    this.shape.showData = false;
                    __privateMethod(this, _generate3, generate_fn2).call(this);
                  }
                );
                HistoryTool.add(action);
                action.redo();
                return;
              }
              sameShape = true;
            }
          }
          if (this.shape != null) {
            var points = this.shape.getVertices();
            for (let v = 0; v < points.length; v++) {
              const next = points[v + 1 < points.length - 1 ? v + 1 : 0];
              const prev = points[v];
              if (Collision.linePoint(next.x, next.y, prev.x, prev.y, pos.x, pos.y) && !Collision.pointCircle(pos.x, pos.y, next.x, next.y, Settings.cursorSize) && !Collision.pointCircle(pos.x, pos.y, prev.x, prev.y, Settings.cursorSize)) {
                if (this.canInsert) {
                  var action = new Action(
                    "Inserted Coordinates",
                    () => {
                      points.splice(v + 1, 1);
                      __privateMethod(this, _generate3, generate_fn2).call(this);
                    },
                    () => {
                      points.splice(v + 1, 0, pos);
                      __privateMethod(this, _generate3, generate_fn2).call(this);
                    }
                  );
                  HistoryTool.add(action);
                  action.redo();
                }
                return;
              } else if (Collision.pointCircle(pos.x, pos.y, prev.x, prev.y, Settings.cursorSize) && v != 0) {
                var points = this.shape.getVertices();
                var point2 = points[v].getCopy();
                if (points.length - 1 > 1) {
                  if (this.canDelete) {
                    var action = new Action(
                      "Deleted Coordinates",
                      () => {
                        points.splice(v, 0, point2);
                        __privateMethod(this, _generate3, generate_fn2).call(this);
                      },
                      () => {
                        points.splice(v, 1);
                        __privateMethod(this, _generate3, generate_fn2).call(this);
                      }
                    );
                    HistoryTool.add(action);
                    action.redo();
                  }
                } else {
                  this.deleteSelected();
                }
                return;
              }
            }
          }
          if (this.shape != null && !sameShape) {
            this.deselectShape();
          }
        }
      });
      cursor.events.subscribe("dragStart", (e) => {
        if (this.isEnabled && this.shape != null && this.canMove) {
          var cursor2 = Cursor.get();
          var pos = cursor2.local().remove(cursor2.offset);
          pos.x /= Settings.zoom;
          pos.y /= Settings.zoom;
          if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) {
            return;
          }
          var points = this.shape.getVertices();
          __privateSet(this, _selectedPointIndex2, null);
          for (let i = 0; i < points.length; i++) {
            const point2 = points[i];
            const dist = Vector2.distance(pos, point2);
            if (dist <= Settings.cursorSize) {
              __privateSet(this, _selectedPointIndex2, i);
              __privateSet(this, _dragOldPos2, point2.getCopy());
              Cursor.disableOffset = true;
              break;
            }
          }
        }
      });
      cursor.events.subscribe("dragMove", (e) => {
        if (this.isEnabled && this.shape != null && __privateGet(this, _selectedPointIndex2) != null) {
          var cursor2 = Cursor.get();
          var pos = cursor2.local().remove(cursor2.offset);
          pos.x /= Settings.zoom;
          pos.y /= Settings.zoom;
          if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) {
            return;
          }
          var points = this.shape.getVertices();
          var oldPos = points[__privateGet(this, _selectedPointIndex2)];
          if (!oldPos || !point) {
            return;
          }
          points[__privateGet(this, _selectedPointIndex2)] = Cursor.toGrid(pos);
          if (!oldPos.equals(points[__privateGet(this, _selectedPointIndex2)])) {
            __privateMethod(this, _generate3, generate_fn2).call(this);
          }
        }
      });
      cursor.events.subscribe("dragEnd", (e) => {
        if (this.isEnabled && this.shape != null) {
          if (__privateGet(this, _selectedPointIndex2) != null) {
            var points = this.shape.getVertices();
            var newPos = points[__privateGet(this, _selectedPointIndex2)].getCopy();
            var oldPos = __privateGet(this, _dragOldPos2).getCopy();
            var index = __privateGet(this, _selectedPointIndex2);
            var action = new Action(
              "Moved Coordinates",
              () => {
                points[index] = oldPos;
                __privateMethod(this, _generate3, generate_fn2).call(this);
              },
              () => {
                points[index] = newPos;
                __privateMethod(this, _generate3, generate_fn2).call(this);
              }
            );
            HistoryTool.add(action);
          }
          __privateSet(this, _selectedPointIndex2, null);
          Cursor.disableOffset = false;
        }
      });
    }
    update() {
      if (this.shape != null) {
        __privateMethod(this, _generate3, generate_fn2).call(this);
      }
      image(__privateGet(this, _buffer3), 0, 0);
    }
    enable() {
      var action = new Action(
        "Enabled Selector tool",
        () => {
          this.isEnabled = false;
        },
        () => {
          this.isEnabled = true;
        }
      );
      HistoryTool.add(action);
      action.redo();
    }
    disable() {
      var shape = this.shape != null ? this.shape.clone() : null;
      var action = new Action(
        "Disable Selector tool",
        () => {
          this.isEnabled = true;
          this.shape = shape;
          if (this.shape != null) {
            this.shape.showData = false;
          }
          __privateMethod(this, _generate3, generate_fn2).call(this);
        },
        () => {
          this.isEnabled = false;
          if (this.shape != null) {
            this.shape.showData = true;
          }
          this.deselectShape();
          this.shape = null;
          __privateMethod(this, _generate3, generate_fn2).call(this);
        }
      );
      HistoryTool.add(action);
      action.redo();
    }
    deleteSelected() {
      if (this.shape == null) {
        return;
      }
      var clone = this.shape.clone();
      var action = new Action(
        "Deleted Shape",
        () => {
          Renderer.instance.add(clone);
          this.shape = clone;
          this.shape.showData = false;
          __privateMethod(this, _generate3, generate_fn2).call(this);
        },
        () => {
          Renderer.instance.remove(this.shape);
          __privateGet(this, _buffer3).clear();
          this.shape.showData = true;
          this.shape = null;
        }
      );
      HistoryTool.add(action);
      action.redo();
    }
    deselectShape() {
      if (this.shape == null) {
        return;
      }
      var points = this.shape.getVertices();
      var oldShape = this.shape.clone();
      var action = new Action(
        "Deselect shape",
        () => {
          this.shape = Renderer.instance.get(oldShape.getId());
          this.shape.showData = false;
          __privateMethod(this, _generate3, generate_fn2).call(this);
        },
        () => {
          this.shape.showData = true;
          this.shape.reCalculate(points, oldShape.color);
          this.shape = null;
          __privateGet(this, _buffer3).clear();
        }
      );
      HistoryTool.add(action);
      action.redo();
    }
  }
  _buffer3 = new WeakMap();
  _selectedPointIndex2 = new WeakMap();
  _dragOldPos2 = new WeakMap();
  _generate3 = new WeakSet();
  generate_fn2 = function() {
    __privateGet(this, _buffer3).clear();
    __privateGet(this, _buffer3).translate(0);
    __privateGet(this, _buffer3).scale(1);
    if (this.shape == null) {
      return;
    }
    var points = this.shape.getVertices();
    if (points.length > 1) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[i - 1 >= 0 ? i - 1 : points.length - 1];
        __privateGet(this, _buffer3).line(p1.x, p1.y, p2.x, p2.y);
      }
    }
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      __privateGet(this, _buffer3).circle(p1.x, p1.y, 10);
      if (i == 0) {
        __privateGet(this, _buffer3).push();
        __privateGet(this, _buffer3).fill(255, 0, 0);
        __privateGet(this, _buffer3).circle(p1.x, p1.y, 5);
        __privateGet(this, _buffer3).pop();
      }
    }
    if (points.length >= 2) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[i - 1 >= 0 ? i - 1 : points.length - 1];
        var dist = Vector2.distance(p1, p2) * 10;
        var textPos = p1.getCopy().add(p2).devide(new Vector2(2, 2));
        __privateGet(this, _buffer3).text(dist.toFixed("0") + " mm", textPos.x, textPos.y);
      }
    }
  };
  class Tile {
    constructor(vertices = [], buffer = null) {
      __privateAdd(this, _generate4);
      __privateAdd(this, _buffer4, null);
      __privateAdd(this, _vertices2, []);
      __privateSet(this, _buffer4, buffer);
      __privateSet(this, _vertices2, vertices);
      __privateMethod(this, _generate4, generate_fn3).call(this);
    }
    getVertices() {
      return __privateGet(this, _vertices2);
    }
  }
  _buffer4 = new WeakMap();
  _vertices2 = new WeakMap();
  _generate4 = new WeakSet();
  generate_fn3 = function() {
    __privateGet(this, _buffer4).beginShape();
    for (let i = 0; i < __privateGet(this, _vertices2).length; i++) {
      __privateGet(this, _buffer4).vertex(__privateGet(this, _vertices2)[i].x, __privateGet(this, _vertices2)[i].y);
    }
    __privateGet(this, _buffer4).vertex(__privateGet(this, _vertices2)[0].x, __privateGet(this, _vertices2)[0].y);
    var rgba = Settings.tileBackground.rgb();
    __privateGet(this, _buffer4).fill(rgba.r, rgba.g, rgba.b, rgba.a);
    __privateGet(this, _buffer4).endShape();
  };
  class GeneratorTool {
    constructor() {
      __privateAdd(this, _createInset);
      __privateAdd(this, _createOutset);
      __privateAdd(this, _getMargin);
      __privateAdd(this, _generateTiles);
      __privateAdd(this, _canBePlaced);
      __privateAdd(this, _isColliding);
      __privateAdd(this, _isInside);
      __privateAdd(this, _getTile);
      __publicField(this, "isEnabled", false);
      __publicField(this, "canAdd", true);
      __publicField(this, "canDelete", true);
      __publicField(this, "canInsert", true);
      __publicField(this, "canMove", true);
      __publicField(this, "marginU", 25);
      __publicField(this, "marginLR", 25);
      __publicField(this, "marginD", 25);
      __publicField(this, "margin", 5);
      __privateAdd(this, _buffer5, null);
      __privateAdd(this, _renderer, null);
      __privateAdd(this, _tiles, []);
      __privateAdd(this, _sleep, (delay) => new Promise((resolve) => setTimeout(resolve, delay)));
      __privateSet(this, _renderer, Renderer.instance);
      __privateSet(this, _buffer5, createGraphics(Settings.mapSizeX, Settings.mapSizeY));
    }
    update() {
      image(__privateGet(this, _buffer5), 0, 0);
    }
    enable() {
      this.isEnabled = true;
    }
    disable() {
      this.isEnabled = false;
    }
    generate() {
      var insets = [];
      var outsets = [];
      __privateGet(this, _buffer5).clear();
      var shapes = __privateGet(this, _renderer).getAll();
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.isAllowed && !shape.isGenerated) {
          var inset = __privateMethod(this, _createInset, createInset_fn).call(this, shape);
          var points = inset.getVertices();
          insets.push(inset);
          {
            __privateGet(this, _buffer5).push();
            for (let i2 = 0; i2 < points.length; i2++) {
              const vc = points[i2];
              const vn = points[i2 + 1 < points.length ? i2 + 1 : 0];
              __privateGet(this, _buffer5).drawingContext.setLineDash([15, 15]);
              __privateGet(this, _buffer5).stroke(255, 0, 0);
              __privateGet(this, _buffer5).strokeWeight(2);
              __privateGet(this, _buffer5).line(vc.x, vc.y, vn.x, vn.y);
            }
            __privateGet(this, _buffer5).pop();
          }
        } else {
          var outset = __privateMethod(this, _createOutset, createOutset_fn).call(this, shape);
          var points = outset.getVertices();
          outsets.push(outset);
          {
            __privateGet(this, _buffer5).push();
            for (let i2 = 0; i2 < points.length; i2++) {
              const vc = points[i2];
              const vn = points[i2 + 1 < points.length ? i2 + 1 : 0];
              __privateGet(this, _buffer5).drawingContext.setLineDash([15, 15]);
              __privateGet(this, _buffer5).stroke(0, 0, 0);
              __privateGet(this, _buffer5).strokeWeight(2);
              __privateGet(this, _buffer5).line(vc.x, vc.y, vn.x, vn.y);
            }
            __privateGet(this, _buffer5).pop();
          }
        }
      }
      for (let i = 0; i < insets.length; i++) {
        const inset2 = insets[i];
        __privateMethod(this, _generateTiles, generateTiles_fn).call(this, inset2, outsets);
      }
    }
  }
  _buffer5 = new WeakMap();
  _renderer = new WeakMap();
  _tiles = new WeakMap();
  _createInset = new WeakSet();
  createInset_fn = function(shape) {
    var insets = [];
    __privateGet(this, _buffer5).beginShape();
    var points = shape.getVertices();
    __privateGet(this, _buffer5).push();
    for (let i = 0; i < points.length; i++) {
      const vc = points[i];
      const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
      const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];
      if (vp.x == vc.x && vc.x == vn.x || vp.y == vc.y && vc.y == vn.y) {
        continue;
      }
      var dirN = vn.getCopy().remove(vc).normalized();
      var marginN = Math.abs(__privateMethod(this, _getMargin, getMargin_fn).call(this, dirN));
      dirN.multiply(new Vector2(marginN, marginN));
      var dirP = vp.getCopy().remove(vc).normalized();
      var marginP = Math.abs(__privateMethod(this, _getMargin, getMargin_fn).call(this, dirP));
      dirP.multiply(new Vector2(marginP, marginP));
      dirN.getCopy().add(vc);
      dirP.getCopy().add(vc);
      var pos = dirN.getCopy().add(vc).add(dirP);
      if (!Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 5)) {
        dirN = vn.getCopy().remove(vc).normalized();
        marginN = Math.abs(__privateMethod(this, _getMargin, getMargin_fn).call(this, dirN));
        dirN.multiply(new Vector2(marginN, marginN));
        dirP = vp.getCopy().remove(vc).normalized();
        marginP = Math.abs(__privateMethod(this, _getMargin, getMargin_fn).call(this, dirP));
        dirP.multiply(new Vector2(marginP, marginP));
        vc.getCopy().remove(dirN);
        vc.getCopy().remove(dirP);
        pos = vc.getCopy().remove(dirN).remove(dirP);
      }
      insets.push(pos);
    }
    __privateGet(this, _buffer5).vertex(insets[0].x, insets[0].y);
    __privateGet(this, _buffer5).noStroke();
    __privateGet(this, _buffer5).noFill();
    __privateGet(this, _buffer5).endShape();
    __privateGet(this, _buffer5).pop();
    return new Shape(insets);
  };
  _createOutset = new WeakSet();
  createOutset_fn = function(shape) {
    var outsets = [];
    __privateGet(this, _buffer5).beginShape();
    var points = shape.getVertices();
    __privateGet(this, _buffer5).push();
    for (let i = 0; i < points.length; i++) {
      const vc = points[i];
      const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
      const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];
      if (vp.x == vc.x && vc.x == vn.x || vp.y == vc.y && vc.y == vn.y) {
        continue;
      }
      var dirP = vp.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
      var dirN = vn.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
      vc.getCopy().remove(dirP);
      vc.getCopy().remove(dirN);
      var pos = vc.getCopy().remove(dirN).remove(dirP);
      if (Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 5)) {
        vc.getCopy().add(dirP);
        vc.getCopy().add(dirN);
        var pos = vc.getCopy().add(dirN).add(dirP);
      }
      outsets.push(pos);
    }
    __privateGet(this, _buffer5).vertex(outsets[0].x, outsets[0].y);
    __privateGet(this, _buffer5).noStroke();
    __privateGet(this, _buffer5).noFill();
    __privateGet(this, _buffer5).endShape();
    __privateGet(this, _buffer5).pop();
    return new Shape(outsets);
  };
  _getMargin = new WeakSet();
  getMargin_fn = function(dir) {
    if (dir.equals(Vector2.up())) {
      return this.marginU;
    } else if (dir.equals(Vector2.right())) {
      return this.marginLR;
    } else if (dir.equals(Vector2.down())) {
      return this.marginD;
    } else if (dir.equals(Vector2.left())) {
      return this.marginLR;
    } else {
      var margin = 0;
      if (dir.x > 0) {
        margin += dir.x * this.marginLR;
      } else {
        margin += Math.abs(dir.x) * this.marginLR;
      }
      if (dir.y > 0) {
        margin += dir.y * this.marginU;
      } else {
        margin += Math.abs(dir.y) * this.marginD;
      }
      return margin;
    }
  };
  _sleep = new WeakMap();
  _generateTiles = new WeakSet();
  generateTiles_fn = function(inset, outsets) {
    var boundingBox = inset.getBoundingBox();
    var tileWidth = 820 / 10;
    var tileHeight = 600 / 10;
    var yWithTile = -1;
    var insetPoints = inset.getVertices();
    var attemptPlaceTile = async (x, y, width2, height2) => {
      var points = [
        new Vector2(x, y),
        new Vector2(x + width2, y),
        new Vector2(x + width2, y + height2),
        new Vector2(x, y + height2)
      ];
      var hasEnoughSpace = __privateMethod(this, _canBePlaced, canBePlaced_fn).call(this, insetPoints, outsets, points);
      if (hasEnoughSpace) {
        var tile = __privateMethod(this, _getTile, getTile_fn).call(this, x, y, points);
        yWithTile = y;
        __privateGet(this, _tiles).push(tile);
        return true;
      } else {
        return false;
      }
    };
    var syncedFunc = async (x, y) => {
      attemptPlaceTile(x, y, tileWidth, tileHeight);
      await __privateGet(this, _sleep).call(this, 10);
      x += tileWidth;
      if (x + tileWidth >= boundingBox.x + boundingBox.w) {
        y += yWithTile < y ? 1 : tileHeight;
        x = boundingBox.x;
      }
      if (y + 20 <= boundingBox.y + boundingBox.h) {
        syncedFunc(x, y);
      }
    };
    syncedFunc(boundingBox.x, boundingBox.y);
  };
  _canBePlaced = new WeakSet();
  canBePlaced_fn = function(insetPoints, outsets, points) {
    var hasEnoughSpace = true;
    if (__privateMethod(this, _isInside, isInside_fn).call(this, insetPoints, points)) {
      for (let i = 0; i < outsets.length; i++) {
        const outset = outsets[i];
        const outsetPoints = outset.getVertices();
        if (__privateMethod(this, _isColliding, isColliding_fn).call(this, outsetPoints, points)) {
          hasEnoughSpace = false;
          break;
        }
      }
    } else {
      hasEnoughSpace = false;
    }
    return hasEnoughSpace;
  };
  _isColliding = new WeakSet();
  isColliding_fn = function(zonePoints, points) {
    if (Collision.polygonPolygon(zonePoints, points) || Collision.polygonPoint(zonePoints, points[0].x, points[0].y) || Collision.polygonPoint(zonePoints, points[1].x, points[1].y) || Collision.polygonPoint(zonePoints, points[2].x, points[2].y) || Collision.polygonPoint(zonePoints, points[3].x, points[3].y)) {
      return true;
    }
    return false;
  };
  _isInside = new WeakSet();
  isInside_fn = function(zonePoints, points) {
    if (Collision.polygonPoint(zonePoints, points[0].x, points[0].y) && Collision.polygonPoint(zonePoints, points[1].x, points[1].y) && Collision.polygonPoint(zonePoints, points[2].x, points[2].y) && Collision.polygonPoint(zonePoints, points[3].x, points[3].y)) {
      return true;
    }
    return false;
  };
  _getTile = new WeakSet();
  getTile_fn = function(x, y, vertices) {
    return new Tile(vertices, __privateGet(this, _buffer5));
  };
  const _HistoryTool$1 = class {
    static instance() {
      __privateSet(_HistoryTool$1, _actions, []);
      __privateSet(_HistoryTool$1, _index, -1);
    }
    static count() {
      return __privateGet(this, _actions).length;
    }
    static get(index) {
      if (index < 0 || index >= __privateGet(this, _actions).length) {
        return null;
      }
      return __privateGet(this, _actions)[index];
    }
    static getIndex() {
      return __privateGet(this, _index);
    }
    static getAll() {
      return __privateGet(this, _actions);
    }
    static add(action) {
      if (__privateGet(_HistoryTool$1, _index) != __privateGet(_HistoryTool$1, _actions).length - 1 && __privateGet(_HistoryTool$1, _index) >= -1) {
        __privateGet(_HistoryTool$1, _actions).splice(__privateGet(_HistoryTool$1, _index) + 1, __privateGet(_HistoryTool$1, _actions).length - __privateGet(_HistoryTool$1, _index));
      }
      __privateGet(_HistoryTool$1, _actions).push(action);
      __privateSet(_HistoryTool$1, _index, __privateGet(_HistoryTool$1, _actions).length - 1);
    }
    static undo() {
      if (__privateGet(_HistoryTool$1, _index) - 1 < -1) {
        console.warn("Nothing to undo");
        return;
      }
      __privateGet(_HistoryTool$1, _actions)[__privateGet(_HistoryTool$1, _index)].undo();
      __privateWrapper(_HistoryTool$1, _index)._--;
    }
    static redo() {
      if (__privateGet(_HistoryTool$1, _index) + 1 >= __privateGet(_HistoryTool$1, _actions).length) {
        console.warn("Nothing to redo");
        return;
      }
      __privateWrapper(_HistoryTool$1, _index)._++;
      __privateGet(_HistoryTool$1, _actions)[__privateGet(_HistoryTool$1, _index)].redo();
    }
  };
  let HistoryTool$1 = _HistoryTool$1;
  _actions = new WeakMap();
  _index = new WeakMap();
  __privateAdd(HistoryTool$1, _actions, []);
  __privateAdd(HistoryTool$1, _index, -1);
  class ContextMenu {
    constructor(id, options = []) {
      __publicField(this, "elem", null);
      __privateAdd(this, _options, []);
      __privateSet(this, _options, options);
      this.elem = document.createElement("DIV");
      this.elem.classList.add("sub-menu");
      this.elem.id = id;
      for (let i = 0; i < options.length; i++) {
        const option = options[i];
        this.elem.append(option.getHtml());
      }
      document.getElementById("menu").append(this.elem);
      this.hide();
    }
    show() {
      for (let i = 0; i < __privateGet(this, _options).length; i++) {
        const option = __privateGet(this, _options)[i];
        option.onLoad();
      }
      this.elem.style.display = "block";
    }
    hide() {
      this.elem.style.display = "none";
    }
    isShown() {
      return this.elem.style.display == "block";
    }
  }
  _options = new WeakMap();
  class ContextMenuOption {
    constructor(text, type = null, icon = null, group = null, loadEvent = null, clickEvent = null, changeEvent = null, dropdownOptions = []) {
      __privateAdd(this, _elem, null);
      __privateAdd(this, _loadEvent, () => {
      });
      if (loadEvent == null) {
        loadEvent = (e) => {
        };
      }
      if (clickEvent == null) {
        clickEvent = (e) => {
        };
      }
      if (changeEvent == null) {
        changeEvent = (e) => {
        };
      }
      __privateSet(this, _loadEvent, loadEvent);
      __privateSet(this, _elem, document.createElement("BUTTON"));
      __privateGet(this, _elem).classList.add("option");
      __privateGet(this, _elem).addEventListener("click", clickEvent);
      if (icon != null) {
        var iconElem = document.createElement("I");
        var classes = icon.split(" ");
        for (let i = 0; i < classes.length; i++) {
          const c = classes[i];
          iconElem.classList.add(c);
        }
        __privateGet(this, _elem).append(iconElem);
      } else if (type == "dropdown") {
        var dropdownElem = document.createElement("SELECT");
        dropdownElem.classList.add("form-control");
        for (let i = 0; i < dropdownOptions.length; i++) {
          const option = dropdownOptions[i];
          var optionElem = document.createElement("OPTION");
          optionElem.innerHTML = option;
          optionElem.value = option;
          if (i == 0) {
            optionElem.selected = true;
          }
          dropdownElem.appendChild(optionElem);
        }
        __privateGet(this, _elem).append(dropdownElem);
      } else if (type != null) {
        var typeElem = document.createElement("INPUT");
        typeElem.classList.add("pointer");
        typeElem.addEventListener("change", changeEvent);
        typeElem.type = type;
        if (group != null) {
          typeElem.name = group;
        }
        __privateGet(this, _elem).append(typeElem);
      }
      if (text != null) {
        var textElem = document.createElement("SPAN");
        textElem.classList.add("text");
        textElem.innerHTML = text;
        __privateGet(this, _elem).append(textElem);
      }
    }
    getHtml() {
      return __privateGet(this, _elem);
    }
    onLoad() {
      __privateGet(this, _loadEvent).call(this, __privateGet(this, _elem));
    }
  }
  _elem = new WeakMap();
  _loadEvent = new WeakMap();
  window.onload = () => {
    if (typeof createCanvas !== "function") {
      alert("Please install p5js! (https://p5js.org)");
      var scripts = document.getElementsByTagName("script");
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        script.type = "application/json";
      }
    }
  };
  exports2.Action = Action;
  exports2.Collision = Collision;
  exports2.Color = Color$1;
  exports2.ContextMenu = ContextMenu;
  exports2.ContextMenuOption = ContextMenuOption;
  exports2.Cursor = Cursor$1;
  exports2.DrawingTool = DrawingTool;
  exports2.EventSystem = EventSystem;
  exports2.GeneratorTool = GeneratorTool;
  exports2.Grid = Grid;
  exports2.HistoryTool = HistoryTool$1;
  exports2.Renderer = Renderer$1;
  exports2.SelectorTool = SelectorTool;
  exports2.Settings = Settings$1;
  exports2.Tile = Tile;
  exports2.Vector2 = Vector2;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
