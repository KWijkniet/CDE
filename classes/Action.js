export default class Action {
    name = "";
    undo = null;
    redo = null;

    constructor(name, undo, redo) {
        this.name = name;
        this.undo = undo;
        this.redo = redo;
    }
}