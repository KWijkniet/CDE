export default class Vector2{
    x = 0;
    y = 0;

    static zero = () => { new Vector2(0,0); };
    static one = () => { new Vector2(1,1); };
    static from = (v) => { new Vector2(v.x, v.y); };
    static angle = (v1, v2) => { return Math.atan((v1.x - v2.x) / (v1.y - v2.y)); };
    static distance = (v1, v2) => { return new Vector2(v1.x - v2.x, v1.y - v2.y).magnitude(); };
    static min = (v1, v2) => { return v1.magnitude() < v2.magnitude() ? Vector2.from(v1) : Vector2.from(v2); };
    static max = (v1, v2) => { return v1.magnitude() > v2.magnitude() ? Vector2.from(v1) : Vector2.from(v2); };

    magnitude = () => { return Math.sqrt(this.x * this.x + this.y * this.y); };
    normalized = () => { var mag = this.magnitude(); return new Vector2(this.x / mag, this.y / mag); };
    getCopy = () => { return new Vector2(this.x, this.y); };

    add = (v) => { new Vector2(this.x + v.x, this.y + v.y); };
    remove = (v) => { new Vector2(this.x - v.x, this.y - v.y); };
    multiply = (v) => { new Vector2(this.x * v.x, this.y * v.y); };
    devide = (v) => { new Vector2(this.x / v.x, this.y / v.y); };

    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
}