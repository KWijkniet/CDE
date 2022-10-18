export default class Grid {
    #buffer = null;

    constructor(size, maxWidth, maxHeight){
        Cursor.instance.addOnScroll(() => {
            this.#generate(size, maxWidth, maxHeight);
        });
        this.#generate(size, maxWidth, maxHeight);
    }

    #generate(size, maxWidth, maxHeight){
        this.#buffer = createGraphics(maxWidth + (Settings.bonusSize * 2), maxHeight + (Settings.bonusSize * 2));
        this.#buffer.canvas.id = "GridBufferGraphics";
        this.#buffer.background(255, 255, 255);
        
        var color = new Color(200, 200, 200);
        var xAmount = Math.ceil((maxWidth + (Settings.bonusSize * 2)) / size);
        var yAmount = Math.ceil((maxHeight + (Settings.bonusSize * 2)) / size);
        
        for (let y = 0; y < yAmount; y++) {
            for (let x = 0; x < xAmount; x++) {
                var coord = new Vector2(x * size, y * size);
                
                this.#buffer.stroke(color.r, color.g, color.b);
                this.#buffer.fill(color.r, color.g, color.b);
                if(x % 5 == 0 && y % 5 == 0){
                    this.#buffer.strokeWeight(1);
                    this.#buffer.line(coord.x, coord.y, coord.x + (size * 5), coord.y, 5);
                    this.#buffer.line(coord.x, coord.y, coord.x, coord.y + (size * 5), 5);
                }else{
                    this.#buffer.strokeWeight(.25);
                    this.#buffer.line(coord.x, coord.y, coord.x + (size * 1), coord.y, 1);
                    this.#buffer.line(coord.x, coord.y, coord.x, coord.y + (size * 1), 1);
                }
            }
        }
    }
    
    draw(){
        var offset = Cursor.instance.getOffset();
        image(this.#buffer, offset.x - Settings.bonusSize, offset.y - Settings.bonusSize);
    }
}