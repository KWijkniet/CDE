export default class Color {
    r = 255;
    g = 255;
    b = 255;
    
    constructor(r,g,b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    fromString(name){
        name = name.toLowerCase();
        if(name == "white"){
            this.r = 255;
            this.g = 255;
            this.b = 255;
        }
        else if(name == "black"){
            this.r = 0;
            this.g = 0;
            this.b = 0;
        }
        else if(name == "red"){
            this.r = 255;
            this.g = 0;
            this.b = 0;
        }
        else if(name == "green"){
            this.r = 0;
            this.g = 255;
            this.b = 0;
        }
        else if(name == "blue"){
            this.r = 0;
            this.g = 0;
            this.b = 255;
        }
    }

    fromRGB(_r, _g, _b){
        this.r = _r;
        this.g = _g;
        this.b = _b;
    }

    toString(){
        return this.r + ", " + this.g + ", " + this.b;
    }
}
  