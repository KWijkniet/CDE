export default class DrawingTool {
    vertices = [];

    // Private
    #state = "Ready";
    #type = 0;
    #colors = [];
    #margin = 0;

    // Core
    #renderer = null;
    #cursor = null;
    #ruler = null;
    #button = null;
    #buttonAllowed = null;
    #buttonForbidden = null;
    #menu = null;
    #callCancel = null;

    constructor(renderer, cursor, margin, colors){
        this.#renderer = renderer;
        this.#cursor = cursor;
        this.#margin = margin;
        this.#colors = colors;
        this.vertices = [];
        this.#ruler = new Ruler();
        this.#button = document.getElementById("drawingTool");
        this.#menu = document.getElementById("drawingTool-dropdown");

        this.#buttonAllowed = document.getElementById("drawingToolAllowed");
        this.#buttonForbidden = document.getElementById("drawingToolForbidden");

        this.#buttonAllowed.addEventListener('click', () => { this.start(0); });
        this.#buttonForbidden.addEventListener('click', () => { this.start(1); });

        this.#callCancel = () => { this.cancel(); };

        this.#cursor.addOnClick(() => {
            if(this.#state == "Drawing"){
                var res = this.newVertice();
                if(res != null){
                    this.#renderer.add(res);
                }
            }
        });

        document.addEventListener('keyup', (event) => {
            if(this.#state == "Drawing" && event.key == "Escape"){
                if(this.vertices.length <= 0){
                    this.cancel();
                }
                else{
                    this.end();
                }
            }
        });
    }

    start(type){
        if(window.activeTool != null){ window.activeTool.cancel(); }
        this.#state = "Drawing";
        this.#type = type;
        this.#ruler.update(null, null);
        this.#button.addEventListener('click', this.#callCancel);
        this.#button.classList.add("active");
        this.#menu.classList.remove("show");
        window.activeTool = this;
    }

    update(){
        if(this.#state == "Drawing"){
            var offset = this.#cursor.getOffset();
            this.#ruler.draw();

            var next = 0;
            var hasNext = true;
            for (let i = 0; i < this.vertices.length; i++) {
                next = i + 1;
                if(next >= this.vertices.length){
                    next = 0;
                    hasNext = false;
                }
        
                const cc = this.vertices[i];
                const nc = this.vertices[next];
                
                noStroke();
                fill(100,100,100);
                circle(cc.x + offset.x, cc.y + offset.y, 20);
                stroke(0);

                if(hasNext){
                    stroke(100, 100, 100);
                    line(cc.x + offset.x, cc.y + offset.y, nc.x + offset.x, nc.y + offset.y);
                    stroke(0,0,0);
                }
            }
    
            if(this.vertices.length > 0){
                this.#ruler.update(this.vertices[this.vertices.length - 1].addNew(offset), this.#cursor.fromGrid(), this.#cursor.fromGrid().addNew(new Vector2(0, 20)));
            }

            var pos = this.#cursor.fromGrid();
            noStroke();
            fill(179, 0, 0);
            circle(pos.x, pos.y, 10);
            stroke(0);
        }
    }

    newVertice(){
        var offset = this.#cursor.getOffset();
        var pos = new Vector2(this.#cursor.fromGrid().x - offset.x, this.#cursor.fromGrid().y - offset.y);
        if(this.vertices.length > 0 && pos.equals(this.vertices[0])){
            return this.end();
        }

        this.vertices.push(pos);
        return null;
    }

    end(){
        var shape = null;
        if(this.vertices.length > 0){
            for (let i = 0; i < this.vertices.length; i++) {
                const coord = this.vertices[i];
                
                coord.x -= this.#margin / 2;
                coord.y -= this.#margin / 2;
            }
    
            shape = new Shape(this.#cursor, this.vertices, this.#colors[this.#type], (this.#type == 0 ? true : false), (this.#type == 0 ? true : false));
        }

        this.cancel();
        this.start(this.#type);
        return shape;
    }

    cancel(){
        this.#button.removeEventListener('click', this.#callCancel);
        this.#button.classList.remove("active");
        this.#menu.classList.remove("show");

        window.activeTool = null;

        this.#state = "Ready";
        this.vertices = [];
        this.#ruler.update(null, null);
        this.#ruler.draw();
    }
}
  