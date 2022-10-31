export default class Action {
    undo = null;
    redo = null;

    constructor(undo, redo) {
        this.undo = undo;
        this.redo = redo;
    }
}