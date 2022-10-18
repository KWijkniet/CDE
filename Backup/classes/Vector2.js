export default class Vector2 {
    x;
    y;

    constructor(_x, _y){
        this.x = _x;
        this.y = _y;
    }
    
    /**
     * @param {Vector2} _target
     */
    distance(_target){
        return Math.sqrt(Math.pow((_target.x - this.x), 2) + Math.pow((_target.y - this.y), 2));
    }
    
    /**
     * @param {Vector2} _target
     */
    add(_target){
        this.x += _target.x;
        this.y += _target.y;

        return this;
    }
    
    /**
     * @param {Vector2} _target
     */
    addNew(_target){
        return new Vector2(this.x + _target.x, this.y + _target.y);
    }
    
    /**
     * @param {Vector2} _target
     */
    remove(_target){
        this.x -= _target.x;
        this.y -= _target.y;

        return this;
    }
    
    /**
     * @param {Vector2} _target
     */
     removeNew(_target){
        return new Vector2(this.x - _target.x, this.y - _target.y);
    }
    
    /**
     * @param {Vector2} _target
     */
    devide(_target){
        this.x /= _target.x;
        this.y /= _target.y;

        return this;
    }
    
    /**
     * @param {Vector2} _target
     */
    multiply(_target){
        this.x *= _target.x;
        this.y *= _target.y;

        return this;
    }
    
    /**
     * @param {Vector2} _target
     */
    equals(_target){
        return this.x == _target.x && this.y == _target.y;
    }
    
    /**
     * @param {Vector2} _min
     * @param {Vector2} _max
     */
    minMax(_min, _max){
        if(this.x < _min.x){
            this.x = _min.x;
        }
        else if(this.x > _max.x){
            this.x = _max.x;
        }

        if(this.y < _min.y){
            this.y = _min.y;
        }
        else if(this.y > _max.y){
            this.y = _max.y;
        }
    }
    
    normalized(){
        var distance = Math.Sqrt(A.x * A.x + A.y * A.y);
        return new Vector2(A.x / distance, A.y / distance);
    }
    
    toString(){
        return "Vector2(" + this.x + ", " + this.y + ")";
    }

    static zero(){
        return new Vector2(0, 0);
    }
}
  