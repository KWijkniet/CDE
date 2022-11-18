import Vector2 from "./Vector2";
import Collision from "./Collision";
import Action from "./Action";
import Shape from "./Shape";

//Current ToDo:
//- test all undo/redo actions
//- show distances
//- disable texts while editing a shape
//- draw disabled area
//- generation

export default class SelectorTool {
    isEnabled = false;

    #buffer = null;
    #shape = null;
    #selectedPointIndex = null;
    #dragOldPos = null;

    constructor(){
        this.isEnabled = false;
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        
        var cursor = Cursor.get();
        cursor.events.subscribe('click', (e) => {
            var cursor = Cursor.get();
            var pos = cursor.global().remove(cursor.offset);
            pos.x /= Settings.zoom;
            pos.y /= Settings.zoom;
            pos = Cursor.toGrid(pos);

            if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3) { return; }
            if (this.isEnabled) {
                var shapes = Renderer.instance.getAll();
                var sameShape = false;
                
                for (let i = 0; i < shapes.length; i++) {
                    const shape = shapes[i];

                    var vertices = shape.getVertices();
                    if (Collision.polygonCircle(vertices, pos.x, pos.y, Settings.cursorSize)){
                        if(this.#shape == null){
                            var action = new Action("Selected shape",
                                () => { this.#shape = null; this.#buffer.clear(); }, //undo
                                () => { this.#shape = shape; this.#generate(); } //redo
                            );
                            History.add(action);

                            //select
                            action.redo();
                            return;
                        }
                        else if(this.#shape.getId() != shape.getId()){
                            var oldShape = this.#shape.clone();
                            var action = new Action("Selected different shape",
                                () => { this.#shape = oldShape; this.#generate(); }, //undo
                                () => { this.#shape = shape; this.#generate(); } //redo
                            );
                            History.add(action);

                            //select different
                            action.redo();
                            return;
                        }
                        sameShape = true;
                    }

                    if(this.#shape != null && this.#shape.getId() == shape.getId()){
                        var points = this.#shape.getVertices();
                        for (let v = 0; v < points.length; v++) {
                            const next = points[v + 1 < points.length - 1 ? v + 1 : 0];
                            const prev = points[v];
                            
                            if (Collision.linePoint(next.x, next.y, prev.x, prev.y, pos.x, pos.y) && !Collision.pointCircle(pos.x, pos.y, next.x, next.y, Settings.cursorSize) && !Collision.pointCircle(pos.x, pos.y, prev.x, prev.y, Settings.cursorSize)){
                                var action = new Action("Inserted Coordinates",
                                    () => { points.splice(v + 1, 1); this.#generate(); }, //undo
                                    () => { points.splice(v + 1, 0, pos); this.#generate(); } //redo
                                );
                                History.add(action);

                                //add point in between
                                action.redo();
                                return;
                            }
                            else if(Collision.pointCircle(pos.x, pos.y, prev.x, prev.y, Settings.cursorSize) && v != 0){
                                var points = this.#shape.getVertices();
                                var point = JSON.parse(JSON.stringify(points[v]));

                                if(points.length - 1 > 1){
                                    var action = new Action("Deleted Coordinates",
                                        () => { points.splice(v, 0, point); this.#generate(); },
                                        () => { points.splice(v, 1); this.#generate(); }
                                    );
                                    History.add(action);

                                    //delete point
                                    action.redo();
                                }
                                else{
                                    var clone = this.#shape.clone();
                                    var action = new Action("Deleted Shape",
                                        () => { Renderer.instance.add(clone); this.#shape = clone; this.#generate(); },
                                        () => { Renderer.instance.remove(this.#shape); this.#buffer.clear(); this.#shape = null; }
                                    );
                                    History.add(action);

                                    //delete point
                                    action.redo();
                                }
                                return;
                            }
                        }
                    }
                }

                //No shape selected
                if(this.#shape != null && !sameShape){
                    var points = this.#shape.getVertices();
                    var oldShape = this.#shape.clone();
                    var action = new Action("Deselect shape",
                        () => { this.#shape = oldShape; this.#generate(); }, //undo
                        () => { this.#shape.redraw(points, oldShape.color); this.#shape = null; this.#buffer.clear(); } //redo
                    );
                    History.add(action);

                    //deselect
                    action.redo();
                }
            }
        });

        cursor.events.subscribe('dragStart', (e) => {
            if (this.isEnabled && this.#shape != null) {
                var cursor = Cursor.get();
                var pos = cursor.global().remove(cursor.offset);
                pos.x /= Settings.zoom;
                pos.y /= Settings.zoom;
                if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }

                var points = this.#shape.getVertices();
                this.#selectedPointIndex = null;
                for (let i = 0; i < points.length; i++) {
                    const point = points[i];
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
            if (this.isEnabled && this.#shape != null && this.#selectedPointIndex != null) {
                var cursor = Cursor.get();
                var pos = cursor.global().remove(cursor.offset);
                pos.x /= Settings.zoom;
                pos.y /= Settings.zoom;
                if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }
                
                var points = this.#shape.getVertices();
                var oldPos = points[this.#selectedPointIndex];
                if (!oldPos || !point) { return; }

                points[this.#selectedPointIndex] = Cursor.toGrid(pos);
                if (!oldPos.equals(points[this.#selectedPointIndex])){
                    this.#generate();
                }
            }
        });

        cursor.events.subscribe('dragEnd', (e) => {
            if (this.isEnabled && this.#shape != null) {
                if(this.#selectedPointIndex != null){
                    var points = this.#shape.getVertices();
                    var newPos = points[this.#selectedPointIndex].getCopy();
                    var oldPos = this.#dragOldPos.getCopy();
                    var index = this.#selectedPointIndex;
                    var action = new Action("Moved Coordinates",
                        () => { points[index] = oldPos; this.#generate(); },
                        () => { points[index] = newPos; this.#generate(); }
                    );
                    History.add(action);
                }

                this.#selectedPointIndex = null;
                Cursor.disableOffset = false;
            }
        });
    }

    update(){
        // console.log(this.#shape != null);
        image(this.#buffer, 0, 0);
    }

    enable(){
        this.isEnabled = true;
    }
    
    disable(){
        this.isEnabled = false;
    }

    #generate(){
        this.#buffer.clear();
        this.#buffer.translate(0);
        this.#buffer.scale(1);

        console.log(this.#shape);
        var points = this.#shape.getVertices();

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[i - 1 >= 0 ? i - 1 : points.length - 1];

            //draw line
            if (points.length > 1) {
                this.#buffer.line(p1.x, p1.y, p2.x, p2.y);
            }
        }

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];

            //draw point
            this.#buffer.circle(p1.x, p1.y, 10);
            if(i == 0){
                this.#buffer.push();
                this.#buffer.fill(255, 0, 0);
                this.#buffer.circle(p1.x, p1.y, 5);
                this.#buffer.pop();
            }
        }
    }
}