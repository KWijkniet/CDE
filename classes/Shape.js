import Color from "./Color";
import Vector2 from "./Vector2";

export default class Shape {
    id = null;
    color = null;
    showData = false;
    isAllowed = true;
    isGenerated = false;
    lineMargins = null;

    #vertices = null;
    #shapebuffer = null;
    #textBuffer = null;
    #pos = null;

    constructor(vertices = [], color = new Color(null, 255, 255, 255), id = null, isGenerated = false, buffer = null) {
        if(vertices.length <= 0 && id == null){return;}
        this.id = id;
        this.color = color;
        this.showData = true;
        this.isAllowed = true;
        this.isGenerated = isGenerated;
        this.#shapebuffer = buffer;
        this.#textBuffer = buffer;
        
        if(this.id == null){
            this.id = this.#generateUniqSerial();
        }
        this.#vertices = vertices;
        this.lineMargins = [];
        for (let i = 0; i < vertices.length; i++) {
            this.lineMargins.push(null);
        }
        
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
    getBoundingBox(){
        const xArr = this.#vertices.map(a => a.x);
        const yArr = this.#vertices.map(a => a.y);
        const width = (Math.max(...xArr) - Math.min(...xArr));
        const height = (Math.max(...yArr) - Math.min(...yArr));
        return {"x": this.#pos.x + (Settings.bufferMargin / 2), "y": this.#pos.y + (Settings.bufferMargin / 2), "w": width, "h": height};
    }

    clone() {
        return new Shape(Vector2.copyAll(this.#vertices), this.color, this.id);
    }

    redraw() {
        this.#generate();
    }

    reCalculate(vertices = [], color = new Color(null, 255, 255, 255)){
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

    toJSON(){
        var vertices = [];
        for (let i = 0; i < this.#vertices.length; i++) {
            const vertice = this.#vertices[i];
            vertices.push(vertice.toJSON());
        }

        return { "id": this.id, "color": this.color.rgba(), "showData": this.showData, "isAllowed": this.isAllowed, "isGenerated": this.isGenerated, "vertices": vertices, "lineMargins": this.lineMargins, "pos": this.#pos.toJSON() };
    }

    fromJSON(json) {
        this.id = json.id;
        this.color = new Color(null, json.color.r, json.color.g, json.color.b, json.color.a);
        this.showData = json.showData;
        this.isAllowed = json.isAllowed;
        this.isGenerated = json.isGenerated;
        this.lineMargins = json.lineMargins;
        this.#pos = json.pos;

        this.#vertices = [];
        for (let i = 0; i < json.vertices.length; i++) {
            const vertice = json.vertices[i];
            this.#vertices.push(new Vector2(0, 0).fromJSON(vertice));
        }
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

        var rgba = this.color.rgba();
        this.#shapebuffer.fill(rgba.r, rgba.g, rgba.b, rgba.a);
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