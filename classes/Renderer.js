import Shape from "./Shape";
import Vector2 from "./Vector2";

export default class Renderer {
    static instance = null;
    #shapes = null;
    
    constructor() {
        Renderer.instance = this;
        this.#shapes = [
            // new Shape([
            //     Cursor.toGrid(new Vector2(10, 10)),
            //     Cursor.toGrid(new Vector2(10, 50)),
            //     Cursor.toGrid(new Vector2(0, 50)),
            // ]),
        ];
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

    add(target) {
        this.#shapes.push(target);
    }

    remove(target) {
        for (let i = 0; i < this.#shapes.length; i++) {
            const shape = this.#shapes[i];
            if (shape == target){
                this.#shapes.splice(i, 1);
                return;
            }
        }
    }

    getAll() {
        return this.#shapes;
    }
}