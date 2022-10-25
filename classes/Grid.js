import Vector2 from "./Vector2";
import Color from "./Color";

export default class Grid{
    #buffer = null;
    #backgroundColor = null;
    #linesColor = null;
    #cachedZoom = 1;
    
    constructor(backgroundColorString, linesColorString){
        this.#linesColor = new Color(linesColorString);
        this.#backgroundColor = new Color(backgroundColorString);

        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#buffer.canvas.id = "grid-buffer";

        this.#generate();
    }

    update(){
        var cursor = Cursor.get();
        if(this.#cachedZoom != cursor.zoom){
            this.#cachedZoom = cursor.zoom;

            this.#generate();
        }

        //zoom determines offset
        image(this.#buffer, 0, 0);
    }

    #generate() {
        var zoom = Cursor.get().zoom;
        // var zoom = 1;
        // this.#buffer.resizeCanvas(Settings.mapSize * zoom, Settings.mapSize * zoom);

        var rgb = this.#backgroundColor.rgb();
        this.#buffer.background(rgb.r, rgb.g, rgb.b);

        var rgba = this.#linesColor.rgba();
        this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);
        
        //Grid
        for (let i = 0; i < Settings.mapSize; i++) {
            if(i % Settings.gridSizeL == 0){
                this.#buffer.strokeWeight(1);
                this.#buffer.line(i * zoom, 0, i * zoom, Settings.mapSize * zoom);
                this.#buffer.line(0, i * zoom, Settings.mapSize * zoom, i * zoom);
            }
            else if(i % Settings.gridSizeS == 0){
                this.#buffer.strokeWeight(0.25);
                this.#buffer.line(i * zoom, 0, i * zoom, Settings.mapSize * zoom);
                this.#buffer.line(0, i * zoom, Settings.mapSize * zoom, i * zoom);
            }
        }
        
        // //Generate Large Grid (BACKUP)
        // var amountL = Math.ceil(Settings.mapSize / Settings.gridSizeL);
        // for (let ly = 0; ly < amountL; ly++) {
        //     for (let lx = 0; lx < amountL; lx++) {
        //         var posL = new Vector2(lx * Settings.gridSizeL, ly * Settings.gridSizeL);

        //         this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);
        //         this.#buffer.strokeWeight(1);
        //         this.#buffer.line(posL.x, posL.y, posL.x + Settings.gridSizeL, posL.y, 5);
        //         this.#buffer.line(posL.x, posL.y, posL.x, posL.y + Settings.gridSizeL, 5);

        //         //Generate Small Grid
        //         var amountS = Math.ceil(Settings.gridSizeL / Settings.gridSizeS);
        //         for (let sy = 0; sy < amountS; sy++) {
        //             for (let sx = 0; sx < amountS; sx++) {
        //                 var posS = new Vector2(posL.x + (sx * Settings.gridSizeS), posL.y + (sy * Settings.gridSizeS));

        //                 this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);
        //                 this.#buffer.strokeWeight(.25);
        //                 this.#buffer.line(posS.x, posS.y, posS.x + Settings.gridSizeS, posS.y, 5);
        //                 this.#buffer.line(posS.x, posS.y, posS.x, posS.y + Settings.gridSizeS, 5);
        //             }
        //         }
        //     }
        // }
    }
}