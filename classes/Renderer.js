export default class Renderer {
    #shapes = {};
    #length = 0;

    constructor(){
        this.#shapes = {};
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
}
  