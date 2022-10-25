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
        return new Vector2((this.position.x - rect.left), (this.position.y - rect.top));
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
        this.offset = new Vector2(-Settings.mapSizeX / 8, -Settings.mapSizeY / 8);
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
            
            if (Math.round((this.zoom + zoom) * 100) / 100 < 0.50) { return; }
            if (Math.round((this.zoom + zoom) * 100) / 100 > 1.50) { return; }

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
        circle(pos.x, pos.y, 10);
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
        this.offset.minMax(new Vector2(-Settings.mapSizeX, -Settings.mapSizeY), new Vector2(Settings.mapSizeX, Settings.mapSizeY));
    }
}