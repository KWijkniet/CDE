var Collision = window.CDE.Collision;
var Settings = window.CDE.Settings;
var EventSystem = window.CDE.EventSystem;
var Cursor = window.CDE.Cursor;
var Color = window.CDE.Color;
var Grid = window.CDE.Grid;

var fps = document.getElementById("fps");
var cursor, grid;

function setup() {
    var canvas = createCanvas(visualViewport.width, visualViewport.height);

    Settings.setCanvas(canvas);

    cursor = new Cursor();
    grid = new Grid("--grid-background", "--grid-lines");
}

function draw() {
    background(225, 225, 225);
    
    fps.innerHTML = frameRate().toFixed(0);
    
    grid.update();
    cursor.update();
}