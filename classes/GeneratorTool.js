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
    margin = 0;
    rowOffsetMode = false;
    overhang = 0;
    offsetX = 0;
    offsetY = 0;

    debugStartingPoint = true;
    debugInset = true;
    debugOutset = true;
    debugBoundingBox = false;
    debugRaycast = false;
    debugTiles = false;
    debugParallel = false;

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
        var insets = [];
        var overhangs = [];
        var outsets = [];

        this.#buffer.clear();
        var shapes = this.#renderer.getAll();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.isAllowed && !shape.isGenerated) {
                var inset = this.#createInset(shape);
                var overhang = this.#createOverhang(shape);
                inset.lineMargins = shape.lineMargins;
                var points = inset.getVertices();
                var pointsOverhang = overhang.getVertices();
                insets.push(inset);
                overhangs.push(overhang);

                if (this.debugInset) {
                    //visualize inset
                    this.#buffer.push();
                    for (let i = 0; i < pointsOverhang.length; i++) {
                        const vc = pointsOverhang[i];
                        const vn = pointsOverhang[i + 1 < pointsOverhang.length ? i + 1 : 0];
                        this.#buffer.drawingContext.setLineDash([15, 15]);
                        this.#buffer.stroke(0, 0, 255);
                        this.#buffer.strokeWeight(3);
                        this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                    }
                    for (let i = 0; i < points.length; i++) {
                        const vc = points[i];
                        const vn = points[i + 1 < points.length ? i + 1 : 0];
                        this.#buffer.drawingContext.setLineDash([15, 15]);
                        this.#buffer.stroke(255, 0, 0);
                        this.#buffer.strokeWeight(3);
                        this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                    }
                    this.#buffer.pop();
                }
            }
            else {
                var outset = this.#createOutset(shape);
                var points = outset.getVertices();
                outsets.push(outset);

                if (this.debugOutset) {
                    //visualize outset
                    this.#buffer.push();
                    for (let i = 0; i < points.length; i++) {
                        const vc = points[i];
                        const vn = points[i + 1 < points.length ? i + 1 : 0];
                        this.#buffer.drawingContext.setLineDash([15, 15]);
                        this.#buffer.stroke(0, 0, 0);
                        this.#buffer.strokeWeight(3);
                        this.#buffer.line(vc.x, vc.y, vn.x, vn.y);
                    }
                    this.#buffer.pop();
                }
            }
        }

        if (this.debugBoundingBox) {
            for (let i = 0; i < insets.length; i++) {
                const inset = insets[i];
                this.#buffer.stroke(0, 0, 255);
                this.#buffer.strokeWeight(2);
                var boundingBox = overhangs[i].getBoundingBox();
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

        this.#tiles = [];
        this.#totalWidth = 0;
        this.#totalHeight = 0;
        this.#dummyWidth = 0;
        this.#dummyHeight = 0;
        this.#tileWidth = 0;
        this.#tileHeight = 0;

        for (let i = 0; i < insets.length; i++) {
            const inset = insets[i];
            this.#generateTiles(shapes[i], inset, overhangs[i], outsets);
        }
    }

    #createInset(shape) {
        //calculate inset
        var insets = [];
        this.#buffer.beginShape();
        var points = shape.getVertices();
        this.#buffer.push();
        
        for (let i = 0; i < points.length; i++) {
            const vc = points[i];
            const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
            const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];

            var mp = 5;
            var mn = 5;

            mp = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[1]);
            mn = parseInt(shape.lineMargins[i].split('|')[1]);

            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var dirN = vn.getCopy().remove(vc).normalized();
            dirN.multiply(new Vector2(mn, mn));
            var dirP = vp.getCopy().remove(vc).normalized();
            dirP.multiply(new Vector2(mp, mp));
            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);
            
            // Stap 2
            var perpendicularStartPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, mp, 'right');
            var perpendicularEndPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, mp, 'left');
            var perpendicularStartPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, mn, 'right');
            var perpendicularEndPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, mn, 'left');
            
            if (this.debugParallel) {
                this.#buffer.fill(0, 0, 255); // BLAUW
                this.#buffer.stroke(0, 0, 0);
                this.#buffer.text("SPP", perpendicularStartPointP.x - 20, perpendicularStartPointP.y);
                this.#buffer.text("SPN", perpendicularStartPointN.x - 10, perpendicularStartPointN.y);
                this.#buffer.text("EPP", perpendicularEndPointP.x + 20, perpendicularEndPointP.y);
                this.#buffer.text("EPN", perpendicularEndPointN.x + 10, perpendicularEndPointN.y);
            }

            // Stap 3
            var dBuffer = 5;
            var newPosP = this.#calculateInsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, dBuffer, this.debugParallel);
            var newPosN = this.#calculateInsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, dBuffer, this.debugParallel);

            if (Collision.pointPoint(newPosP.x, newPosP.y, newPosN.x, newPosN.y)) {
                insets.push(new Vector2(newPosN.x, newPosN.y));
            } else {
                var directionP = vp.getCopy().remove(vc).normalized();
                var startPointP = Vector2.add(newPosP, directionP.multiplyScalar(1000));
                var endPointP = Vector2.add(newPosP, directionP.multiplyScalar(-1000));

                var directionN = vn.getCopy().remove(vc).normalized();
                var startPointN = Vector2.add(newPosN, directionN.multiplyScalar(1000));
                var endPointN = Vector2.add(newPosN, directionN.multiplyScalar(-1000));

                var collisionPoint = this.#lineIntersection(startPointP, endPointP, startPointN, endPointN);
                insets.push(collisionPoint);


                if (this.debugParallel) {
                    this.#buffer.circle(startPointN.x, startPointN.y, 5);
                    this.#buffer.line(startPointN.x, startPointN.y, endPointN.x, endPointN.y, 5);
                    this.#buffer.line(startPointP.x, startPointP.y, endPointP.x, endPointP.y, 5);
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.text("Collision Point", collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 10);
                }
            }

            if (this.debugParallel) {
                this.#buffer.text(i, vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(posP.x, posP.y, 5);
                this.#buffer.circle(posN.x, posN.y, 5);
                this.#buffer.fill(255, 0, 0);
                this.#buffer.circle(newPosP.x, newPosP.y, 10);
                this.#buffer.circle(newPosN.x, newPosN.y, 10);
            }
        }
        this.#buffer.vertex(insets[0].x, insets[0].y);
        this.#buffer.noStroke();
        this.#buffer.noFill();
        this.#buffer.endShape();
        this.#buffer.pop();

        return new Shape(insets);
    }

    #createOverhang(shape) {
        var insets = [];
        this.#buffer.beginShape();
        var points = shape.getVertices();
        this.#buffer.push();
        
        for (let i = 0; i < points.length; i++) {
            // Overhang Variables
            var enableOverhangP = false;
            var enableOverhangN = false;
            const vc = points[i];
            const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
            const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];
            
            var mp = 5;
            var mn = 5;
            var op = 0;
            var on = 0;

            mp = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[1]);
            mn = parseInt(shape.lineMargins[i].split('|')[1]);

            op = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[2]);
            on = parseInt(shape.lineMargins[i].split('|')[2]);

            if(op != 0) enableOverhangP = true;
            if(on != 0) enableOverhangN = true;

            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var dirN = vn.getCopy().remove(vc).normalized();
            var dirP = vp.getCopy().remove(vc).normalized();
            dirP.multiply(new Vector2(enableOverhangP ? op : mp, enableOverhangP ? op : mp));
            dirN.multiply(new Vector2(enableOverhangN ? on : mn, enableOverhangN ? on : mn));
            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);
            
            // Stap 2
            var perpendicularStartPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, enableOverhangP ? op : mp, 'right');
            var perpendicularEndPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, enableOverhangP ? op : mp, 'left');
            var perpendicularStartPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, enableOverhangN ? on : mn, 'right');
            var perpendicularEndPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, enableOverhangN ? on : mn, 'left');
            
            if (this.debugParallel) {
                this.#buffer.fill(0, 0, 255); // BLAUW
                this.#buffer.stroke(0, 0, 0);
                this.#buffer.text("SPP", perpendicularStartPointP.x - 20, perpendicularStartPointP.y);
                this.#buffer.text("SPN", perpendicularStartPointN.x - 10, perpendicularStartPointN.y);
                this.#buffer.text("EPP", perpendicularEndPointP.x + 20, perpendicularEndPointP.y);
                this.#buffer.text("EPN", perpendicularEndPointN.x + 10, perpendicularEndPointN.y);
            }

            // Stap 3
            var dBuffer = 5;
            var newPosP, newPosN;
            if(!enableOverhangP) newPosP = this.#calculateInsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, dBuffer, this.debugParallel);
            else newPosP = this.#calculateOutsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, this.debugParallel);
            if(!enableOverhangN) newPosN = this.#calculateInsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, dBuffer, this.debugParallel);
            else newPosN = this.#calculateOutsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, this.debugParallel);

            if (Collision.pointPoint(newPosP.x, newPosP.y, newPosN.x, newPosN.y)) {
                insets.push(new Vector2(newPosN.x, newPosN.y));
            } else {
                var directionP = vp.getCopy().remove(vc).normalized();
                var startPointP = Vector2.add(newPosP, directionP.multiplyScalar(1000));
                var endPointP = Vector2.add(newPosP, directionP.multiplyScalar(-1000));

                var directionN = vn.getCopy().remove(vc).normalized();
                var startPointN = Vector2.add(newPosN, directionN.multiplyScalar(1000));
                var endPointN = Vector2.add(newPosN, directionN.multiplyScalar(-1000));

                var collisionPoint = this.#lineIntersection(startPointP, endPointP, startPointN, endPointN);
                insets.push(collisionPoint);

                if (this.debugParallel) {
                    this.#buffer.circle(startPointN.x, startPointN.y, 5);
                    this.#buffer.line(startPointN.x, startPointN.y, endPointN.x, endPointN.y, 5);
                    this.#buffer.line(startPointP.x, startPointP.y, endPointP.x, endPointP.y, 5);
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.text("Collision Point", collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 10);
                }
            }

            if (this.debugParallel) {
                this.#buffer.text(i, vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(posP.x, posP.y, 5);
                this.#buffer.circle(posN.x, posN.y, 5);
                this.#buffer.fill(255, 0, 0);
                this.#buffer.circle(newPosP.x, newPosP.y, 10);
                this.#buffer.circle(newPosN.x, newPosN.y, 10);
            }
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
            dirN.multiply(new Vector2(mp, mp));
            var dirP = vp.getCopy().remove(vc).normalized();
            dirP.multiply(new Vector2(mn, mn));
            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);

            // Stap 2
            var perpendicularStartPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, mp, 'right');
            var perpendicularEndPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, mp, 'left');

            var perpendicularStartPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, mn, 'right');
            var perpendicularEndPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, mn, 'left');

            if (this.debugParallel) {
                this.#buffer.fill(0, 0, 255); // BLAUW
                this.#buffer.stroke(0, 0, 0);
                this.#buffer.text("SPP", perpendicularStartPointP.x - 20, perpendicularStartPointP.y);
                this.#buffer.text("SPN", perpendicularStartPointN.x - 10, perpendicularStartPointN.y);
                this.#buffer.text("EPP", perpendicularEndPointP.x + 20, perpendicularEndPointP.y);
                this.#buffer.text("EPN", perpendicularEndPointN.x + 10, perpendicularEndPointN.y);

                this.#buffer.circle(perpendicularStartPointP.x, perpendicularStartPointP.y, 10);
                this.#buffer.circle(perpendicularStartPointN.x, perpendicularStartPointN.y, 10);
                this.#buffer.circle(perpendicularEndPointP.x, perpendicularEndPointP.y, 10);
                this.#buffer.circle(perpendicularEndPointN.x, perpendicularEndPointN.y, 10);
            }

            // Stap 3
            var newPosP = this.#calculateOutsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, this.debugParallel); 
            var newPosN = this.#calculateOutsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, this.debugParallel);

            // Check if points are on the same coordinates
            if (Collision.pointPoint(newPosP.x, newPosP.y, newPosN.x, newPosN.y)) {
                outsets.push(new Vector2(newPosN.x, newPosN.y));
            } else {
                // Draw a line parallel of original line
                var directionP = vp.getCopy().remove(vc).normalized();
                var startPointP = Vector2.add(newPosP, directionP.multiplyScalar(1000));
                var endPointP = Vector2.add(newPosP, directionP.multiplyScalar(-1000));

                var directionN = vn.getCopy().remove(vc).normalized();
                var startPointN = Vector2.add(newPosN, directionN.multiplyScalar(1000));
                var endPointN = Vector2.add(newPosN, directionN.multiplyScalar(-1000));

                var collisionPoint = this.#lineIntersection(startPointP, endPointP, startPointN, endPointN);
                if (this.debugParallel) {
                    this.#buffer.circle(startPointN.x, startPointN.y, 5);
                    this.#buffer.line(startPointN.x, startPointN.y, endPointN.x, endPointN.y, 5);
                    this.#buffer.line(startPointP.x, startPointP.y, endPointP.x, endPointP.y, 5);
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.text("Collision Point", collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 10);
                }
                outsets.push(collisionPoint);
            }

            if (this.debugParallel) {
                this.#buffer.text(i, vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(posP.x, posP.y, 10);
                this.#buffer.circle(posN.x, posN.y, 10);
            }
        }
        this.#buffer.vertex(outsets[0].x, outsets[0].y);
        this.#buffer.noStroke();
        this.#buffer.noFill();
        this.#buffer.endShape();
        this.#buffer.pop();

        return new Shape(outsets);
    }

    async #generateTiles(shape, inset, overhang, outsets) {
        var self = this;
        var tileSize = new Vector2(820 / 10, (600 / 10));
        var overlap = 100 / 10;
        var shapePoints = shape.getVertices();
        var insetPoints = inset.getVertices();
        var overhangPoints = overhang.getVertices();
        var boundingBox = overhang.getBoundingBox();
        var count = 0;
        var hasTilesAbove = false;
        var tmpResults = [];

        var syncedPlaceTile = async (x, y, predictionPoints, isDummy = false) => new Promise((resolve) => {
            var delay = 1;
            // var isDummy = false;
            count++;

            setTimeout(() => {
                var results = [];
                var collisions = [];
                var inShapeCount = 0;
                var outsideShapeCount = 0;
                var inForbiddenCount = 0;

                if(self.debugTiles){
                    self.#buffer.text(count, predictionPoints[0].x + 10 + tileSize.x / 2, predictionPoints[0].y + 10 + tileSize.y / 2);
                }

                for (let i = 0; i < predictionPoints.length; i++) {
                    const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                    const vc = predictionPoints[i];
                    const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                    if(!self.IsInside(insetPoints, vc.x, vc.y)) {isDummy = true; }
                    if(!self.IsInside(overhangPoints, vc.x, vc.y)) {isDummy = true; outsideShapeCount++;} else inShapeCount++;
                    if(self.IsInsideForbiddenShapes(outsets, vc.x, vc.y )) {inForbiddenCount++;}
                    
                    if(!self.IsInsideForbiddenShapes(outsets, vc.x, vc.y) && self.IsInside(overhangPoints, vc.x, vc.y)){
                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();
    
                        if (this.debugTiles){
                            self.#buffer.fill(0);
                            self.#buffer.circle(vc.x, vc.y, 5);
                            self.#buffer.stroke(255, 255, 0);
                            self.#buffer.line(vc.x, vc.y, vc.x + (dirN.x * 20), vc.y + (dirN.y * 20));
                            self.#buffer.stroke(0, 0, 255);
                            self.#buffer.line(vc.x, vc.y, vc.x + (dirP.x * 20), vc.y + (dirP.y * 20));
                        }

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);

                        if(raycastP != null){
                            if(Vector2.distance(raycastP, vp) > 0 || (!self.IsInsideForbiddenShapes(outsets, vp.x, vp.y, false) && Vector2.distance(raycastP, vp) <= 0)) {
                                isDummy = true;
                                results.push(raycastP);
                                collisions.push({'index': results.length - 1, 'isWall': !self.IsInsideForbiddenShapes(outsets, vp.x, vp.y) && !self.IsInside(overhangPoints, vp.x, vp.y) });
                            }
                        }

                        results.push(vc);

                        if (raycastN != null) {
                            if(Vector2.distance(raycastN, vn) > 0 ||  (!self.IsInsideForbiddenShapes(outsets, vn.x, vn.y, false) && Vector2.distance(raycastN, vn) <= 0)) {
                                isDummy = true;
                                results.push(raycastN);
                                collisions.push({'index': results.length, 'isWall': !self.IsInsideForbiddenShapes(outsets, vn.x, vn.y) && !self.IsInside(overhangPoints, vn.x, vn.y) });
                            }
                        }
                    }
                    else{
                        isDummy = true;
                    }
                }

                var pointsNeedToBeAdded = [];
                for (let r = 0; r < overhangPoints.length; r++) {
                    const insetPoint = overhangPoints[r];
                    if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y, false)) {
                        pointsNeedToBeAdded.push(insetPoint);
                    }
                }
                for (let r = 0; r < overhangPoints.length; r++) {
                    const overhangPoint = overhangPoints[r];
                    if(self.IsInside(predictionPoints, overhangPoint.x, overhangPoint.y, false)){
                        pointsNeedToBeAdded.push(overhangPoint);
                    }
                }

                var multipleOutsetsUsed = false;
                var _outsets = [];
                for (let x = 0; x < outsets.length; x++) {
                    const outsetPoints = outsets[x].getVertices();

                    for (let r = 0; r < outsetPoints.length; r++) {
                        const outsetPoint = outsetPoints[r];
                        if (self.IsInside(predictionPoints, outsetPoint.x, outsetPoint.y, true)) {
                            pointsNeedToBeAdded.push(outsetPoint);
                            _outsets.push(x);
                        }
                    }
                }
                if(_outsets.length > 1) multipleOutsetsUsed = true;

                var pointsAddedThroughException = false;
                if(inForbiddenCount == 2 && outsideShapeCount == 2){
                    console.log(count,'inForbiddenCount == 2 && outsideShapeCount == 2', inForbiddenCount == 2 , outsideShapeCount == 2);
                    for (let i = 0; i < predictionPoints.length; i++) {
                        const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                        const vc = predictionPoints[i];
                        const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);

                        if(raycastP != null){
                            if(Vector2.distance(raycastP, vp) > 0){ 
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                    var response = self.checkAndPush(results, raycastP, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }

                        if(self.IsInside(overhangPoints, vc.x, vc.y) && !self.IsInsideForbiddenShapes(outsets, vc.x, vc.y, false) && pointsNeedToBeAdded.length == 0){
                            var response = self.checkAndPush(results, vc, 0, false);
                            if (response != 'found') pointsAddedThroughException = true;
                        }

                        if (raycastN != null) {
                            if(Vector2.distance(raycastN, vn) > 0){
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                    var response = self.checkAndPush(results, raycastN, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }
                    }
                } else if(inForbiddenCount == 1 && outsideShapeCount == 1){
                    console.log(count,'inForbiddenCount == 1 && outsideShapeCount == 1');
                    for (let i = 0; i < predictionPoints.length; i++) {
                        const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                        const vc = predictionPoints[i];
                        const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);

                        if(raycastP != null){
                            if(Vector2.distance(raycastP, vp) > 0){ 
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                    var response = self.checkAndPush(results, raycastP, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }

                        if(self.IsInside(overhangPoints, vc.x, vc.y) && !self.IsInsideForbiddenShapes(outsets, vc.x, vc.y, false)){
                            var response = self.checkAndPush(results, vc, 0, false);
                            if (response != 'found') pointsAddedThroughException = true;
                        }

                        if (raycastN != null) {
                            if(Vector2.distance(raycastN, vn) > 0){
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                    var response = self.checkAndPush(results, raycastN, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }
                    }
                } else if(inForbiddenCount >= 1 && outsideShapeCount >= 2){
                    console.log(count,'inForbiddenCount >= 1 && outsideShapeCount >= 2');
                    for (let i = 0; i < predictionPoints.length; i++) {
                        const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                        const vc = predictionPoints[i];
                        const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);

                        if(raycastP != null){
                            if(Vector2.distance(raycastP, vp) > 0){ 
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                    var response = self.checkAndPush(results, raycastP, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }

                        if(self.IsInside(overhangPoints, vc.x, vc.y) && !self.IsInsideForbiddenShapes(outsets, vc.x, vc.y, false)){
                            var response = self.checkAndPush(results, vc, 0, false);
                            if (response != 'found') pointsAddedThroughException = true;
                        }

                        if (raycastN != null) {
                            if(Vector2.distance(raycastN, vn) > 0){
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                    var response = self.checkAndPush(results, raycastN, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }
                    }
                } else if(inForbiddenCount >= 2 && outsideShapeCount >= 1){
                    console.log(count,'inForbiddenCount >= 2 && outsideShapeCount >= 1');
                    for (let i = 0; i < predictionPoints.length; i++) {
                        const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                        const vc = predictionPoints[i];
                        const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);

                        if(raycastP != null){
                            if(Vector2.distance(raycastP, vp) > 0){ 
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                    var response = self.checkAndPush(results, raycastP, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }

                        // if(self.IsInside(overhangPoints, vc.x, vc.y) && !self.IsInsideForbiddenShapes(outsets, vc.x, vc.y, false)){
                        //     var response = self.checkAndPush(results, vc, 0, false);
                        //     if (response != 'found') pointsAddedThroughException = true;
                        // }

                        if (raycastN != null) {
                            if(Vector2.distance(raycastN, vn) > 0){
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                    var response = self.checkAndPush(results, raycastN, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }
                    }
                } else if(inForbiddenCount == 1 && outsideShapeCount == 0){
                    console.log(count,'inForbiddenCount >= 1 && outsideShapeCount == 0');
                    for (let i = 0; i < predictionPoints.length; i++) {
                        const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                        const vc = predictionPoints[i];
                        const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);

                        if(raycastP != null){
                            if(Vector2.distance(raycastP, vp) > 0){ 
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                    var response = self.checkAndPush(results, raycastP, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }

                        // if(self.IsInside(overhangPoints, vc.x, vc.y) && !self.IsInsideForbiddenShapes(outsets, vc.x, vc.y, false)){
                        //     var response = self.checkAndPush(results, vc, 0, false);
                        //     if (response != 'found') pointsAddedThroughException = true;
                        // }

                        if (raycastN != null) {
                            if(Vector2.distance(raycastN, vn) > 0){
                                isDummy = true;
                                if(self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                    var response = self.checkAndPush(results, raycastN, 0, false);
                                    if (response != 'found') pointsAddedThroughException = true;
                                }
                            }
                        }
                    }
                } 
                if(pointsAddedThroughException){
                    this.#reorderClockwise(results);
                }

                var extraTile = null;
                //split tile
                if(collisions.length >= 4){                
                    if(pointsNeedToBeAdded.length == 1) {
                        var index;
                        for (let j = 0; j < collisions.length; j++) {
                            const element = collisions[j];
                            if(!element['isWall']) index = element['index'];
                        }

                        for (let r = 0; r < overhangPoints.length; r++) {
                            const insetPoint = overhangPoints[r];
                            if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y, false)) {
                                if (self.IsInside(results, insetPoint.x, insetPoint.y, false)) {
                                    results.splice(index, 0, insetPoint);
                                    isDummy = true;
                                } else {
                                    const vp = results[index - 1];
                                    const vc = insetPoint;
                                    const vn = results[index];        
                                    // Direction calculation
                                    var dirP = vp.getCopy().remove(vc).normalized();
                                    var dirN = vn.getCopy().remove(vc).normalized();
                                    //Make a shape for the results
                                    var shape = new Shape(results);
                                    var toPrev = self.#raycast([shape], vc, new Vector2(-dirP.x, -dirP.y), Vector2.distance(vp, vc), false);
                                    var toNext = self.#raycast([shape], vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc), false);
                                    results.splice(index, 0, toPrev);
                                    results.splice(index+1, 0, toNext);
                                    isDummy = true;
                                }
                            }
                        }
                        for (let x = 0; x < outsets.length; x++) {
                            const outsetPoints = outsets[x].getVertices();
                            for (let r = 0; r < outsetPoints.length; r++) {
                                const outsetPoint = outsetPoints[r];
                                if (self.IsInside(predictionPoints, outsetPoint.x, outsetPoint.y, false)) {
                                    if (self.IsInside(results, outsetPoint.x, outsetPoint.y, false)) {
                                        results.splice(index, 0, outsetPoint);
                                        isDummy = true;
                                    } else {
                                        const vp = results[index - 1];
                                        const vc = outsetPoint;
                                        const vn = results[index];        
                                        // Direction calculation
                                        var dirP = vp.getCopy().remove(vc).normalized();
                                        var dirN = vn.getCopy().remove(vc).normalized();
                                        //Make a shape for the results
                                        var shape = new Shape(results);
                                        var toPrev = self.#raycast([shape], vc, new Vector2(-dirP.x, -dirP.y), Vector2.distance(vp, vc), false);
                                        var toNext = self.#raycast([shape], vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc), false);
                                        results.splice(index, 0, toPrev);
                                        results.splice(index+1, 0, toNext);
                                        isDummy = true;
                                    }
                                }
                            }
                        }

                        if(this.debugTiles){
                            for (let k = 0; k < results.length; k++) {
                                const element = results[k];
                                self.#buffer.text(k,element.x,element.y);
                            }
                        }
                    }
                    else if(pointsNeedToBeAdded.length >= 2){
                        var newResults = [];
                        for (let i = 0; i < results.length; i++) {
                            const vp = results[i - 1 >= 0 ? i - 1 : results.length - 1];
                            const vc = results[i];
                            const vn = results[i + 1 <= results.length - 1 ? i + 1 : 0];

                            newResults.push(vc);
                            
                            // Direction calculation
                            var dirP = vp.getCopy().remove(vc).normalized();
                            var dirN = vn.getCopy().remove(vc).normalized();
                            // Make 90 degrees angles
                            var maxP = Math.max(Math.abs(dirP.x), Math.abs(dirP.y));
                            var maxN = Math.max(Math.abs(dirN.x), Math.abs(dirN.y));
                            if (maxP === Math.abs(dirP.x)) {dirP.x = dirP.x > 0 ? 1 : -1; dirP.y = 0;}
                            else {dirP.y = dirP.y > 0 ? 1 : -1; dirP.x = 0;}
                            if (maxN === Math.abs(dirN.x)) {dirN.x = dirN.x > 0 ? 1 : -1; dirN.y = 0;}
                            else {dirN.y = dirN.y > 0 ? 1 : -1; dirN.x = 0;}
                            var distanceP = Vector2.distance(vc, vp);
                            var distanceN = Vector2.distance(vc, vn);
                            var hitPointsP = [];
                            var hitPointsN = [];
                            for (let j = 0; j < pointsNeedToBeAdded.length; j++) {
                                const element = pointsNeedToBeAdded[j];
                                if(Collision.lineCircle(vc.x, vc.y, vc.x + dirP.x * distanceP, vc.y + dirP.y * distanceP, element.x, element.y, 5)){
                                    hitPointsP.push(element);
                                }
                                if(Collision.lineCircle(vc.x, vc.y, vc.x + dirN.x * distanceN, vc.y + dirN.y * distanceP, element.x, element.y, 5)){
                                    hitPointsN.push(element);
                                }
                            }
                            
                            if(hitPointsP.length > 0){
                                var closestVector;
                                var closestDistance = Infinity;
                                
                                for (let k = 0; k < hitPointsP.length; k++) {
                                    var distance = dist(vc.x, vc.y, hitPointsP[k].x, hitPointsP[k].y);
                                    if (distance < closestDistance) {
                                        closestDistance = distance;
                                        closestVector = hitPointsP[k];
                                    }
                                }
                                self.checkAndPush(newResults, closestVector, newResults.length - 1, true);
                                collisions[1]['index'] ++;
                                collisions[2]['index'] ++;
                            }
                            
                            if(hitPointsN.length > 0){
                                var closestVector;
                                var closestDistance = Infinity;
                                for (let k = 0; k < hitPointsN.length; k++) {
                                    var distance = dist(vc.x, vc.y, hitPointsN[k].x, hitPointsN[k].y);
                                    if (distance < closestDistance) {
                                        closestDistance = distance;
                                        closestVector = hitPointsN[k];
                                    }
                                }
                                self.checkAndPush(newResults, closestVector, newResults.length , true);
                                collisions[3]['index'] ++;
                            }

                        }

                        results = newResults;
                        if(!multipleOutsetsUsed){
                            isDummy = true;
                            var tile01 = results.slice(collisions[0]['index'], collisions[2]['index']);
                            var tile02 = results.slice(collisions[2]['index'], results.length).concat(results.slice(0, collisions[0]['index']));
        
                            extraTile = Vector2.copyAll(tile01);
                            results = Vector2.copyAll(tile02);
                        }
                    }  
                    else {
                        isDummy = true;
                        var tile01 = results.slice(collisions[0]['index'], collisions[2]['index']);
                        var tile02 = results.slice(collisions[2]['index'], results.length).concat(results.slice(0, collisions[0]['index']));
                        extraTile = Vector2.copyAll(tile01);
                        results = Vector2.copyAll(tile02);
                    }
                }
                //add point inside tile
                else if(collisions.length >= 2){
                    
                    var resultLength = results.length;

                    var index = collisions[0]['index'];
                    for (let r = 0; r < overhangPoints.length; r++) {
                        const insetPoint = overhangPoints[r];
                        if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y, false)) {
                            results.splice(index, 0, insetPoint);
                            didAdd = true;
                        }
                    }
                    for (let x = 0; x < outsets.length; x++) {
                        const outsetPoints = outsets[x].getVertices();

                        for (let r = 0; r < outsetPoints.length; r++) {
                            const outsetPoint = outsetPoints[r];
                            if (self.IsInside(predictionPoints, outsetPoint.x, outsetPoint.y, false)) {
                                if(self.IsInside(overhangPoints, outsetPoint.x, outsetPoint.y)){
                                    if(pointsAddedThroughException){
                                        // Check which 2 points falls into the forbidden
                                        var index = null;
                                        for (let a = 0; a < results.length; a++) {
                                            const vc = results[a];
                                            const vn = results[a + 1 <= results.length - 1 ? a + 1 : 0];
                                            
                                            if(self.IsInsideForbiddenShapes(outsets, vc.x, vc.y) && self.IsInsideForbiddenShapes(outsets, vn.x, vn.y)) {
                                                if(index == null) {
                                                    index = a;
                                                    break;
                                                }
                                            }
                                        }

                                        if(index != null) {
                                            results.splice(index + 1, 0, outsetPoint);
                                        }
                                    } else {
                                        results.splice(index, 0, outsetPoint);
                                    }
                                }
                                else{
                                    for (let t = 0; t < predictionPoints.length; t++) {
                                        const vp = predictionPoints[t - 1 >= 0 ? t - 1 : predictionPoints.length - 1];
                                        const vc = predictionPoints[t];
                                        const vn = predictionPoints[t + 1 <= predictionPoints.length - 1 ? t + 1 : 0];

                                        var dirP = vp.getCopy().remove(vc).normalized();
                                        var dirN = vn.getCopy().remove(vc).normalized();

                                        var distP = Vector2.distance(vc, vp);
                                        var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                                        var distN = Vector2.distance(vc, vn);
                                        var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);
                                        if(raycastP != null && raycastN != null){
                                            var startPointP = Vector2.add(raycastP, dirN.multiplyScalar(100));
                                            var endPointP = Vector2.add(raycastP, dirN.multiplyScalar(-100));
                                            var startPointN = Vector2.add(raycastN, dirP.multiplyScalar(100));
                                            var endPointN = Vector2.add(raycastN, dirP.multiplyScalar(-100));
        
                                            var collisionPoint = this.#lineIntersection(startPointP, endPointP, startPointN, endPointN);
                                            if(self.IsInside(overhangPoints, collisionPoint.x, collisionPoint.y))
                                                results.splice(index, 0, collisionPoint);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    if(results.length == resultLength){
                        //Loop door predicted points
                        for (let k = 0; k < predictionPoints.length; k++) {
                            const vp = predictionPoints[k - 1 >= 0 ? k - 1 : predictionPoints.length - 1];
                            const vc = predictionPoints[k];
                            const vn = predictionPoints[k + 1 <= predictionPoints.length - 1 ? k + 1 : 0];
                            
                            if (!self.IsInside(overhangPoints, vc.x, vc.y))
                            {
                                var dirP = vp.getCopy().remove(vc).normalized();
                                var dirN = vn.getCopy().remove(vc).normalized();
        
                                var distP = Vector2.distance(vc, vp);
                                var raycastP = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, true);
                                var distN = Vector2.distance(vc, vn);
                                var raycastN = self.#raycast([overhang].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, true);
                                
                                var doCollisionCheckP = false;
                                var doCollisionCheckN = false;
                                if(raycastP != null){
                                    if(!self.IsInsideForbiddenShapes(outsets, raycastP.x, raycastP.y) && self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                        self.checkAndPush(results, raycastP, k, true);
                                    }
                                    else if(self.IsInsideForbiddenShapes(outsets, raycastP.x, raycastP.y) && self.IsInside(overhangPoints, raycastP.x, raycastP.y)){
                                        doCollisionCheckP = true;
                                    }
                                }
                                if(raycastN != null){
                                    if(!self.IsInsideForbiddenShapes(outsets, raycastN.x, raycastN.y) && self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                        self.checkAndPush(results, raycastN, k + 1, true);
                                    }
                                    else if(self.IsInsideForbiddenShapes(outsets, raycastN.x, raycastN.y) && self.IsInside(overhangPoints, raycastN.x, raycastN.y)){
                                        doCollisionCheckN = true;
                                    }
                                }
                                

                                if(raycastP != null && raycastN != null && (doCollisionCheckP || doCollisionCheckN)){
                                    var startPointP = Vector2.add(raycastP, dirN.multiplyScalar(100));
                                    var endPointP = Vector2.add(raycastP, dirN.multiplyScalar(-100));
                                    var startPointN = Vector2.add(raycastN, dirP.multiplyScalar(100));
                                    var endPointN = Vector2.add(raycastN, dirP.multiplyScalar(-100));
                                    var collisionPoint = this.#lineIntersection(startPointP, endPointP, startPointN, endPointN);
                                    
                                    if(doCollisionCheckP)
                                        self.checkAndPush(results, collisionPoint, k);
                                    else if(doCollisionCheckN)
                                        self.checkAndPush(results, collisionPoint, k + 1);
                                }
                                
                            }
                        }
                    }
                }

                // if(count == 2|| count == 3||count == 4||count == 15||count == 17||count == 21||count == 22||count == 28||count == 35||count == 47||count == 48||count == 49||count == 50)
                //     console.log(count, 'inShapeCount', inShapeCount, 'outsideShapeCount', outsideShapeCount, 'inForbiddenCount', inForbiddenCount, results);

                predictionPoints = Vector2.copyAll(results);
                
                // create tile
                var tile;
                if(inShapeCount >= 1){
                    tile = self.#createTile(predictionPoints, isDummy);
                }
                var extra = null;

                if(tile != null){
                    var bb = tile.getBoundingBox();
                    if (bb.h <= 0 || bb.w <= 0) {
                        tile = null;
                    }
                }

                if(extraTile != null){
                    extra = self.#createTile(extraTile, isDummy);
                    var extraBb = extra.getBoundingBox();
                    if (extraBb.h <= 0 || extraBb.w <= 0) {
                        extra = null;
                    }
                }
                resolve([tile, extra]);
            }, delay);
        });

        var tmpTiles = [];
        var loop = async (x, y, w, h) => {
            self.#buffer.stroke(0);
            var yIndex = Math.round((y - (topleft.y + self.offsetY)) / (tileSize.y - overlap));
            var xIndex = Math.round((x - (topleft.x + self.offsetX)) / tileSize.x);
            var tempX = x + (this.rowOffsetMode && Math.abs(yIndex % 2) == 1 ? tileSize.x / 2 : 0);
            var tempY = h - overlap;
            if(yIndex == 0 && !hasTilesAbove){
                tempY += overlap;
            }
            var predictedPoints = [new Vector2(tempX, y), new Vector2(tempX + w, y), new Vector2(tempX + w, y + tempY), new Vector2(tempX, y + tempY)];
            if(Collision.polygonPolygon(insetPoints, predictedPoints)){
                await syncedPlaceTile(tempX, y, predictedPoints, y < topleft.y + self.offsetY || x < topleft.x + self.offsetX).then(tiles => {
                    tmpTiles[xIndex + ", " + yIndex] = tiles;
                    for (let r = 0; r < tiles.length; r++) {
                        const tile = tiles[r];
                        if(tile != null){
                            if(yIndex != 0 && tmpResults.length <= 0){
                                hasTilesAbove = true;
                            }
                            tmpResults.push(tile);
                            // self.#buffer.text(tempY, tile.getVertices()[0].x + 5, tile.getVertices()[0].y + 25);
                        }
                    }
                });
            }
            await self.#sleep(10);

            // if(tmpTiles[x + "_" + y] && (tmpTiles[x + "_" + y][0] != null || tmpTiles[x + "_" + y][1] != null)){
                //Neighbour right
                if(typeof tmpTiles[(xIndex + 1) + ", " + yIndex] === "undefined"){
                    var predictedRight = Vector2.copyAll(predictedPoints);
                    for (let x = 0; x < predictedRight.length; x++) {
                        predictedRight[x].x += w;
                    }

                    if(Collision.polygonPolygon(insetPoints, predictedRight)){
                        await loop(x + w, y, w, h);
                    }
                }
                //Neighbour left
                if(typeof tmpTiles[(xIndex - 1) + ", " + yIndex] === "undefined"){
                    var predictedLeft = Vector2.copyAll(predictedPoints);
                    for (let x = 0; x < predictedLeft.length; x++) {
                        predictedLeft[x].x -= w;
                    }

                    if(Collision.polygonPolygon(insetPoints, predictedLeft)){
                        await loop(x - w, y, w, h);
                    }
                }
                //Neighbour up
                if(typeof tmpTiles[xIndex + ", " + (yIndex - 1)] === "undefined"){
                    var predictedUp = Vector2.copyAll(predictedPoints);
                    for (let x = 0; x < predictedUp.length; x++) {
                        predictedUp[x].y -= tempY;
                    }
                    
                    if(Collision.polygonPolygon(insetPoints, predictedUp)){
                        await loop(x, y - tempY, w, h);
                    }
                }
                //Neighbour down
                if(typeof tmpTiles[xIndex + ", " + (yIndex + 1)] === "undefined"){
                    var predictedDown = Vector2.copyAll(predictedPoints);
                    for (let x = 0; x < predictedDown.length; x++) {
                        predictedDown[x].y += tempY;
                    }

                    if(Collision.polygonPolygon(insetPoints, predictedDown)){
                        await loop(x, y + tempY, w, h);
                    }
                }
            // }
        };
        
        //Find the top left vertice of the shape
        var topleft = null;
        for (let i = 0; i < insetPoints.length; i++) {
            const vc = insetPoints[i];
            
            if(topleft == null){
                topleft = vc;
            }
            else if(Vector2.distance(vc, boundingBox) < Vector2.distance(topleft, boundingBox)){
                topleft = vc;
            }
        }

        if(this.debugStartingPoint){
            this.#buffer.fill(255, 0, 0);
            this.#buffer.circle(topleft.x + self.offsetX, topleft.y + self.offsetY, 10);
        }

        //center
        await loop(topleft.x + self.offsetX, topleft.y + self.offsetY - tileSize.y + overlap, tileSize.x, tileSize.y);
        
        if(this.debugStartingPoint){
            this.#buffer.fill(255, 0, 0);
            this.#buffer.circle(topleft.x + self.offsetX, topleft.y + self.offsetY, 10);
        }

        this.#tiles = this.#tiles.concat(tmpResults);
    }

    #createTile(vertices, isDummy) {
        return new Tile(vertices, this.#buffer, isDummy);
    }

    #raycast(shapes, from, dir, dist, ignoreSelf = true) {
        var collisions = this.#raycastAll(shapes, from, dir, dist, ignoreSelf);
        if (collisions.length > 0) {
            return collisions[0];
        }
        return null;
    }

    #raycastAll(shapes, from, dir, dist, ignoreSelf = true) {
        var collisions = [];
        var keys = [];
        var end = from.getCopy().remove(new Vector2(dir.x, dir.y).multiply(new Vector2(dist, dist)));
        if(this.debugRaycast){
            this.#buffer.fill(0);
            this.#buffer.line(from.x, from.y, end.x, end.y);
        }

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const vertices = shape.getVertices();

            for (let r = 0; r < vertices.length; r++) {
                const vn = vertices[r + 1 < vertices.length ? r + 1 : 0];
                const vc = vertices[r];
                var key = i + "_" + r + "_" + (r + 1 < vertices.length ? r + 1 : 0);
                if(keys.includes(key)){
                    continue;
                }

                if (Collision.linePoint(vn.x, vn.y, vc.x, vc.y, from.x, from.y) && ignoreSelf) {
                    keys.push(key);
                    continue;
                }

                var collision = Collision.lineLineCollision(from.x, from.y, end.x, end.y, vc.x, vc.y, vn.x, vn.y);
                if (collision != null) {
                    keys.push(key);
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
            else if (tile.isVent) {
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

        return { 'tiles': t, 'width': this.#totalWidth, 'height': this.#totalHeight, 'tile_width': this.#tileWidth, 'tile_height': this.#tileHeight, 'dummy_width': this.#dummyWidth, 'dummy_height': this.#dummyHeight };
    }

    fromJSON(json) {
        if (!json) { return; }

        if (json.tiles) {
            this.#buffer.clear();

            if (json.tiles['Alucobond']) {
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

            if (json.tiles['X-Roof']) {
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

            if (json.tiles['Ventilatiekap']) {
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

        if (json.offsetX) { this.offsetX = json.offsetX; }
        if (json.offsetY) { this.offsetY = json.offsetY; }
    }

    IsInside(vertices, x, y, includeLines = true) {
        var isInside = false;

        if (Collision.polygonPoint(vertices, x, y)) {
            isInside = true;
        }

        for (let i = 0; i < vertices.length; i++) {
            const vc = vertices[i];
            const vn = vertices[i + 1 <= vertices.length - 1 ? i + 1 : 0];

            if (Collision.linePoint(vc.x, vc.y, vn.x, vn.y, x, y)) {
                if (includeLines){
                    isInside = true;
                }
                else {
                    isInside = false;
                }
                break;
            }
        }

        return isInside;
    }

    IsInsideForbiddenShapes(forbiddenShapes, x, y, includeLines = true) {
        var isInside = false;
        for (let i = 0; i < forbiddenShapes.length; i++) {
            const shape = forbiddenShapes[i];
            const shapePoints = shape.getVertices();
            if (this.IsInside(shapePoints, x, y, includeLines)) {
                isInside = true;
            }
        }

        return isInside;
    }

    checkAndPush(arr, vector2, index, useIndex = false) {
        var found = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].x === vector2.x && arr[i].y === vector2.y) {
                found = true;
                return 'found';
            }
        }
        if (!found) {
            if(useIndex) arr.splice(index, 0, vector2);
            else arr.push(vector2);
        }
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
        return new Vector2(xCoor, yCoor);
    }

    #getPerpendicularPoint(x1, y1, x2, y2, distance, direction) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
        if (direction === 'left') {
            return new Vector2(x1 + dy * distance, y1 - dx * distance);
        } else {
            return new Vector2(x1 - dy * distance, y1 + dx * distance);
        }
    }

    #calculateInsetPoint(shape, point, startPoint, endPoint, dBuffer, debug = false){
        let newPos = null;

        if (Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1) && Collision.polygonCircle(shape.getVertices(), endPoint.x, endPoint.y, 1)) {
            const directionStart = new Vector2(startPoint.x, startPoint.y).remove(point).normalized();
            const directionEnd = new Vector2(endPoint.x, endPoint.y).remove(posP).normalized();

            const raycastPSFalse = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), false);
            const raycastPSTrue = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), true);
            if (raycastPSFalse == null && raycastPSTrue == null) {
                if (debug) {
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.circle(startPoint.x, startPoint.y, 5);
                }
                newPos = startPoint;
            } else if (Vector2.distance(point, raycastSFalse) <= dBuffer && raycastSTrue == null) {
                newPos = startPoint;
            } else if (Vector2.distance(point, raycastSTrue) <= dBuffer && raycastSFalse == null) {
                newPos = startPoint;
            } else {
                if (debug) {
                    this.#buffer.line(point.x, point.y, startPoint.x, startPoint.y, 5);
                }
                newPos = endPoint;
            }

            if (newPos == null) {
                const raycastPEFalse = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), false);
                const raycastPETrue = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
                if (raycastPEFalse == null && raycastPETrue == null) {
                    if (debug) {
                        this.#buffer.fill(0, 255, 0);
                        this.#buffer.circle(endPoint.x, endPoint.y, 5);
                    }
                    newPos = endPoint;
                } else if (Vector2.distance(point, raycastEFalse) <= dBuffer && raycastETrue == null) {
                    newPos = endPoint;
                } else if (Vector2.distance(point, raycastETrue) <= dBuffer && raycastEFalse == null) {
                    newPos = endPoint;
                }else{
                    if (debug) {
                        this.#buffer.line(posP.x, posP.y, endPoint.x, endPoint.y, 5);
                    }
                    newPos = startPoint;
                }
            }
        }
        else if (!Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1) && !Collision.polygonCircle(shape.getVertices(), endPoint.x, endPoint.y, 1)) {
            var directionStart = new Vector2(startPoint.x, startPoint.y).remove(point).normalized();
            var directionEnd = new Vector2(endPoint.x, endPoint.y).remove(point).normalized();

            var raycastSFalse = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), false);
            var raycastSTrue = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), true);
            if (raycastSFalse != null && raycastSTrue != null) {
                newPos = startPoint;
            }

            var raycastEFalse = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), false);
            var raycastETrue = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
            if (raycastEFalse != null && raycastETrue != null) {
                newPos = endPoint;
            }
        }
        // Als start punt in shape zitten  
        else if (Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1)) newPos = startPoint;
        // Anders pak eind punt
        else newPos = endPoint;


        return newPos;
    }

    #calculateOutsetPoint(shape, point, startPoint, endPoint, debug = true){
        let newPos = null;

        if (!Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1) && !Collision.polygonCircle(shape.getVertices(), endPoint.x, endPoint.y, 1)) {
            var directionStart = new Vector2(startPoint.x, startPoint.y).remove(point).normalized();
            var directionEnd = new Vector2(endPoint.x, endPoint.y).remove(point).normalized();
            var start = this.#raycastAll([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), true);
            var end = this.#raycastAll([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
            if (start.length < 2) {
                if (start.length != 0) {
                    for (let l = 0; l < start.length; l++) {
                        if (!start[l].equals(point)) newPos = endPoint;
                    }
                } else newPos = startPoint
            }
            if (end.length < 2) {
                if (end.length != 0) {
                    for (let l = 0; l < end.length; l++) {
                        if (!end[l].equals(point))  newPos = startPoint; 
                    }
                } else newPos = endPoint;
            }
        
        }
        // !Als beide punten NIET in shape zitten 
        else if (Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1) && Collision.polygonCircle(shape.getVertices(), endPoint.x, endPoint.y, 1)) {
            var directionStart = new Vector2(startPoint.x, startPoint.y).remove(point).normalized();
            var directionEnd = new Vector2(endPoint.x, endPoint.y).remove(point).normalized();
        
            var raycastPSFalse = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), false);
            var raycastPSTrue = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), true);
            if (raycastPSFalse != null && raycastPSTrue != null) {
                if (debug) {this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(startPoint.x, startPoint.y, 5);}
                newPos = startPoint;
            }
        
            var raycastPEFalse = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), false);
            var raycastPETrue = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
            if (raycastPEFalse != null && raycastPETrue != null) {
                if (debug) {this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(endPoint.x, endPoint.y, 5);}
                newPos = endPoint;
            }
        }
        // Als start punt in shape zitten  
        else if (!Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1)) newPos = startPoint;
        // Anders pak eind punt
        else newPos = endPoint;

        return newPos;
    }

    #reorderClockwise(points) {
        // calculate center point
        let center = new Vector2(0, 0);
        for (let i = 0; i < points.length; i++) {
            center.x += points[i].x;
            center.y += points[i].y;
        }
        center.x /= points.length;
        center.y /= points.length;

        // Step 2: Sort the array based on angle
        points.sort((a, b) => {
            const angleA = Math.atan2(a.y - center.y, a.x - center.x);
            const angleB = Math.atan2(b.y - center.y, b.x - center.x);
            // use angle as primary sort key
            let result = angleA - angleB;
            return result;
        });
    }

    getTiles() {
        return this.#tiles;
    }

    redraw(){
        this.#buffer.clear();
        for (let i = 0; i < this.#tiles.length; i++) {
            const tile = this.#tiles[i];
            
            tile.generate();
        }
    }
}