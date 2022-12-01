import Color from "./Color";
import Vector2 from "./Vector2";

export default class Tile {
    #buffer = null;
    #vertices = [];

    constructor(vertices = [], buffer = null) {
        this.#buffer = buffer;
        this.#vertices = vertices;
        this.#generate();
    }

    getVertices(){
        return this.#vertices;
    }

    #generate(){
        this.#buffer.beginShape();
        for (let i = 0; i < this.#vertices.length; i++) {
            this.#buffer.vertex(this.#vertices[i].x, this.#vertices[i].y);
        }
        this.#buffer.vertex(this.#vertices[0].x, this.#vertices[0].y);

        var rgba = Settings.tileBackground.rgb();
        this.#buffer.fill(rgba.r, rgba.g, rgba.b, rgba.a);
        this.#buffer.endShape();
    }
}