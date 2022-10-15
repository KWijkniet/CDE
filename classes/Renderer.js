export default class Renderer {
    #shapes = {};
    #length = 0;

    // Core
    #cursor = null;

    constructor(cursor){
        this.#cursor = cursor;
        this.#shapes = {};

        // //add default shape
        // var sx = 150;
        // var sy = 50;
        // var scale = 50;
        // //allowed
        // this.add(new Shape(this.#cursor, [
        //     new Vector2(sx, sy),
        //     new Vector2(sx + (scale * 10), sy),
        //     new Vector2(sx + (scale * 5), sy + (scale * 10)),
        //     new Vector2(sx + (scale * 10), sy + (scale * 12)),
        //     new Vector2(sx + (scale * 10), sy + (scale * 15)),
        //     new Vector2(sx, sy + (scale * 15))
        // ], new Color(255, 255, 255), true, true));
        // //forbidden
        // this.add(new Shape(this.#cursor, [
        //     new Vector2(sx + (scale * 1), sy + (scale * 1)),
        //     new Vector2(sx + (scale * 5), sy + (scale * 1)),
        //     new Vector2(sx + (scale * 5), sy + (scale * 5)),
        //     new Vector2(sx + (scale * 1), sy + (scale * 5)),
        // ], new Color(255,0,0), false, false));
        // this.add(new Shape(this.#cursor, [
        //     new Vector2(sx + (scale * 2), sy + (scale * 10)),
        //     new Vector2(sx + (scale * 8), sy + (scale * 10)),
        //     new Vector2(sx + (scale * 8), sy + (scale * 11)),
        //     new Vector2(sx + (scale * 3), sy + (scale * 13)),
        // ], new Color(255,0,0), false, false));
    }

    update(){
        var keys = Object.keys(this.#shapes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            var shape = this.#shapes[key];

            shape.update();
        }

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            var shape = this.#shapes[key];

            shape.updateText();
        }
    }

    add(shape) {
        this.#shapes[this.#length] = shape;
        this.#length += 1;

        return this.#length - 1;
    }

    remove(shape) {
        this.#shapes[this.#length] = shape;
        this.#length += 1;

        return this.#length - 1;
    }

    getAll(){
        return this.#shapes;
    }

    bringToFront(){

    }
}
  