export default class HistoryTool {
    static #actions = [];
    static #index = -1;

    static instance() {
        HistoryTool.#actions = [];
        HistoryTool.#index = -1;
    }

    static count() {
        return this.#actions.length;
    }

    static get(index) {
        if (index < 0 || index >= this.#actions.length) {
            return null;
        }
        return this.#actions[index];
    }

    static getIndex() {
        return this.#index;
    }

    static getAll() {
        return this.#actions;
    }

    static add(action){
        if(HistoryTool.#index != HistoryTool.#actions.length - 1 && HistoryTool.#index >= -1){
            //delete all actions after the index;
            HistoryTool.#actions.splice(HistoryTool.#index + 1, HistoryTool.#actions.length - HistoryTool.#index);
            // HistoryTool.#actions.splice(0, HistoryTool.#index);
        }

        HistoryTool.#actions.push(action);
        HistoryTool.#index = HistoryTool.#actions.length - 1;
    }

    static undo(){
        if(HistoryTool.#index - 1 < -1){ console.warn("Nothing to undo"); return; }

        HistoryTool.#actions[HistoryTool.#index].undo();
        HistoryTool.#index--;
    }

    static redo(){
        if(HistoryTool.#index + 1 >= HistoryTool.#actions.length){ console.warn("Nothing to redo"); return; }

        HistoryTool.#index++;
        HistoryTool.#actions[HistoryTool.#index].redo();
    }
}