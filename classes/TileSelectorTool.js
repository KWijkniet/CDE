export default class TileSelectorTool {
    isEnabled = false;
    selectedShape = null;
    selectedPointIndex = -1;

    //events
    events = null;

    #generator = null;
    #buffer = null;

    constructor(generator) {
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#generator = generator;
        // this.events = new EventSystem(['selectLine', 'updateSettings']);

        var cursor = Cursor.get();
        cursor.events.subscribe('click', (e) => {
            if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3) { return; }

            if (this.isEnabled) {
                this.#detectTile(e);
            }
        });
    }

    update() {
        image(this.#buffer, 0, 0);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.#buffer.clear();
    }

    #detectTile(e) {
        this.#buffer.clear();
        var cursor = Cursor.get();
        var pos = cursor.local().remove(cursor.offset);
        pos.x /= Settings.zoom;
        pos.y /= Settings.zoom;
        if (pos.x < 0 || pos.y < 0 || pos.x > Settings.mapSizeX || pos.y > Settings.mapSizeY) { return; }

        var tiles = this.#generator.getTiles();
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            var points = tile.getVertices();

            if (!tile.isDummy && Collision.polygonPoint(points, pos.x, pos.y)) {
                tile.toggleVent();
                for (let r = 0; r < points.length; r++) {
                    const vc = points[r];
                    const vn = r + 1 >= points.length ? points[0] : points[r + 1];

                    this.#buffer.stroke(0, 0, 255);
                    this.#buffer.strokeWeight(3);
                    this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                }
            }
        }
        this.#generator.redraw();
    }
}