import Vector2 from "./Vector2";
import EventSystem from "./EventSystem";

export default class Cursor{
    static toGrid = (pos) => { return new Vector2(Math.round(pos.x / Settings.gridSize) * Settings.gridSize, Math.round(pos.y / Settings.gridSize) * Settings.gridSize); };
    
    events = null;
    position = null;
    
    zoom = 1;
    offset = null;

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
        this.events = new EventSystem(['click', 'dragStart', 'dragMove', 'dragEnd', 'scroll']);
        this.position = new Vector2(0, 0);

        document.addEventListener('mousemove', (e) => { this.position = new Vector2(e.clientX, e.clientY); });
    }

    update(){
        var pos = this.local();
        circle(pos.x, pos.y, 10);
    }
}