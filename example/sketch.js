var Collision = window.CDE.Collision;
var Settings = window.CDE.Settings;
var EventSystem = window.CDE.EventSystem;
var Cursor = window.CDE.Cursor;
var Color = window.CDE.Color;
var Grid = window.CDE.Grid;

var cursor, grid;

function setup() {
    var canvas = createCanvas(visualViewport.width, visualViewport.height, P2D);

    Settings.setCanvas(canvas);

    cursor = new Cursor();
    grid = new Grid("--grid-background", "--grid-lines");
    frameRate(60);
}

let fr = 60;
function draw() {
    background(225, 225, 225);

    grid.update();
    cursor.update();

    push();
    fr = 0.95 * fr + 0.05 * frameRate();
    fill(0);
    rect(0, 0, 35, 25);
    fill(255, 255, 255);
    noStroke();
    text(str(floor(fr * 100)), 4, 16);
    pop();
}