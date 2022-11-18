import Color from "./Color";
import Vector2 from "./Vector2";

export default class Shape {
    id = null;
    color = null;
    showData = false;
    isAllowed = true;

    #vertices = null;
    #shapebuffer = null;
    #textBuffer = null;
    #pos = null;

    constructor(vertices = [], color = new Color(null, 255, 255, 255), id = null) {
        this.id = id;
        this.color = color;
        this.showData = true;
        this.isAllowed = true;

        if(this.id == null){
            this.id = this.#generateUniqSerial();
        }
        this.#vertices = vertices;
        this.#generate();
    }

    update() {
        image(this.#shapebuffer, this.#pos.x, this.#pos.y);
    }
    updateText() {
        if(!this.showData) { return; }
        image(this.#textBuffer, this.#pos.x, this.#pos.y);
    }

    getId(){
        return this.#shapebuffer.canvas.id.split("_")[1];
    }

    getVertices(){
        return this.#vertices;
    }

    clone() {
        // var copy = [];
        // for (let i = 0; i < this.#vertices.length; i++) {
        //     const vertice = this.#vertices[i];
        //     copy.push(Vector2.copy(vertice));
        // }
        return new Shape(Vector2.copyAll(this.#vertices), this.color, this.id);
    }

    redraw(vertices = [], color = new Color(null, 255, 255, 255)){
        if(this.#shapebuffer != null){
            this.#shapebuffer.clear();
            this.#shapebuffer.elt.parentNode.removeChild(this.#shapebuffer.elt);
            this.#shapebuffer = null;
            this.#textBuffer.clear();
            this.#textBuffer.elt.parentNode.removeChild(this.#textBuffer.elt);
            this.#textBuffer = null;
        }
        
        this.#vertices = vertices;
        this.color = color;
        this.#generate();
    }

    #generate = () => {
        const xArr = this.#vertices.map(a => a.x);
        const yArr = this.#vertices.map(a => a.y);
        const width = (Math.max(...xArr) - Math.min(...xArr)) + Settings.bufferMargin;
        const height = (Math.max(...yArr) - Math.min(...yArr)) + Settings.bufferMargin;

        this.#pos = new Vector2(Math.min(...xArr) - (Settings.bufferMargin / 2), Math.min(...yArr) - (Settings.bufferMargin / 2));

        if(this.#shapebuffer == null || this.#textBuffer == null){
            this.#shapebuffer = createGraphics(width, height);
            this.#shapebuffer.canvas.id = "ShapesBufferGraphics_" + this.id;
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
        var next = 0;
        for (let i = 0; i < this.#vertices.length; i++) {
            next = i + 1;
            if (next >= this.#vertices.length) {
                next = 0;
            }
            const v1 = this.#vertices[i];
            const v2 = this.#vertices[next];

            var pos = v1.getCopy().add(v2).devide(new Vector2(2, 2));
            pos.remove(this.#pos);

            var dist = (Vector2.distance(v1, v2) * 10).toFixed("0");
            this.#textBuffer.fill(0);
            this.#textBuffer.textSize(12);
            this.#textBuffer.text(dist + ' mm', pos.x - ((dist + "").length * 6), pos.y);
        }
    };

    #generateUniqSerial = () => { return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => { const r = Math.floor(Math.random() * 16); return r.toString(16); }); };
}