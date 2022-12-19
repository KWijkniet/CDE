import Vector2 from "./Vector2";
import EventSystem from "./EventSystem";

export default class Cursor{
    static disableOffset = false;
    static get = () => { return null; };
    static toGrid = (pos) => { var size = Settings.gridSizeS; return new Vector2(Math.round(pos.x / size) * size, Math.round(pos.y / size) * size); };
    
    events = null;
    position = null;
    offset = null;
    
    isDisabled = false;

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

    constructor() {
        Cursor.get = () => { return this; };
        this.events = new EventSystem(['click', 'dragStart', 'dragMove', 'dragEnd', 'scroll']);
        this.position = Vector2.zero();
        this.#lastPos = Vector2.zero();
        this.#diff = Vector2.zero();
        this.resetOffset();

        //Track mouse position
        Settings.getCanvas().elt.addEventListener('mousemove', (e) => { this.position = new Vector2(e.clientX, e.clientY); });
        
        //Mouse based
        Settings.getCanvas().elt.addEventListener('mousemove', (event) => { this.#event(event, 'mousemove'); });
        Settings.getCanvas().elt.addEventListener('mousedown', (event) => { this.#event(event, 'mousedown'); });
        Settings.getCanvas().elt.addEventListener('mouseup', (event) => { this.#event(event, 'mouseup'); });

        //Touch based
        Settings.getCanvas().elt.addEventListener('touchmove', (event) => { this.#event(event, 'mousemove') });
        Settings.getCanvas().elt.addEventListener('touchstart', (event) => { this.#event(event, 'mousedown') });
        Settings.getCanvas().elt.addEventListener('touchend', (event) => { this.#event(event, 'mouseup') });

        Settings.getCanvas().elt.addEventListener('wheel', (event) => { this.events.invoke('scroll', event); });
        this.events.subscribe('scroll', (e) => {
            if (this.isDisabled) { this.#checkBounds(); return; }
            const {x, y, deltaY} = e.detail;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.05;
            const zoom = 1 * direction * factor;

            if (Math.round((Settings.zoom + zoom) * 100) / 100 < 0.50) { return; }
            if (Math.round((Settings.zoom + zoom) * 100) / 100 > 1.50) { return; }

            const wx = (x - this.offset.x) / (width * Settings.zoom);
            const wy = (y - this.offset.y) / (height * Settings.zoom);

            this.offset.x -= wx * width * zoom;
            this.offset.y -= wy * height * zoom;
            Settings.zoom += zoom;

            this.#checkBounds();
        });
    }

    update() {}

    resetOffset(){
        this.offset = new Vector2(-Settings.mapSizeX / 8, -Settings.mapSizeY / 8);
    }

    #event(e, type) {
        if (this.isDisabled) { return; }
        var newPos = this.local();
        if(type == 'mousemove'){
            if (this.#mousedown && !this.#mousemoved){
                this.#lastPos = Vector2.copy(newPos);
                this.#mousemoved = true;
                this.events.invoke('dragStart', e);
            }

            if(this.#mousedown && this.#mousemoved){
                //drag
                if (!Cursor.disableOffset) {
                    this.#diff = Vector2.remove(newPos, this.#lastPos);
                    this.offset.add(this.#diff);

                    this.#checkBounds();
                    this.#lastPos = Vector2.copy(newPos);
                }
                this.events.invoke('dragMove', e);
            }
        }
        else if(type == 'mousedown'){
            this.#mousemoved = false;
            this.#mousedown = true;
        }
        else if(type == 'mouseup'){
            if(this.#mousemoved){
                this.events.invoke('dragEnd', e);
            }
            else{
                this.events.invoke('click', e);
            }

            this.#mousemoved = false;
            this.#mousedown = false;
        }
    }

    #checkBounds(){
        this.offset.minMax(new Vector2(-Settings.mapSizeX, -Settings.mapSizeY), new Vector2(Settings.mapSizeX, Settings.mapSizeY));
    }
}