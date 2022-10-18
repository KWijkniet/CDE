export default class EventSystem {
    #events = {};

    constructor(events){
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            this.#events[event] = document.createEvent("Event");
            this.#events[event].initEvent(event, true, true);
        }
    }

    subscribe(event, func){
        document.addEventListener(event, func, false);
    }
    
    unsubscribe(event, func){
        document.removeEventListener(event, func);
    }
}