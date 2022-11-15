import Color from "./Color";
import Vector2 from "./Vector2";

export default class Shape {
    #vertices = null;
    #shapebuffer = null;
    #textBuffer = null;
    #pos = null;
    #color = null

    constructor(vertices = [], color = new Color(null, 255, 255, 255)) {
        this.#vertices = vertices;
        this.#color = color;
        this.#generate();
    }

    update() {
        image(this.#shapebuffer, this.#pos.x, this.#pos.y);
    }
    updateText() {
        image(this.#textBuffer, this.#pos.x, this.#pos.y);
    }

    getId(){
        return this.#shapebuffer.canvas.id.split("_")[1];
    }

    getVertices(){
        return this.#vertices;
    }

    #generate = () => {
        const xArr = this.#vertices.map(a => a.x);
        const yArr = this.#vertices.map(a => a.y);
        const width = (Math.max(...xArr) - Math.min(...xArr)) + Settings.bufferMargin;
        const height = (Math.max(...yArr) - Math.min(...yArr)) + Settings.bufferMargin;

        this.#pos = new Vector2(Math.min(...xArr) - (Settings.bufferMargin / 2), Math.min(...yArr) - (Settings.bufferMargin / 2));

        if(this.#shapebuffer == null || this.#textBuffer == null){
            this.#shapebuffer = createGraphics(width, height);
            this.#shapebuffer.canvas.id = "ShapesBufferGraphics_" + this.#generateUniqSerial();
            this.#textBuffer = createGraphics(width, height);
            this.#textBuffer.canvas.id = "TEXT_" + this.#shapebuffer.canvas.id;
        }
        else{
            this.#shapebuffer.clear();
            this.#textBuffer.clear();
        }

        //Generate Shape
        this.#shapebuffer.beginShape();
        for (let i = 0; i < this.#vertices.length; i++) {
            const v = this.#vertices[i];
            this.#shapebuffer.vertex(v.x - this.#pos.x, v.y - this.#pos.y);
        }
        this.#shapebuffer.vertex(this.#vertices[0].x - this.#pos.x, this.#vertices[0].y - this.#pos.y);

        var rgb = Settings.gridBackground.rgb();
        this.#shapebuffer.fill(rgb.r, rgb.g, rgb.b);
        this.#shapebuffer.endShape();

        //Generate Text
    };

    #generateUniqSerial = () => { return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => { const r = Math.floor(Math.random() * 16); return r.toString(16); }); };
}