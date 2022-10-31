export default class History {
    #actions = [];
    #index = 0;

    constructor() {
        this.#actions = [];
        this.#index = 0;
    }

    add(action){
        if(this.#index != this.#actions.length - 1){
            //delete all actions after the index;
            this.#actions.length
        }

        this.#actions.push(action);
        this.#index = this.#actions.length - 1;
    }

    undo(){

    }

    redo(){

    }
}