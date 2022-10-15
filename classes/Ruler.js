export default class Ruler {
    p1 = null;
    p2 = null;
    offset = null;
    elem = null;

    constructor(){
        var body = document.getElementsByTagName('body')[0];
        this.elem = document.createElement('p');

        this.elem.style.position = "absolute";
        this.elem.style.transform = "translate(-50%, 0)";
        this.elem.style.width = 75;
        this.elem.style.color = "black";
        this.elem.style.textAlign = "center";
        this.elem.style.visibility = "visible";
        this.elem.style.pointerEvents = "none";

        body.appendChild(this.elem);
    }

    update(p1, p2, offset){
        this.p1 = p1;
        this.p2 = p2;
        this.offset = offset;
        if(!this.p1 || !this.p2){
            return;
        }
    }

    draw(){
        if(!this.p1 || !this.p2){
            this.elem.innerHTML = "";
            return;
        }

        this.elem.style.left = this.offset.x;
        this.elem.style.top = this.offset.y;
        this.elem.innerHTML = Math.ceil(this.p1.distance(this.p2) * 10) + "mm";

        fill(0,0,0);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    }

    destroy(){
        this.elem.parentNode.removeChild(this.elem);
    }
}
  