export default class ContextMenuOption {
    #elem = null;
    #loadEvent = () => { };

    constructor(text, type = null, icon = null, group = null, loadEvent = null, clickEvent = null, changeEvent = null) {
        if (loadEvent == null) { loadEvent = (e) => {}; }
        if (clickEvent == null) { clickEvent = (e) => {}; }
        if (changeEvent == null) { changeEvent = (e) => {}; }
        
        this.#loadEvent = loadEvent;

        this.#elem = document.createElement("BUTTON");
        this.#elem.classList.add("option");
        this.#elem.addEventListener('click', clickEvent);

        if(icon != null){
            var iconElem = document.createElement("I");
            var classes = icon.split(' ');
            for (let i = 0; i < classes.length; i++) {
                const c = classes[i];
                iconElem.classList.add(c);
            }

            this.#elem.append(iconElem);
        }
        else if(type != null){
            var typeElem = document.createElement('INPUT');
            typeElem.classList.add("pointer");
            typeElem.addEventListener('change', changeEvent);
            typeElem.type = type;
            if(group != null){
                typeElem.name = group;
            }
            
            this.#elem.append(typeElem);
        }

        if(text != null){
            var textElem = document.createElement("SPAN");
            textElem.classList.add("text");
            textElem.innerHTML = text;

            this.#elem.append(textElem);
        }
    }

    getHtml(){
        return this.#elem;
    }

    onLoad() {
        this.#loadEvent(this.#elem);
    }
}