export default class EditingTool {
    vertices = [];

    // Private
    #state = "Ready";
    #type = 0;
    #shape = null;
    #originalShowData = false;
    #verticeIndex = -1;
    #colors = [];
    #margin = 0;

    // Core
    #renderer = null;
    #cursor = null;
    #callStart = null;
    #callEnd = null;
    #callCancel = null;
    
    #dropdown = null;
    #dropdownMenu = null;
    #editButton = null;
    #addButton = null;
    #removeButton = null;

    constructor(renderer, cursor, margin){
        this.#renderer = renderer;
        this.#cursor = cursor;
        this.#margin = margin;

        this.#dropdown = document.getElementById("editingTool");
        this.#dropdownMenu = document.getElementById("editingTool-dropdown");
        this.#editButton = document.getElementById("editingToolEdit");
        this.#addButton = document.getElementById("editingToolAdd");
        this.#removeButton = document.getElementById("editingToolRemove");

        this.#editButton.addEventListener('click', () => { this.start(0); });
        this.#addButton.addEventListener('click', () => { this.start(1); });
        this.#removeButton.addEventListener('click', () => { this.start(2); });

        this.#callCancel = () => { this.cancel(); };

        this.#cursor.addOnClick(() => {
            if(this.#state != "Editing"){return;}

            var offset = this.#cursor.getOffset();
            var pos = this.#cursor.position;

            //find target shape
            var shapes = this.#renderer.getAll();
            var keys = Object.keys(shapes);
            var found = null;

            for (let i = 0; i < keys.length; i++) {
                const shape = shapes[keys[i]];

                if (polygonPoint(shape.vertices, pos.x - offset.x - (margin / 2), pos.y - offset.y - (margin / 2))) {
                    found = shape;
                }
            }

            if (found) {
                if (this.#shape != null) {
                    this.#shape.showData = this.#originalShowData;
                    this.#shape.generate();
                }
                this.#shape = found;

                this.#originalShowData = this.#shape.showData;
                this.#shape.showData = true;
                this.#shape.generate();
            }
            else {
                if (this.#shape != null) {
                    this.#shape.showData = this.#originalShowData;
                    this.#shape.generate();
                }
                this.#shape = null;
            }
        });
        
        this.#cursor.addOnDragStart(() => {
            if (this.#shape == null) { return; }
            
            var pos = this.#cursor.position;
            var offset = this.#cursor.getOffset();
            
            //find vertice
            this.#verticeIndex = -1;
            for (let i = 0; i < this.#shape.vertices.length; i++) {
                const vertice = this.#shape.vertices[i];
                
                var dist = vertice.distance(new Vector2(pos.x - offset.x - (margin / 2), pos.y - offset.y - (margin / 2)));
                
                if (dist < 10) {
                    this.#verticeIndex = i;

                    if(this.#type == 1){
                        //Add vertice between current and next
                    }
                    else if(this.#type == 2){
                        //Remove current vertice
                    }
                    break;
                }
            }
        });
        
        this.#cursor.addOnDragUpdate(()=>{
            if (this.#shape == null || this.#verticeIndex == -1){ return; }
            
            var pos = this.#cursor.fromGrid();
            var offset = this.#cursor.getOffset();
            
            this.#shape.vertices[this.#verticeIndex] = new Vector2(pos.x - offset.x - (margin / 2), pos.y - offset.y - (margin / 2));
            this.#shape.generate();
        });
        
        this.#cursor.addOnDragEnd(() => {
            if (this.#shape == null || this.#verticeIndex == -1) { return; }
            this.#verticeIndex = -1;
        });
    }

    start(type){
        if(window.activeTool != null){ window.activeTool.cancel(); }
        this.#state = "Editing";
        this.#type = type;

        this.#dropdownMenu.classList.remove("show");
        this.#dropdown.classList.add("active");
        this.#dropdown.addEventListener('click', this.#callCancel);
        window.activeTool = this;
    }

    update(){
        if(this.#shape != null){
            var offset = this.#cursor.getOffset();
            var vertices = this.#shape.vertices;
            for (let i = 0; i < vertices.length; i++) {
                const v = vertices[i];
                
                fill(0, 0, 255);
                circle(v.x + offset.x + (margin / 2), v.y + offset.y + (margin / 2), 10);
            }
        }
    }

    end(){
        this.cancel();
    }

    cancel(){
        this.#state = "Ready";
        this.#shape = null;

        this.#dropdownMenu.classList.remove("show");
        this.#dropdown.classList.remove("active");
        this.#dropdown.removeEventListener('click', this.#callCancel);
        window.activeTool = null;
    }
}
  