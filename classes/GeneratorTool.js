import Shape from "./Shape";
import Vector2 from "./Vector2";
import Collision from "./Collision";
import Color from "./Color";
import Tile from "./Tile";

export default class GeneratorTool {
    isEnabled = false;

    canAdd = true;
    canDelete = true;
    canInsert = true;
    canMove = true;

    //options
    marginU = 25;
    marginLR = 25;
    marginD = 25;
    margin = 25;

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
        var hideVisuals = true;

        this.#buffer.clear();
        var shapes = this.#renderer.getAll();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.isAllowed && !shape.isGenerated){
                var inset = this.#createInset(shape);
                var points = inset.getVertices();
                insets.push(inset);

                if(!hideVisuals){
                    //visualize inset
                    this.#buffer.push();
                    for (let i = 0; i < points.length; i++) {
                        const vc = points[i];
                        const vn = points[i + 1 < points.length ? i + 1 : 0];
                        this.#buffer.drawingContext.setLineDash([15, 15]);
                        this.#buffer.stroke(255, 0, 0);
                        this.#buffer.strokeWeight(2);
                        this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                    }
                    this.#buffer.pop();
                }
            }
            else{
                var outset = this.#createOutset(shape);
                var points = outset.getVertices();
                outsets.push(outset);

                if(!hideVisuals){
                    //visualize outset
                    this.#buffer.push();
                    for (let i = 0; i < points.length; i++) {
                        const vc = points[i];
                        const vn = points[i + 1 < points.length ? i + 1 : 0];
                        this.#buffer.drawingContext.setLineDash([15, 15]);
                        this.#buffer.stroke(0, 0, 0);
                        this.#buffer.strokeWeight(2);
                        this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                    }
                    this.#buffer.pop();
                }
            }
        }

        if(!hideVisuals){
            for (let i = 0; i < insets.length; i++) {
                const inset = insets[i];
                this.#buffer.stroke(0);
                this.#buffer.strokeWeight(2);
                var boundingBox = inset.getBoundingBox();
                this.#buffer.fill(255, 255, 255, 0);
                this.#buffer.rect(boundingBox.x, boundingBox.y, boundingBox.w, boundingBox.h);
            }

            for (let i = 0; i < outsets.length; i++) {
                const outset = outsets[i];
                this.#buffer.stroke(0);
                this.#buffer.strokeWeight(2);
                var boundingBox = outset.getBoundingBox();
                this.#buffer.fill(255, 0, 0, 150);
                this.#buffer.rect(boundingBox.x, boundingBox.y, boundingBox.w, boundingBox.h);
            }
        }

        for (let i = 0; i < insets.length; i++) {
            const inset = insets[i];
            this.#generateTiles(inset, outsets);
        }
    }

    #createInset(shape){
        //calculate inset
        var insets = [];
        this.#buffer.beginShape();
        var points = shape.getVertices();
        var hideVisuals = true;
        this.#buffer.push();

        for (let i = 0; i < points.length; i++) {
            const vc = points[i];
            const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
            const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];
            
            //ToDo: make it detect diagonal as well
            //If aligned with previous and next vertice along the x OR y axis
            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }
            
            var dirN = vn.getCopy().remove(vc).normalized();
            var marginN = Math.abs(this.#getMargin(dirN));
            dirN.multiply(new Vector2(marginN, marginN));
            
            var dirP = vp.getCopy().remove(vc).normalized();
            var marginP = Math.abs(this.#getMargin(dirP));
            dirP.multiply(new Vector2(marginP, marginP));
            
            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);
            var pos = dirN.getCopy().add(vc).add(dirP);

            if(!hideVisuals){
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(pos.x, pos.y, 10);
                this.#buffer.circle(posP.x, posP.y, 10);
                this.#buffer.circle(posN.x, posN.y, 10);
            }

            if(!Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 5)){
                dirN = vn.getCopy().remove(vc).normalized();
                marginN = Math.abs(this.#getMargin(dirN));
                dirN.multiply(new Vector2(marginN, marginN))
                
                dirP = vp.getCopy().remove(vc).normalized();
                marginP = Math.abs(this.#getMargin(dirP));
                dirP.multiply(new Vector2(marginP, marginP));
                
                posN = vc.getCopy().remove(dirN);
                posP = vc.getCopy().remove(dirP);
                pos = vc.getCopy().remove(dirN).remove(dirP);
                if(!hideVisuals){
                    this.#buffer.fill(255, 0, 0);
                    this.#buffer.circle(posN.x, posN.y, 10);
                    this.#buffer.circle(posP.x, posP.y, 10);
                    this.#buffer.circle(pos.x, pos.y, 10);
                }
            }

            insets.push(pos);
        }

        this.#buffer.vertex(insets[0].x, insets[0].y);
        this.#buffer.noStroke();
        this.#buffer.noFill();
        this.#buffer.endShape();
        this.#buffer.pop();

        return new Shape(insets);
    }

    #createOutset(shape){
        //calculate outset
        var outsets = [];
        this.#buffer.beginShape();
        var points = shape.getVertices();
        var hideVisuals = true;
        this.#buffer.push();

        for (let i = 0; i < points.length; i++) {
            const vc = points[i];
            const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
            const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];
            
            //ToDo: make it detect diagonal as well
            //If aligned with previous and next vertice along the x OR y axis
            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var dirP = vp.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
            var dirN = vn.getCopy().remove(vc).normalized().multiply(new Vector2(this.margin, this.margin));
            
            var posP = vc.getCopy().remove(dirP);
            var posN = vc.getCopy().remove(dirN);
            var pos = vc.getCopy().remove(dirN).remove(dirP);
            if(!hideVisuals){
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(posP.x, posP.y, 10);
                this.#buffer.circle(posN.x, posN.y, 10);
                this.#buffer.circle(pos.x, pos.y, 10);
            }

            if(Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 5)){
                var posP = vc.getCopy().add(dirP);
                var posN = vc.getCopy().add(dirN);
                var pos = vc.getCopy().add(dirN).add(dirP);
                if(!hideVisuals){
                    this.#buffer.fill(0, 0, 255);
                    this.#buffer.circle(posP.x, posP.y, 10);
                    this.#buffer.circle(posN.x, posN.y, 10);
                    this.#buffer.circle(pos.x, pos.y, 10);
                }
            }

            outsets.push(pos);
        }
        this.#buffer.vertex(outsets[0].x, outsets[0].y);
        this.#buffer.noStroke();
        this.#buffer.noFill();
        this.#buffer.endShape();
        this.#buffer.pop();

        return new Shape(outsets);
    }

    #getMargin(dir){
        if(dir.equals(Vector2.up())){
            // console.log("up", this.marginU);
            return this.marginU;
        }
        else if(dir.equals(Vector2.right())){
            // console.log("right", this.marginLR);
            return this.marginLR;
        }
        else if(dir.equals(Vector2.down())){
            // console.log("down", this.marginD);
            return this.marginD;
        }
        else if(dir.equals(Vector2.left())){
            // console.log("left", this.marginLR);
            return this.marginLR;
        }
        else{
            var margin = 0;
            if(dir.x > 0){
                margin += dir.x * this.marginLR;
            }
            else{
                margin += Math.abs(dir.x) * this.marginLR;
                // margin += dir.x * this.marginLR;
            }

            if(dir.y > 0){
                margin += dir.y * this.marginU;
            }
            else{
                margin += Math.abs(dir.y) * this.marginD;
                // margin += dir.y * this.marginD;
            }
            // console.log("ERROR:", dir, margin);
            return margin;
        }
    }

    #sleep = (delay) => new Promise((resolve)=> setTimeout(resolve, delay));
    #generateTiles(inset, outsets){
        var boundingBox = inset.getBoundingBox();
        var tileWidth = 820 / 10;
        var tileHeight = 600 / 10;
        var yWithTile = -1;
        var insetPoints = inset.getVertices();
        // var mode = "grid";
        var mode = "space";

        var syncedFunc = async(x, y) => {
            var points = [
                new Vector2(x, y),
                new Vector2(x + tileWidth, y),
                new Vector2(x + tileWidth, y + tileHeight),
                new Vector2(x, y + tileHeight),
            ];

            var hasEnoughSpace = true;
            if(this.#isInside(insetPoints, points)){
                for (let i = 0; i < outsets.length; i++) {
                    const outset = outsets[i];
                    const outsetPoints = outset.getVertices();
                    
                    if(this.#isColliding(outsetPoints, points)){
                        hasEnoughSpace = false;
                        break;
                    }
                }
            }
            else{
                hasEnoughSpace = false;
            }

            if(hasEnoughSpace){
                var tile = this.#getTile(x, y, points);
                yWithTile = y;
            }

            // //Incase we need to slow down the calculation (if the browser freezes up)
            // await this.#sleep(0);

            //Space Mode
            if(mode == "space"){
                x += hasEnoughSpace ? tileWidth : 1;
                if(x + tileWidth >= boundingBox.x + boundingBox.w){
                    y += y == yWithTile ? tileHeight : 1;
                    x = boundingBox.x;
                }
                
                if(y + tileHeight < boundingBox.y + boundingBox.h){
                    syncedFunc(x, y);
                }
            }

            //Grid mode
            if(mode == "grid"){
                x += tileWidth;
                if(x + tileWidth >= boundingBox.x + boundingBox.w){
                    y += tileHeight;
                    x = boundingBox.x;
                }
                
                if(y + tileHeight < boundingBox.y + boundingBox.h){
                    syncedFunc(x, y);
                }
            }
        }

        syncedFunc(boundingBox.x, boundingBox.y);
    }

    #isColliding(zonePoints, points){
        if(Collision.polygonPolygon(zonePoints, points) || Collision.polygonPoint(zonePoints, points[0].x, points[0].y) || Collision.polygonPoint(zonePoints, points[1].x, points[1].y) || Collision.polygonPoint(zonePoints, points[2].x, points[2].y) || Collision.polygonPoint(zonePoints, points[3].x, points[3].y)){
            return true;
        }
        return false;
    }

    #isInside(zonePoints, points){
        if(Collision.polygonPoint(zonePoints, points[0].x, points[0].y) && Collision.polygonPoint(zonePoints, points[1].x, points[1].y) && Collision.polygonPoint(zonePoints, points[2].x, points[2].y) && Collision.polygonPoint(zonePoints, points[3].x, points[3].y)){
            return true;
        }
        return false;
    }

    #getTile(x,y, vertices){
        return new Tile(vertices, this.#buffer);
    }
}