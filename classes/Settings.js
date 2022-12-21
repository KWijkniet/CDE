import Color from "./Color";

export default class Settings {
    static mapSizeX = 5000;
    static mapSizeY = 5000 / 16 * 9;
    // static mapSizeX = visualViewport.width;
    // static mapSizeY = visualViewport.height;
    static bufferMargin = 50;
    static gridSizeS = 10;
    static gridSizeL = 100;
    static zoom = 1;
    static cursorSize = 10;
    static type = "Zwart";

    static gridBackground = new Color("--grid-background");
    static gridLines = new Color("--grid-lines");
    static shapeAllowed = new Color("--shape-allowed");
    static shapeForbidden = new Color("--shape-forbidden");
    static tileTerracottaBackground = new Color("--tile-background-terracotta");
    static tileZwartBackground = new Color("--tile-background-zwart");
    static dummyTerracottaBackground = new Color("--tile-background-terracotta-dummy");
    static dummyZwartBackground = new Color("--tile-background-zwart-dummy");

    static #canvas = null;
    static setCanvas = (c) => { this.#canvas = c; };
    static getCanvas = () => { return this.#canvas; };
    
    static #activeTool = null;
    static setActiveTool = (c) => { this.#activeTool = c; };
    static getActiveTool = () => { return this.#activeTool; };
}