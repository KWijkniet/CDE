import Shape from "./Shape";
import Vector2 from "./Vector2";
import Collision from "./Collision";
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
    #sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

    constructor() {
        this.#renderer = Renderer.instance;
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#tiles = [];
    }

    update() {
        image(this.#buffer, 0, 0);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    generate() {
        console.log('Generating...');
        var insets = [];
        var outsets = [];
        var hideVisuals = false;

        this.#buffer.clear();
        var shapes = this.#renderer.getAll();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.isAllowed && !shape.isGenerated) {
                var inset = this.#createInset(shape);
                inset.lineMargins = shape.lineMargins;
                var points = inset.getVertices();
                insets.push(inset);

                if (!hideVisuals) {
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
            else {
                var outset = this.#createOutset(shape);
                var points = outset.getVertices();
                outsets.push(outset);

                if (!hideVisuals) {
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

        if (!hideVisuals) {
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

    #createInset(shape) {
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

            if (!hideVisuals) {
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(pos.x, pos.y, 10);
                this.#buffer.circle(posP.x, posP.y, 10);
                this.#buffer.circle(posN.x, posN.y, 10);
            }

            if (!Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 1)) {
                dirN = vn.getCopy().remove(vc).normalized();
                // marginN = Math.abs(this.#getMargin(dirN));
                dirN.multiply(new Vector2(mp, mp))

                dirP = vp.getCopy().remove(vc).normalized();
                // marginP = Math.abs(this.#getMargin(dirP));
                dirP.multiply(new Vector2(mn, mn));

                posN = vc.getCopy().remove(dirN);
                posP = vc.getCopy().remove(dirP);
                pos = vc.getCopy().remove(dirN).remove(dirP);
                if (!hideVisuals) {
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

    #createOutset(shape) {
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
            if (!hideVisuals) {
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(posP.x, posP.y, 10);
                this.#buffer.circle(posN.x, posN.y, 10);
                this.#buffer.circle(pos.x, pos.y, 10);
            }

            if (Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 5)) {
                var posP = vc.getCopy().add(dirP);
                var posN = vc.getCopy().add(dirN);
                var pos = vc.getCopy().add(dirN).add(dirP);
                if (!hideVisuals) {
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

    #generateTiles(inset, outsets) {
        var self = this;
        var tileSize = new Vector2(820 / 10, 600 / 10);
        var firstTileSize = new Vector2(410 / 10, 600 / 10);
        var insetPoints = inset.getVertices();
        var boundingBox = inset.getBoundingBox();
        var isFirstTile = false;
        var rowIndex = 0;
        var maxTiles = Math.floor((boundingBox.x + boundingBox.w) / tileSize.x) * Math.floor((boundingBox.y + boundingBox.h) / tileSize.y);

        // this.#tiles = { 'X-Roof': [], 'Alucobond': [] };
        this.#tiles = [];
        this.#totalWidth = 0;
        this.#totalHeight = 0;
        this.#dummyWidth = 0;
        this.#dummyHeight = 0;
        this.#tileWidth = 0;
        this.#tileHeight = 0;

        var syncedPlaceTile = async (x, y, targetPoints) => new Promise((resolve) => {
            var delay = 1;
            var isDummy = false;

            setTimeout(() => {
                var result = [];

                //validate target points
                for (let i = 0; i < targetPoints.length; i++) {
                    const vp = targetPoints[i - 1 >= 0 ? i - 1 : targetPoints.length - 1];
                    const vc = targetPoints[i];
                    const vn = targetPoints[i + 1 <= targetPoints.length - 1 ? i + 1 : 0];

                    //Point outside of shape
                    if (!self.IsInside(insetPoints, vc.x, vc.y) || self.IsInsideForbiddenShapes(outsets, vc.x, vc.y)) {
                        isDummy = true;

                        //Find a collision between current vertice and the previous vertice
                        var dirP = vp.getCopy().remove(vc).normalized();
                        var toPrev = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), Vector2.distance(vp, vc), false);
                        
                        //Find a collision between current vertice and the next vertice
                        var dirN = vn.getCopy().remove(vc).normalized();
                        var toNext = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc), false);

                        //Push collision point into the result array
                        if (toPrev != null) {
                            // self.#buffer.text('x', toPrev.x - 3, toPrev.y + 3);
                            result.push(toPrev);
                        }

                        //Include all inset points that are inside the tile
                        for (let r = 0; r < insetPoints.length; r++) {
                            const inset = insetPoints[r];

                            if (self.IsInside(targetPoints, inset.x, inset.y)) {
                                result.push(inset);
                            }
                        }

                        //Include all outset points that are inside the tile
                        for (let r = 0; r < outsets.length; r++) {
                            const outset = outsets[r];
                            const outsetPoints = outset.getVertices();

                            for (let b = 0; b < outsetPoints.length; b++) {
                                const outsetPoint = outsetPoints[b];

                                if (self.IsInside(targetPoints, outsetPoint.x, outsetPoint.y)) {
                                    result.push(outsetPoint);
                                }
                            }
                        }
                        
                        //Push collision point into the result array
                        if (toNext != null) {
                            // self.#buffer.text('x', toNext.x - 3, toNext.y + 3);
                            result.push(toNext);
                        }
                    }
                    else {
                        //xroof (normal) tile
                        result.push(vc);
                    }
                }

                //TODO: If a raycast has more then 1 point then you need to seperate the 2 parts into different tiles
                // TODO: raycast up a tiny bit to detect if this is the first tile on the Y axis. (wont work)
                var tmp = [];
                for (let i = 0; i < result.length; i++) {
                    const vc = result[i];
                    const vn = result[i + 1 <= result.length - 1 ? i + 1 : 0];

                    //Find a collision between current vertice and the next vertice
                    var dirN = vn.getCopy().remove(vc).normalized();
                    var toNext = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc), true);
                    var toCurr = self.#raycast([inset].concat(outsets), vn, new Vector2(dirN.x, dirN.y), Vector2.distance(vn, vc), true);
                    
                    tmp.push(vc);
                    
                    //Validate found collisions
                    if ((toNext != null && (Vector2.distance(toNext, vc) <= 2 || Vector2.distance(toNext, vn) <= 2)) || (toCurr != null && (Vector2.distance(toCurr, vn) <= 2 || Vector2.distance(toCurr, vc) <= 2))) {
                        continue;
                    }

                    if (toNext != null) {
                        isDummy = true;
                        tmp.push(toNext);
                    }

                    if(toNext != null && toCurr != null){
                        //Include all inset points that are inside the tile
                        for (let r = 0; r < insetPoints.length; r++) {
                            const inset = insetPoints[r];

                            if (self.IsInside(result, inset.x, inset.y)) {
                                tmp.push(inset);
                            }
                        }

                        //Include all outset points that are inside the tile
                        for (let r = 0; r < outsets.length; r++) {
                            const outset = outsets[r];
                            const outsetPoints = outset.getVertices();

                            for (let b = 0; b < outsetPoints.length; b++) {
                                const outsetPoint = outsetPoints[b];

                                if (self.IsInside(result, outsetPoint.x, outsetPoint.y)) {
                                    tmp.push(outsetPoint);
                                }
                            }
                        }
                    }

                    if (toCurr != null) {
                        isDummy = true;
                        tmp.push(toCurr);
                    }
                }
                result = tmp;

                //create tile
                var tile = self.#createTile(result, isFirstTile ? true : isDummy);
                var bb = tile.getBoundingBox();
                if (bb.h <= 0 || bb.w <= 0) {
                    resolve(null);
                    return;
                }
                resolve(tile);
            }, delay);
        });

        var findStartingPos = (x, y, targetPoints) => {
            
            if (!this.IsInside(insetPoints, x, y)) {
                var pos = new Vector2(x, y).add(Vector2.left().multiply(new Vector2(10, 10)));
                var horizontal = self.#raycast([inset], pos, Vector2.left(), boundingBox.w);

                // self.#buffer.fill(0);
                // self.#buffer.circle(pos.x, pos.y, 5);
                if (horizontal) {
                    // horizontal.add(Vector2.right());
                    // self.#buffer.fill(255, 0, 0);
                    // self.#buffer.circle(horizontal.x, horizontal.y, 5);
                    if (!this.IsInside(insetPoints, horizontal.x, horizontal.y)) {

                        pos = horizontal.getCopy().add(Vector2.down().multiply(new Vector2(10, 10)));
                        var vertical = self.#raycast([inset], pos, Vector2.down(), boundingBox.h);

                        // self.#buffer.fill(0);
                        // self.#buffer.circle(pos.x, pos.y, 5);
                        if (vertical) {
                            // vertical.add(Vector2.up());
                            // self.#buffer.fill(255, 0, 0);
                            // self.#buffer.circle(vertical.x, vertical.y, 5);
                            // console.log("Is inside shape (Vertical)");
                            return vertical.getCopy();
                        } else {
                            // console.log("Could not collide (Vertical)");
                        }
                    } else {
                        // console.log("Is inside shape (Horizontal)");
                        return horizontal.getCopy();
                    }
                } else {
                    // console.log("Could not collide (Horizontal)");
                }
            } else {
                // console.log("Is inside shape!");
                return new Vector2(x, y);
            }

            return null;
        }

        var validateLocation = (x, y, targetPoints) => {
            var isValid = false;
            for (let i = 0; i < targetPoints.length; i++) {
                const vc = targetPoints[i];

                if (self.IsInside(insetPoints, vc.x, vc.y)) {
                    if(outsets.length <= 0){
                        isValid = true;
                    }
                    else {
                        for (let r = 0; r < outsets.length; r++) {
                            const outset = outsets[r];
                            const outsetPoints = outset.getVertices();

                            if (!self.IsInside(outsetPoints, vc.x, vc.y)) {
                                isValid = true;
                            }
                        }
                    }
                }
            }
            
            if (isValid) {
                return new Vector2(x, y);
            }
            
            // var horizontal = self.#raycast([inset], new Vector2(x, y), Vector2.left(), Vector2.distance(targetPoints[0], targetPoints[1]));
            // if(horizontal != null){
            //     return horizontal;
            // }
            return null;
        }

        var syncedLoop = async (x, y) => {
            var startX = null;
            var startY = null;
            var delay = 100;
            
            // PHASE 1
            var firstTileValid = true;
            for (let i = 0; i < insetPoints.length; i++) {
                const vc = insetPoints[i];
                const vn = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
                const lineType = inset.lineMargins[i];
                var isFirst = true;

                //Only apply when specific line options have been choosen
                if (lineType.split("|")[0] != "daknok1" && lineType.split("|")[0] != "dakrand1" && lineType.split("|")[0] != "gootdetail3") {
                    firstTileValid = true;
                    continue;
                }
                
                var dir = vn.getCopy().remove(vc).normalized();
                var targetPoints = [
                    new Vector2(vc.x - tileSize.x / 2, vc.y - tileSize.y / 2),
                    new Vector2(vc.x + tileSize.x / 2, vc.y - tileSize.y / 2),
                    new Vector2(vc.x + tileSize.x / 2, vc.y + tileSize.y / 2),
                    new Vector2(vc.x - tileSize.x / 2, vc.y + tileSize.y / 2),
                ];
                if(startX != null && startY != null){
                    for (let r = 0; r < targetPoints.length; r++) {
                        targetPoints[r].x = self.#convertToGrid(targetPoints[r].x, startX, tileSize.x);
                        targetPoints[r].y = self.#convertToGrid(targetPoints[r].y, startY, tileSize.y);
                    }
                }
                
                if (isFirst && !firstTileValid) {
                    //Update next position
                    for (let r = 0; r < targetPoints.length; r++) {
                        const tp = targetPoints[r];
                        tp.add(new Vector2(dir.x * tileSize.x, dir.y * tileSize.y));
                    }
                }

                //Update inset
                if (isFirst) {
                    const vp = insetPoints[i - 1 >= 0 ? i - 1 : insetPoints.length - 1];
                    const dirP = vp.getCopy().remove(vc).normalized();

                    const vnn = insetPoints[(i + 2 % insetPoints.length - 1) - 1];
                    const dirN = vn.getCopy().remove(vnn).normalized();

                    vc.add(new Vector2(dirP.x * (tileSize.x / 2), dirP.y * (tileSize.y / 2)));
                    // vc.x = self.#convertToGrid(vc.x - (tileSize.x / 2), startX, tileSize.x);
                    // vc.y = self.#convertToGrid(vc.y - (tileSize.x / 2), startY, tileSize.y);

                    vn.add(new Vector2(dirN.x * (tileSize.x / 2), dirN.y * (tileSize.y / 2)));
                    // vn.x = self.#convertToGrid(vn.x, startX, tileSize.x);
                    // vn.y = self.#convertToGrid(vn.y, startY, tileSize.y);

                    self.#buffer.circle(vc.x, vc.y, 10);
                    self.#buffer.circle(vn.x, vn.y, 10);
                }

                var max = 999;
                while (Collision.polygonLine(targetPoints, vc.x, vc.y, vn.x, vn.y)) {
                    //Create tile
                    self.#tiles.push(self.#createTile(targetPoints, true));
                    firstTileValid = false;
                    isFirst = false;
                    if(self.#tiles.length == 1){
                        startX = targetPoints[0].x;
                        startY = targetPoints[0].y;
                    }

                    //Update next position
                    for (let r = 0; r < targetPoints.length; r++) {
                        const tp = targetPoints[r];
                        tp.add(new Vector2(dir.x * tileSize.x, dir.y * tileSize.y));
                    }
                    await self.#sleep(delay);

                    //Security
                    max--;
                    if(max <= 0){
                        console.error("Infinite loop detected!");
                        break;
                    }
                }

                console.log("Tile Count:", self.#tiles.length);
            }

            for (let i = 0; i < insetPoints.length; i++) {
                const vc = insetPoints[i];
                const vn = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
                const lineType = inset.lineMargins[i];
                
                //Only apply when specific line options have been choosen
                if (lineType.split("|")[0] != "daknok1" && lineType.split("|")[0] != "dakrand1" && lineType.split("|")[0] != "gootdetail3") {
                    continue;
                }
            }

            // //place tiles along line
            // for (let i = 0; i < insetPoints.length; i++) {
            //     const vc = insetPoints[i];
            //     const vn = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
            //     const lineType = inset.lineMargins[i];

            //     //Only apply when specific line options have been choosen
            //     if (lineType.split("|")[0] != "daknok1" && lineType.split("|")[0] != "dakrand1" && lineType.split("|")[0] != "gootdetail3") { continue; }

            //     //get dir of line.
            //     var dir = vn.getCopy().remove(vc).normalized();

            //     //This follows a grid since you only move it tilesize.x or tilesize.y
            //     var killCounter = 0;
            //     while (true) {
            //         //apply dir x.
            //         if (startX == null || startY == null) {
            //             startX = vc.x
            //             startY = vc.y;
            //         }
            //         else{
            //             startX += tileSize.x * dir.x;
            //             startY += tileSize.y * dir.y;
            //         }

            //         var targetPoints = [
            //             new Vector2(startX - tileSize.x / 2, startY - tileSize.y / 2),
            //             new Vector2(startX + tileSize.x / 2, startY - tileSize.y / 2),
            //             new Vector2(startX + tileSize.x / 2, startY + tileSize.y / 2),
            //             new Vector2(startX - tileSize.x / 2, startY + tileSize.y / 2),
            //         ];

            //         //is on line
            //         if(Collision.polygonLine(targetPoints, vc.x, vc.y, vn.x, vn.y)){
            //             this.#tiles.push(this.#createTile(targetPoints, true));
            //             this.#buffer.fill(255, 0, 0);
            //             this.#buffer.text(killCounter, startX, startY);
            //         }
            //         //if shape is not ON the line then add Y.
            //         else {
            //             startX -= tileSize.x * dir.x;
            //             startY -= tileSize.y * dir.y;
            //             break;
            //         }

            //         //Emergency break :D
            //         killCounter++;
            //         if (killCounter > maxTiles){
            //             break;
            //         }
            //         await this.#sleep(delay);
            //     }
            // }

            //Calculate top left corner
            // var topLeftTile = null;
            // var topLeftTilePoints = [];
            // for (let i = 0; i < this.#tiles.length; i++) {
            //     const tile = this.#tiles[i];
            //     const tilePoints = tile != null ? tile.getVertices() : [];
            //     if (tile == null || tilePoints.length <= 0){ continue; }

            //     if(topLeftTilePoints.length <= 0 || (tilePoints[0].x <= topLeftTilePoints[0].x && tilePoints[0].y <= topLeftTilePoints[0].y)){
            //         topLeftTile = tile;
            //         topLeftTilePoints = tilePoints;
            //     }
            // }

            //Update the inset to include the "omvouw" tiles
            
            //Starting position of where to place the first inner tile
            // startX = topLeftTile == null ? x : topLeftTilePoints[2].x;
            // startY = topLeftTile == null ? y : topLeftTilePoints[2].y;
            
            // //Place tiles in the remaining area
            // var killCounter = 0;
            // var yIndex = 0;
            // var xIndex = 0;
            // var yMax = Math.ceil(boundingBox.h / tileSize.y);
            // var xMax = Math.ceil(boundingBox.w / tileSize.x);
            // while (true){
            //     var targetPoints = [
            //         new Vector2(startX, startY),
            //         new Vector2(startX + tileSize.x, startY),
            //         new Vector2(startX + tileSize.x, startY + tileSize.y),
            //         new Vector2(startX, startY + tileSize.y),
            //     ];
                
            //     var resultPos = validateLocation(startX, startY, targetPoints);
            //     if(resultPos){
            //         await syncedPlaceTile(resultPos.x, resultPos.y, targetPoints).then((tile) => {
            //             if (tile != null) {
            //                 isFirstTile = false;
            //                 self.#tiles.push(tile);

            //                 // var points = tile.getVertices();
            //                 // for (let r = 0; r < points.length; r++) {
            //                 //     this.#buffer.circle(points[r].x, points[r].y, 10);
            //                 // }
            //             }
            //         });
            //     }
            //     await this.#sleep(delay);

            //     if(xIndex < xMax - 1){
            //         startX += tileSize.x;
            //         xIndex++;
            //     }
            //     else if (yIndex < yMax - 1) {
            //         startX = topLeftTile == null ? x : topLeftTilePoints[2].x;
            //         startY += tileSize.y;
            //         xIndex = 0;
            //         yIndex++;
            //     }
            //     else{
            //         break;
            //     }

            //     killCounter++;
            //     if (killCounter > maxTiles){
            //         break;
            //     }
            // }



            // var targetPoints = [
            //     new Vector2(x, y),
            //     new Vector2(x + (isFirstTile ? firstTileSize.x : tileSize.x), y),
            //     new Vector2(x + (isFirstTile ? firstTileSize.x : tileSize.x), y + (rowIndex <= 0 ? tileSize.y : tileSize.y - 10)),
            //     new Vector2(x - (isFirstTile ? tileSize.x - firstTileSize.x : 0), y + (rowIndex <= 0 ? tileSize.y : tileSize.y - 10)),
            // ];
            // x += (isFirstTile ? firstTileSize.x : tileSize.x);

            // var delay = 10;
            // var resultPos = validateLocation(x, y, targetPoints);
            // if(resultPos){
            //     await syncedPlaceTile(resultPos.x, resultPos.y, targetPoints).then((tile) => {
            //         if (tile != null) {
            //             isFirstTile = false;
            //             self.#tiles.push(tile);
            //         }
            //     });
            //     await this.#sleep(delay);
            // }

            // if (x < boundingBox.x + boundingBox.w) {
            //     //Same row
            //     syncedLoop(x, y);
            // } else if (y + tileSize.y < boundingBox.y + boundingBox.h) {
            //     //New row
            //     rowIndex++;
            //     isFirstTile = true;
            //     syncedLoop(boundingBox.x, y + (rowIndex <= 1 ? tileSize.y : tileSize.y - 10));
            // }
        };

        syncedLoop(boundingBox.x, boundingBox.y);
    }

    #convertToGrid(value, gridStart, gridSize){
        return Math.round((value - gridStart) / gridSize) * gridSize + gridStart;
    }

    #createTile(vertices, isDummy){
        return new Tile(vertices, this.#buffer, isDummy);
    }
    
    #raycast(shapes, from, dir, dist, ignoreSelf = true) {
        var collisions = this.#raycastAll(shapes, from, dir, dist, ignoreSelf);
        if(collisions.length > 0){
            return collisions[0];
        }
        return null;
        // var collisionClosest = null;
        // var collisionDist = 99999999999;

        // var end = from.getCopy().remove(new Vector2(dir.x, dir.y).multiply(new Vector2(dist, dist)));
        // // this.#buffer.stroke(255, 0, 0);
        // // this.#buffer.line(from.x, from.y, end.x, end.y);


        // for (let i = 0; i < shapes.length; i++) {
        //     const shape = shapes[i];
        //     const vertices = shape.getVertices();

        //     for (let r = 0; r < vertices.length; r++) {
        //         const vn = vertices[r + 1 < vertices.length ? r + 1 : 0];
        //         const vc = vertices[r];

        //         // if (Collision.pointCircle(vc.x, vc.y, end.x, end.y, 10)) {
        //         //     circle(vc.x, vc.y, 10);
        //         //     circle(vn.x, vn.y, 10);
        //         // }

        //         // if (Collision.lineLine(vc.x, vc.y, vn.x, vn.y, from.x, from.y, end.x, end.y)) {
        //         //     strokeWeight(5);
        //         //     stroke(255, 255, 0);
        //         //     line(vn.x, vn.y, vc.x, vc.y);
        //         // }

        //         if (Collision.linePoint(vn.x, vn.y, vc.x, vc.y, from.x, from.y) && ignoreSelf) {
        //             continue;
        //         }

        //         var collision = Collision.lineLineCollision(from.x, from.y, end.x, end.y, vc.x, vc.y, vn.x, vn.y);
        //         if (collision != null) {
        //             var dist = Vector2.distance(from, collision);
        //             if (collisionClosest == null || dist < collisionDist) {
        //                 collisionClosest = collision;
        //                 collisionDist = dist;
        //             }
        //         }
        //     }
        // }

        // return collisionClosest;
    }

    #raycastAll(shapes, from, dir, dist, ignoreSelf = true){
        var collisions = [];
        var end = from.getCopy().remove(new Vector2(dir.x, dir.y).multiply(new Vector2(dist, dist)));

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const vertices = shape.getVertices();

            for (let r = 0; r < vertices.length; r++) {
                const vn = vertices[r + 1 < vertices.length ? r + 1 : 0];
                const vc = vertices[r];

                if (Collision.linePoint(vn.x, vn.y, vc.x, vc.y, from.x, from.y) && ignoreSelf) {

                    continue;
                }

                var collision = Collision.lineLineCollision(from.x, from.y, end.x, end.y, vc.x, vc.y, vn.x, vn.y);
                if (collision != null) {
                    collisions.push(collision);
                }
            }
        }

        collisions.sort((a, b) => Vector2.distance(from, a) > Vector2.distance(from, b) ? 1 : -1);
        return collisions;
    }

    toJSON() {
        var t = { 'Alucobond': [], 'X-Roof': [], 'Ventilatiekap': [] };

        for (let i = 0; i < this.#tiles.length; i++) {
            const tile = this.#tiles[i];
            
            if (tile.isDummy) {
                t['Alucobond'].push(tile.toJSON());
                this.#totalWidth += tile.width;
                this.#totalHeight += tile.height;
                this.#dummyWidth += tile.width;
                this.#dummyHeight += tile.height;
            }
            else if(tile.isVent) {
                t['Ventilatiekap'].push(tile.toJSON());
            }
            else {
                t['X-Roof'].push(tile.toJSON());
                this.#totalWidth += tile.width;
                this.#totalHeight += tile.height;
                this.#tileWidth += tile.width;
                this.#tileHeight += tile.height;
            }
        }


        // for (let i = 0; i < this.#tiles['Alucobond'].length; i++) {
        //     const tile = this.#tiles['Alucobond'][i];
        //     t['Alucobond'].push(tile.toJSON());
        // }

        // for (let i = 0; i < this.#tiles['X-Roof'].length; i++) {
        //     const tile = this.#tiles['X-Roof'][i];
        //     t['X-Roof'].push(tile.toJSON());
        // }

        return { 'tiles': t, 'width': this.#totalWidth, 'height': this.#totalHeight, 'tile_width': this.#tileWidth, 'tile_height': this.#tileHeight, 'dummy_width': this.#dummyWidth, 'dummy_height': this.#dummyHeight };
    }

    fromJSON(json) {
        if(!json){ return; }

        if (json.tiles) {
            this.#buffer.clear();

            if (json.tiles['Alucobond']){
                for (let i = 0; i < json.tiles['Alucobond'].length; i++) {
                    const tile = json.tiles['Alucobond'][i];

                    var vertices = [];
                    for (let i = 0; i < tile.vertices.length; i++) {
                        const vertice = tile.vertices[i];
                        vertices.push(Vector2.fromJSON(vertice));
                    }
                    this.#tiles.push(new Tile(vertices, this.#buffer, tile.isDummy, tile.isVent));
                }
            }

            if (json.tiles['X-Roof']){
                for (let i = 0; i < json.tiles['X-Roof'].length; i++) {
                    const tile = json.tiles['X-Roof'][i];

                    var vertices = [];
                    for (let i = 0; i < tile.vertices.length; i++) {
                        const vertice = tile.vertices[i];
                        vertices.push(Vector2.fromJSON(vertice));
                    }
                    this.#tiles.push(new Tile(vertices, this.#buffer, tile.isDummy, tile.isVent));
                }
            }

            if (json.tiles['Ventilatiekap']){
                for (let i = 0; i < json.tiles['Ventilatiekap'].length; i++) {
                    const tile = json.tiles['Ventilatiekap'][i];

                    var vertices = [];
                    for (let i = 0; i < tile.vertices.length; i++) {
                        const vertice = tile.vertices[i];
                        vertices.push(Vector2.fromJSON(vertice));
                    }
                    this.#tiles.push(new Tile(vertices, this.#buffer, tile.isDummy, tile.isVent));
                }
            }
        }

        if (json.width) { this.#totalWidth = json.width; }
        if (json.height) { this.#totalHeight = json.height; }

        if (json.dummy_width) { this.#dummyWidth = json.dummy_width; }
        if (json.dummy_height) { this.#dummyHeight = json.dummy_height; }

        if (json.tile_width) { this.#tileWidth = json.tile_width; }
        if (json.tile_height) { this.#tileHeight = json.tile_height; }
    }

    IsInside(vertices, x, y){
        if (Collision.polygonPoint(vertices, x, y)) {
            return true;
        }

        for (let i = 0; i < vertices.length; i++) {
            const vc = vertices[i];
            const vn = vertices[i + 1 < vertices.length - 1 ? i + 1 : 0];

            if (Collision.linePoint(vc.x, vc.y, vn.x, vn.y, x, y)) {
                if (y == 406.91537822811176 && x == 1907.2847231827582) {
                    console.log("Inside");
                }
                return true;
            }
        }

        return false;
    }

    IsInsideForbiddenShapes(forbiddenShapes, x, y){
        var isInside = false;
        for (let i = 0; i < forbiddenShapes.length; i++) {
            const shape = forbiddenShapes[i];
            const shapePoints = shape.getVertices();
            if (this.IsInside(shapePoints, x, y)) {
                isInside = true;
            }
        }

        return isInside;
    }

    isCollidingWithShapes(shapes, shape){
        for (let i = 0; i < shapes.length; i++) {
            const points = shapes[i].getVertices();
            
            if(Collision.polygonPolygon(points, shape)){
                return true;
            }
        }

        return false;
    }

    getTiles(){
        return this.#tiles;
    }
}