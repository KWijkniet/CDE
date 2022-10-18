import Vector2 from "./Vector2";
import Color from "./Color";

export default class Grid{
    #buffer = null;
    #backgroundColor = null;
    #linesColor = null;
    
    constructor(backgroundColorString, linesColorString){
        this.#linesColor = new Color(linesColorString);
        this.#backgroundColor = new Color(backgroundColorString);

        this.#buffer = createGraphics(Settings.mapSize, Settings.mapSize);
        this.#buffer.canvas.id = "grid-buffer";

        var rgb = this.#backgroundColor.rgb();
        this.#buffer.background(rgb.r, rgb.g, rgb.b);
        
        var rgba = this.#linesColor.rgba();
        this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);

        //Generate Large Grid
        var amountL = Math.ceil(Settings.mapSize / Settings.gridSizeL);
        for (let ly = 0; ly < amountL; ly++) {
            for (let lx = 0; lx < amountL; lx++) {
                var posL = new Vector2(lx * Settings.gridSizeL, ly * Settings.gridSizeL);

                this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);
                this.#buffer.strokeWeight(1);
                this.#buffer.line(posL.x, posL.y, posL.x + Settings.gridSizeL, posL.y, 5);
                this.#buffer.line(posL.x, posL.y, posL.x, posL.y + Settings.gridSizeL, 5);

                //Generate Small Grid
                var amountS = Math.ceil(Settings.gridSizeL / Settings.gridSizeS);
                for (let sy = 0; sy < amountS; sy++) {
                    for (let sx = 0; sx < amountS; sx++) {
                        var posS = new Vector2(posL.x + (sx * Settings.gridSizeS), posL.y + (sy * Settings.gridSizeS));

                        this.#buffer.stroke(rgba.r, rgba.g, rgba.b, rgba.a);
                        this.#buffer.strokeWeight(.25);
                        this.#buffer.line(posS.x, posS.y, posS.x + Settings.gridSizeS, posS.y, 5);
                        this.#buffer.line(posS.x, posS.y, posS.x, posS.y + Settings.gridSizeS, 5);
                    }
                }
            }
        }

        // var color = new Color(200, 200, 200);
        // var xAmount = Math.ceil((maxWidth + (Settings.bonusSize * 2)) / size);
        // var yAmount = Math.ceil((maxHeight + (Settings.bonusSize * 2)) / size);
        
        // for (let y = 0; y < yAmount; y++) {
        //     for (let x = 0; x < xAmount; x++) {
        //         var coord = new Vector2(x * size, y * size);
                
        //         this.#buffer.stroke(color.r, color.g, color.b);
        //         this.#buffer.fill(color.r, color.g, color.b);
        //         if(x % 5 == 0 && y % 5 == 0){
        //             this.#buffer.strokeWeight(1);
        //             this.#buffer.line(coord.x, coord.y, coord.x + (size * 5), coord.y, 5);
        //             this.#buffer.line(coord.x, coord.y, coord.x, coord.y + (size * 5), 5);
        //         }else{
        //             this.#buffer.strokeWeight(.25);
        //             this.#buffer.line(coord.x, coord.y, coord.x + (size * 1), coord.y, 1);
        //             this.#buffer.line(coord.x, coord.y, coord.x, coord.y + (size * 1), 1);
        //         }
        //     }
        // }
    }

    update(){
        image(this.#buffer, 0, 0);
    }
}