import Color from "./Color";
import Vector2 from "./Vector2";

export default class Tile {
    width = 0;
    height = 0;
    #buffer = null;
    #vertices = [];
    #color = null;

    constructor(vertices = [], buffer = null, isDummy = false) {
        this.#buffer = buffer;
        this.#vertices = vertices;
        this.width = 0;
        this.height = 0;
        if(this.#vertices.length <= 0){return;}
        for (let i = this.#vertices.length - 1; i >= 0; i--) {
            const vc = this.#vertices[i];
            if(isNaN(vc.x) || isNaN(vc.y)){
                this.#vertices.splice(i, 1);
            }
        }

        if(isDummy){
            this.#color = Settings.type == "Zwart" ? Settings.dummyZwartBackground : Settings.dummyTerracottaBackground;
        }else{
            this.#color = Settings.type == "Zwart" ? Settings.tileZwartBackground : Settings.tileTerracottaBackground;
        }

        const xArr = this.#vertices.map(a => a.x);
        const yArr = this.#vertices.map(a => a.y);
        this.width = (Math.max(...xArr) - Math.min(...xArr));
        this.height = (Math.max(...yArr) - Math.min(...yArr));

        if(this.width >= 20 && this.height >= 20){
            this.#generate();
        }
    }

    getVertices(){
        return this.#vertices;
    }

    toJSON() {
        var vertices = [];
        for (let i = 0; i < this.#vertices.length; i++) {
            const vertice = this.#vertices[i];
            vertices.push(vertice.toJSON());
        }

        return { "vertices": vertices, "width": this.width, "height": this.height };
    }

    #generate() {
        this.#buffer.beginShape();
        for (let i = 0; i < this.#vertices.length; i++) {
            this.#buffer.vertex(this.#vertices[i].x, this.#vertices[i].y);
        }
        this.#buffer.vertex(this.#vertices[0].x, this.#vertices[0].y);
        var rgba = this.#color.rgba();
        this.#buffer.fill(rgba.r, rgba.g, rgba.b, rgba.a);
        this.#buffer.endShape();
    }
}