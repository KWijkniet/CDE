import Vector2 from "./Vector2";
import EventSystem from "./EventSystem";

export default class Cursor{
    static get = () => { return null; };
    static toGrid = (pos) => { return new Vector2(Math.round(pos.x / Settings.gridSize) * Settings.gridSize, Math.round(pos.y / Settings.gridSize) * Settings.gridSize); };
    
    events = null;
    position = null;
    
    zoom = 1;
    offset = null;

    #mousedown = false;
    #mousemoved = false;
    #lastPos = null;
    #diff = null;

    local = () => {
        var rect = Settings.getCanvas().elt.getBoundingClientRect();
        return new Vector2(this.position.x - rect.left, this.position.y - rect.top);
    };
    global = () => {
        var x = window.pageXOffset + Settings.getCanvas().elt.getBoundingClientRect().left;
        var y = window.pageYOffset + Settings.getCanvas().elt.getBoundingClientRect().top;

        var pos = this.local();
        return new Vector2(x + pos.x, y + pos.y);
    };

    constructor(){
        Cursor.get = () => { return this; };
        this.events = new EventSystem(['click', 'dragStart', 'dragMove', 'dragEnd', 'scroll']);
        this.position = Vector2.zero();
        this.offset = Vector2.zero();
        this.#lastPos = Vector2.zero();
        this.#diff = Vector2.zero();

        //Track mouse position
        document.addEventListener('mousemove', (e) => { this.position = new Vector2(e.clientX, e.clientY); });
        
        //Mouse based
        document.addEventListener('mousemove', (event) => { this.#event(event, 'mousemove'); });
        document.addEventListener('mousedown', (event) => { this.#event(event, 'mousedown'); });
        document.addEventListener('mouseup', (event) => { this.#event(event, 'mouseup'); });

        //Touch based
        document.addEventListener('touchmove', (event) => { this.#event(event, 'mousemove') });
        document.addEventListener('touchstart', (event) => { this.#event(event, 'mousedown') });
        document.addEventListener('touchend', (event) => { this.#event(event, 'mouseup') });

        document.addEventListener('wheel', (event) => { this.events.invoke('scroll', event); });
        this.events.subscribe('scroll', (e) => {
            const {x, y, deltaY} = e.detail;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.05;
            const zoom = 1 * direction * factor;
            
            if(this.zoom + zoom < 0.5) { return; }
            if(this.zoom + zoom > 1.5) { return; }

            const wx = (x-this.offset.x)/(width*this.zoom);
            const wy = (y-this.offset.y)/(height*this.zoom);
            
            this.offset.x -= wx*width*zoom;
            this.offset.y -= wy*height*zoom;
            this.zoom += zoom;

            this.#checkBounds();
        });
    }

    update(){
        var pos = this.local();

        // translate(visualViewport.width / 2 + this.local().x, visualViewport.height / 2 + this.local().y);
        // scale(this.zoom);
        circle(pos.x / this.zoom, pos.y / this.zoom, 10);
    }

    #event(e, type) {
        var newPos = this.local();
        if(type == 'mousemove'){
            if(!this.#mousemoved){
                this.#lastPos = Vector2.copy(newPos);
                this.#mousemoved = true;
            }

            if(this.#mousedown && this.#mousemoved){
                //drag
                this.#diff = Vector2.remove(newPos, this.#lastPos);
                this.offset.add(this.#diff);

                this.#checkBounds();
                this.#lastPos = Vector2.copy(newPos);
            }
        }
        else if(type == 'mousedown'){
            this.#mousemoved = false;
            this.#mousedown = true;
        }
        else if(type == 'mouseup'){
            this.#mousemoved = false;
            this.#mousedown = false;
        }
    }

    #checkBounds(){

        var x = visualViewport.width / this.zoom + this.offset.x;
        console.log(x);

        // if(visualViewport.width >= Settings.mapSizeX * this.zoom){
        //     this.offset.x = 0;
        //     // this.offset.x = Settings.mapSizeX * this.zoom;
        // }
        // if(visualViewport.height >= Settings.mapSizeY * this.zoom){
        //     this.offset.y = 0;
        //     // this.offset.y = Settings.mapSizeY * this.zoom;
        // }

        // var width = visualViewport.width >= (Settings.mapSizeX * this.zoom) ? (Settings.mapSizeX * this.zoom) / 2 : (Settings.mapSizeX * this.zoom) - (Settings.mapSizeX / 2);
        // var height = visualViewport.height >= (Settings.mapSizeY * this.zoom) ? (Settings.mapSizeX * this.zoom) / 2 : (Settings.mapSizeY * this.zoom) - (Settings.mapSizeY / 2);

        var width = visualViewport.width >= (Settings.mapSizeX * this.zoom) ? 0 : (Settings.mapSizeX * this.zoom) - visualViewport.width;
        var height = visualViewport.height >= (Settings.mapSizeY * this.zoom) ? 0 : (Settings.mapSizeY * this.zoom) - visualViewport.height;
        
        // console.log(width, height);
        this.offset.minMax(new Vector2(-width, -height), new Vector2(width, height));
        // console.log(this.offset);

        // var xs = visualViewport.pageLeft - this.offset.x / this.zoom;
        // var xe = visualViewport.pageLeft + visualViewport.width - this.offset.x / this.zoom;

        // var ys = visualViewport.pageTop - this.offset.y / this.zoom;
        // var ye = visualViewport.pageTop + visualViewport.height - this.offset.y / this.zoom;
        // console.log(xs, xe, ys, ye);

        // // console.log(xs, this.offset.x);
        // if(xs < 0 && this.offset.x > 0){
        //     this.offset.x = 0;
        //     console.log("Left bound reached");
        // }
        // else if(xe > Settings.mapSizeX && this.offset.x < 0){
        //     this.offset.x = 0;
        //     console.log("Right bound reached");
        // }
        // if(ys < 0 && this.offset.y > 0){
        //     this.offset.y = 0;
        //     console.log("Top bound reached");
        // }
        // else if(ye > Settings.mapSizeY && this.offset.y < 0){
        //     this.offset.y = 0;
        //     console.log("Bottom bound reached");
        // }

        // var width = (Settings.mapSizeX * this.zoom) - visualViewport.width;
        // var height = (Settings.mapSizeY * this.zoom) - visualViewport.height;

        // //console.log(-width, width, " <> ", -height, height);
        // if(-width > width){ width = 0; }
        // if(-height > height){ height = 0; }
        // // var minWidth = (-Settings.mapSize + (visualViewport.width / 2)) * this.zoom;
        // // var maxWidth = (Settings.mapSize - (visualViewport.width / 2)) * this.zoom;
        // // var minHeight = (-Settings.mapSize + (visualViewport.height / 2)) * this.zoom;
        // // var maxHeight = (Settings.mapSize - (visualViewport.height / 2)) * this.zoom;

        // this.offset.minMax(new Vector2(-width, -height), new Vector2(width, height));
    }
}