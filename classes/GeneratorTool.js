import Shape from "./Shape";
import Vector2 from "./Vector2";
import Collision from "./Collision";

export default class GeneratorTool {
    isEnabled = false;

    canAdd = true;
    canDelete = true;
    canInsert = true;
    canMove = true;

    //options
    margin = 25;
    marginU = 50;
    marginLR = 25;
    marginD = 0;

    #buffer = null;
    #renderer = null;

    constructor(){
        this.#renderer = Renderer.instance;
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
    }

    update(){
        image(this.#buffer, 0, 0);
    }

    enable(){
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    generate(){
        var insets = [];
        var outsets = [];

        this.#buffer.clear();
        var shapes = this.#renderer.getAll();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.isAllowed){
                var inset = this.#createInset(shape);
                var points = inset.getVertices();
                insets.push(inset);

                //visualize inset
                push();
                for (let i = 0; i < points.length; i++) {
                    const vc = points[i];
                    const vn = points[i + 1 < points.length ? i + 1 : 0];
                    this.#buffer.drawingContext.setLineDash([15, 15]);
                    this.#buffer.stroke(255, 0, 0);
                    this.#buffer.strokeWeight(2);
                    this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                }
                pop();
            }
            else{
                var outset = this.#createOutset(shape);
                var points = outset.getVertices();
                outsets.push(outset);

                //visualize outset
                push();
                for (let i = 0; i < points.length; i++) {
                    const vc = points[i];
                    const vn = points[i + 1 < points.length ? i + 1 : 0];
                    this.#buffer.drawingContext.setLineDash([15, 15]);
                    this.#buffer.stroke(0, 0, 0);
                    this.#buffer.strokeWeight(2);
                    this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                }
                pop();
            }
        }

        for (let i = 0; i < insets.length; i++) {
            const inset = insets[i];
            
        }
    }

    #createInset(shape){
        var insets = [];

        //calculate inset
        this.#buffer.beginShape();
        var points = shape.getVertices();
        for (let i = 0; i < points.length; i++) {
            const vp = points[i - 1 < 0 ? points.length - 1 : i - 1];
            const vc = points[i];
            const vn = points[i + 1 >= points.length ? 0 : i + 1];

            //detect side (up)
            var dirP = vp.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
            var dirN = vn.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
            var p1 = new Vector2(0, 0);
            var p2 = new Vector2(0, 0);

            //If aligned with previous and next vertice along the x OR y axis
            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            p1 = new Vector2(vc.x + dirP.x, vc.y + dirP.y);
            p2 = new Vector2(vc.x + dirN.x, vc.y + dirN.y);
            p1.add(p2).devide(new Vector2(2, 2));

            if (!Collision.polygonPoint(points, p1.x, p1.y)) {
                //position is outside shape
                p1 = new Vector2(vc.x - dirP.x, vc.y - dirP.y);
                p2 = new Vector2(vc.x - dirN.x, vc.y - dirN.y);
                p1.add(p2).devide(new Vector2(2, 2));
            }

            insets.push(p1);
        }
        this.#buffer.vertex(insets[0].x, insets[0].y);
        this.#buffer.noStroke();
        this.#buffer.noFill();
        this.#buffer.endShape();

        return new Shape(insets);
    }

    #createOutset(shape){
        var outsets = [];

        //calculate inset
        this.#buffer.beginShape();
        var points = shape.getVertices();
        for (let i = 0; i < points.length; i++) {
            const vp = points[i - 1 < 0 ? points.length - 1 : i - 1];
            const vc = points[i];
            const vn = points[i + 1 >= points.length ? 0 : i + 1];

            var dirP = vp.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
            var dirN = vn.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));

            //If aligned with previous and next vertice along the x OR y axis
            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var p1 = new Vector2(vc.x - dirP.x, vc.y - dirP.y);
            var p2 = new Vector2(vc.x - dirN.x, vc.y - dirN.y);
            p1.add(p2).devide(new Vector2(2, 2));

            if (Collision.polygonPoint(points, p1.x, p1.y)) {
                //position is inside shape
                p1 = new Vector2(vc.x + dirP.x, vc.y + dirP.y);
                p2 = new Vector2(vc.x + dirN.x, vc.y + dirN.y);
                p1.add(p2).devide(new Vector2(2, 2));
            }

            outsets.push(p1);
        }
        if(outsets.length > 0){
            this.#buffer.vertex(outsets[0].x, outsets[0].y);
        }
        this.#buffer.noStroke();
        this.#buffer.noFill();
        this.#buffer.endShape();

        return new Shape(outsets);
    }
}