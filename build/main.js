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
var _buffer, _generate, generate_fn, _mousedown, _mousemoved, _lastPos, _offset, _zoom, _event, event_fn, _click, click_fn, _drag, drag_fn, _scrollEvent, scrollEvent_fn, _state, _type, _colors, _margin, _renderer, _cursor, _ruler, _button, _buttonAllowed, _buttonForbidden, _menu, _callCancel, _state2, _type2, _shape, _originalShowData, _verticeIndex, _colors2, _margin2, _renderer2, _cursor2, _callStart, _callEnd, _callCancel2, _dropdown, _dropdownMenu, _editButton, _addButton, _removeButton, _pos, _oldPos, _buffer2, _textBuffer, _cursor3, _margin3, _generateUniqSerial, generateUniqSerial_fn, _shapes, _length;
class Settings$1 {
}
__publicField(Settings$1, "bonusSize", 1e3);
__publicField(Settings$1, "margin", 50);
__publicField(Settings$1, "gridSize", 10);
class Vector2$1 {
  constructor(_x, _y) {
    __publicField(this, "x");
    __publicField(this, "y");
    this.x = _x;
    this.y = _y;
  }
  distance(_target) {
    return Math.sqrt(Math.pow(_target.x - this.x, 2) + Math.pow(_target.y - this.y, 2));
  }
  add(_target) {
    this.x += _target.x;
    this.y += _target.y;
    return this;
  }
  addNew(_target) {
    return new Vector2$1(this.x + _target.x, this.y + _target.y);
  }
  remove(_target) {
    this.x -= _target.x;
    this.y -= _target.y;
    return this;
  }
  removeNew(_target) {
    return new Vector2$1(this.x - _target.x, this.y - _target.y);
  }
  devide(_target) {
    this.x /= _target.x;
    this.y /= _target.y;
    return this;
  }
  multiply(_target) {
    this.x *= _target.x;
    this.y *= _target.y;
    return this;
  }
  equals(_target) {
    return this.x == _target.x && this.y == _target.y;
  }
  minMax(_min, _max) {
    if (this.x < _min.x) {
      this.x = _min.x;
    } else if (this.x > _max.x) {
      this.x = _max.x;
    }
    if (this.y < _min.y) {
      this.y = _min.y;
    } else if (this.y > _max.y) {
      this.y = _max.y;
    }
  }
  normalized() {
    var distance = Math.Sqrt(A.x * A.x + A.y * A.y);
    return new Vector2$1(A.x / distance, A.y / distance);
  }
  toString() {
    return "Vector2(" + this.x + ", " + this.y + ")";
  }
  static zero() {
    return new Vector2$1(0, 0);
  }
}
class Color$1 {
  constructor(r, g, b) {
    __publicField(this, "r", 255);
    __publicField(this, "g", 255);
    __publicField(this, "b", 255);
    this.r = r;
    this.g = g;
    this.b = b;
  }
  fromString(name) {
    name = name.toLowerCase();
    if (name == "white") {
      this.r = 255;
      this.g = 255;
      this.b = 255;
    } else if (name == "black") {
      this.r = 0;
      this.g = 0;
      this.b = 0;
    } else if (name == "red") {
      this.r = 255;
      this.g = 0;
      this.b = 0;
    } else if (name == "green") {
      this.r = 0;
      this.g = 255;
      this.b = 0;
    } else if (name == "blue") {
      this.r = 0;
      this.g = 0;
      this.b = 255;
    }
  }
  fromRGB(_r, _g, _b) {
    this.r = _r;
    this.g = _g;
    this.b = _b;
  }
  toString() {
    return this.r + ", " + this.g + ", " + this.b;
  }
}
class Ruler$1 {
  constructor() {
    __publicField(this, "p1", null);
    __publicField(this, "p2", null);
    __publicField(this, "offset", null);
    __publicField(this, "elem", null);
    var body = document.getElementsByTagName("body")[0];
    this.elem = document.createElement("p");
    this.elem.style.position = "absolute";
    this.elem.style.transform = "translate(-50%, 0)";
    this.elem.style.width = 75;
    this.elem.style.color = "black";
    this.elem.style.textAlign = "center";
    this.elem.style.visibility = "visible";
    this.elem.style.pointerEvents = "none";
    body.appendChild(this.elem);
  }
  update(p1, p2, offset) {
    this.p1 = p1;
    this.p2 = p2;
    this.offset = offset;
    if (!this.p1 || !this.p2) {
      return;
    }
  }
  draw() {
    if (!this.p1 || !this.p2) {
      this.elem.innerHTML = "";
      return;
    }
    this.elem.style.left = this.offset.x;
    this.elem.style.top = this.offset.y;
    this.elem.innerHTML = Math.ceil(this.p1.distance(this.p2) * 10) + "mm";
    fill(0, 0, 0);
    line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
  }
  destroy() {
    this.elem.parentNode.removeChild(this.elem);
  }
}
class Grid {
  constructor(size, maxWidth, maxHeight) {
    __privateAdd(this, _generate);
    __privateAdd(this, _buffer, null);
    Cursor.instance.addOnScroll(() => {
      __privateMethod(this, _generate, generate_fn).call(this, size, maxWidth, maxHeight);
    });
    __privateMethod(this, _generate, generate_fn).call(this, size, maxWidth, maxHeight);
  }
  draw() {
    var offset = Cursor.instance.getOffset();
    image(__privateGet(this, _buffer), offset.x - Settings.bonusSize, offset.y - Settings.bonusSize);
  }
}
_buffer = new WeakMap();
_generate = new WeakSet();
generate_fn = function(size, maxWidth, maxHeight) {
  __privateSet(this, _buffer, createGraphics(maxWidth + Settings.bonusSize * 2, maxHeight + Settings.bonusSize * 2));
  __privateGet(this, _buffer).canvas.id = "GridBufferGraphics";
  __privateGet(this, _buffer).background(255, 255, 255);
  var color = new Color(200, 200, 200);
  var xAmount = Math.ceil((maxWidth + Settings.bonusSize * 2) / size);
  var yAmount = Math.ceil((maxHeight + Settings.bonusSize * 2) / size);
  for (let y = 0; y < yAmount; y++) {
    for (let x = 0; x < xAmount; x++) {
      var coord = new Vector2(x * size, y * size);
      __privateGet(this, _buffer).stroke(color.r, color.g, color.b);
      __privateGet(this, _buffer).fill(color.r, color.g, color.b);
      if (x % 5 == 0 && y % 5 == 0) {
        __privateGet(this, _buffer).strokeWeight(1);
        __privateGet(this, _buffer).line(coord.x, coord.y, coord.x + size * 5, coord.y, 5);
        __privateGet(this, _buffer).line(coord.x, coord.y, coord.x, coord.y + size * 5, 5);
      } else {
        __privateGet(this, _buffer).strokeWeight(0.25);
        __privateGet(this, _buffer).line(coord.x, coord.y, coord.x + size * 1, coord.y, 1);
        __privateGet(this, _buffer).line(coord.x, coord.y, coord.x, coord.y + size * 1, 1);
      }
    }
  }
};
const _Cursor$1 = class {
  constructor() {
    __privateAdd(this, _event);
    __privateAdd(this, _click);
    __privateAdd(this, _drag);
    __privateAdd(this, _scrollEvent);
    __publicField(this, "position", null);
    __publicField(this, "onClick", null);
    __publicField(this, "onDragStart", null);
    __publicField(this, "onDragUpdate", null);
    __publicField(this, "onDragEnd", null);
    __publicField(this, "onScroll", null);
    __publicField(this, "diff", null);
    __privateAdd(this, _mousedown, false);
    __privateAdd(this, _mousemoved, false);
    __privateAdd(this, _lastPos, null);
    __privateAdd(this, _offset, null);
    __privateAdd(this, _zoom, 1);
    this.position = new Vector2(0, 0);
    this.onClick = document.createEvent("Event");
    this.onClick.initEvent("cClick", true, true);
    this.onDragStart = document.createEvent("Event");
    this.onDragStart.initEvent("cDragStart", true, true);
    this.onDragUpdate = document.createEvent("Event");
    this.onDragUpdate.initEvent("cDragUpdate", true, true);
    this.onDragEnd = document.createEvent("Event");
    this.onDragEnd.initEvent("cDragEnd", true, true);
    this.onScroll = document.createEvent("Event");
    this.onScroll.initEvent("cOnScroll", true, true);
    __privateSet(this, _offset, new Vector2(0, 0));
    __privateSet(this, _lastPos, new Vector2(0, 0));
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
    document.addEventListener("mousewheel", (event) => {
      __privateMethod(this, _scrollEvent, scrollEvent_fn).call(this, event);
    });
    _Cursor$1.instance = this;
  }
  fromGrid() {
    var x = Math.round(this.position.x / Settings.gridSize) * Settings.gridSize;
    var y = Math.round(this.position.y / Settings.gridSize) * Settings.gridSize;
    return new Vector2(x, y);
  }
  getOffset() {
    return __privateGet(this, _offset);
  }
  getZoom() {
    return __privateGet(this, _zoom);
  }
  resetOffset() {
    __privateSet(this, _offset, Vector2.zero());
  }
  addOnClick(func) {
    document.addEventListener("cClick", func, false);
  }
  addOnDragStart(func) {
    document.addEventListener("cDragStart", func, false);
  }
  addOnDragUpdate(func) {
    document.addEventListener("cDragUpdate", func, false);
  }
  addOnDragEnd(func) {
    document.addEventListener("cDragEnd", func, false);
  }
  addOnScroll(func) {
    document.addEventListener("cOnScroll", func, false);
  }
};
let Cursor$1 = _Cursor$1;
_mousedown = new WeakMap();
_mousemoved = new WeakMap();
_lastPos = new WeakMap();
_offset = new WeakMap();
_zoom = new WeakMap();
_event = new WeakSet();
event_fn = function(e, type) {
  if (type == "mousemove") {
    this.position.x = e.clientX;
    this.position.y = e.clientY;
    if (__privateGet(this, _mousedown)) {
      this.diff = null;
      if (!__privateGet(this, _mousemoved)) {
        __privateMethod(this, _drag, drag_fn).call(this, e, "start");
      } else {
        __privateMethod(this, _drag, drag_fn).call(this, e, "update");
      }
      __privateSet(this, _mousemoved, true);
    } else {
      if (__privateGet(this, _mousemoved)) {
        __privateMethod(this, _drag, drag_fn).call(this, e, "end");
      }
      __privateSet(this, _mousemoved, false);
    }
  } else if (type == "mousedown") {
    __privateSet(this, _mousedown, true);
  } else if (type == "mouseup") {
    __privateSet(this, _mousedown, false);
    if (!__privateGet(this, _mousemoved)) {
      __privateMethod(this, _click, click_fn).call(this, e);
    } else if (this.diff == null && window.activeTool != null && window.activeTool.constructor.name == "DrawingTool") {
      __privateMethod(this, _click, click_fn).call(this, e);
    }
  }
};
_click = new WeakSet();
click_fn = function(e) {
  if (e.target.tagName == "CANVAS") {
    document.dispatchEvent(this.onClick);
  }
};
_drag = new WeakSet();
drag_fn = function(e, type) {
  var newPos = null;
  if (type == "start") {
    newPos = this.fromGrid();
    __privateSet(this, _lastPos, new Vector2(newPos.x, newPos.y));
    document.dispatchEvent(this.onDragStart);
  } else if (type == "update") {
    newPos = this.fromGrid();
    this.diff = new Vector2(newPos.x - __privateGet(this, _lastPos).x, newPos.y - __privateGet(this, _lastPos).y);
    document.dispatchEvent(this.onDragUpdate);
  } else if (type == "end") {
    document.dispatchEvent(this.onDragEnd);
  }
  if (e.target.tagName == "CANVAS") {
    if (e.shiftKey && this.diff != null && newPos != null) {
      __privateGet(this, _offset).add(this.diff).minMax(new Vector2(-Settings.bonusSize, -Settings.bonusSize), new Vector2(Settings.bonusSize, Settings.bonusSize));
      __privateSet(this, _lastPos, new Vector2(newPos.x, newPos.y));
    } else {
      this.diff = null;
    }
  }
};
_scrollEvent = new WeakSet();
scrollEvent_fn = function(e) {
  __privateSet(this, _zoom, __privateGet(this, _zoom) - e.deltaY / 1e3);
  if (__privateGet(this, _zoom) < 0.5) {
    __privateSet(this, _zoom, 0.5);
  } else if (__privateGet(this, _zoom) > 5) {
    __privateSet(this, _zoom, 5);
  }
};
__publicField(Cursor$1, "instance", null);
class Input {
  constructor(_id, _position, _symbol) {
    __publicField(this, "id");
    __publicField(this, "position");
    __publicField(this, "symbol");
    __publicField(this, "inputElem");
    __publicField(this, "pElem");
    this.id = _id;
    this.position = _position;
    this.symbol = _symbol;
    var body = document.getElementsByTagName("body")[0];
    this.inputElem = document.createElement("input");
    this.pElem = document.createElement("p");
    this.inputElem.id = this.id;
    this.pElem.id = this.id + "_p";
    this.inputElem.type = "number";
    body.appendChild(this.inputElem);
    body.appendChild(this.pElem);
    this.inputElem.classList.add("input-hidden");
    this.inputElem.style.position = "absolute";
    this.inputElem.style.left = this.position.x;
    this.inputElem.style.top = this.position.y;
    this.inputElem.style.transform = "translate(-50%, 0)";
    this.inputElem.style.width = 75;
    this.inputElem.style.color = "black";
    this.inputElem.style.textAlign = "center";
    this.inputElem.style.visibility = "hidden";
    this.pElem.style.position = "absolute";
    this.pElem.style.left = this.position.x;
    this.pElem.style.top = this.position.y;
    this.pElem.style.transform = "translate(-50%, 0)";
    this.pElem.style.width = 75;
    this.pElem.style.color = "black";
    this.pElem.style.textAlign = "center";
    this.pElem.style.visibility = "visible";
    this.pElem.classList.add("symbol");
    this.inputElem.addEventListener("change", (event) => {
    }, false);
    this.pElem.addEventListener("click", (event) => {
      this.pElem.style.visibility = "hidden";
      this.inputElem.style.visibility = "visible";
      this.inputElem.focus();
    });
    this.inputElem.addEventListener("blur", (event) => {
      this.pElem.style.visibility = "visible";
      this.inputElem.style.visibility = "hidden";
    }, false);
  }
  set(_value) {
    _value = (parseFloat(_value) * 10).toFixed(0);
    if (this.inputElem.value == _value) {
      return;
    }
    this.inputElem.value = _value;
    this.pElem.innerHTML = this.inputElem.value + " " + this.symbol;
  }
  destroy() {
    this.inputElem.parentNode.removeChild(this.inputElem);
    this.pElem.parentNode.removeChild(this.pElem);
  }
  toString() {
    return this.id;
  }
  update() {
    this.inputElem.style.left = this.position.x;
    this.inputElem.style.top = this.position.y;
    this.pElem.style.left = this.position.x;
    this.pElem.style.top = this.position.y;
  }
}
class DrawingTool {
  constructor(renderer, cursor, margin2, colors) {
    __publicField(this, "vertices", []);
    __privateAdd(this, _state, "Ready");
    __privateAdd(this, _type, 0);
    __privateAdd(this, _colors, []);
    __privateAdd(this, _margin, 0);
    __privateAdd(this, _renderer, null);
    __privateAdd(this, _cursor, null);
    __privateAdd(this, _ruler, null);
    __privateAdd(this, _button, null);
    __privateAdd(this, _buttonAllowed, null);
    __privateAdd(this, _buttonForbidden, null);
    __privateAdd(this, _menu, null);
    __privateAdd(this, _callCancel, null);
    __privateSet(this, _renderer, renderer);
    __privateSet(this, _cursor, cursor);
    __privateSet(this, _margin, margin2);
    __privateSet(this, _colors, colors);
    this.vertices = [];
    __privateSet(this, _ruler, new Ruler());
    __privateSet(this, _button, document.getElementById("drawingTool"));
    __privateSet(this, _menu, document.getElementById("drawingTool-dropdown"));
    __privateSet(this, _buttonAllowed, document.getElementById("drawingToolAllowed"));
    __privateSet(this, _buttonForbidden, document.getElementById("drawingToolForbidden"));
    __privateGet(this, _buttonAllowed).addEventListener("click", () => {
      this.start(0);
    });
    __privateGet(this, _buttonForbidden).addEventListener("click", () => {
      this.start(1);
    });
    __privateSet(this, _callCancel, () => {
      this.cancel();
    });
    __privateGet(this, _cursor).addOnClick(() => {
      if (__privateGet(this, _state) == "Drawing") {
        var res = this.newVertice();
        if (res != null) {
          __privateGet(this, _renderer).add(res);
        }
      }
    });
    document.addEventListener("keyup", (event) => {
      if (__privateGet(this, _state) == "Drawing" && event.key == "Escape") {
        if (this.vertices.length <= 0) {
          this.cancel();
        } else {
          this.end();
        }
      }
    });
  }
  start(type) {
    if (window.activeTool != null) {
      window.activeTool.cancel();
    }
    __privateSet(this, _state, "Drawing");
    __privateSet(this, _type, type);
    __privateGet(this, _ruler).update(null, null);
    __privateGet(this, _button).addEventListener("click", __privateGet(this, _callCancel));
    __privateGet(this, _button).classList.add("active");
    __privateGet(this, _menu).classList.remove("show");
    window.activeTool = this;
  }
  update() {
    if (__privateGet(this, _state) == "Drawing") {
      var offset = __privateGet(this, _cursor).getOffset();
      __privateGet(this, _ruler).draw();
      var next = 0;
      var hasNext = true;
      for (let i = 0; i < this.vertices.length; i++) {
        next = i + 1;
        if (next >= this.vertices.length) {
          next = 0;
          hasNext = false;
        }
        const cc = this.vertices[i];
        const nc = this.vertices[next];
        noStroke();
        fill(100, 100, 100);
        circle(cc.x + offset.x, cc.y + offset.y, 20);
        stroke(0);
        if (hasNext) {
          stroke(100, 100, 100);
          line(cc.x + offset.x, cc.y + offset.y, nc.x + offset.x, nc.y + offset.y);
          stroke(0, 0, 0);
        }
      }
      if (this.vertices.length > 0) {
        __privateGet(this, _ruler).update(this.vertices[this.vertices.length - 1].addNew(offset), __privateGet(this, _cursor).fromGrid(), __privateGet(this, _cursor).fromGrid().addNew(new Vector2(0, 20)));
      }
      var pos = __privateGet(this, _cursor).fromGrid();
      noStroke();
      fill(179, 0, 0);
      circle(pos.x, pos.y, 10);
      stroke(0);
    }
  }
  newVertice() {
    var offset = __privateGet(this, _cursor).getOffset();
    var pos = new Vector2(__privateGet(this, _cursor).fromGrid().x - offset.x, __privateGet(this, _cursor).fromGrid().y - offset.y);
    if (this.vertices.length > 0 && pos.equals(this.vertices[0])) {
      return this.end();
    }
    this.vertices.push(pos);
    return null;
  }
  end() {
    var shape = null;
    if (this.vertices.length > 0) {
      for (let i = 0; i < this.vertices.length; i++) {
        const coord = this.vertices[i];
        coord.x -= __privateGet(this, _margin) / 2;
        coord.y -= __privateGet(this, _margin) / 2;
      }
      shape = new Shape(__privateGet(this, _cursor), this.vertices, __privateGet(this, _colors)[__privateGet(this, _type)], __privateGet(this, _type) == 0 ? true : false, __privateGet(this, _type) == 0 ? true : false);
    }
    this.cancel();
    this.start(__privateGet(this, _type));
    return shape;
  }
  cancel() {
    __privateGet(this, _button).removeEventListener("click", __privateGet(this, _callCancel));
    __privateGet(this, _button).classList.remove("active");
    __privateGet(this, _menu).classList.remove("show");
    window.activeTool = null;
    __privateSet(this, _state, "Ready");
    this.vertices = [];
    __privateGet(this, _ruler).update(null, null);
    __privateGet(this, _ruler).draw();
  }
}
_state = new WeakMap();
_type = new WeakMap();
_colors = new WeakMap();
_margin = new WeakMap();
_renderer = new WeakMap();
_cursor = new WeakMap();
_ruler = new WeakMap();
_button = new WeakMap();
_buttonAllowed = new WeakMap();
_buttonForbidden = new WeakMap();
_menu = new WeakMap();
_callCancel = new WeakMap();
class EditingTool {
  constructor(renderer, cursor, margin2) {
    __publicField(this, "vertices", []);
    __privateAdd(this, _state2, "Ready");
    __privateAdd(this, _type2, 0);
    __privateAdd(this, _shape, null);
    __privateAdd(this, _originalShowData, false);
    __privateAdd(this, _verticeIndex, -1);
    __privateAdd(this, _colors2, []);
    __privateAdd(this, _margin2, 0);
    __privateAdd(this, _renderer2, null);
    __privateAdd(this, _cursor2, null);
    __privateAdd(this, _callStart, null);
    __privateAdd(this, _callEnd, null);
    __privateAdd(this, _callCancel2, null);
    __privateAdd(this, _dropdown, null);
    __privateAdd(this, _dropdownMenu, null);
    __privateAdd(this, _editButton, null);
    __privateAdd(this, _addButton, null);
    __privateAdd(this, _removeButton, null);
    __privateSet(this, _renderer2, renderer);
    __privateSet(this, _cursor2, cursor);
    __privateSet(this, _margin2, margin2);
    __privateSet(this, _dropdown, document.getElementById("editingTool"));
    __privateSet(this, _dropdownMenu, document.getElementById("editingTool-dropdown"));
    __privateSet(this, _editButton, document.getElementById("editingToolEdit"));
    __privateSet(this, _addButton, document.getElementById("editingToolAdd"));
    __privateSet(this, _removeButton, document.getElementById("editingToolRemove"));
    __privateGet(this, _editButton).addEventListener("click", () => {
      this.start(0);
    });
    __privateGet(this, _addButton).addEventListener("click", () => {
      this.start(1);
    });
    __privateGet(this, _removeButton).addEventListener("click", () => {
      this.start(2);
    });
    __privateSet(this, _callCancel2, () => {
      this.cancel();
    });
    __privateGet(this, _cursor2).addOnClick(() => {
      if (__privateGet(this, _state2) != "Editing") {
        return;
      }
      var offset = __privateGet(this, _cursor2).getOffset();
      var pos = __privateGet(this, _cursor2).position;
      var shapes = __privateGet(this, _renderer2).getAll();
      var keys = Object.keys(shapes);
      var found = null;
      for (let i = 0; i < keys.length; i++) {
        const shape = shapes[keys[i]];
        if (polygonPoint(shape.vertices, pos.x - offset.x - margin2 / 2, pos.y - offset.y - margin2 / 2)) {
          found = shape;
        }
      }
      if (found) {
        if (__privateGet(this, _shape) != null) {
          __privateGet(this, _shape).showData = __privateGet(this, _originalShowData);
          __privateGet(this, _shape).generate();
        }
        __privateSet(this, _shape, found);
        __privateSet(this, _originalShowData, __privateGet(this, _shape).showData);
        __privateGet(this, _shape).showData = true;
        __privateGet(this, _shape).generate();
      } else {
        if (__privateGet(this, _shape) != null) {
          __privateGet(this, _shape).showData = __privateGet(this, _originalShowData);
          __privateGet(this, _shape).generate();
        }
        __privateSet(this, _shape, null);
      }
    });
    __privateGet(this, _cursor2).addOnDragStart(() => {
      if (__privateGet(this, _shape) == null) {
        return;
      }
      var pos = __privateGet(this, _cursor2).position;
      var offset = __privateGet(this, _cursor2).getOffset();
      __privateSet(this, _verticeIndex, -1);
      for (let i = 0; i < __privateGet(this, _shape).vertices.length; i++) {
        const vertice = __privateGet(this, _shape).vertices[i];
        var dist = vertice.distance(new Vector2(pos.x - offset.x - margin2 / 2, pos.y - offset.y - margin2 / 2));
        if (dist < 10) {
          __privateSet(this, _verticeIndex, i);
          if (__privateGet(this, _type2) == 1)
            ;
          else if (__privateGet(this, _type2) == 2)
            ;
          break;
        }
      }
    });
    __privateGet(this, _cursor2).addOnDragUpdate(() => {
      if (__privateGet(this, _shape) == null || __privateGet(this, _verticeIndex) == -1) {
        return;
      }
      var pos = __privateGet(this, _cursor2).fromGrid();
      var offset = __privateGet(this, _cursor2).getOffset();
      __privateGet(this, _shape).vertices[__privateGet(this, _verticeIndex)] = new Vector2(pos.x - offset.x - margin2 / 2, pos.y - offset.y - margin2 / 2);
      __privateGet(this, _shape).generate();
    });
    __privateGet(this, _cursor2).addOnDragEnd(() => {
      if (__privateGet(this, _shape) == null || __privateGet(this, _verticeIndex) == -1) {
        return;
      }
      __privateSet(this, _verticeIndex, -1);
    });
  }
  start(type) {
    if (window.activeTool != null) {
      window.activeTool.cancel();
    }
    __privateSet(this, _state2, "Editing");
    __privateSet(this, _type2, type);
    __privateGet(this, _dropdownMenu).classList.remove("show");
    __privateGet(this, _dropdown).classList.add("active");
    __privateGet(this, _dropdown).addEventListener("click", __privateGet(this, _callCancel2));
    window.activeTool = this;
  }
  update() {
    if (__privateGet(this, _shape) != null) {
      var offset = __privateGet(this, _cursor2).getOffset();
      var vertices = __privateGet(this, _shape).vertices;
      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        fill(0, 0, 255);
        circle(v.x + offset.x + margin / 2, v.y + offset.y + margin / 2, 10);
      }
    }
  }
  end() {
    this.cancel();
  }
  cancel() {
    __privateSet(this, _state2, "Ready");
    __privateSet(this, _shape, null);
    __privateGet(this, _dropdownMenu).classList.remove("show");
    __privateGet(this, _dropdown).classList.remove("active");
    __privateGet(this, _dropdown).removeEventListener("click", __privateGet(this, _callCancel2));
    window.activeTool = null;
  }
}
_state2 = new WeakMap();
_type2 = new WeakMap();
_shape = new WeakMap();
_originalShowData = new WeakMap();
_verticeIndex = new WeakMap();
_colors2 = new WeakMap();
_margin2 = new WeakMap();
_renderer2 = new WeakMap();
_cursor2 = new WeakMap();
_callStart = new WeakMap();
_callEnd = new WeakMap();
_callCancel2 = new WeakMap();
_dropdown = new WeakMap();
_dropdownMenu = new WeakMap();
_editButton = new WeakMap();
_addButton = new WeakMap();
_removeButton = new WeakMap();
class Shape$1 {
  constructor(cursor, _vertices, _color = new Color(255, 255, 255), _allowed = true, _showData = true) {
    __privateAdd(this, _generateUniqSerial);
    __publicField(this, "inputs", {});
    __publicField(this, "vertices", []);
    __publicField(this, "color", new Color(255, 255, 255));
    __publicField(this, "showData", true);
    __publicField(this, "allowed", true);
    __privateAdd(this, _pos, null);
    __privateAdd(this, _oldPos, null);
    __privateAdd(this, _buffer2, null);
    __privateAdd(this, _textBuffer, null);
    __privateAdd(this, _cursor3, null);
    __privateAdd(this, _margin3, 50);
    __privateSet(this, _cursor3, cursor);
    this.vertices = _vertices;
    this.color = _color;
    this.allowed = _allowed;
    this.showData = _showData;
    __privateSet(this, _oldPos, _vertices[0]);
    this.generate();
  }
  update() {
    var offset = __privateGet(this, _cursor3).getOffset();
    image(__privateGet(this, _buffer2), __privateGet(this, _pos).x + offset.x + __privateGet(this, _margin3) / 2, __privateGet(this, _pos).y + offset.y + __privateGet(this, _margin3) / 2);
  }
  updateText() {
    var offset = __privateGet(this, _cursor3).getOffset();
    image(__privateGet(this, _textBuffer), __privateGet(this, _pos).x + offset.x + __privateGet(this, _margin3) / 2, __privateGet(this, _pos).y + offset.y + __privateGet(this, _margin3) / 2);
  }
  generate() {
    if (__privateGet(this, _buffer2) != null) {
      __privateGet(this, _buffer2).elt.parentNode.removeChild(__privateGet(this, _buffer2).elt);
      __privateGet(this, _textBuffer).elt.parentNode.removeChild(__privateGet(this, _textBuffer).elt);
    }
    const xArr = this.vertices.map((a) => a.x);
    const yArr = this.vertices.map((a) => a.y);
    const width = Math.max(...xArr) - Math.min(...xArr) + __privateGet(this, _margin3);
    const height = Math.max(...yArr) - Math.min(...yArr) + __privateGet(this, _margin3);
    __privateSet(this, _pos, new Vector2(Math.min(...xArr) - __privateGet(this, _margin3) / 2, Math.min(...yArr) - __privateGet(this, _margin3) / 2));
    if (__privateGet(this, _buffer2) == null) {
      __privateSet(this, _buffer2, createGraphics(width, height));
      __privateGet(this, _buffer2).canvas.id = "ShapesBufferGraphics_" + __privateMethod(this, _generateUniqSerial, generateUniqSerial_fn).call(this);
      __privateSet(this, _textBuffer, createGraphics(width, height));
      __privateGet(this, _textBuffer).canvas.id = "TEXT_" + __privateGet(this, _buffer2).canvas.id;
    }
    this.generateShape();
    this.generateInfo();
  }
  generateShape() {
    __privateGet(this, _buffer2).beginShape();
    for (let i = 0; i < this.vertices.length; i++) {
      const vc = this.vertices[i];
      __privateGet(this, _buffer2).vertex(vc.x - __privateGet(this, _pos).x, vc.y - __privateGet(this, _pos).y);
    }
    __privateGet(this, _buffer2).fill(this.color.r, this.color.g, this.color.b);
    __privateGet(this, _buffer2).vertex(this.vertices[0].x - __privateGet(this, _pos).x, this.vertices[0].y - __privateGet(this, _pos).y);
    __privateGet(this, _buffer2).endShape(CLOSE);
  }
  generateInfo() {
    if (this.showData) {
      var next = 0;
      for (let i = 0; i < this.vertices.length; i++) {
        next = i + 1;
        if (next >= this.vertices.length) {
          next = 0;
        }
        const v1 = this.vertices[i];
        const v2 = this.vertices[next];
        var position = v1.addNew(v2).devide(new Vector2(2, 2));
        position.remove(__privateGet(this, _pos));
        var dist = (v1.distance(v2) * 10).toFixed(0);
        __privateGet(this, _textBuffer).fill(0);
        __privateGet(this, _textBuffer).textSize(12);
        __privateGet(this, _textBuffer).text(dist + " mm", position.x - (dist + "").length * 6, position.y);
      }
    }
  }
}
_pos = new WeakMap();
_oldPos = new WeakMap();
_buffer2 = new WeakMap();
_textBuffer = new WeakMap();
_cursor3 = new WeakMap();
_margin3 = new WeakMap();
_generateUniqSerial = new WeakSet();
generateUniqSerial_fn = function() {
  return "xxxx-xxxx-xxx-xxxx".replace(/[x]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return r.toString(16);
  });
};
class Renderer {
  constructor() {
    __privateAdd(this, _shapes, {});
    __privateAdd(this, _length, 0);
    __privateSet(this, _shapes, {});
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
  add(shape) {
    __privateGet(this, _shapes)[__privateGet(this, _length)] = shape;
    __privateSet(this, _length, __privateGet(this, _length) + 1);
    return __privateGet(this, _length) - 1;
  }
  remove(shape) {
    __privateGet(this, _shapes)[__privateGet(this, _length)] = shape;
    __privateSet(this, _length, __privateGet(this, _length) + 1);
    return __privateGet(this, _length) - 1;
  }
  getAll() {
    return __privateGet(this, _shapes);
  }
}
_shapes = new WeakMap();
_length = new WeakMap();
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
export {
  Color$1 as Color,
  Cursor$1 as Cursor,
  DrawingTool,
  EditingTool,
  Grid,
  Input,
  Renderer,
  Ruler$1 as Ruler,
  Settings$1 as Settings,
  Shape$1 as Shape,
  Vector2$1 as Vector2
};

      }
    }
  }
  _pos = new WeakMap();
  _oldPos = new WeakMap();
  _buffer2 = new WeakMap();
  _textBuffer = new WeakMap();
  _cursor3 = new WeakMap();
  _margin3 = new WeakMap();
  _generateUniqSerial = new WeakSet();
  generateUniqSerial_fn = function() {
    return "xxxx-xxxx-xxx-xxxx".replace(/[x]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  };
  class Renderer {
    constructor() {
      __privateAdd(this, _shapes, {});
      __privateAdd(this, _length, 0);
      __privateSet(this, _shapes, {});
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
    add(shape) {
      __privateGet(this, _shapes)[__privateGet(this, _length)] = shape;
      __privateSet(this, _length, __privateGet(this, _length) + 1);
      return __privateGet(this, _length) - 1;
    }
    remove(shape) {
      __privateGet(this, _shapes)[__privateGet(this, _length)] = shape;
      __privateSet(this, _length, __privateGet(this, _length) + 1);
      return __privateGet(this, _length) - 1;
    }
    getAll() {
      return __privateGet(this, _shapes);
    }
  }
  _shapes = new WeakMap();
  _length = new WeakMap();
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
  exports2.Color = Color$1;
  exports2.Cursor = Cursor$1;
  exports2.DrawingTool = DrawingTool;
  exports2.EditingTool = EditingTool;
  exports2.Grid = Grid;
  exports2.Input = Input;
  exports2.Renderer = Renderer;
  exports2.Ruler = Ruler$1;
  exports2.Settings = Settings$1;
  exports2.Shape = Shape$1;
  exports2.Vector2 = Vector2$1;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
