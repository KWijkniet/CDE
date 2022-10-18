export default class Settings {
    static mapSize = 2000;
    static bufferMargin = 50;
    static gridSizeS = 10;
    static gridSizeL = 100;

    static #canvas = null;
    static setCanvas = (c) => { this.#canvas = c; };
    static getCanvas = () => { return this.#canvas; };
}