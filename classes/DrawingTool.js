import Vector2 from "./Vector2";
import Collision from "./Collision";
import Shape from "./Shape";
import Color from "./Color";

export default class DrawingTool {
    isEnabled = false;

    #buffer = null;
    #points = [];
    #selectedPointIndex = null;

    constructor() {
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);

        var cursor = Cursor.get();
        cursor.events.subscribe('click', (e) => {
            if (e.detail.shiftKey) {
                if (this.isEnabled) { this.disable(); }
                else { this.enable(); }

                return;
            }

            if (this.isEnabled) {
                this.#onPlace(e);
            }
        });

        cursor.events.subscribe('dragStart', (e) => {
            if (this.isEnabled) {
                var cursor = Cursor.get();
                var pos = cursor.global().remove(cursor.offset);
                pos.x /= Settings.zoom;
                pos.y /= Settings.zoom;
                if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }

                this.#selectedPointIndex = null;
                for (let i = 0; i < this.#points.length; i++) {
                    const point = this.#points[i];
                    const dist = Vector2.distance(pos, point);

                    if (dist <= Settings.cursorSize) {
                        this.#selectedPointIndex = i;
                        Cursor.disableOffset = true;
                        break;
                    }
                }
            }
        });

        cursor.events.subscribe('dragMove', (e) => {
            if (this.isEnabled && this.#selectedPointIndex != null) {
                this.#onDrag(e);
            }
        });

        cursor.events.subscribe('dragEnd', (e) => {
            if (this.isEnabled) {
                this.#selectedPointIndex = null;
                Cursor.disableOffset = false;
            }
        });
    }

    update(){
        image(this.#buffer, 0, 0);
    }

    enable(){
        this.isEnabled = true;
        this.#points = [];
    }

    disable(){
        this.isEnabled = false;
    }

    #onPlace(e){
        var cursor = Cursor.get();
        var pos = cursor.global().remove(cursor.offset);
        pos.x /= Settings.zoom;
        pos.y /= Settings.zoom;
        pos = Cursor.toGrid(pos);
        if(pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }
        
        var hasFound = false;
        for (let i = 0; i < this.#points.length; i++) {
            const point = this.#points[i];
            const dist = Vector2.distance(pos, point);

            if (dist <= Settings.cursorSize){
                if(i != 0){
                    //delete point
                    this.#points.splice(i, 1);
                    hasFound = true;
                    this.#generate();
                    break;
                }
                else{
                    //complete shape
                    hasFound = true;
                    Renderer.instance.add(new Shape(this.#points, new Color('--shape-allowed')));
                    this.#points = [];
                    this.#buffer.clear();
                    return;
                }
            }
        }

        if(!hasFound){
            var realPos = cursor.global().remove(cursor.offset);
            //check collision between points
            for (let i = 0; i < this.#points.length; i++) {
                const next = this.#points[i];
                const prev = this.#points[i - 1 >= 0 ? i - 1 : this.#points.length - 1];

                if (Collision.linePoint(next.x, next.y, prev.x, prev.y, realPos.x, realPos.y)) {
                    //Colliding with a line
                    hasFound = true;
                    //add point in between
                    this.#points.splice(i, 0, pos);
                    break;
                }
            }

            if (!hasFound) {
                //add
                this.#points.push(pos);
            }
            this.#generate();
        }
    }

    #onDrag(e){
        var cursor = Cursor.get();
        var pos = cursor.global().remove(cursor.offset);
        pos.x /= Settings.zoom;
        pos.y /= Settings.zoom;
        if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }
        var oldPos = this.#points[this.#selectedPointIndex];
        
        this.#points[this.#selectedPointIndex] = Cursor.toGrid(pos);
        if (!oldPos.equals(pos)){
            this.#generate();
        }
    }

    #generate(){
        this.#buffer.clear();
        this.#buffer.translate(0);
        this.#buffer.scale(1);

        for (let i = 0; i < this.#points.length; i++) {
            const p1 = this.#points[i];
            const p2 = this.#points[i - 1 >= 0 ? i - 1 : this.#points.length - 1];

            //draw line
            if (this.#points.length > 1) {
                this.#buffer.line(p1.x, p1.y, p2.x, p2.y);
            }
        }

        for (let i = 0; i < this.#points.length; i++) {
            const p1 = this.#points[i];
            const p2 = this.#points[i - 1 >= 0 ? i - 1 : this.#points.length - 1];

            //draw point
            this.#buffer.circle(p1.x, p1.y, 10);
        }
    }
}