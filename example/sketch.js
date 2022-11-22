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
var ContextMenu = window.CDE.ContextMenu;
var ContextMenuOption = window.CDE.ContextMenuOption;

//Core
var cursor, grid, renderer, drawingTool, selectorTool;
//Visuals
var drawingToolElem, selectorToolElem, selectorToolMenu, optionsElem, allowedInputElem, toolModeAddElem;
//Other
var hasSelectedShape;

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
    Window.currentTool = null;
    hasSelectedShape = null;

    //Visuals
    drawingToolElem = document.getElementById("drawingTool");
    selectorToolElem = document.getElementById("selectorTool");
    optionsElem = document.getElementById("optionsElem");
    allowedInputElem = document.getElementById("allowedInput");
    toolModeAddElem = document.getElementById("toolModeAdd");

    selectorToolMenu = new ContextMenu('selectorTool', [
        new ContextMenuOption('Allowed', 'checkbox', null, null, (e) => { e.querySelector('input').checked = selectorTool.shape != null ? selectorTool.shape.isAllowed : false; }, null, (e) => {
            selectorTool.shape.isAllowed = e.target.checked; selectorTool.shape.color = selectorTool.shape.isAllowed ? Settings.shapeAllowed : Settings.shapeForbidden;selectorTool.shape.redraw(); }),
        new ContextMenuOption('Multi Tool', 'radio', null, 'toolMode'),
        new ContextMenuOption('Move', 'radio', null, 'toolMode'),
        new ContextMenuOption('Insert', 'radio', null, 'toolMode'),
        new ContextMenuOption('Delete', 'radio', null, 'toolMode'),
        new ContextMenuOption('Delete All', null, 'fa-solid fa-trash'),
    ]);
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
    // showHistory();
    updateVisuals();

    if (drawingTool.isEnabled && Window.currentTool != drawingTool) {
        Window.currentTool = drawingTool;
    }
    if (selectorTool.isEnabled && Window.currentTool != selectorTool) {
        Window.currentTool = selectorTool;
    }
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

    if (!selectorToolMenu.isShown() && Window.currentTool != null && selectorTool.shape != hasSelectedShape){
        hasSelectedShape = selectorTool.shape;
        selectorToolMenu.show();
    } else if (Window.currentTool != selectorTool || (Window.currentTool == selectorTool && selectorTool.shape == null)) {
        selectorToolMenu.hide();
    }

    // if (Window.currentTool == selectorTool){
    //     if (optionsElem.style.display == "none"){
    //         optionsElem.style.display = "block";
    //         document.querySelector('input[name="drawingMode"][value="multiTool"]').checked = true;
    //         updateSelected('toolMode');
            
    //         if (selectorTool.shape == null) {
    //             optionsElem.style.display = "none";
    //             allowedInputElem.parentNode.parentNode.style.display = "block";
    //             toolModeAddElem.style.display = "none";
    //         }
    //     }

    //     if ((hasSelectedShape == null || hasSelectedShape != selectorTool.shape) && selectorTool.shape != null){
    //         hasSelectedShape = selectorTool.shape;
    //         allowedInputElem.checked = selectorTool.shape.isAllowed;
    //     }
    //     else if (hasSelectedShape != null && selectorTool.shape == null) {
    //         hasSelectedShape = null;
    //         optionsElem.style.display = "none";
    //     }
    // }
    // else if (optionsElem.style.display == "block") {
    //     optionsElem.style.display = "none";
    // }
}

function toggleDrawingTool() {
    if (Window.currentTool != null && Window.currentTool != drawingTool) { Window.currentTool.disable(); optionsElem.style.display = "none"; }
    Window.currentTool = drawingTool;
    if (drawingTool.isEnabled) {
        drawingTool.disable();
        Window.currentTool = null;
    }
    else {
        drawingTool.enable();
    }
}

function toggleSelectorTool() {
    if (Window.currentTool != null && Window.currentTool != selectorTool) { Window.currentTool.disable(); optionsElem.style.display = "none"; }
    Window.currentTool = selectorTool;
    if (selectorTool.isEnabled) {
        selectorTool.disable();
        Window.currentTool = null;
    }
    else {
        selectorTool.enable();
    }
}

function recenter(){
    cursor.resetOffset();
}

function confirmSelected() {
    if (Window.currentTool == selectorTool) {
        selectorTool.deselectShape();
    }
}

function deleteSelected(){
    if(Window.currentTool == selectorTool){
        selectorTool.deleteSelected();
    }
    else if(Window.currentTool == drawingTool){
        drawingTool.setData([]);
    }
}

function updateSelected(type){
    if (type == "isAllowed"){
        selectorTool.shape.isAllowed = !selectorTool.shape.isAllowed;
        selectorTool.shape.color = selectorTool.shape.isAllowed ? Settings.shapeAllowed : Settings.shapeForbidden;
        selectorTool.shape.redraw();
    }
    else if (type == "toolMode"){
        var value = document.querySelector('input[name="drawingMode"]:checked').value;
        Window.currentTool.canAdd = value == "multiTool";
        Window.currentTool.canDelete = value == "multiTool";
        Window.currentTool.canInsert = value == "multiTool";
        Window.currentTool.canMove = value == "multiTool";

        if (value == "add") {
            Window.currentTool.canAdd = true;
        }
        else if (value == "move") {
            Window.currentTool.canMove = true;
        }
        else if (value == "delete") {
            Window.currentTool.canDelete = true;
        }
        else if (value == "insert") {
            Window.currentTool.canInsert = true;
        }
    }
}