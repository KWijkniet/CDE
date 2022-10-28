import Vector2 from "./Vector2";

export default class Grid{
    #buffer = null;
    
    constructor(){
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#buffer.canvas.id = "grid-buffer";

        var rgb = Settings.gridBackground.rgb();
        this.#buffer.background(rgb.r, rgb.g, rgb.b);

        var rgba = Settings.gridLines.rgba();
        this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);

        //Grid
        for (let i = 0; i < Settings.mapSizeX; i++) {
            this.#buffer.strokeWeight(i % Settings.gridSizeL == 0 ? 1 : 0.25);

            if (i % Settings.gridSizeS == 0 || i % Settings.gridSizeL == 0){
                var fromPos = Cursor.toGrid(new Vector2(i, 0));
                var toPos = Cursor.toGrid(new Vector2(i, Settings.mapSizeY));
                this.#buffer.line(fromPos.x, fromPos.y, toPos.x, toPos.y);
            }
        }

        for (let i = 0; i < Settings.mapSizeY; i++) {
            this.#buffer.strokeWeight(i % Settings.gridSizeL == 0 ? 1 : 0.25);

            if (i % Settings.gridSizeS == 0 || i % Settings.gridSizeL == 0) {
                var fromPos = Cursor.toGrid(new Vector2(0, i));
                var toPos = Cursor.toGrid(new Vector2(Settings.mapSizeX, i));
                this.#buffer.line(fromPos.x, fromPos.y, toPos.x, toPos.y);
            }
        }
    }

    update(){
        image(this.#buffer, 0, 0);
    }
}