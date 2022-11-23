import Vector2 from "./Vector2";
import Collision from "./Collision";
import Shape from "./Shape";
import Action from "./Action";

export default class DrawingTool {
    isEnabled = false;

    canAdd = true;
    canDelete = true;
    canInsert = true;
    canMove = true;

    #buffer = null;
    #points = [];
    #selectedPointIndex = null;

    #dragOldPos = null;
    #originalShape = null;

    constructor() {
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        
        document.addEventListener('keyup', (event) => {
            if (this.#points.length > 0 && event.key == "Escape") {
                this.setData([]);
            }
        });

        var cursor = Cursor.get();
        cursor.events.subscribe('click', (e) => {
            if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3){return;}
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
            if (this.isEnabled && this.canMove) {
                var cursor = Cursor.get();
                var pos = cursor.local().remove(cursor.offset);
                pos.x /= Settings.zoom;
                pos.y /= Settings.zoom;
                if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }

                this.#selectedPointIndex = null;
                for (let i = 0; i < this.#points.length; i++) {
                    const point = this.#points[i];
                    const dist = Vector2.distance(pos, point);

                    if (dist <= Settings.cursorSize) {
                        this.#selectedPointIndex = i;
                        this.#dragOldPos = point.getCopy();
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
                    var oldPos = this.#dragOldPos.getCopy();
                    var index = this.#selectedPointIndex;
                    var action = new Action("Moved Coordinates",
                        () => { this.#points[index] = oldPos; this.#generate(); },
                        () => { this.#points[index] = newPos; this.#generate(); }
                    );
                    History.add(action);
                }

                this.#selectedPointIndex = null;
                Cursor.disableOffset = false;
            }
        });
    }

    update() {
        this.#generate();
        image(this.#buffer, 0, 0);
    }

    enable() {
        var action = new Action("Enabled Drawing tool",
            () => { this.isEnabled = false; this.#originalShape = null; this.#dragOldPos = null; }, //disable
            () => { this.isEnabled = true; this.#originalShape = null; this.#dragOldPos = null;  }
        );
        History.add(action);
        action.redo();
    }

    disable() {
        var points = Vector2.copyAll(this.#points);
        var action = new Action("Disable Drawing tool",
            () => { this.isEnabled = true; this.#originalShape = null; this.#dragOldPos = null; this.#points = points; this.#generate(); }, //enable
            () => { this.isEnabled = false; this.#originalShape = null; this.#dragOldPos = null; this.#points = []; this.#generate(); }
        );
        History.add(action);
        action.redo();
    }

    setData(points){
        this.#points = points;
        this.#generate();
    }

    #onPlace(e){
        var cursor = Cursor.get();
        var pos = cursor.local().remove(cursor.offset);
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
                    
                    if (this.canDelete) {
                        var original = Vector2.copyAll(this.#points);
                        var tmp = Vector2.copyAll(this.#points);
                        tmp.splice(i, 1);

                        //create history entree
                        var action = new Action("Deleted Coordinates",
                            () => { this.#points = original; this.#generate(); },
                            () => { this.#points = tmp; this.#generate(); }
                        );
                        History.add(action);

                        //delete point
                        action.redo();
                    }
                    break;
                }
                else if(this.#points.length > 1){
                    hasFound = true;
                    var shape = new Shape(this.#points, Settings.shapeAllowed);
                    var points = Vector2.copyAll(this.#points);

                    //create history entree
                    var action = new Action("Created Shape",
                        () => { Renderer.instance.remove(shape); this.#points = points; this.#generate(); },
                        () => { Renderer.instance.add(shape); this.#points = []; this.#buffer.clear(); }
                    );
                    History.add(action);

                    //complete shape
                    action.redo();[]
                    return;
                }
                else {
                    var points = Vector2.copyAll(this.#points);
                    //create history entree
                    var action = new Action("Deleted Shape",
                        () => { this.#points = points; this.#generate(); },
                        () => { this.#points = []; this.#buffer.clear(); this.#generate(); }
                    );
                    History.add(action);

                    //delete shape
                    action.redo();
                    return;
                }
            }
        }

        if(!hasFound){
            var realPos = cursor.local().remove(cursor.offset);
            //check collision between points
            for (let i = 0; i < this.#points.length; i++) {
                const next = this.#points[i + 1 < this.#points.length - 1 ? i + 1 : 0];
                const prev = this.#points[i];

                //colliding with a line
                if (Collision.linePoint(next.x, next.y, prev.x, prev.y, realPos.x, realPos.y)) {
                    hasFound = true;

                    if (this.canInsert) {
                        //create history entree
                        var action = new Action("Inserted Coordinates",
                            () => { this.#points.splice(i + 1, 1); this.#generate(); },
                            () => { this.#points.splice(i + 1, 0, pos); this.#generate(); }
                        );
                        History.add(action);

                        //add point in between
                        action.redo();
                    }

                    break;
                }
            }

            if (!hasFound) {
                if(this.#originalShape == null){
                    if (this.canAdd) {
                        var action = new Action("Added Coordinates",
                            () => { this.#points.splice(this.#points.length - 1, 1); this.#generate(); },
                            () => { this.#points.push(pos); this.#generate(); }
                        );
                        History.add(action);

                        //add
                        action.redo();
                    }
                }
                else{
                    //update shape
                }
            }
        }
    }

    #onDrag(e){
        var cursor = Cursor.get();
        var pos = cursor.local().remove(cursor.offset);
        pos.x /= Settings.zoom;
        pos.y /= Settings.zoom;
        if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }
        var oldPos = this.#points[this.#selectedPointIndex];
        if (!oldPos || !point) { return; }

        this.#points[this.#selectedPointIndex] = Cursor.toGrid(pos);
        if (!oldPos.equals(this.#points[this.#selectedPointIndex])){
            this.#generate();
        }
    }

    #generate(){
        this.#buffer.clear();
        this.#buffer.translate(0);
        this.#buffer.scale(1);

        //draw lines between points
        for (let i = 1; i < this.#points.length; i++) {
            const p1 = this.#points[i];
            const p2 = this.#points[i - 1 >= 0 ? i - 1 : this.#points.length - 1];

            //draw line
            this.#buffer.line(p1.x, p1.y, p2.x, p2.y);
        }

        //line from last coordinate to cursor
        if (this.#points.length >= 1 && this.canAdd) {
            var cursor = Cursor.get();
            var pos = cursor.local().remove(cursor.offset);
            pos.x /= Settings.zoom;
            pos.y /= Settings.zoom;
            pos = Cursor.toGrid(pos);
            var lastPos = this.#points[this.#points.length - 1];

            this.#buffer.push();
            this.#buffer.line(lastPos.x, lastPos.y, pos.x, pos.y);
            this.#buffer.fill(255, 0, 0);
            this.#buffer.circle(pos.x, pos.y, 5);

            var dist = Vector2.distance(lastPos, pos) * 10;
            this.#buffer.fill(0);
            this.#buffer.text(dist.toFixed("0") + " mm", pos.x, pos.y + 30);
            this.#buffer.pop();
        }

        //draw circles on each coordinate
        for (let i = 0; i < this.#points.length; i++) {
            const p1 = this.#points[i];

            //draw point
            this.#buffer.circle(p1.x, p1.y, 10);
            if (i == 0) {
                this.#buffer.push();
                this.#buffer.fill(255, 0, 0);
                this.#buffer.circle(p1.x, p1.y, 5);
                this.#buffer.pop();
            }
        }

        //show distances
        if (this.#points.length >= 2) {
            for (let i = 1; i < this.#points.length; i++) {
                const p1 = this.#points[i];
                const p2 = this.#points[i - 1 >= 0 ? i - 1 : this.#points.length - 1];

                var dist = Vector2.distance(p1, p2) * 10;
                var textPos = p1.getCopy().add(p2).devide(new Vector2(2, 2));

                //draw text
                this.#buffer.text(dist.toFixed("0") + " mm", textPos.x, textPos.y);
            }
        }
    }
}