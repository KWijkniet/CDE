export default class Cursor {
    static instance = null;

    //public
    position = null;
    onClick = null;
    onDragStart = null;
    onDragUpdate = null;
    onDragEnd = null;
    onScroll = null;
    diff = null;

    //private
    #mousedown = false;
    #mousemoved = false;
    #lastPos = null;
    #offset = null;
    #zoom = 1;

    constructor(){
        this.position = new Vector2(0, 0);

        this.onClick = document.createEvent("Event");
        this.onClick.initEvent("cClick", true, true);

        this.onDragStart = document.createEvent("Event");
        this.onDragStart.initEvent("cDragStart", true, true);

        this.onDragUpdate = document.createEvent("Event");
        this.onDragUpdate.initEvent("cDragUpdate", true, true);
        
        this.onDragEnd = document.createEvent("Event");
        this.onDragEnd.initEvent("cDragEnd", true, true);
        
        this.onScroll = document.createEvent("Event");
        this.onScroll.initEvent("cOnScroll", true, true);

        this.#offset = new Vector2(0,0);
        this.#lastPos = new Vector2(0, 0);

        document.addEventListener('mousemove', (event) => { this.#event(event, 'mousemove'); });
        document.addEventListener('mousedown', (event) => { this.#event(event, 'mousedown'); });
        document.addEventListener('mouseup', (event) => { this.#event(event, 'mouseup'); });

        document.addEventListener('touchmove', (event) => { this.#event(event, 'mousemove') });
        document.addEventListener('touchstart', (event) => { this.#event(event, 'mousedown') });
        document.addEventListener('touchend', (event) => { this.#event(event, 'mouseup') });

        document.addEventListener('mousewheel', (event) => { this.#scrollEvent(event); });

        Cursor.instance = this;
    }

    // Private Methods

    // Based on received events determine if it was a drag or click
    #event(e, type){
        if(type == 'mousemove'){
            this.position.x = e.clientX;
            this.position.y = e.clientY;

            if(this.#mousedown){
                this.diff = null;
                if(!this.#mousemoved){
                    //start of drag
                    this.#drag(e, "start");
                }
                else{
                    this.#drag(e, "update");
                }
                this.#mousemoved = true;
            }
            else{
                if(this.#mousemoved){
                    //end of drag
                    this.#drag(e, "end");
                }
                this.#mousemoved = false;
            }
        }
        else if(type == 'mousedown'){
            this.#mousedown = true;
        }
        else if(type == 'mouseup'){
            this.#mousedown = false;

            if(!this.#mousemoved){
                this.#click(e);
            }else if(this.diff == null && window.activeTool != null && window.activeTool.constructor.name == "DrawingTool"){
                this.#click(e);
            }
        }
    }

    #click(e){
        if(e.target.tagName == "CANVAS"){
            document.dispatchEvent(this.onClick);
        }
    }

    #drag(e, type){
        var newPos = null;
        if(type == "start"){
            newPos = this.fromGrid();
            this.#lastPos = new Vector2(newPos.x, newPos.y);
            document.dispatchEvent(this.onDragStart);
        }
        else if(type == "update"){
            newPos = this.fromGrid();
            this.diff = new Vector2(newPos.x - this.#lastPos.x, newPos.y - this.#lastPos.y);
            document.dispatchEvent(this.onDragUpdate);
        }
        else if (type == "end") {
            document.dispatchEvent(this.onDragEnd);
        }

        if(e.target.tagName == "CANVAS"){
            if(e.shiftKey && this.diff != null && newPos != null){
                this.#offset.add(this.diff).minMax(new Vector2(-Settings.bonusSize, -Settings.bonusSize), new Vector2(Settings.bonusSize, Settings.bonusSize));
                this.#lastPos = new Vector2(newPos.x, newPos.y);
            }
            else{
                this.diff = null;
            }
        }
    }

    #scrollEvent(e){
        this.#zoom -= e.deltaY / 1000;
        if(this.#zoom < 0.5){ this.#zoom = 0.5; }
        else if(this.#zoom > 5){ this.#zoom = 5; }
    }

    // Public Methods

    fromGrid(){
        var x = Math.round(this.position.x / Settings.gridSize) * Settings.gridSize;
        var y = Math.round(this.position.y / Settings.gridSize) * Settings.gridSize;

        return new Vector2(x, y);
    }

    getOffset(){
        return this.#offset;
    }

    getZoom(){
        return this.#zoom;
    }

    resetOffset(){
        this.#offset = Vector2.zero();
    }

    addOnClick(func){
        document.addEventListener("cClick", func, false);
    }

    addOnDragStart(func) {
        document.addEventListener("cDragStart", func, false);
    }

    addOnDragUpdate(func) {
        document.addEventListener("cDragUpdate", func, false);
    }

    addOnDragEnd(func) {
        document.addEventListener("cDragEnd", func, false);
    }

    addOnScroll(func) {
        document.addEventListener("cOnScroll", func, false);
    }
}
