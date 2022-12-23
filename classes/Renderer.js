import Color from "./Color";
import Shape from "./Shape";
import Vector2 from "./Vector2";

export default class Renderer {
    static instance = null;
    #shapes = null;
    
    constructor() {
        Renderer.instance = this;
        this.#shapes = [];
        // this.add(new Shape([
        //     new Vector2(900, 100),
        //     new Vector2(1100, 100),
        //     new Vector2(1300, 300),
        //     new Vector2(1300, 500),
        //     new Vector2(1100, 700),
        //     new Vector2(900, 700),
        //     new Vector2(700, 500),
        //     new Vector2(700, 300)
        // ], new Color(null, 255, 255, 255, 255)));

        this.add(new Shape([
            new Vector2(750, 750),
            new Vector2(750 + (50 * 15), 750),
            // new Vector2(750 + (50 * 10), 750 + (50 * 10)),
            // new Vector2(750 + (50 * 15), 750 + (50 * 12)),
            new Vector2(750 + (50 * 15), 750 + (50 * 15)),
            new Vector2(750, 750 + (50 * 15)),
        ], new Color(null, 255, 255, 255, 255)));

        // this.add(new Shape([
        //     new Vector2(1600, 750),
        //     new Vector2(1600 + (50 * 10), 750),
        //     new Vector2(1600 + (50 * 10), 750 + (50 * 10)),
        //     new Vector2(1600, 750 + (50 * 10)),
        // ], new Color(null, 255, 255, 255, 255)));

        // this.add(new Shape([
        //     new Vector2(2900, 990),
        //     new Vector2(2900, 1600),
        //     new Vector2(3300, 1600),
        //     new Vector2(3300, 1890),
        //     new Vector2(3750, 1890),
        //     new Vector2(3750, 1370),
        //     new Vector2(3510, 1370),
        //     new Vector2(3510, 1160),
        //     new Vector2(3740, 1160),
        //     new Vector2(3740, 960),
        //     new Vector2(3340, 960),
        //     new Vector2(3340, 1110),
        //     new Vector2(3060, 1110),
        //     new Vector2(3060, 990),
        // ], new Color(null, 255, 255, 255, 255)));



        // var forbidden = new Shape([
        //     new Vector2(820, 1200),
        //     new Vector2(1000, 1200),
        //     new Vector2(1000, 1010),
        //     new Vector2(820, 1010),
        // ], new Color(null, 255, 0, 0, 255));
        // forbidden.isAllowed = false;
        // this.add(forbidden);
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
            if (shape.getId() == target.getId()){
                this.#shapes.splice(i, 1);
                return;
            }
        }
    }

    replace(target, value){
        for (let i = 0; i < this.#shapes.length; i++) {
            const shape = this.#shapes[i];
            if (shape.getId() == target.getId()){
                this.#shapes[i] = value;
                return;
            }
        }
    }

    getAll() {
        return this.#shapes;
    }

    get(id) {
        for (let i = 0; i < this.#shapes.length; i++) {
            const shape = this.#shapes[i];
            if (shape.getId() == id) {
                return shape;
            }
        }
        return null;
    }
}