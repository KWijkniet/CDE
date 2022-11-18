export default class Renderer {
    static instance = null;
    #shapes = null;
    
    constructor() {
        Renderer.instance = this;
        this.#shapes = [];
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