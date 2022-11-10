import Vector2 from "./Vector2";
import Collision from "./Collision";
import Shape from "./Shape";
import Color from "./Color";
import Action from "./Action";

export default class DrawingTool {
    isEnabled = false;

    #buffer = null;
    #points = [];
    #selectedPointIndex = null;

    #dragOldPos = null;
    #originalShape = null;

    constructor() {
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);

        var cursor = Cursor.get();
        cursor.events.subscribe('click', (e) => {
            if (e.detail.shiftKey) {
                if (this.isEnabled) { this.disable(); }
                else { this.enable(); }

                return;
            }
            
            if (e.detail.controlKey) {
                if (this.isEnabled) { this.disable(); }
                else {
                    // this.enable();
                    
                    //find target, select target (copy the points), update shape (see #onPlace)
                }

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
                        this.#dragOldPos = this.#points[this.#selectedPointIndex].getCopy();
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
                if(this.#selectedPointIndex != null){
                    var newPos = this.#points[this.#selectedPointIndex].getCopy();
                    var index = this.#selectedPointIndex;
                    var action = new Action(
                        () => { this.#points[index] = this.#dragOldPos; this.#generate(); },
                        () => { this.#points[index] = newPos; this.#generate(); }
                    );
                    History.add(action);
                }

                this.#selectedPointIndex = null;
                Cursor.disableOffset = false;
            }
        });
    }

    update(){
        image(this.#buffer, 0, 0);
    }

    enable() {
        this.isEnabled = true;
        this.#originalShape = null;
        this.#dragOldPos = null;
    }

    disable(){
        this.#originalShape = null;
        this.isEnabled = false;
        this.#dragOldPos = null;
    }

    setData(points){
        this.#points = points;
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
                    hasFound = true;
                    var p = this.#points[i];
                    
                    //create history entree
                    var action = new Action(
                        () => { this.#points.splice(i, 0, p); this.#generate(); },
                        () => { this.#points.splice(i, 1); this.#generate(); }
                    );
                    History.add(action);

                    //delete point
                    action.redo();
                    break;
                }
                else{
                    hasFound = true;
                    var shape = new Shape(this.#points, new Color('--shape-allowed'));
                    var points = this.#points;

                    //create history entree
                    var action = new Action(
                        () => { Renderer.instance.remove(shape); this.#points = points; this.#generate(); },
                        () => { Renderer.instance.add(shape); this.#points = []; this.#buffer.clear(); }
                    );
                    History.add(action);

                    //complete shape
                    action.redo();
                    this.disable();
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

                    //create history entree
                    var action = new Action(
                        () => { this.#points.splice(i, 1); this.#generate(); },
                        () => { this.#points.splice(i, 0, pos); this.#generate(); }
                    );
                    History.add(action);

                    //add point in between
                    action.redo();

                    break;
                }
            }

            if (!hasFound) {
                if(this.#originalShape == null){
                    var action = new Action(
                        () => { this.#points.splice(this.#points.length - 1, 1); this.#generate(); },
                        () => { this.#points.push(pos); this.#generate(); }
                    );
                    History.add(action);
                    
                    //add
                    action.redo();
                }
                else{
                    //update shape
                }
            }
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