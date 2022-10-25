export default class Settings {
    static mapSizeX = 1879;
    static mapSizeY = 939;
    static bufferMargin = 50;
    static gridSizeS = 10;
    static gridSizeL = 100;

    static #canvas = null;
    static setCanvas = (c) => { this.#canvas = c; };
    static getCanvas = () => { return this.#canvas; };
}