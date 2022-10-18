export default class Shape {
    inputs = {};
    vertices = [];
    color = new Color(255, 255, 255);
    showData = true;
    allowed = true;
    
    //private
    #pos = null;
    #oldPos = null;
    #buffer = null;
    #textBuffer = null;
    #cursor = null;
    #margin = 50;

    constructor(cursor, _vertices, _color = new Color(255, 255, 255), _allowed = true, _showData = true) {
        this.#cursor = cursor;
        this.vertices = _vertices;
        this.color = _color;
        this.allowed = _allowed;
        this.showData = _showData;
        this.#oldPos = _vertices[0];
        this.generate();
    }

    update(){
        var offset = this.#cursor.getOffset();

        image(this.#buffer, this.#pos.x + offset.x + (this.#margin / 2), this.#pos.y + offset.y + (this.#margin / 2));
    }

    updateText() {
        var offset = this.#cursor.getOffset();
        
        image(this.#textBuffer, this.#pos.x + offset.x + (this.#margin / 2), this.#pos.y + offset.y + (this.#margin / 2));
    }

    generate(){
        if (this.#buffer != null){
            this.#buffer.elt.parentNode.removeChild(this.#buffer.elt);
            this.#textBuffer.elt.parentNode.removeChild(this.#textBuffer.elt);
        }

        const xArr = this.vertices.map(a => a.x);
        const yArr = this.vertices.map(a => a.y);
        const width  = (Math.max(...xArr) - Math.min(...xArr)) + this.#margin;
        const height = (Math.max(...yArr) - Math.min(...yArr)) + this.#margin;

        this.#pos = new Vector2(Math.min(...xArr) - (this.#margin / 2), Math.min(...yArr) - (this.#margin / 2));
        
        if (this.#buffer == null) {
            this.#buffer = createGraphics(width, height);
            this.#buffer.canvas.id = "ShapesBufferGraphics_" + this.#generateUniqSerial();
            this.#textBuffer = createGraphics(width, height);
            this.#textBuffer.canvas.id = "TEXT_" + this.#buffer.canvas.id;
        }
        this.generateShape();
        this.generateInfo();
    }

    generateShape(){
        this.#buffer.beginShape();

        for (let i = 0; i < this.vertices.length; i++) {
            const vc = this.vertices[i];
            this.#buffer.vertex(vc.x - this.#pos.x, vc.y - this.#pos.y);
        }
        
        this.#buffer.fill(this.color.r, this.color.g, this.color.b);
        this.#buffer.vertex(this.vertices[0].x - this.#pos.x, this.vertices[0].y - this.#pos.y);
        
        this.#buffer.endShape(CLOSE);
    }

    generateInfo(){
        if(this.showData){
            var next = 0;
            for (let i = 0; i < this.vertices.length; i++) {
                next = i + 1;
                if(next >= this.vertices.length){
                    next = 0;
                }
                const v1 = this.vertices[i];
                const v2 = this.vertices[next];

                var position = v1.addNew(v2).devide(new Vector2(2,2));
                position.remove(this.#pos);
                
                var dist = (v1.distance(v2) * 10).toFixed(0);
                this.#textBuffer.fill(0);
                this.#textBuffer.textSize(12);
                this.#textBuffer.text(dist + ' mm', position.x - ((dist + "").length * 6), position.y);
            }
        }
    }

    #generateUniqSerial(){
        return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => {
            const r = Math.floor(Math.random() * 16);
            return r.toString(16);
        });
    }
}
  