export default class Input {
    id;
    position;
    symbol;

    inputElem;
    pElem;

    constructor(_id, _position, _symbol){
        this.id = _id;
        this.position = _position;
        this.symbol = _symbol;

        var body = document.getElementsByTagName('body')[0];
        this.inputElem = document.createElement('input');
        this.pElem = document.createElement('p');

        //set Identifier
        this.inputElem.id = this.id;
        this.pElem.id = this.id + "_p";

        //set input type + limiters (min/max)
        this.inputElem.type = "number";

        body.appendChild(this.inputElem);
        body.appendChild(this.pElem);

        //styling + positioning
        this.inputElem.classList.add('input-hidden');
        this.inputElem.style.position = "absolute";
        this.inputElem.style.left = this.position.x;
        this.inputElem.style.top = this.position.y;
        this.inputElem.style.transform = "translate(-50%, 0)";
        this.inputElem.style.width = 75;
        this.inputElem.style.color = "black";
        this.inputElem.style.textAlign = "center";
        this.inputElem.style.visibility = "hidden";
        
        this.pElem.style.position = "absolute";
        this.pElem.style.left = this.position.x;
        this.pElem.style.top = this.position.y;
        this.pElem.style.transform = "translate(-50%, 0)";
        this.pElem.style.width = 75;
        this.pElem.style.color = "black";
        this.pElem.style.textAlign = "center";
        this.pElem.style.visibility = "visible";
        this.pElem.classList.add("symbol");

        //set input events
        this.inputElem.addEventListener('change', (event) => {
            // //force the value to be between the given min and max value
            // if(event.target.value > event.target.max){
            //     event.target.value = event.target.max;
            // }
            // else if(event.target.value < event.target.min){
            //     event.target.value = event.target.min;
            // }
            // event.target.value = parseFloat(event.target.value).toFixed(2);

            // var elem = document.getElementById(event.target.id + "_symbol");
            // elem.style.left = position.x + (inputElem.value.length * 5);
        }, false);

        this.pElem.addEventListener('click', (event) => {
            this.pElem.style.visibility = "hidden";
            this.inputElem.style.visibility = "visible";
            this.inputElem.focus();
        });
        this.inputElem.addEventListener('blur', (event) => {
            this.pElem.style.visibility = "visible";
            this.inputElem.style.visibility = "hidden";
        }, false);
    }

    set(_value){
        _value = (parseFloat(_value) * 10).toFixed(0);
        if(this.inputElem.value == _value){ return; }

        this.inputElem.value = _value;
        this.pElem.innerHTML = this.inputElem.value + " " + this.symbol;
    }

    destroy(){
        this.inputElem.parentNode.removeChild(this.inputElem);
        this.pElem.parentNode.removeChild(this.pElem);
    }
    
    toString(){
        return this.id;
    }

    update(){
        this.inputElem.style.left = this.position.x;
        this.inputElem.style.top = this.position.y;
        this.pElem.style.left = this.position.x;
        this.pElem.style.top = this.position.y;
    }
}
  