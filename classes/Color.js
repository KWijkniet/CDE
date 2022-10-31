export default class Color{
    string = "";
    value = [];

    constructor(string = null, r = 0, g = 0, b = 0, a = 1){
        this.string = string;
        if(string == null){
            this.value = [r,g,b,a];
        }
    }

    rgba(){
        value = this.value;
        if (this.string != null) {
            var value = getComputedStyle(document.body).getPropertyValue(this.string);
            this.value = value.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(',');
        }

        return {r: parseFloat(value[0]), g: parseFloat(value[1]), b: parseFloat(value[2]), a: parseFloat(value[3])};
    }
    
    rgb(){
        var rgba = this.rgba();
        delete rgba['a'];
        return rgba;
    }
}