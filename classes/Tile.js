import Color from "./Color";
import Vector2 from "./Vector2";

export default class Tile {
    width = 0;
    height = 0;
    pos = null;
    isDummy = false;
    isVent = false;
    
    #buffer = null;
    #vertices = [];
    #color = null;

    constructor(vertices = [], buffer = null, isDummy = false, isVent = false) {
        this.#buffer = buffer;
        this.#vertices = vertices;
        this.width = 0;
        this.height = 0;
        this.pos = this.#vertices[0];
        this.isDummy = isDummy;
        this.isVent = isVent;

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
        
        if (this.width >= 20 && this.height >= 20) {
            if (buffer == null) {
                this.#buffer = createGraphics(this.width, this.height);
            }

            //this.#generate();
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

        return { "vertices": vertices, "width": this.width, "height": this.height, "isDummy": this.isDummy, "isVent": this.isVent };
    }

    #generate() {
        this.#buffer.beginShape();
        for (let i = 0; i < this.#vertices.length; i++) {
            this.#buffer.vertex(this.#vertices[i].x, this.#vertices[i].y);
        }
        this.#buffer.vertex(this.#vertices[0].x, this.#vertices[0].y);

        this.#buffer.push();
        var rgba = this.#color.rgba();
        this.#buffer.fill(rgba.r, rgba.g, rgba.b, rgba.a);
        this.#buffer.endShape();
        this.#buffer.pop();

        if (this.isVent) {
            const xArr = this.#vertices.map(a => a.x);
            const yArr = this.#vertices.map(a => a.y);
            var pos = new Vector2(Math.min(...xArr) + (this.height / 2) - 10, Math.min(...yArr) + (this.height / 2) + 8);

            this.#buffer.push();
            this.#buffer.fill(255, 0, 0);
            this.#buffer.textSize(25);
            this.#buffer.text("Vent", pos.x, pos.y);
            this.#buffer.pop();
        }
    }

    getBoundingBox() {
        const xArr = this.#vertices.map(a => a.x);
        const yArr = this.#vertices.map(a => a.y);
        const width = (Math.max(...xArr) - Math.min(...xArr));
        const height = (Math.max(...yArr) - Math.min(...yArr));
        return {
            "x": this.pos,
            "y": this.pos,
            "w": width,
            "h": height
        };
    }

    toggleVent(){
        this.isVent = !this.isVent;
        this.#generate();
    }
}