export default class ContextMenu {
    elem = null;
    #options = [];

    constructor(id, options = [], parentId = null) {
        this.#options = options;
        this.elem = document.createElement('DIV');
        this.elem.classList.add('sub-menu');
        this.elem.id = id;
        
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            this.elem.append(option.getHtml());
        }

        document.getElementById(parentId != null ? parentId : 'menu').append(this.elem);
        this.hide();
    }

    show(){
        for (let i = 0; i < this.#options.length; i++) {
            const option = this.#options[i];
            option.onLoad();
        }
        this.elem.style.display = "block";
    }

    hide() {
        this.elem.style.display = "none";
    }
    
    isShown(){
        return this.elem.style.display == "block";
    }
}