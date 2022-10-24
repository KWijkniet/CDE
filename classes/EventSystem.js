export default class EventSystem {
    #events = {};

    constructor(events){
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            this.#events[event] = document.createEvent("Event");
            this.#events[event].initEvent("c_" + event, true, true);
        }
    }

    subscribe(event, func){
        document.addEventListener("c_" + event, func, false);
    }
    
    unsubscribe(event, func){
        document.removeEventListener("c_" + event, func);
    }

    invoke(event, e) {
        var keys = Object.keys(this.#events);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if(key == event){
                var ce = new CustomEvent("c_" + key, {'detail': e});
                // this.#events[key].detail = e;
                document.dispatchEvent(ce);
                return;
            }
        }
    }
}