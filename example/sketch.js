var Collision = window.CDE.Collision;
var Settings = window.CDE.Settings;
var EventSystem = window.CDE.EventSystem;
var Cursor = window.CDE.Cursor;
var Color = window.CDE.Color;
var Grid = window.CDE.Grid;
var Renderer = window.CDE.Renderer;
var DrawingTool = window.CDE.DrawingTool;
var History = window.CDE.History;

var cursor, grid, renderer, drawingTool;

function setup() {
    var canvas = createCanvas(visualViewport.width, visualViewport.height);

    History.instance();
    Settings.setCanvas(canvas);

    renderer = new Renderer();
    cursor = new Cursor();
    grid = new Grid();
    drawingTool = new DrawingTool();

    frameRate(60);
    menu();
}

function draw() {
    background(225, 225, 225);

    push();
    translate(cursor.offset.x, cursor.offset.y);
    scale(Settings.zoom);
    grid.update();
    renderer.update();
    drawingTool.update();
    pop();

    cursor.update();
    showFPS();
}

function menu(){
    var undo = createButton("Undo");
    undo.position(50, 5);
    undo.mouseClicked(History.undo);
    var redo = createButton("Redo");
    redo.position(50, 40);
    redo.mouseClicked(History.redo);
}

let fr = 60;
function showFPS() {
    push();
    fr = 0.95 * fr + 0.05 * frameRate();
    fill(0);
    rect(0, 0, 40, 74);
    fill(255, 255, 255);
    noStroke();
    text(str(floor(fr * 100) / 100), 5, 16);
    text(Settings.zoom.toFixed(2) + "%", 4, 30);
    text(drawingTool.isEnabled, 4, 44);
    text("R:" + renderer.getAll().length, 4, 58);
    text("H:" + History.count(), 4, 72);
    pop();
}