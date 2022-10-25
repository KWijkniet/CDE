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
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.CDE = {}));
})(this, function(exports2) {
  var _canvas, _activeTool, _events, _mousedown, _mousemoved, _lastPos, _diff, _event, event_fn, _checkBounds, checkBounds_fn, _buffer, _shapes;
  "use strict";
  class Collision {
    pointPoint(x1, y1, x2, y2) {
      if (x1 == x2 && y1 == y2) {
        return true;
      }
      return false;
    }
    pointCircle(px, py, cx, cy, cr) {
      var distX = px - cx;
      var distY = py - cy;
      var dist = Math.sqrt(distX * distX + distY * distY);
      if (dist <= cr) {
        return true;
      }
      return false;
    }
    circleCircle(c1x, c1y, c1r, c2x, c2y, c2r) {
      var distX = c1x - c2x;
      var distY = c1y - c2y;
      var dist = Math.sqrt(distX * distX + distY * distY);
      if (dist <= c1r + c2r) {
        return true;
      }
      return false;
    }
    pointRectangle(px, py, rx, ry, rw, rh) {
      if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) {
        return true;
      }
      return false;
    }
    RectangleRectangle(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
      if (r1x + r1w >= r2x && r1x <= r2x + r2w && r1y + r1h >= r2y && r1y <= r2y + r2h) {
        return true;
      }
      return false;
    }
    circleRectangle(cx, cy, cr, rx, ry, rw, rh) {
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
    linePoint(x1, y1, x2, y2, px, py) {
      var dist1 = Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
      var dist2 = Math.sqrt(Math.pow(px - x2, 2) + Math.pow(py - y2, 2));
      var lineLength = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      var buffer = 0.1;
      if (dist1 + dist2 >= lineLength - buffer && dist1 + dist2 <= lineLength + buffer) {
        return true;
      }
      return false;
    }
    lineCircle(x1, y1, x2, y2, cx, cy, cr) {
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
    lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
      var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
      if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return true;
      }
      return false;
    }
    lineRectangle(x1, y1, x2, y2, rx, ry, rw, rh) {
      var left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
      var right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
      var top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
      var bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);
      if (left || right || top || bottom) {
        return true;
      }
      return false;
    }
    polygonPoint(vertices, px, py) {
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
    polygonCircle(vertices, cx, cy, cr) {
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
    polygonRectangle(vertices, rx, ry, rw, rh) {
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
    polygonLine(vertices, x1, y1, x2, y2) {
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
    polygonPolygon(v1, v2) {
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
    trianglePoint(x1, y1, x2, y2, x3, y3, px, py) {
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
    constructor(string) {
      __publicField(this, "string", "");
      this.string = string;
    }
    rgba() {
      var value = getComputedStyle(document.body).getPropertyValue(this.string);
      value = value.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
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
  const _Cursor = class {
    constructor() {
      __privateAdd(this, _event);
      __privateAdd(this, _checkBounds);
      __publicField(this, "events", null);
      __publicField(this, "position", null);
      __publicField(this, "zoom", 1);
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
      _Cursor.get = () => {
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
        if (Math.round((this.zoom + zoom) * 100) / 100 < 0.5) {
          return;
        }
        if (Math.round((this.zoom + zoom) * 100) / 100 > 1.5) {
          return;
        }
        const wx = (x - this.offset.x) / (width * this.zoom);
        const wy = (y - this.offset.y) / (height * this.zoom);
        this.offset.x -= wx * width * zoom;
        this.offset.y -= wy * height * zoom;
        this.zoom += zoom;
        __privateMethod(this, _checkBounds, checkBounds_fn).call(this);
      });
    }
    update() {
      var pos = this.local();
      circle(pos.x, pos.y, 10);
    }
  };
  let Cursor = _Cursor;
  _mousedown = new WeakMap();
  _mousemoved = new WeakMap();
  _lastPos = new WeakMap();
  _diff = new WeakMap();
  _event = new WeakSet();
  event_fn = function(e, type) {
    var newPos = this.local();
    if (type == "mousemove") {
      if (!__privateGet(this, _mousemoved)) {
        __privateSet(this, _lastPos, Vector2.copy(newPos));
        __privateSet(this, _mousemoved, true);
      }
      if (__privateGet(this, _mousedown) && __privateGet(this, _mousemoved)) {
        __privateSet(this, _diff, Vector2.remove(newPos, __privateGet(this, _lastPos)));
        this.offset.add(__privateGet(this, _diff));
        __privateMethod(this, _checkBounds, checkBounds_fn).call(this);
        __privateSet(this, _lastPos, Vector2.copy(newPos));
      }
    } else if (type == "mousedown") {
      __privateSet(this, _mousemoved, false);
      __privateSet(this, _mousedown, true);
    } else if (type == "mouseup") {
      __privateSet(this, _mousemoved, false);
      __privateSet(this, _mousedown, false);
    }
  };
  _checkBounds = new WeakSet();
  checkBounds_fn = function() {
    this.offset.minMax(new Vector2(-Settings.mapSizeX, -Settings.mapSizeY), new Vector2(Settings.mapSizeX, Settings.mapSizeY));
  };
  __publicField(Cursor, "get", () => {
    return null;
  });
  __publicField(Cursor, "toGrid", (pos) => {
    return new Vector2(Math.round(pos.x / Settings.gridSize) * Settings.gridSize, Math.round(pos.y / Settings.gridSize) * Settings.gridSize);
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
          __privateGet(this, _buffer).line(i, 0, i, Settings.mapSizeY);
        }
      }
      for (let i = 0; i < Settings.mapSizeY; i++) {
        __privateGet(this, _buffer).strokeWeight(i % Settings.gridSizeL == 0 ? 1 : 0.25);
        if (i % Settings.gridSizeS == 0 || i % Settings.gridSizeL == 0) {
          __privateGet(this, _buffer).line(0, i, Settings.mapSizeX, i);
        }
      }
    }
    update() {
      image(__privateGet(this, _buffer), 0, 0);
    }
  }
  _buffer = new WeakMap();
  class Renderer {
    constructor() {
      __privateAdd(this, _shapes, null);
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
        if (shape == target) {
          __privateGet(this, _shapes).splice(i, 1);
          return;
        }
      }
    }
    getAll() {
      return __privateGet(this, _shapes);
    }
  }
  _shapes = new WeakMap();
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
  exports2.Collision = Collision;
  exports2.Color = Color;
  exports2.Cursor = Cursor;
  exports2.EventSystem = EventSystem;
  exports2.Grid = Grid;
  exports2.Renderer = Renderer;
  exports2.Settings = Settings$1;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
