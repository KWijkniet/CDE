var Collision = window.CDE.Collision;
var Settings = window.CDE.Settings;
var EventSystem = window.CDE.EventSystem;
var Cursor = window.CDE.Cursor;
var Color = window.CDE.Color;
var Grid = window.CDE.Grid;

var cursor, grid;
var cam;
function setup() {
    var canvas = createCanvas(Settings.mapSizeX, Settings.mapSizeY);

    Settings.setCanvas(canvas);

    cursor = new Cursor();
    grid = new Grid("--grid-background", "--grid-lines");
    frameRate(60);
}

let fr = 60;
function draw() {
    background(225, 225, 225);

    push();
    translate(cursor.offset.x, cursor.offset.y);
    scale(cursor.zoom);

    grid.update();
    cursor.update();

    stroke(0);
    strokeWeight(10);
    line(0, 0, Settings.mapSizeX, 0);
    line(Settings.mapSizeX, 0, Settings.mapSizeX, Settings.mapSizeY);
    line(Settings.mapSizeX, Settings.mapSizeY, 0, Settings.mapSizeY);
    line(0, Settings.mapSizeY, 0, 0);

    circle(Settings.mapSizeX / 2, Settings.mapSizeY / 2, 50);
    pop();

    fr = 0.95 * fr + 0.05 * frameRate();
    fill(0);
    rect(0, 0, 40, 35);
    fill(255, 255, 255);
    noStroke();
    text(str(floor(fr * 100) / 100), 5, 16);
    text(cursor.zoom.toFixed(2) + "%", 4, 30);
}