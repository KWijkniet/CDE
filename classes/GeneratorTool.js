export default class GeneratorTool {
    isEnabled = false;

    canAdd = true;
    canDelete = true;
    canInsert = true;
    canMove = true;

    constructor(){

    }

    enable(){
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}