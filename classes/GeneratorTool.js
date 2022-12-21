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
    marginU = 0;
    marginLR = 0;
    marginD = 0;
    margin = 0;
    rowOffsetMode = false;

    #buffer = null;
    #renderer = null;
    #tiles = null;
    #totalWidth = 0;
    #totalHeight = 0;
    #dummyWidth = 0;
    #dummyHeight = 0;
    #tileWidth = 0;
    #tileHeight = 0;

    index = 0;

    constructor(){
        this.#renderer = Renderer.instance;
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#tiles = { 'X-Roof': 0, 'Alucobond': 0};
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
        var hideVisuals = false;

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
                        this.#buffer.strokeWeight(5);
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
                        this.#buffer.strokeWeight(5);
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

            var mp = 0;
            var mn = 0;
            if (shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1] != null) {
                mp = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[1]);
            }
            if (shape.lineMargins[i] != null) {
                mn = parseInt(shape.lineMargins[i].split('|')[1]);
            }

            //ToDo: make it detect diagonal as well
            //If aligned with previous and next vertice along the x OR y axis
            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }
            
            var dirN = vn.getCopy().remove(vc).normalized();
            // var marginN = Math.abs(this.#getMargin(dirN));
            dirN.multiply(new Vector2(mp, mp));
            
            var dirP = vp.getCopy().remove(vc).normalized();
            // var marginP = Math.abs(this.#getMargin(dirP));
            dirP.multiply(new Vector2(mn, mn));
            
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
                // marginN = Math.abs(this.#getMargin(dirN));
                dirN.multiply(new Vector2(mp, mp))
                
                dirP = vp.getCopy().remove(vc).normalized();
                // marginP = Math.abs(this.#getMargin(dirP));
                dirP.multiply(new Vector2(mn, mn));
                
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
        var hideVisuals = false;
        this.#buffer.push();

        for (let i = 0; i < points.length; i++) {
            const vc = points[i];
            const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
            const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];

            var mp = 0;
            var mn = 0;
            if (shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1] != null) {
                mp = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[1]);
            }
            if (shape.lineMargins[i] != null) {
                mn = parseInt(shape.lineMargins[i].split('|')[1]);
            }
            
            //ToDo: make it detect diagonal as well
            //If aligned with previous and next vertice along the x OR y axis
            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var dirP = vp.getCopy().remove(vc).normalized().multiply(new Vector2(mn, mn));
            var dirN = vn.getCopy().remove(vc).normalized().multiply(new Vector2(mp, mp));
            
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
        var rowIndex = 0;
        var withOffset = false;
        var self = this;

        var attemptPlaceTile = async(x, y, width, height) => {
            var points = [
                new Vector2(x, y),
                new Vector2(x + width, y),
                new Vector2(x + width, y + height),
                new Vector2(x, y + height),
            ];

            var hasEnoughSpace = this.#canBePlaced(insetPoints, outsets, points);
            
            if (hasEnoughSpace) {
                var tile = this.#getTile(x, y, points, false);
                this.#totalWidth += tile.width;
                this.#totalHeight += tile.height;
                this.#tileWidth += tile.width;
                this.#tileHeight += tile.height;

                yWithTile = y;
                self.#tiles['X-Roof']++;
                return true;
            } else if (yWithTile > 0) {
                // if (width > 20 && height > 20) {
                    //Incase we need to slow down the calculation (if the browser freezes up)
                    // await this.#sleep(100);

                    var placeTile = true; 
                    var count = 0;
                    var newPoints = [];
                    // Loop through the vector point of the tile
                    for(let i = 0; i < points.length; i++){
                        const vc = points[i];
                        const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
                        const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];
                        var previousStatus; 
                        var nextStatus; 

                        // Check if the vector point is outside of the insetpoints
                        // if(!Collision.polygonPoint(insetPoints, vc.x, vc.y)){
                        if(!this.#isInsidePoint(insetPoints, vc) && !this.#isInsideForbiddenZone(outsets, vc)){
                            // this.#buffer.fill(12, 72, 250); // Blue
                            //     this.#buffer.circle(vc.x , vc.y ,10);
                            var intersectionPrevious, intersectionNext;
                            count++;
                            var previousCollision = false;
                            var nextCollision = false;
                            
                            if (Collision.polygonLine(insetPoints, vc.x, vc.y, vp.x, vp.y)){
                                intersectionPrevious = this.#polygonLineWithCoordinates(insetPoints, vc, vp);
                                if(intersectionPrevious != null){
                                    previousCollision = true;
                                } else {
                                    previousStatus = false;
                                }
                            }

                            if (Collision.polygonLine(insetPoints, vc.x, vc.y, vn.x, vn.y)){
                                intersectionNext = this.#polygonLineWithCoordinates(insetPoints, vc, vn);
                                if(intersectionNext != null){
                                    nextCollision = true;
                                } else {
                                    nextStatus = false;
                                }
                            }

                            if(previousCollision){
                                // this.#buffer.text('x', intersectionPrevious.x, intersectionPrevious.y);
                                newPoints.push(intersectionPrevious);
                                this.#buffer.fill(12, 72, 250); // Blue
                                // this.#buffer.circle(intersectionPrevious.x , intersectionPrevious.y ,10);
                            }

                            if (!previousStatus && !nextStatus) {
                                for(let j = 0; j < insetPoints.length; j++){
                                    const current = insetPoints[j];
                                    const past = insetPoints[j  - 1 >= 0 ? j  - 1 : insetPoints.length - 1];
                                    const next = insetPoints[j  + 1 <= insetPoints.length - 1 ? j  + 1 : 0];
                                    
                                    if(Collision.polygonPoint(points, current.x, current.y)){
                                        this.#buffer.circle(current.x , current.y ,10);
                                        newPoints.push(current);
                                        previousStatus = true;
                                        nextStatus = true;
                                    } else {
                                        for(let i = 0; i < points.length; i++){
                                            const vCurrent = points[i];
                                            const vNext = points[i + 1 <= points.length - 1 ? i + 1 : 0];
                                            if(Collision.linePoint(vCurrent.x, vCurrent.y, vNext.x, vNext.y, current.x, current.y)){
                                                this.#buffer.circle(current.x , current.y ,10);
                                                newPoints.push(current);
                                                previousStatus = true;
                                                nextStatus = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            if(nextCollision){
                                // this.#buffer.text('x', intersectionNext.x, intersectionNext.y);
                                newPoints.push(intersectionNext); 
                                this.#buffer.fill(12, 72, 250); // Blue
                                // this.#buffer.circle(intersectionNext.x , intersectionNext.y ,10);
                            }
                        }else {
                            if(this.#isInsideForbiddenZone(outsets, vc)){
                                // this.#buffer.fill(55, 12, 4);
                                // this.#buffer.circle(vc.x , vc.y ,10);
                                var newPointsFromFunction = this.#calculateNewVectorPosition(points, vc, vp, vn, outsets, previousStatus, nextStatus);
                                if(newPointsFromFunction.length > 0) {
                                    for(let k = 0; k < newPointsFromFunction.length; k++){
                                        newPoints.push(newPointsFromFunction[k]);
                                    }
                                }
                            } else {
                                // this.#buffer.fill(255, 127, 80); // orange
                                // this.#buffer.circle(vc.x , vc.y ,10);
                                newPoints.push(points[i]);
                            }
                        }

                        // Check if all the vector point is outside of the insetpoints 
                        if(count == 4 ) placeTile = false;
                    }
                // }
                // Place Tile
                if(placeTile){
                    if (newPoints.length > 0){
                        var tile = this.#getTile(x, y, newPoints, true);
                        this.#totalWidth += tile.width;
                        this.#totalHeight += tile.height;
                        this.#dummyWidth += tile.width;
                        this.#dummyHeight += tile.height;

                        yWithTile = y;
                        self.#tiles['Alucobond']++;
                        return true;
                    }
                }
            }
            return false;
        }

        var syncedFunc = async(x, y) => {
            var tilePlaced = attemptPlaceTile(x, y, tileWidth, tileHeight);

            //Incase we need to slow down the calculation (if the browser freezes up)
            await this.#sleep(20);

            x += tileWidth;
            if (x >= boundingBox.x + boundingBox.w) {
                y += yWithTile < y ? 1 : tileHeight;
                rowIndex++;
                if (this.rowOffsetMode) {
                    x = rowIndex % 2 != 0 ? boundingBox.x + (tileWidth / 2) : boundingBox.x;
                }
                else{
                    x = boundingBox.x;
                }
            }

            if (y <= boundingBox.y + boundingBox.h) {
                syncedFunc(x, y);
            }
        }

        syncedFunc(boundingBox.x, boundingBox.y);
    }
    
    #canBePlaced(insetPoints, outsets, points) {
        var hasEnoughSpace = true;
        if (this.#isInside(insetPoints, points)) {
            for (let i = 0; i < outsets.length; i++) {
                const outset = outsets[i];
                const outsetPoints = outset.getVertices();

                if (this.#isColliding(outsetPoints, points)) {
                    hasEnoughSpace = false;
                    break;
                }
            }
        }
        else {
            hasEnoughSpace = false;
        }

        return hasEnoughSpace;
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

    #isInsidePoint(zonePoints, point){
        // if Point is inside of the inset shape
        if (Collision.polygonPoint(zonePoints, point.x, point.y)) {
            return true; 
        }
        // if Point is on the line
        for (let r = 0; r < zonePoints.length; r++) {
            const c = zonePoints[r];
            const n = zonePoints[r + 1 <= zonePoints.length - 1 ? r + 1 : 0];
            if (Collision.linePoint(c.x, c.y, n.x, n.y, point.x, point.y)) {
                return true;
            }
        }
        return false;
    }

    #isInsideForbiddenZone(zonePoints, point){
        // if Point is inside of the inset shape
        for (let i = 0; i < zonePoints.length; i++) {
            const outset = zonePoints[i];
            const outsetPoints = outset.getVertices();

            if (Collision.polygonPoint(outsetPoints, point.x, point.y)) {
                return true;
            }
            // if Point is on the line
            for (let r = 0; r < outsetPoints.length; r++) {
                const c = outsetPoints[r];
                const n = outsetPoints[r + 1 <= outsetPoints.length - 1 ? r + 1 : 0];
                if (Collision.linePoint(c.x, c.y, n.x, n.y, point.x, point.y)) {
                    return true;
                }
            }
        }
        return false;
    }

    #getTile(x,y, vertices, isDummy){
        return new Tile(vertices, this.#buffer, isDummy);
    }

    #polygonLineWithCoordinates(vertices, vector1, vector2){
        //loop over all vertices
        var next = 0;
        for (let current = 0; current < vertices.length; current++) {

            //get next vertice in list (wrap around to 0 if we exceed the vertices array length)
            next = current + 1;
            if(next == vertices.length){
                next = 0;
            }
            
            //detect if the vertices lines intersect with the given line
            var hit = this.#lineIntersection(vector1, vector2, vertices[current], vertices[next]);
            if(hit != null){
                return hit;
            }
        }

        return null;
    }

    #lineIntersection(pointA, pointB, pointC, pointD) {
        var z1 = (pointA.x - pointB.x);
        var z2 = (pointC.x - pointD.x);
        var z3 = (pointA.y - pointB.y);
        var z4 = (pointC.y - pointD.y);
        var dist = z1 * z4 - z3 * z2;

        var tempA = (pointA.x * pointB.y - pointA.y * pointB.x);
        var tempB = (pointC.x * pointD.y - pointC.y * pointD.x);
        var xCoor = (tempA * z2 - z1 * tempB) / dist;
        var yCoor = (tempA * z4 - z3 * tempB) / dist;
      
        if (xCoor < Math.min(pointA.x, pointB.x) || xCoor > Math.max(pointA.x, pointB.x) ||
          xCoor < Math.min(pointC.x, pointD.x) || xCoor > Math.max(pointC.x, pointD.x)) {
          return null;
        }
        if (yCoor < Math.min(pointA.y, pointB.y) || yCoor > Math.max(pointA.y, pointB.y) ||
          yCoor < Math.min(pointC.y, pointD.y) || yCoor > Math.max(pointC.y, pointD.y)) {
          return null;
        }
      
        return new Vector2(xCoor, yCoor);
    }

    #calculateNewVectorPosition(points, vc, vp, vn, insetPoints, previousStatus, nextStatus){
        var _points = [];
        var intersectionPrevious, intersectionNext;
        var previousCollision = false;
        var nextCollision = false;
        

        for (let i = 0; i < insetPoints.length; i++) {
            const outset = insetPoints[i];
            const nextOutset = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
            const outsetPoints = outset.getVertices();

            if(!Collision.linePoint(outset.x, outset.y, nextOutset.x ,nextOutset.y, vc.x, vc.y)){ 
                // Previous vector collision check
                if (Collision.polygonLine(outsetPoints, vc.x, vc.y, vp.x, vp.y)){
                    intersectionPrevious = this.#polygonLineWithCoordinates(outsetPoints, vc, vp);
                    if(intersectionPrevious != null){
                        previousCollision = true;
                    } else {
                        previousStatus = false;
                    }
                }

                // Next vector collision check
                if (Collision.polygonLine(outsetPoints, vc.x, vc.y, vn.x, vn.y)){
                    intersectionNext = this.#polygonLineWithCoordinates(outsetPoints, vc, vn);
                    if(intersectionNext != null){
                        nextCollision = true;
                    } else {
                        nextStatus = false;
                    }
                }

                if(previousCollision){
                    _points.push(intersectionPrevious);
                    this.#buffer.fill(173, 255, 47); // Purple
                    this.#buffer.circle(intersectionPrevious.x , intersectionPrevious.y ,10);
                }

                // 2
                if (!previousStatus && !nextStatus) {
                    // print('QWERTY');
                    // this.index++;
                    // this.#buffer.textSize(32);
                    // this.#buffer.text(this.index, vc.x, vc.y);
                    for(let j = 0; j < outsetPoints.length; j++){
                        const current = outsetPoints[j];
                        const next = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
                        // this.#isInsideForbiddenZone(insetPoints, current) ||
                        // if(Collision.linePoint(current.x, current.y, next.x ,next.y, vc.x, vc.y)){
                        //     console.log('Line Collision met ' + current);
                        // }
                        if(Collision.polygonPoint(points, current.x, current.y)){
                            this.#buffer.circle(current.x , current.y ,10);
                            _points.push(current);
                            previousStatus = true;
                            nextStatus = true;
                        }
                    }
                }

                if(nextCollision){
                    _points.push(intersectionNext); 
                    this.#buffer.fill(173, 255, 47); // Purple
                    this.#buffer.circle(intersectionNext.x , intersectionNext.y ,10);
                }
            } else{
                _points.push(nextOutset);
            }
        }
        return _points;
    }

    toJSON(){
        return { 'tiles': this.#tiles, 'width': this.#totalWidth, 'height': this.#totalHeight, 'tile_width': this.#tileWidth, 'tile_height': this.#tileHeight, 'dummy_width': this.#dummyWidth, 'dummy_height': this.#dummyHeight };
    }

    fromJSON(json){
        this.#tiles = json.tiles;
        this.#totalWidth = json.width;
        this.#totalHeight = json.height;
        this.#dummyWidth += tile.width;
        this.#dummyHeight += tile.height;
        this.#tileWidth += tile.width;
        this.#tileHeight += tile.height;
    }
}