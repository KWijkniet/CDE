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
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.CDE = {}));
})(this, function(exports2) {
  var _canvas, _events, _buffer, _backgroundColor, _linesColor;
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
  const _Settings$1 = class {
  };
  let Settings$1 = _Settings$1;
  _canvas = new WeakMap();
  __publicField(Settings$1, "mapSize", 2e3);
  __publicField(Settings$1, "bufferMargin", 50);
  __publicField(Settings$1, "gridSizeS", 10);
  __publicField(Settings$1, "gridSizeL", 100);
  __privateAdd(Settings$1, _canvas, null);
  __publicField(Settings$1, "setCanvas", (c) => {
    __privateSet(_Settings$1, _canvas, c);
  });
  __publicField(Settings$1, "getCanvas", () => {
    return __privateGet(_Settings$1, _canvas);
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
      __publicField(this, "add", (v) => {
        new _Vector2(this.x + v.x, this.y + v.y);
      });
      __publicField(this, "remove", (v) => {
        new _Vector2(this.x - v.x, this.y - v.y);
      });
      __publicField(this, "multiply", (v) => {
        new _Vector2(this.x * v.x, this.y * v.y);
      });
      __publicField(this, "devide", (v) => {
        new _Vector2(this.x / v.x, this.y / v.y);
      });
      this.x = x;
      this.y = y;
    }
  };
  let Vector2 = _Vector2;
  __publicField(Vector2, "zero", () => {
    new _Vector2(0, 0);
  });
  __publicField(Vector2, "one", () => {
    new _Vector2(1, 1);
  });
  __publicField(Vector2, "from", (v) => {
    new _Vector2(v.x, v.y);
  });
  __publicField(Vector2, "angle", (v1, v2) => {
    return Math.atan((v1.x - v2.x) / (v1.y - v2.y));
  });
  __publicField(Vector2, "distance", (v1, v2) => {
    return new _Vector2(v1.x - v2.x, v1.y - v2.y).magnitude();
  });
  __publicField(Vector2, "min", (v1, v2) => {
    return v1.magnitude() < v2.magnitude() ? _Vector2.from(v1) : _Vector2.from(v2);
  });
  __publicField(Vector2, "max", (v1, v2) => {
    return v1.magnitude() > v2.magnitude() ? _Vector2.from(v1) : _Vector2.from(v2);
  });
  class Cursor {
    constructor() {
      __publicField(this, "events", null);
      __publicField(this, "position", null);
      __publicField(this, "zoom", 1);
      __publicField(this, "offset", null);
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
      this.events = new EventSystem(["click", "dragStart", "dragMove", "dragEnd", "scroll"]);
      this.position = new Vector2(0, 0);
      document.addEventListener("mousemove", (e) => {
        this.position = new Vector2(e.clientX, e.clientY);
      });
    }
    update() {
      var pos = this.local();
      circle(pos.x, pos.y, 10);
    }
  }
  __publicField(Cursor, "toGrid", (pos) => {
    return new Vector2(Math.round(pos.x / Settings.gridSize) * Settings.gridSize, Math.round(pos.y / Settings.gridSize) * Settings.gridSize);
  });
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
  class Grid {
    constructor(backgroundColorString, linesColorString) {
      __privateAdd(this, _buffer, null);
      __privateAdd(this, _backgroundColor, null);
      __privateAdd(this, _linesColor, null);
      __privateSet(this, _linesColor, new Color(linesColorString));
      __privateSet(this, _backgroundColor, new Color(backgroundColorString));
      __privateSet(this, _buffer, createGraphics(Settings.mapSize, Settings.mapSize));
      __privateGet(this, _buffer).canvas.id = "grid-buffer";
      var rgb = __privateGet(this, _backgroundColor).rgb();
      __privateGet(this, _buffer).background(rgb.r, rgb.g, rgb.b);
      var rgba = __privateGet(this, _linesColor).rgba();
      __privateGet(this, _buffer).stroke(rgba.r, rgba.g, rgba.b, rgba.a);
      var amountL = Math.ceil(Settings.mapSize / Settings.gridSizeL);
      for (let ly = 0; ly < amountL; ly++) {
        for (let lx = 0; lx < amountL; lx++) {
          var posL = new Vector2(lx * Settings.gridSizeL, ly * Settings.gridSizeL);
          __privateGet(this, _buffer).stroke(rgba.r, rgba.g, rgba.b, rgba.a);
          __privateGet(this, _buffer).strokeWeight(1);
          __privateGet(this, _buffer).line(posL.x, posL.y, posL.x + Settings.gridSizeL, posL.y, 5);
          __privateGet(this, _buffer).line(posL.x, posL.y, posL.x, posL.y + Settings.gridSizeL, 5);
          var amountS = Math.ceil(Settings.gridSizeL / Settings.gridSizeS);
          for (let sy = 0; sy < amountS; sy++) {
            for (let sx = 0; sx < amountS; sx++) {
              var posS = new Vector2(posL.x + sx * Settings.gridSizeS, posL.y + sy * Settings.gridSizeS);
              __privateGet(this, _buffer).stroke(rgba.r, rgba.g, rgba.b, rgba.a);
              __privateGet(this, _buffer).strokeWeight(0.25);
              __privateGet(this, _buffer).line(posS.x, posS.y, posS.x + Settings.gridSizeS, posS.y, 5);
              __privateGet(this, _buffer).line(posS.x, posS.y, posS.x, posS.y + Settings.gridSizeS, 5);
            }
          }
        }
      }
    }
    update() {
      image(__privateGet(this, _buffer), 0, 0);
    }
  }
  _buffer = new WeakMap();
  _backgroundColor = new WeakMap();
  _linesColor = new WeakMap();
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
  exports2.Settings = Settings$1;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
