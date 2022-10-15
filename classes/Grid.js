export default class Grid {
    size = 0;
    coords = [];
    buffer = null;
    bonusSize = 0;

    constructor(size, maxWidth, maxHeight, color = new color(255, 255, 255), bonusSize){
        this.size = size;
        this.bonusSize = bonusSize;
        this.buffer = createGraphics(maxWidth + (bonusSize * 2), maxHeight + (bonusSize * 2));
        this.buffer.canvas.id = "GridBufferGraphics";

        var xAmount = Math.ceil((maxWidth + (bonusSize * 2)) / this.size);
        var yAmount = Math.ceil((maxHeight + (bonusSize * 2)) / this.size);
        
        for (let y = 0; y < yAmount; y++) {
            for (let x = 0; x < xAmount; x++) {
                var coord = new Vector2(x * this.size, y * this.size);
                this.coords.push(coord);

                this.buffer.stroke(color.r, color.g, color.b);
                this.buffer.fill(color.r, color.g, color.b);
                if(x % 5 == 0 && y % 5 == 0){
                    this.buffer.strokeWeight(1);
                    this.buffer.line(coord.x, coord.y, coord.x + (this.size * 5), coord.y, 5);
                    this.buffer.line(coord.x, coord.y, coord.x, coord.y + (this.size * 5), 5);
                }else{
                    this.buffer.strokeWeight(.25);
                    this.buffer.line(coord.x, coord.y, coord.x + (this.size * 1), coord.y, 1);
                    this.buffer.line(coord.x, coord.y, coord.x, coord.y + (this.size * 1), 1);
                }
            }
        }
    }

    draw(offset = Vector2.zero()){
        image(this.buffer, offset.x - bonusSize, offset.y - bonusSize);
    }
}