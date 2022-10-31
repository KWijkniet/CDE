import Color from "./Color";

export default class Settings {
    static mapSizeX = 2500;
    static mapSizeY = 2500 / 16 * 9;
    // static mapSizeX = visualViewport.width;
    // static mapSizeY = visualViewport.height;
    static bufferMargin = 50;
    static gridSizeS = 10;
    static gridSizeL = 100;
    static zoom = 1;
    static bufferMargin = 50;
    static cursorSize = 15;

    static gridBackground = new Color("--grid-background");
    static gridLines = new Color("--grid-lines");
    static shapeAllowed = new Color("--shape-allowed");
    static shapeForbidden = new Color("--shape-forbidden");

    static #canvas = null;
    static setCanvas = (c) => { this.#canvas = c; };
    static getCanvas = () => { return this.#canvas; };
    
    static #activeTool = null;
    static setActiveTool = (c) => { this.#activeTool = c; };
    static getActiveTool = () => { return this.#activeTool; };
}