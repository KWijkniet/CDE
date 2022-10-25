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
                this.#buffer.line(i, 0, i, Settings.mapSizeY);
            }
        }

        for (let i = 0; i < Settings.mapSizeY; i++) {
            this.#buffer.strokeWeight(i % Settings.gridSizeL == 0 ? 1 : 0.25);
            if (i % Settings.gridSizeS == 0 || i % Settings.gridSizeL == 0) {
                this.#buffer.line(0, i, Settings.mapSizeX, i);
            }
        }
    }

    update(){
        //zoom determines offset
        image(this.#buffer, 0, 0);
    }
}