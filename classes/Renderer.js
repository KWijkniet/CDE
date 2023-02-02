import Color from "./Color";
import Shape from "./Shape";
import Vector2 from "./Vector2";

export default class Renderer {
    static instance = null;
    #shapes = null;
    
    constructor() {
        Renderer.instance = this;
        this.#shapes = [];
        
        // // R
        // this.add(new Shape([
        //     new Vector2(300, 200),
        //     new Vector2(300, 1200),
        //     new Vector2(500, 1200),
        //     new Vector2(500, 700),
        //     new Vector2(700, 1200),
        //     new Vector2(900, 1200),
        //     new Vector2(900, 1000),
        //     new Vector2(700, 600),
        //     new Vector2(900, 600),
        //     new Vector2(900, 200),
        // ], new Color(null, 255, 255, 255, 255)));
        // var forbidden = new Shape([
        //     new Vector2(500, 300),
        //     new Vector2(500, 500),
        //     new Vector2(700, 500),
        //     new Vector2(700, 300),
        // ], new Color(null, 255, 0, 0, 255));
        // forbidden.isAllowed = false;
        // this.add(forbidden);

        // // E
        // this.add(new Shape([
        //     new Vector2(1100, 200),
        //     new Vector2(1100, 1200),
        //     new Vector2(1700, 1200),
        //     new Vector2(1700, 1000),
        //     new Vector2(1300, 1000),
        //     new Vector2(1300, 800),
        //     new Vector2(1700, 800),
        //     new Vector2(1700, 600),
        //     new Vector2(1300, 600),
        //     new Vector2(1300, 400),
        //     new Vector2(1700, 400),
        //     new Vector2(1700, 200),
        // ], new Color(null, 255, 255, 255, 255)));

        // // X
        // this.add(new Shape([
        //     new Vector2(1900, 400),
        //     new Vector2(2100, 200),
        //     new Vector2(2440, 500),
        //     new Vector2(2740, 160),
        //     new Vector2(2960, 340),
        //     new Vector2(2640, 680),
        //     new Vector2(3000, 1000),
        //     new Vector2(2800, 1200),
        //     new Vector2(2440, 880),
        //     new Vector2(2106, 1200),
        //     new Vector2(1900, 1000),
        //     new Vector2(2240, 700),
        // ], new Color(null, 255, 255, 255, 255)));

        // // M
        // this.add(new Shape([
        //     new Vector2(800, 1300),
        //     new Vector2(700, 1700),
        //     new Vector2(600, 1300),
        //     new Vector2(300, 1300),
        //     new Vector2(300, 2300),
        //     new Vector2(500, 2300),
        //     new Vector2(500, 1500),
        //     new Vector2(700, 2300),
        //     new Vector2(900, 1500),
        //     new Vector2(900, 2300),
        //     new Vector2(1100, 2300),
        //     new Vector2(1100, 1300),
        // ], new Color(null, 255, 255, 255, 255)));

        // // E
        // this.add(new Shape([
        //     new Vector2(1300, 1300),
        //     new Vector2(1300, 2300),
        //     new Vector2(1900, 2300),
        //     new Vector2(1900, 2100),
        //     new Vector2(1500, 2100),
        //     new Vector2(1500, 1900),
        //     new Vector2(1900, 1900),
        //     new Vector2(1900, 1700),
        //     new Vector2(1500, 1700),
        //     new Vector2(1500, 1500),
        //     new Vector2(1900, 1500),
        //     new Vector2(1900, 1300),
        // ], new Color(null, 255, 255, 255, 255)));

        // // D
        // this.add(new Shape([
        //     new Vector2(2100, 1300),
        //     new Vector2(2100, 2300),
        //     new Vector2(2500, 2300),
        //     new Vector2(2700, 2100),
        //     new Vector2(2700, 1500),
        //     new Vector2(2500, 1300),
        // ], new Color(null, 255, 255, 255, 255)));
        // var forbidden = new Shape([
        //     new Vector2(2300, 2100),
        //     new Vector2(2500, 2100),
        //     new Vector2(2500, 1500),
        //     new Vector2(2300, 1500),
        // ], new Color(null, 255, 0, 0, 255));
        // forbidden.isAllowed = false;
        // this.add(forbidden);

        // // I
        // this.add(new Shape([
        //     new Vector2(2900, 1300),
        //     new Vector2(2900, 2300),
        //     new Vector2(3100, 2300),
        //     new Vector2(3100, 1300),
        // ], new Color(null, 255, 255, 255, 255)));

        // // A
        // this.add(new Shape([
        //     new Vector2(3400, 2300),
        //     new Vector2(3200, 2300),
        //     new Vector2(3700, 1300),
        //     new Vector2(4200, 2300),
        //     new Vector2(4000, 2300),
        //     new Vector2(3910, 2100),
        //     new Vector2(3490, 2100),
        // ], new Color(null, 255, 255, 255, 255)));
        // var forbidden = new Shape([
        //     new Vector2(3700, 1600),
        //     new Vector2(3530, 2000),
        //     new Vector2(3860, 2000),
        // ], new Color(null, 255, 0, 0, 255));
        // forbidden.isAllowed = false;
        // this.add(forbidden);

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

        // this.add(new Shape([
        //     new Vector2(750, 750),
        //     new Vector2(750 + (50 * 15), 750),
        //     new Vector2(750 + (50 * 10), 750 + (50 * 10)),
        //     new Vector2(750 + (50 * 15), 750 + (50 * 12)),
        //     new Vector2(750 + (50 * 15), 750 + (50 * 15)),
        //     new Vector2(750, 750 + (50 * 15)),
        // ], new Color(null, 255, 255, 255, 255)));

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

        // TEST SHAPES ANGLES
        // this.add(new Shape([
        //     new Vector2(800, 500),
        //     new Vector2(1200, 500),
        //     new Vector2(1200, 900),
        //     new Vector2(1000, 900),
        //     new Vector2(1000, 700),
        // ], new Color(null, 255, 255, 255, 255)));

        // this.add(new Shape([
        //     new Vector2(1600, 500),
        //     new Vector2(1300, 800),
        //     new Vector2(1900, 800),
        // ], new Color(null, 255, 255, 255, 255)));

        // this.add(new Shape([
        //     new Vector2(1300, 900),
        //     new Vector2(1600, 900),
        //     new Vector2(1600, 1100),
        //     new Vector2(1800, 1200),
        //     new Vector2(1800, 1500),
        //     new Vector2(1500, 1500),
        //     new Vector2(1300, 1300),
        //     new Vector2(1100, 1300),
        //     new Vector2(1100, 1100),
        // ], new Color(null, 255, 255, 255, 50)));

        // Inset test
        // this.add(new Shape([
        //     new Vector2(900, 500),
        //     new Vector2(1200, 500),
        //     new Vector2(1500, 700),
        //     new Vector2(1500, 1000),
        //     new Vector2(1100, 1000),
        //     new Vector2(900, 800),
        // ], new Color(null, 255, 255, 255, 50)));
        
        // Outset test
        // var forbidden = new Shape([
        //     new Vector2(900, 500),
        //     new Vector2(1200, 500),
        //     new Vector2(1500, 700),
        //     new Vector2(1500, 1000),
        //     new Vector2(1100, 1000),
        //     new Vector2(900, 800),
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
    }

    updateText() {
        var keys = Object.keys(this.#shapes);
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

    replace(value){
        for (let i = 0; i < this.#shapes.length; i++) {
            const shape = this.#shapes[i];
            if (shape.getId() == value.getId()){
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