var Settings = window.CDE.Settings;
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
var renderer, grid, cursor, state, canvas, ruler, offset, drawingTool, editingTool;

function setup() {
    createCanvas(visualViewport.width, visualViewport.height);
    canvas = document.getElementById("defaultCanvas0");
    
    cursor = new Cursor();
    renderer = new Renderer();

    grid = new Grid(10, visualViewport.width, visualViewport.height);
}

function draw() {
    background(225, 225, 225);
    if (renderer == null){ return; }
    
    fpsElem.innerHTML = frameRate().toFixed(0);
    grid.draw();
    renderer.update();
}