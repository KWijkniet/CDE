export default class History {
    static #actions = [];
    static #index = -1;

    static instance() {
        History.#actions = [];
        History.#index = -1;
    }
    
    static count(){
        return this.#actions.length;
    }

    static add(action){
        if(History.#index != History.#actions.length - 1 && History.#index >= -1){
            //delete all actions after the index;
            History.#actions.splice(History.#index, History.#actions.length - History.#index);
            // History.#actions.splice(0, History.#index);
        }

        History.#actions.push(action);
        History.#index = History.#actions.length - 1;
    }

    static undo(){
        if(History.#index - 1 < -1){ console.warn("Nothing to undo"); return; }

        History.#actions[History.#index].undo();
        History.#index--;
    }

    static redo(){
        if(History.#index + 1 >= History.#actions.length){ console.warn("Nothing to redo"); return; }

        History.#index++;
        History.#actions[History.#index].redo();
    }
}