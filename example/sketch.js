var Collision = window.CDE.Collision;
var Settings = window.CDE.Settings;
var EventSystem = window.CDE.EventSystem;
var Cursor = window.CDE.Cursor;
var Color = window.CDE.Color;
var Grid = window.CDE.Grid;
var Renderer = window.CDE.Renderer;
var DrawingTool = window.CDE.DrawingTool;
var SelectorTool = window.CDE.SelectorTool;
var History = window.CDE.History;

//Core
var cursor, grid, renderer, drawingTool, selectorTool;
//Visuals
var drawingToolElem, selectorToolElem;

function setup() {
    var canvas = createCanvas(visualViewport.width, visualViewport.height);

    History.instance();
    Settings.setCanvas(canvas);

    renderer = new Renderer();
    cursor = new Cursor();
    grid = new Grid();
    drawingTool = new DrawingTool();
    selectorTool = new SelectorTool();

    frameRate(60);

    //Visuals
    drawingToolElem = document.getElementById("drawingTool");
    selectorToolElem = document.getElementById("selectorTool");
}

function draw() {
    background(225, 225, 225);

    push();
    translate(cursor.offset.x, cursor.offset.y);
    scale(Settings.zoom);
    grid.update();
    renderer.update();
    drawingTool.update();
    selectorTool.update();
    pop();

    cursor.update();
    showFPS();
    showHistory();
    updateVisuals();
}

let fr = 60;
function showFPS() {
    push();
    fr = 0.95 * fr + 0.05 * frameRate();
    fill(0);
    rect(0, 0, 40, 35);
    fill(255, 255, 255);
    noStroke();
    text(str(floor(fr * 100) / 100), 5, 16);
    text(Settings.zoom.toFixed(2) + "%", 4, 30);
    pop();
}

function showHistory() {
    push();

    fill(0);
    rect(width - 250, 0, 250, 500);

    var count = 0;
    for (let i = History.count() - 1; i >= 0; i--) {
        if(count >= 15){break;}
        count++;
        
        var action = History.get(i);
        var index = History.getIndex();
        noStroke();
        if (index == i) {
            fill(0, 255, 0);
        }
        else{
            fill(255, 255, 255);
        }
        text(count + ". " + action.name, width - 250, 25 + (16 * count));
        stroke(255);
        line(width - 250, 25 + (16 * count), width, 25 + (16 * count));
    }
    pop();
}

function updateVisuals(){
    //Drawing tool
    if (drawingTool.isEnabled && !drawingToolElem.classList.contains("active")) {
        drawingToolElem.classList.add("active");
    }
    else if (!drawingTool.isEnabled && drawingToolElem.classList.contains("active")) {
        drawingToolElem.classList.remove("active");
    }
    //Selector tool
    if (selectorTool.isEnabled && !selectorToolElem.classList.contains("active")) {
        selectorToolElem.classList.add("active");
    }
    else if (!selectorTool.isEnabled && selectorToolElem.classList.contains("active")) {
        selectorToolElem.classList.remove("active");
    }
}

function toggleDrawingTool() {
    if(Window.currentTool != null && Window.currentTool != drawingTool){ Window.currentTool.disable(); }
    Window.currentTool = drawingTool;
    if (drawingTool.isEnabled) {
        drawingTool.disable();
    }
    else {
        drawingTool.enable();
    }
}

function toggleSelectorTool() {
    if(Window.currentTool != null && Window.currentTool != selectorTool){ Window.currentTool.disable(); }
    Window.currentTool = selectorTool;
    if (selectorTool.isEnabled) {
        selectorTool.disable();
    }
    else {
        selectorTool.enable();
    }
}

function recenter(){
    cursor.resetOffset();
}