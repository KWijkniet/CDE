var Collision = window.CDE.Collision;
var Settings = window.CDE.Settings;
var EventSystem = window.CDE.EventSystem;
var Cursor = window.CDE.Cursor;
var Shape = window.CDE.Shape;
var Color = window.CDE.Color;
var Grid = window.CDE.Grid;
var Renderer = window.CDE.Renderer;
var DrawingTool = window.CDE.DrawingTool;
var SelectorTool = window.CDE.SelectorTool;
var GeneratorTool = window.CDE.GeneratorTool;
var HistoryTool = window.CDE.HistoryTool;
var ContextMenu = window.CDE.ContextMenu;
var ContextMenuOption = window.CDE.ContextMenuOption;
var LineSelectorTool = window.CDE.LineSelectorTool;
var TileSelectorTool = window.CDE.TileSelectorTool;

//Core
var cursor, grid, renderer, drawingTool, selectorTool, lineSelectorTool, tileSelectorTool;
//Visuals
var drawingToolElem, selectorToolElem, selectorToolMenu, generatorElem, lineSelectorElem, tileSelectorElem/*, generatorMenu*/;
//Other
var hasSelectedShape;

//Event
onSetupComplete = () => {};

function setup() {
    var canvas = createCanvas(visualViewport.width, visualViewport.height);
    // document.getElementsByClassName("editor")[0].appendChild(canvas.elt);

    HistoryTool.instance();
    Settings.setCanvas(canvas);

    renderer = new Renderer();
    cursor = new Cursor();
    grid = new Grid();
    drawingTool = new DrawingTool();
    selectorTool = new SelectorTool();
    generatorTool = new GeneratorTool();
    lineSelectorTool = new LineSelectorTool();
    lineSelectorTool.events.subscribe('selectLine', (e) => { $("#exampleModal").modal("show"); cursor.isDisabled = true; loadMargin(); });
    tileSelectorTool = new TileSelectorTool(generatorTool);

    frameRate(60);
    Window.currentTool = null;
    hasSelectedShape = null;

    //Visuals
    drawingToolElem = document.getElementById("drawingTool");
    selectorToolElem = document.getElementById("selectorTool");
    generatorElem = document.getElementById("generatorTool");
    lineSelectorElem = document.getElementById("lineTool");
    tileSelectorElem = document.getElementById("tileTool");

    selectorToolMenu = new ContextMenu('selectorToolMenu', [
        new ContextMenuOption('Allowed', 'checkbox', null, null, (e) => { e.querySelector('input').checked = selectorTool.shape != null ? selectorTool.shape.isAllowed : false; }, null, (e) => {
            selectorTool.shape.isAllowed = e.target.checked; selectorTool.shape.color = selectorTool.shape.isAllowed ? Settings.shapeAllowed : Settings.shapeForbidden;selectorTool.shape.redraw(); }),
        new ContextMenuOption('Multi Tool', 'radio', null, 'toolMode', (e) => { e.querySelector('input').checked = true; updateToolMode('multiTool') }, null, (e) => { updateToolMode('multiTool');}),
        new ContextMenuOption('Move', 'radio', null, 'toolMode', null, null, (e) => { updateToolMode('move'); }),
        new ContextMenuOption('Insert', 'radio', null, 'toolMode', null, null, (e) => { updateToolMode('insert'); }),
        new ContextMenuOption('Delete', 'radio', null, 'toolMode', null, null, (e) => { updateToolMode('delete'); }),
        new ContextMenuOption('Confirm', null, 'fa-solid fa-check', null, null, (e) => { confirmSelected(); }),
        new ContextMenuOption('Delete Shape', null, 'fa-solid fa-trash', null, null, (e) => { deleteSelected(); }),
    ], "selectorTool");

    onSetupComplete();
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
    generatorTool.update();
    renderer.updateText();
    lineSelectorTool.update();
    tileSelectorTool.update();
    cursor.update();
    pop();

    // showFPS();
    // showHistory();
    updateVisuals();

    if (drawingTool.isEnabled && Window.currentTool != drawingTool) {
        Window.currentTool = drawingTool;
    }
    if (selectorTool.isEnabled && Window.currentTool != selectorTool) {
        Window.currentTool = selectorTool;
    }
}

