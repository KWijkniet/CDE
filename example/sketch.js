var Vector2 = window.CDE.Vector2;
var Color = window.CDE.Color;
var Ruler = window.CDE.Ruler;
var Grid = window.CDE.Grid;
var Cursor = window.CDE.Cursor;
var Input = window.CDE.Input;
var DrawingTool = window.CDE.DrawingTool;
var EditingTool = window.CDE.EditingTool;
var Shape = window.CDE.Shape;
var Renderer = window.CDE.Renderer;

//FPS counter
var fpsElem = document.getElementById("fps");

//Core
var bonusSize = 1000; //The amount on the left, top, right, bottom you can move to (drag)
var margin = 50;
var renderer, grid, cursor, state, canvas, ruler, offset, drawingTool, editingTool;

function setup() {
    createCanvas(visualViewport.width, visualViewport.height);
    canvas = document.getElementById("defaultCanvas0");

    grid = new Grid(10, visualViewport.width, visualViewport.height, new Color(63, 63, 63), bonusSize);
    cursor = new Cursor(grid, canvas, true, margin, bonusSize);
    renderer = new Renderer(cursor);
    drawingTool = new DrawingTool(renderer, cursor, margin, [new Color(255, 255, 255), new Color(255, 0, 0)]);
    editingTool = new EditingTool(renderer, cursor, margin);
}

function draw() {
    background(225, 225, 225);
    if (renderer == null){ return; }

    fpsElem.innerHTML = frameRate().toFixed(0);
    grid.draw(cursor.getOffset());
    renderer.update();
    drawingTool.update();
    editingTool.update();

    cursor.draw();
}

function startDraw(type) {
    drawingTool.start(type);
}

function recenter() {
    cursor.resetOffset();
}