import Collision from "./Collision";

export default class LineSelectorTool {
    isEnabled = false;
    selectedShape = null;
    selectedPointIndex = -1;

    //events
    events = null;
    
    #renderer = null;
    #buffer = null;

    constructor() {
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#renderer = Renderer.instance;
        this.events = new EventSystem(['selectLine', 'updateSettings']);

        var cursor = Cursor.get();
        cursor.events.subscribe('click', (e) => {
            if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3) { return; }

            if (this.isEnabled) {
                this.#detectLine(e);
            }
        });
    }

    update(){
        image(this.#buffer, 0, 0);
    }

    enable(){
        this.isEnabled = true;
    }

    disable(){
        this.isEnabled = false;
        this.#buffer.clear();
    }

    #detectLine(e) {
        this.#buffer.clear();
        var cursor = Cursor.get();
        var pos = cursor.local().remove(cursor.offset);
        pos.x /= Settings.zoom;
        pos.y /= Settings.zoom;
        if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }

        var shapes = this.#renderer.getAll();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            var points = shape.getVertices();
            
            for (let r = 0; r < points.length; r++) {
                const vc = points[r];
                const vn = r + 1 >= points.length ? points[0] : points[r+1];

                if (Collision.lineCircle(vn.x, vn.y, vc.x, vc.y, pos.x, pos.y, Settings.cursorSize)){
                    this.#buffer.stroke(0, 0, 255);
                    this.#buffer.strokeWeight(5);
                    this.#buffer.line(vc.x, vc.y, vn.x, vn.y);

                    this.selectedShape = shape;
                    this.selectedPointIndex = r;
                    this.events.invoke('selectLine', e);
                    return;
                }
            }
        }
    }
}