function windowResized() {
    resizeCanvas(visualViewport.width, visualViewport.height);
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
    for (let i = HistoryTool.count() - 1; i >= 0; i--) {
        if(count >= 15){break;}
        count++;
        
        var action = HistoryTool.get(i);
        var index = HistoryTool.getIndex();
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

    //Generator
    if (generatorTool.isEnabled && !generatorElem.classList.contains("active")) {
        generatorElem.classList.add("active");
    }
    else if (!generatorTool.isEnabled && generatorElem.classList.contains("active")) {
        generatorElem.classList.remove("active");
    }

    //Selector menu
    if (!selectorToolMenu.isShown() && Window.currentTool == selectorTool && selectorTool.shape != hasSelectedShape) {
        hasSelectedShape = selectorTool.shape;
        selectorToolMenu.show();
    } else if (Window.currentTool != selectorTool || (Window.currentTool == selectorTool && selectorTool.shape == null)) {
        selectorToolMenu.hide();
    }

    //LineSelector tool
    if (lineSelectorTool.isEnabled && !lineSelectorElem.classList.contains("active")) {
        lineSelectorElem.classList.add("active");
    }
    else if (!lineSelectorTool.isEnabled && lineSelectorElem.classList.contains("active")) {
        lineSelectorElem.classList.remove("active");
    }

    //TileSelectorTool tool
    if (tileSelectorTool.isEnabled && !tileSelectorElem.classList.contains("active")) {
        tileSelectorElem.classList.add("active");
    }
    else if (!tileSelectorTool.isEnabled && tileSelectorElem.classList.contains("active")) {
        tileSelectorElem.classList.remove("active");
    }

    // //Selector menu
    // if (!generatorMenu.isShown() && Window.currentTool == generatorTool) {
    //     generatorMenu.show();
    // } else if (Window.currentTool != generatorTool) {
    //     generatorMenu.hide();
    // }
}

function toggleDrawingTool() {
    if (Window.currentTool != null && Window.currentTool != drawingTool) { Window.currentTool.disable(); }
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
    if (Window.currentTool != null && Window.currentTool != selectorTool) { Window.currentTool.disable(); }
    Window.currentTool = selectorTool;
    if (selectorTool.isEnabled) {
        selectorTool.disable();
        Window.currentTool = null;
    }
    else {
        selectorTool.enable();
    }
}

function toggleGeneratorTool() {
    generatorTool.generate();
    if (Window.currentTool != null){
        Window.currentTool.disable();
        Window.currentTool = null;
    }
    // if (Window.currentTool != null && Window.currentTool != generatorTool) { Window.currentTool.disable(); }
    // Window.currentTool = generatorTool;
    // if (generatorTool.isEnabled) {
    //     generatorTool.disable();
    //     Window.currentTool = null;
    // }
    // else {
    //     generatorTool.enable();
    // }
}

function toggleLineTool() {
    if (Window.currentTool != null && Window.currentTool != lineSelectorTool) { Window.currentTool.disable(); }
    Window.currentTool = lineSelectorTool;
    if (lineSelectorTool.isEnabled) {
        lineSelectorTool.disable();
        Window.currentTool = null;
    }
    else {
        lineSelectorTool.enable();
    }
}

function toggleTileTool() {
    if (Window.currentTool != null && Window.currentTool != tileSelectorTool) { Window.currentTool.disable(); }
    Window.currentTool = tileSelectorTool;
    if (tileSelectorTool.isEnabled) {
        tileSelectorTool.disable();
        Window.currentTool = null;
    }
    else {
        tileSelectorTool.enable();
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

function updateToolMode(mode){
    Window.currentTool.canAdd = mode == "multiTool";
    Window.currentTool.canDelete = mode == "multiTool";
    Window.currentTool.canInsert = mode == "multiTool";
    Window.currentTool.canMove = mode == "multiTool";

    if (mode == "add") {
        Window.currentTool.canAdd = true;
    }
    else if (mode == "move") {
        Window.currentTool.canMove = true;
    }
    else if (mode == "delete") {
        Window.currentTool.canDelete = true;
    }
    else if (mode == "insert") {
        Window.currentTool.canInsert = true;
    }
}

function updateSettings(){
    generatorTool.rowOffsetMode = document.getElementById("useRowOffset").checked;
    Settings.type = document.getElementById("tileType").value;
}

function updateMargin() {
    var elems = document.getElementsByName("marginType");
    for (let i = 0; i < elems.length; i++) {
        const elem = elems[i];
        if (elem.checked) {
            var value = elem.getAttribute("data-margin");
            if (!value) {
                value = document.querySelector('[data-target="' + elem.id + '"]').value;
            }
            lineSelectorTool.selectedShape.lineMargins[lineSelectorTool.selectedPointIndex] = elem.id + "|" + value;
            Renderer.instance.replace(lineSelectorTool.selectedShape);
            break;
        }
    }

    generatorTool.margin = document.getElementById("objectMargin").value;
    generatorTool.rowOffsetMode = document.getElementById("useRowOffset").checked;
}

function loadMargin() {
    var data = (lineSelectorTool.selectedShape.lineMargins[lineSelectorTool.selectedPointIndex] + "").split("|");
    var elems = document.getElementsByName("marginType");
    for (let i = 0; i < elems.length; i++) {
        const elem = elems[i];
        if (elem.id == data[0]){
            elem.checked = true;

            if (!elem.getAttribute("data-margin")){
                document.querySelector('[data-target="' + elem.id + '"]').value = data[1];
            }
            break;
        }

        if (elem.checked){
            elem.checked = false;
        }
    }
}

function exportData() {
    var data = {
        "shapes": [],
        "generator": [],
        "useRowOffset": 0,
        "tileType": "",
    };

    var shapes = renderer.getAll();
    for(var i = 0; i < shapes.length; i++){
        data["shapes"][i] = shapes[i].toJSON();
    }
    data['generator'] = generatorTool.toJSON();
    data['useRowOffset'] = document.getElementById("useRowOffset").checked;
    data['tileType'] = document.getElementById("tileType").value;
    data['dakvoetprofielen'] = document.getElementById("dakvoetprofielen").value;
    data['vogelschroten'] = document.getElementById("vogelschroten").value;

    return JSON.stringify(data);
}

function importData(json){
    for (let i = 0; i < json.shapes.length; i++) {
        const shape = json.shapes[i];
        
        var newShape = new Shape();
        newShape.fromJSON(shape);
        renderer.add(newShape);
    }
    document.getElementById("useRowOffset").checked = json['useRowOffset'];
    document.getElementById("tileType").value = json['tileType'];
    document.getElementById("dakvoetprofielen").value = json['dakvoetprofielen'];
    document.getElementById("vogelschroten").value = json['vogelschroten'];
    generatorTool.fromJSON(json['generator']);
}

function canvasAsImage(){
    return Settings.getCanvas().elt.toDataURL();
}