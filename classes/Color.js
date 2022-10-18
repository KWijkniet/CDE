export default class Color{
    string = "";
    
    constructor(string){
        this.string = string;
    }

    rgba(){
        var value = getComputedStyle(document.body).getPropertyValue(this.string);
        value = value.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(',');
        return {r: parseFloat(value[0]), g: parseFloat(value[1]), b: parseFloat(value[2]), a: parseFloat(value[3])};
    }
    
    rgb(){
        var rgba = this.rgba();
        delete rgba['a'];
        return rgba;
    }
}