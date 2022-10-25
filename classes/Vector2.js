export default class Vector2{
    x = 0;
    y = 0;

    static zero = () => { return new Vector2(0,0); };
    static one = () => { return new Vector2(1,1); };
    static copy = (v) => { return new Vector2(v.x, v.y); };
    static angle = (v1, v2) => { return Math.atan((v1.x - v2.x) / (v1.y - v2.y)); };
    static distance = (v1, v2) => { return new Vector2(v1.x - v2.x, v1.y - v2.y).magnitude(); };
    static min = (v1, v2) => { return v1.magnitude() < v2.magnitude() ? Vector2.copy(v1) : Vector2.copy(v2); };
    static max = (v1, v2) => { return v1.magnitude() > v2.magnitude() ? Vector2.copy(v1) : Vector2.copy(v2); };
    static add = (v1, v2) => { return new Vector2(v1.x + v2.x, v1.y + v2.y); };
    static remove = (v1, v2) => { return new Vector2(v1.x - v2.x, v1.y - v2.y); };
    static multiply = (v1, v2) => { return new Vector2(v1.x * v2.x, v1.y * v2.y); };
    static devide = (v1, v2) => { return new Vector2(v1.x / v2.x, v1.y / v2.y); };
    
    magnitude = () => { return Math.sqrt(this.x * this.x + this.y * this.y); };
    normalized = () => { var mag = this.magnitude(); return new Vector2(this.x / mag, this.y / mag); };
    getCopy = () => { return new Vector2(this.x, this.y); };
    minMax = (v1, v2) => {
        this.x = this.x < v1.x ? v1.x : this.x;
        this.y = this.y < v1.y ? v1.y : this.y;
        this.x = this.x > v2.x ? v2.x : this.x;
        this.y = this.y > v2.y ? v2.y : this.y;
        return this;
    };
    
    add = (v) => { this.x += v.x; this.y += v.y; return this; };
    remove = (v) => { this.x -= v.x; this.y -= v.y; return this; };
    multiply = (v) => { this.x *= v.x; this.y *= v.y; return this; };
    devide = (v) => { this.x /= v.x; this.y /= v.y; return this; };

    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
}