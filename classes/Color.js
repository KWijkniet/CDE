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
        
        this.value[3] = parseFloat(this.value[3]) < 1 && parseFloat(this.value[3]) > 0 ? parseFloat(this.value[3]) * 100 : parseFloat(this.value[3]);

        return {r: parseFloat(this.value[0]), g: parseFloat(this.value[1]), b: parseFloat(this.value[2]), a: parseFloat(this.value[3])};
    }
    
    rgb(){
        var rgba = this.rgba();
        delete rgba['a'];
        return rgba;
    }
}