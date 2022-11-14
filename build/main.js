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
  var _canvas, _activeTool, _events, _mousedown, _mousemoved, _lastPos, _diff, _event, event_fn, _checkBounds, checkBounds_fn, _buffer, _shapes, _vertices, _shapebuffer, _textBuffer, _pos, _color, _generate, _generateUniqSerial, _buffer2, _points, _selectedPointIndex, _dragOldPos, _originalShape, _onPlace, onPlace_fn, _onDrag, onDrag_fn, _generate2, generate_fn, _actions, _index;
  "use strict";
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
      var buffer = 0.2;
      if (dist1 + dist2 >= lineLength - buffer && dist1 + dist2 <= lineLength + buffer) {
        return true;
      }
      return false;
    }
    static lineCircle(x1, y1, x2, y2, cx, cy, cr) {
      var isInsideP1 = pointCircle(x1, y1, cx, cy, cr);
      var isInsideP2 = pointCircle(x2, y2, cx, cy, cr);
      if (isInsideP1 || isInsideP2) {
        return true;
      }
      var distX = x1 - x2;
      var distY = y1 - y2;
      var length = Math.sqrt(distX * distX + distY * distY);
      var dot = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(length, 2);
      var closestX = x1 + dot * (x2 - x1);
      var closestY = y1 + dot * (y2 - y1);
      var onSegment = linePoint(x1, y1, x2, y2, closestX, closestY);
      if (!onSegment) {
        return false;
      }
      distX = closestX - cx;
      distY = closestY - cy;
      var dist = Math.sqrt(distX * distX + distY * distY);
      if (dist <= r) {
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
      var left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      var right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
      var top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      var bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
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
        var collision = lineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, cr);
        if (collision) {
          return true;
        }
      }
      var centerInside = polygonPoint(vertices, cx, cy);
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
        var collision = lineRectangle(vc.x, vc.y, vn.x, vn.y, rx, ry, rw, rh);
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
        var hit = lineLine(x1, y1, x2, y2, x3, y3, x4, y4);
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
        var collision = polygonLine(v2, vc.x, vc.y, vn.x, vn.y);
        if (collision) {
          return true;
        }
        collision = polygonPoint(v1, v2[0].x, v2[0].y);
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
  class Color {
    constructor(string = null, r2 = 0, g = 0, b = 0, a = 1) {
      __publicField(this, "string", "");
      __publicField(this, "value", []);
      this.string = string;
      if (string == null) {
        this.value = [r2, g, b, a];
      }
    }
    rgba() {
      value = this.value;
      if (this.string != null) {
        var value = getComputedStyle(document.body).getPropertyValue(this.string);
        this.value = value.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
      }
      return { r: parseFloat(value[0]), g: parseFloat(value[1]), b: parseFloat(value[2]), a: parseFloat(value[3]) };
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
  __publicField(Settings$1, "mapSizeX", 2500);
  __publicField(Settings$1, "mapSizeY", 2500 / 16 * 9);
  __publicField(Settings$1, "bufferMargin", 50);
  __publicField(Settings$1, "gridSizeS", 10);
  __publicField(Settings$1, "gridSizeL", 100);
  __publicField(Settings$1, "zoom", 1);
  __publicField(Settings$1, "bufferMargin", 50);
  __publicField(Settings$1, "cursorSize", 15);
  __publicField(Settings$1, "gridBackground", new Color("--grid-background"));
  __publicField(Settings$1, "gridLines", new Color("--grid-lines"));
  __publicField(Settings$1, "shapeAllowed", new Color("--shape-allowed"));
  __publicField(Settings$1, "shapeForbidden", new Color("--shape-forbidden"));
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
  const _Cursor$1 = class {
    constructor() {
      __privateAdd(this, _event);
      __privateAdd(this, _checkBounds);
      __publicField(this, "events", null);
      __publicField(this, "position", null);
      __publicField(this, "offset", null);
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
      this.offset = new Vector2(-Settings.mapSizeX / 8, -Settings.mapSizeY / 8);
      __privateSet(this, _lastPos, Vector2.zero());
      __privateSet(this, _diff, Vector2.zero());
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
  };
  let Cursor$1 = _Cursor$1;
  _mousedown = new WeakMap();
  _mousemoved = new WeakMap();
  _lastPos = new WeakMap();
  _diff = new WeakMap();
  _event = new WeakSet();
  event_fn = function(e, type) {
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
  const _Renderer$1 = class {
    constructor() {
      __privateAdd(this, _shapes, null);
      _Renderer$1.instance = this;
      __privateSet(this, _shapes, []);
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
    getAll() {
      return __privateGet(this, _shapes);
    }
  };
  let Renderer$1 = _Renderer$1;
  _shapes = new WeakMap();
  __publicField(Renderer$1, "instance", null);
  class Shape {
    constructor(vertices = [], color = new Color(null, 255, 255, 255)) {
      __privateAdd(this, _vertices, null);
      __privateAdd(this, _shapebuffer, null);
      __privateAdd(this, _textBuffer, null);
      __privateAdd(this, _pos, null);
      __privateAdd(this, _color, null);
      __privateAdd(this, _generate, () => {
        const xArr = __privateGet(this, _vertices).map((a) => a.x);
        const yArr = __privateGet(this, _vertices).map((a) => a.y);
        const width2 = Math.max(...xArr) - Math.min(...xArr) + Settings.bufferMargin;
        const height2 = Math.max(...yArr) - Math.min(...yArr) + Settings.bufferMargin;
        __privateSet(this, _pos, new Vector2(Math.min(...xArr) - Settings.bufferMargin / 2, Math.min(...yArr) - Settings.bufferMargin / 2));
        if (__privateGet(this, _shapebuffer) == null || __privateGet(this, _textBuffer) == null) {
          __privateSet(this, _shapebuffer, createGraphics(width2, height2));
          __privateGet(this, _shapebuffer).canvas.id = "ShapesBufferGraphics_" + __privateGet(this, _generateUniqSerial).call(this);
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
        var rgb = Settings.gridBackground.rgb();
        __privateGet(this, _shapebuffer).fill(rgb.r, rgb.g, rgb.b);
        __privateGet(this, _shapebuffer).endShape();
      });
      __privateAdd(this, _generateUniqSerial, () => {
        return "xxxx-xxxx-xxx-xxxx".replace(/[x]/g, (c) => {
          const r2 = Math.floor(Math.random() * 16);
          return r2.toString(16);
        });
      });
      __privateSet(this, _vertices, vertices);
      __privateSet(this, _color, color);
      __privateGet(this, _generate).call(this);
    }
    update() {
      image(__privateGet(this, _shapebuffer), __privateGet(this, _pos).x, __privateGet(this, _pos).y);
    }
    updateText() {
      image(__privateGet(this, _textBuffer), __privateGet(this, _pos).x, __privateGet(this, _pos).y);
    }
    getId() {
      return __privateGet(this, _shapebuffer).canvas.id.split("_")[1];
    }
  }
  _vertices = new WeakMap();
  _shapebuffer = new WeakMap();
  _textBuffer = new WeakMap();
  _pos = new WeakMap();
  _color = new WeakMap();
  _generate = new WeakMap();
  _generateUniqSerial = new WeakMap();
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
      __privateAdd(this, _buffer2, null);
      __privateAdd(this, _points, []);
      __privateAdd(this, _selectedPointIndex, null);
      __privateAdd(this, _dragOldPos, null);
      __privateAdd(this, _originalShape, null);
      __privateSet(this, _buffer2, createGraphics(Settings.mapSizeX, Settings.mapSizeY));
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
        if (this.isEnabled) {
          var cursor2 = Cursor.get();
          var pos = cursor2.global().remove(cursor2.offset);
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
            History.add(action);
          }
          __privateSet(this, _selectedPointIndex, null);
          Cursor.disableOffset = false;
        }
      });
    }
    update() {
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
      History.add(action);
      action.redo();
    }
    disable() {
      var action = new Action(
        "Disable Drawing tool",
        () => {
          this.isEnabled = true;
          __privateSet(this, _originalShape, null);
          __privateSet(this, _dragOldPos, null);
        },
        () => {
          this.isEnabled = false;
          __privateSet(this, _originalShape, null);
          __privateSet(this, _dragOldPos, null);
        }
      );
      History.add(action);
      action.redo();
    }
    setData(points) {
      __privateSet(this, _points, points);
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
    var pos = cursor.global().remove(cursor.offset);
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
          __privateGet(this, _points)[i];
          var original = JSON.parse(JSON.stringify(__privateGet(this, _points)));
          var tmp = JSON.parse(JSON.stringify(__privateGet(this, _points)));
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
          History.add(action);
          action.redo();
          break;
        } else {
          hasFound = true;
          var shape = new Shape(__privateGet(this, _points), new Color("--shape-allowed"));
          var points = JSON.parse(JSON.stringify(__privateGet(this, _points)));
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
          History.add(action);
          action.redo();
          return;
        }
      }
    }
    if (!hasFound) {
      var realPos = cursor.global().remove(cursor.offset);
      for (let i = 0; i < __privateGet(this, _points).length; i++) {
        const next = __privateGet(this, _points)[i + 1 < __privateGet(this, _points).length - 1 ? i + 1 : 0];
        const prev = __privateGet(this, _points)[i];
        if (Collision.linePoint(next.x, next.y, prev.x, prev.y, realPos.x, realPos.y)) {
          hasFound = true;
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
          History.add(action);
          action.redo();
          break;
        }
      }
      if (!hasFound) {
        if (__privateGet(this, _originalShape) == null) {
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
          History.add(action);
          action.redo();
        }
      }
    }
  };
  _onDrag = new WeakSet();
  onDrag_fn = function(e) {
    var cursor = Cursor.get();
    var pos = cursor.global().remove(cursor.offset);
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
    for (let i = 0; i < __privateGet(this, _points).length; i++) {
      const p1 = __privateGet(this, _points)[i];
      const p2 = __privateGet(this, _points)[i - 1 >= 0 ? i - 1 : __privateGet(this, _points).length - 1];
      if (__privateGet(this, _points).length > 1) {
        __privateGet(this, _buffer2).line(p1.x, p1.y, p2.x, p2.y);
      }
    }
    for (let i = 0; i < __privateGet(this, _points).length; i++) {
      const p1 = __privateGet(this, _points)[i];
      __privateGet(this, _points)[i - 1 >= 0 ? i - 1 : __privateGet(this, _points).length - 1];
      __privateGet(this, _buffer2).circle(p1.x, p1.y, 10);
    }
  };
  const _History$1 = class {
    static instance() {
      __privateSet(_History$1, _actions, []);
      __privateSet(_History$1, _index, -1);
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
      if (__privateGet(_History$1, _index) != __privateGet(_History$1, _actions).length - 1 && __privateGet(_History$1, _index) >= -1) {
        __privateGet(_History$1, _actions).splice(__privateGet(_History$1, _index) + 1, __privateGet(_History$1, _actions).length - __privateGet(_History$1, _index));
      }
      __privateGet(_History$1, _actions).push(action);
      __privateSet(_History$1, _index, __privateGet(_History$1, _actions).length - 1);
    }
    static undo() {
      if (__privateGet(_History$1, _index) - 1 < -1) {
        console.warn("Nothing to undo");
        return;
      }
      __privateGet(_History$1, _actions)[__privateGet(_History$1, _index)].undo();
      __privateWrapper(_History$1, _index)._--;
    }
    static redo() {
      if (__privateGet(_History$1, _index) + 1 >= __privateGet(_History$1, _actions).length) {
        console.warn("Nothing to redo");
        return;
      }
      __privateWrapper(_History$1, _index)._++;
      __privateGet(_History$1, _actions)[__privateGet(_History$1, _index)].redo();
    }
  };
  let History$1 = _History$1;
  _actions = new WeakMap();
  _index = new WeakMap();
  __privateAdd(History$1, _actions, []);
  __privateAdd(History$1, _index, -1);
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
  exports2.Color = Color;
  exports2.Cursor = Cursor$1;
  exports2.DrawingTool = DrawingTool;
  exports2.EventSystem = EventSystem;
  exports2.Grid = Grid;
  exports2.History = History$1;
  exports2.Renderer = Renderer$1;
  exports2.Settings = Settings$1;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
