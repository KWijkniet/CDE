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
        this.position = new Vector2(0, 0);

        //Track mouse position
        document.addEventListener('mousemove', (e) => { this.position = new Vector2(e.clientX, e.clientY); });
        
        //Mouse based
        document.addEventListener('mousemove', (event) => { this.event(event, 'mousemove'); });
        document.addEventListener('mousedown', (event) => { this.event(event, 'mousedown'); });
        document.addEventListener('mouseup', (event) => { this.event(event, 'mouseup'); });

        //Touch based
        document.addEventListener('touchmove', (event) => { this.event(event, 'mousemove') });
        document.addEventListener('touchstart', (event) => { this.event(event, 'mousedown') });
        document.addEventListener('touchend', (event) => { this.event(event, 'mouseup') });

        document.addEventListener('wheel', (event) => { this.events.invoke('scroll', event); });
        this.events.subscribe('scroll', (e) => {
            this.zoom += e.detail.deltaY / 5000;
            this.zoom = Math.round(this.zoom * 100) / 100;
            
            if(this.zoom < 0.5) { this.zoom = 0.5; }
            if(this.zoom > 1.5) { this.zoom = 1.5; }

            console.log("Zoom: ", this.zoom);
        });
    }

    update(){
        var pos = this.local();

        scale(this.zoom);
        circle(pos.x / this.zoom, pos.y / this.zoom, 10);
    }

    event(e, type) {
        // if (type == 'mousemove') {
        //     if (this.#mousedown) {
        //         if (!this.#mousemoved) {
        //             //start of drag
        //             this.events.invoke('dragStart');
        //         }
        //         else {
        //             this.events.invoke('dragMove');
        //         }
        //         this.#mousemoved = true;
        //     }
        //     else {
        //         if (this.#mousemoved) {
        //             //end of drag
        //             this.events.invoke('dragEnd');
        //         }
        //         this.#mousemoved = false;
        //     }
        // }
        // else if (type == 'mousedown') {
        //     this.#mousedown = true;
        // }
        // else if (type == 'mouseup') {
        //     this.#mousedown = false;

        //     if (!this.#mousemoved) {
        //         this.events.invoke('click');
        //     }
        // }
    }
}