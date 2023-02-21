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

    // // Paspaneel Width - DUMMY THICC
    // dummyTileSize = 0;
    // // Overlap Alucobond
    // overlapTileSize = 0;

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
        var overhangs = [];
        var outsets = [];
        var hideVisuals = false;

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

                if (!hideVisuals) {
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

                if (!hideVisuals) {
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
            // this.#generateTiles(inset, outsets);
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

            var mp = 5;
            var mn = 5;
            if (shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] != "daknok1" && 
                shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] != "dakrand1" && 
                shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] != "gootdetail3") {
                if (shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1] != null) {
                    mp = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[1]);
                }
            }
            if (shape.lineMargins[i].split("|")[0] != "daknok1" && shape.lineMargins[i].split("|")[0] != "dakrand1" && shape.lineMargins[i].split("|")[0] != "gootdetail3") {
                if (shape.lineMargins[i] != null) {
                    mn = parseInt(shape.lineMargins[i].split('|')[1]);
                }
            }

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
            
            if (!hideVisuals) {
                this.#buffer.fill(0, 0, 255); // BLAUW
                this.#buffer.stroke(0, 0, 0);
                this.#buffer.text("SPP", perpendicularStartPointP.x - 20, perpendicularStartPointP.y);
                this.#buffer.text("SPN", perpendicularStartPointN.x - 10, perpendicularStartPointN.y);
                this.#buffer.text("EPP", perpendicularEndPointP.x + 20, perpendicularEndPointP.y);
                this.#buffer.text("EPN", perpendicularEndPointN.x + 10, perpendicularEndPointN.y);
            }

            // Stap 3
            var dBuffer = 5;
            var newPosP = this.#calculateInsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, dBuffer, hideVisuals);
            var newPosN = this.#calculateInsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, dBuffer, hideVisuals);

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

                if (!hideVisuals) {
                    this.#buffer.circle(startPointN.x, startPointN.y, 5);
                    this.#buffer.line(startPointN.x, startPointN.y, endPointN.x, endPointN.y, 5);
                    this.#buffer.line(startPointP.x, startPointP.y, endPointP.x, endPointP.y, 5);
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.text("Collision Point", collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 15);
                }
            }

            if (!hideVisuals) {
                this.#buffer.text(i, vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                // this.#buffer.circle(pos.x, pos.y, 10);
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
        var hideVisuals = true;
        this.#buffer.push();
        
        var op = 20;
        var on = 20;
        for (let i = 0; i < points.length; i++) {
            // Overhang Variables
            var enableOverhangP = false;
            var enableOverhangN = false;
            const vc = points[i];
            const vp = points[i - 1 >= 0 ? i - 1 : points.length - 1];
            const vn = points[i + 1 <= points.length - 1 ? i + 1 : 0];

            var mp = 5;
            var mn = 5;
            if (shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] != "daknok1" && 
                shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] != "dakrand1" && 
                shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] != "gootdetail3") {
                if (shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1] != null) {
                    mp = parseInt(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split('|')[1]);
                }
            }else if(shape.lineMargins[i - 1 >= 0 ? i - 1 : points.length - 1].split("|")[0] == "daknok1"){
                enableOverhangP = true;
            }
            if (shape.lineMargins[i].split("|")[0] != "daknok1" && shape.lineMargins[i].split("|")[0] != "dakrand1" && shape.lineMargins[i].split("|")[0] != "gootdetail3") {
                if (shape.lineMargins[i] != null) {
                    mn = parseInt(shape.lineMargins[i].split('|')[1]);
                }
            }else if(shape.lineMargins[i].split("|")[0] == "daknok1"){ 
                enableOverhangN = true;
            }

            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var dirN = vn.getCopy().remove(vc).normalized();
            dirN.multiply(new Vector2(enableOverhangP ? op : mp, enableOverhangP ? op : mp));
            var dirP = vp.getCopy().remove(vc).normalized();
            dirP.multiply(new Vector2(enableOverhangN ? on : mn, enableOverhangN ? on : mn));
            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);
            
            // Stap 2
            var perpendicularStartPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, enableOverhangP ? op : mp, 'right');
            var perpendicularEndPointP = this.#getPerpendicularPoint(posP.x, posP.y, vp.x, vp.y, enableOverhangP ? op : mp, 'left');
            var perpendicularStartPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, enableOverhangN ? on : mn, 'right');
            var perpendicularEndPointN = this.#getPerpendicularPoint(posN.x, posN.y, vn.x, vn.y, enableOverhangN ? on : mn, 'left');
            
            if (!hideVisuals) {
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
            if(!enableOverhangP) newPosP = this.#calculateInsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, dBuffer, hideVisuals);
            else newPosP = this.#calculateOutsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, hideVisuals);
            if(!enableOverhangN) newPosN = this.#calculateInsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, dBuffer, hideVisuals);
            else newPosN = this.#calculateOutsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, hideVisuals);

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

                if (!hideVisuals) {
                    this.#buffer.circle(startPointN.x, startPointN.y, 5);
                    this.#buffer.line(startPointN.x, startPointN.y, endPointN.x, endPointN.y, 5);
                    this.#buffer.line(startPointP.x, startPointP.y, endPointP.x, endPointP.y, 5);
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.text("Collision Point", collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 15);
                }
            }

            if (!hideVisuals) {
                this.#buffer.text(i, vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                // this.#buffer.circle(pos.x, pos.y, 10);
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

            if (!hideVisuals) {
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
            // #calculateOutsetPoint(shape, point, startPoint, endPoint, hideVisuals = true)
            var newPosP = this.#calculateOutsetPoint(shape, posP, perpendicularStartPointP, perpendicularEndPointP, hideVisuals); 
            var newPosN = this.#calculateOutsetPoint(shape, posN, perpendicularStartPointN, perpendicularEndPointN, hideVisuals);

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
                if (!hideVisuals) {
                    this.#buffer.circle(startPointN.x, startPointN.y, 5);
                    this.#buffer.line(startPointN.x, startPointN.y, endPointN.x, endPointN.y, 5);
                    this.#buffer.line(startPointP.x, startPointP.y, endPointP.x, endPointP.y, 5);
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.text("Collision Point", collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 15);
                }
                outsets.push(collisionPoint);
            }

            if (!hideVisuals) {
                this.#buffer.text(i, vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                // this.#buffer.circle(pos.x, pos.y, 10);
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

    #generateTiles(inset, outsets) {
        var self = this;
        var tileSize = new Vector2(820 / 10, 600 / 10);
        var insetPoints = inset.getVertices();
        var boundingBox = inset.getBoundingBox();
        var count = 0;
        var tiledMode = this.rowOffsetMode;
        var dummySize = this.dummyTileSize;

        // this.#tiles = { 'X-Roof': [], 'Alucobond': [] };
        this.#tiles = [];
        this.#totalWidth = 0;
        this.#totalHeight = 0;
        this.#dummyWidth = 0;
        this.#dummyHeight = 0;
        this.#tileWidth = 0;
        this.#tileHeight = 0;

        var syncedPlaceTile = async (x, y, predictionPoints) => new Promise((resolve) => {
            var delay = 1;
            var isDummy = false;
            var hideVisuals = true;
            count++;

            setTimeout(() => {
                var results = [];
                var collisions = [];
                // self.#buffer.text(count, predictionPoints[0].x + 10 + tileSize.x / 2, predictionPoints[0].y + 10 + tileSize.y / 2);

                for (let i = 0; i < predictionPoints.length; i++) {
                    const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                    const vc = predictionPoints[i];
                    const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];
                    
                    if(!self.IsInsideForbiddenShapes(outsets, vc.x, vc.y) && self.IsInside(insetPoints, vc.x, vc.y)){
                        var dirP = vp.getCopy().remove(vc).normalized();
                        var dirN = vn.getCopy().remove(vc).normalized();
    
                        if (!hideVisuals){
                            self.#buffer.fill(0);
                            self.#buffer.circle(vc.x, vc.y, 5);
                            self.#buffer.stroke(255, 255, 0);
                            self.#buffer.line(vc.x, vc.y, vc.x + (dirN.x * 20), vc.y + (dirN.y * 20));
                            self.#buffer.stroke(0, 0, 255);
                            self.#buffer.line(vc.x, vc.y, vc.x + (dirP.x * 20), vc.y + (dirP.y * 20));
                        }

                        var distP = Vector2.distance(vc, vp);
                        var raycastP = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), distP, false);
                        var distN = Vector2.distance(vc, vn);
                        var raycastN = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), distN, false);

                        if(raycastP != null){
                            isDummy = true;
                            results.push(raycastP);
                            // if(self.IsInside(insetPoints, vp.x, vp.y)) 
                                collisions.push({'index': results.length - 1, 'isWall': !self.IsInsideForbiddenShapes(outsets, vp.x, vp.y) && !self.IsInside(insetPoints, vp.x, vp.y) });
                                self.#buffer.stroke(0);
                                if (!hideVisuals) {
                                self.#buffer.fill(255, 255, 0);
                                self.#buffer.circle(raycastP.x, raycastP.y, 3);
                            }
                        }

                        results.push(vc);

                        if (raycastN != null) {
                            isDummy = true;
                            results.push(raycastN);
                            // if(self.IsInside(insetPoints, vn.x, vn.y)) 
                                collisions.push({'index': results.length, 'isWall': !self.IsInsideForbiddenShapes(outsets, vn.x, vn.y) && !self.IsInside(insetPoints, vn.x, vn.y) });
                            if (!hideVisuals) {
                                self.#buffer.stroke(0);
                                self.#buffer.fill(255, 255, 0);
                                self.#buffer.circle(raycastN.x, raycastN.y, 3);
                            }
                        }
                    }
                    else{
                        isDummy = true;
                    }
                }
                var pointsNeedToBeAdded = [];
                for (let r = 0; r < insetPoints.length; r++) {
                    const insetPoint = insetPoints[r];
                    if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y, false)) {
                        pointsNeedToBeAdded.push(insetPoint);
                    }
                }
                for (let x = 0; x < outsets.length; x++) {
                    const outsetPoints = outsets[x].getVertices();

                    for (let r = 0; r < outsetPoints.length; r++) {
                        const outsetPoint = outsetPoints[r];
                        if (self.IsInside(predictionPoints, outsetPoint.x, outsetPoint.y, false)) {
                            pointsNeedToBeAdded.push(outsetPoint);
                        }
                    }
                }
                
                var extraTile = null;
                //split tile
                if(collisions.length >= 4){
                    if(pointsNeedToBeAdded.length == 1) {
                        console.log(count);
                        console.log(collisions.length, collisions);
                        console.log(results);
                        var index;
                        for (let j = 0; j < collisions.length; j++) {
                            const element = collisions[j];
                            if(!element['isWall']) index = element['index'];
                        }

                        for (let r = 0; r < insetPoints.length; r++) {
                            const insetPoint = insetPoints[r];
                            if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y, false)) {
                                if (self.IsInside(results, insetPoint.x, insetPoint.y, false)) {
                                    results.splice(index, 0, insetPoint);
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
                                    }
                                }
                            }
                        }

                        if(!hideVisuals){
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
                        var tile01 = results.slice(collisions[0]['index'], collisions[2]['index']);
                        var tile02 = results.slice(collisions[2]['index'], results.length).concat(results.slice(0, collisions[0]['index']));
    
                        // var tile = self.#createTile(tile01, isDummy);
                        // var bb = tile.getBoundingBox();
                        // if (bb.h > 0 && bb.w > 0) {
                        //     self.#tiles.push(tile);
                        // }
                        extraTile = Vector2.copyAll(tile01);
                        results = Vector2.copyAll(tile02);
                    }  
                    else {
                        var tile01 = results.slice(collisions[0]['index'], collisions[2]['index']);
                        var tile02 = results.slice(collisions[2]['index'], results.length).concat(results.slice(0, collisions[0]['index']));
    
                        // var tile = self.#createTile(tile01, isDummy);
                        // var bb = tile.getBoundingBox();
                        // if (bb.h > 0 && bb.w > 0) {
                        //     self.#tiles.push(tile);
                        // }
                        extraTile = Vector2.copyAll(tile01);
                        results = Vector2.copyAll(tile02);
                    }
                }
                //add point inside tile
                else if(collisions.length == 2){
                    var index = collisions[0]['index'];
                    for (let r = 0; r < insetPoints.length; r++) {
                        const insetPoint = insetPoints[r];
                        if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y, false)) {
                            results.splice(index, 0, insetPoint);
                        }
                    }
                    for (let x = 0; x < outsets.length; x++) {
                        const outsetPoints = outsets[x].getVertices();

                        for (let r = 0; r < outsetPoints.length; r++) {
                            const outsetPoint = outsetPoints[r];
                            if (self.IsInside(predictionPoints, outsetPoint.x, outsetPoint.y, false)) {
                                results.splice(index, 0, outsetPoint);
                            }
                        }
                    }
                }
      
                predictionPoints = Vector2.copyAll(results);
                
                // //PHASE 01: Move all the points to valid locations
                // var tmp = Vector2.copyAll(predictionPoints);
                // for (let i = 0; i < predictionPoints.length; i++) {
                //     const vp = predictionPoints[i - 1 >= 0 ? i - 1 : predictionPoints.length - 1];
                //     const vc = predictionPoints[i];
                //     const vn = predictionPoints[i + 1 <= predictionPoints.length - 1 ? i + 1 : 0];

                //     //If point is invalid
                //     if (!self.IsInside(insetPoints, vc.x, vc.y) || self.IsInsideForbiddenShapes(outsets, vc.x, vc.y)) {

                //         var dirPrev = vc.getCopy().remove(vp).normalized();
                //         var raycastPrev = self.#raycast([inset].concat(outsets), vc, dirPrev, tileSize.x, false);

                //         var dirNext = vc.getCopy().remove(vn).normalized();
                //         var raycastNext = self.#raycast([inset].concat(outsets), vc, dirNext, tileSize.x, false);

                //         //Has collision with previous
                //         if (raycastPrev != null) {
                //             tmp[i] = raycastPrev;
                //             isDummy = true;
                //         }
                //         //Has no collision
                //         if (raycastPrev == null && raycastNext == null) {
                //             isDummy = true;
                //             self.#buffer.text("X", vc.x, vc.y);
                //             tmp.splice(i, 1);

                //             for (let r = 0; r < insetPoints.length; r++) {
                //                 const insetPoint = insetPoints[r];
                //                 if (self.IsInside(predictionPoints, insetPoint.x, insetPoint.y)) {
                //                     tmp.splice(i, 0, insetPoint);
                //                 }
                //             }
                //         }

                //         if ((raycastNext != null || raycastPrev != null) && !(raycastNext != null && raycastPrev != null)) {
                //             for (let x = 0; x < outsets.length; x++) {
                //                 const outsetPoints = outsets[x].getVertices();

                //                 for (let r = 0; r < outsetPoints.length; r++) {
                //                     const outsetPoint = outsetPoints[r];
                //                     if (self.IsInside(predictionPoints, outsetPoint.x, outsetPoint.y)) {
                //                         tmp.splice(i, 0, outsetPoint);
                //                     }
                //                 }
                //             }
                //         }

                //         //Has collision with next
                //         if (raycastNext != null) {
                //             isDummy = true;
                //             tmp[i] = raycastNext;
                //         }
                //     }
                // }
                // predictionPoints = Vector2.copyAll(tmp);

                // for (let i = 0; i < predictionPoints.length; i++) {
                //     const vc = predictionPoints[i];
                //     if (!hideVisuals) { self.#buffer.fill(0); self.#buffer.circle(vc.x, vc.y, 10); }
                // }


                // create tile
                var tile = self.#createTile(predictionPoints, isDummy);
                var extra = null;

                var bb = tile.getBoundingBox();
                if (bb.h <= 0 || bb.w <= 0) {
                    tile = null;
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

        var syncedLoop = async (x, y) => {
            var startX = null;
            var startY = null;
            var delay = 100;
            var newInsetPoints = Vector2.copyAll(insetPoints);

            // PHASE 1: Overlapping tiles
            var tmpTiles = [];
            var totalOverlapSize = new Vector2(0,0);
            for (let j = 0; j < insetPoints.length; j++) {
                const vct = insetPoints[j];
                const vnt = insetPoints[j + 1 <= insetPoints.length - 1 ? j + 1 : 0];
                
                this.#buffer.circle(vct.x, vct.y, 5);
                // console.log(j, inset.lineMargins[j]);
                console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
                // console.log(inset.lineMargins[j],vct, vnt);
                var dir = vnt.getCopy().remove(vct).normalized();
                // console.log(dir, dir.abs());
                if (inset.lineMargins[j].split("|")[0] == "daknok1" || inset.lineMargins[j].split("|")[0] == "dakrand1" || inset.lineMargins[j].split("|")[0] == "gootdetail3") {
                    var amount = parseInt(inset.lineMargins[j].split("|")[1]);
                    amount = Math.abs(amount);
                    console.log("nandi", totalOverlapSize.toJSON(), dir.toJSON(), amount);
                    totalOverlapSize.add(new Vector2(dir.y * amount, dir.x * amount));
                }
            }
            console.log('totalOverlapSize', totalOverlapSize.toJSON());

            for (let i = 0; i < insetPoints.length; i++) {
                const vc = insetPoints[i];
                const vn = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
                const lineType = inset.lineMargins[i];
                const nextLineType = inset.lineMargins[i + 1 <= inset.lineMargins.length - 1 ? i + 1 : 0];
                var placeLastTile = false;
                var isFirst = true;
                var dir = vc.getCopy().remove(vn).normalized();

                //Only apply when specific line options have been choosen
                if (lineType.split("|")[0] != "daknok1" && lineType.split("|")[0] != "dakrand1" && lineType.split("|")[0] != "gootdetail3") {
                    continue;
                }
                if (nextLineType.split("|")[0] != "daknok1" && nextLineType.split("|")[0] != "dakrand1" && nextLineType.split("|")[0] != "gootdetail3") {
                    placeLastTile = true;
                }
                var dir = vn.getCopy().remove(vc).normalized();

                // console.log('overlapSize : ' + (overlapSize * dir.y), dir.x, dir.y);
                var targetPoints = [
                    new Vector2(vc.x - (tileSize.x / 2) + totalOverlapSize.x, vc.y - (tileSize.y / 2)  + totalOverlapSize.y),
                    new Vector2(vc.x + (tileSize.x / 2) + totalOverlapSize.x, vc.y - (tileSize.y / 2)  + totalOverlapSize.y),
                    new Vector2(vc.x + (tileSize.x / 2) + totalOverlapSize.x, vc.y + (tileSize.y / 2)  + totalOverlapSize.y),
                    new Vector2(vc.x - (tileSize.x / 2) + totalOverlapSize.x, vc.y + (tileSize.y / 2)  + totalOverlapSize.y),
                ];
                if (startX != null && startY != null) {
                    for (let r = 0; r < targetPoints.length; r++) {
                        targetPoints[r].x = self.#convertToGrid(targetPoints[r].x, startX, tileSize.x);
                        targetPoints[r].y = self.#convertToGrid(targetPoints[r].y, startY, tileSize.y);
                        this.#buffer.circle(targetPoints[r].x,targetPoints[r].y, 10);
                    }
                }

                var max = 999;
                var placeAnyway = true;

                while (Collision.polygonLine(targetPoints, vc.x, vc.y, vn.x, vn.y)) {
                    if (!placeAnyway){
                        break;
                    }
                    if (Collision.polygonPoint(targetPoints, vn.x, vn.y) && !placeLastTile) {
                        var startIndex = dir.x > 0 ? 1 : dir.x < 0 ? 3 : dir.y > 0 ? 2 : dir.y < 0 ? 0 : 0;
                        var endIndex = dir.x > 0 ? 2 : dir.x < 0 ? 0 : dir.y > 0 ? 3 : dir.y < 0 ? 1 : 0;
                        if (Collision.lineCircle(targetPoints[startIndex].x, targetPoints[startIndex].y, targetPoints[endIndex].x, targetPoints[endIndex].y, vn.x, vn.y, 2)){
                            placeAnyway = false;
                        }
                        else{
                            break;
                        }
                    }

                    //Create tile
                    const tile = self.#createTile(Vector2.copyAll(targetPoints), true);
                    var bb = tile.getBoundingBox();
                    if (bb.h > 0 && bb.w > 0) {
                        tmpTiles.push(tile);
                    }

                    //Update inset
                    if (isFirst) {
                        const vp = insetPoints[i - 1 >= 0 ? i - 1 : insetPoints.length - 1];
                        const dirVCToPrev = vc.getCopy().remove(vp).normalized();
                        const newVC = self.#raycast([tile], vc, dirVCToPrev, tileSize.x, false);

                        if (newVC != null) {
                            var dist = Vector2.distance(vc, newVC);
                            var distPos = dirVCToPrev.getCopy().reverse().multiply(new Vector2(dist, dist));

                            newInsetPoints[i].add(distPos);
                            newInsetPoints[i + 1 <= newInsetPoints.length - 1 ? i + 1 : 0].add(distPos);
                        }
                    }

                    isFirst = false;
                    if (tmpTiles.length == 1) {
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
                    if (max <= 0) {
                        console.error("Infinite loop detected!");
                        break;
                    }
                }
            }
            console.log("Tile Count:", tmpTiles.length);
            self.#tiles = self.#tiles.concat(tmpTiles);
            insetPoints = Vector2.copyAll(newInsetPoints);

            //PHASE 2: Tiles along the inset
            tmpTiles = [];
            for (let i = 0; i < insetPoints.length; i++) {
                const vc = insetPoints[i];
                const vn = insetPoints[i + 1 <= insetPoints.length - 1 ? i + 1 : 0];
                const lineType = inset.lineMargins[i];
                const nextLineType = inset.lineMargins[i + 1 <= inset.lineMargins.length - 1 ? i + 1 : 0];
                const lastLineType = inset.lineMargins[i - 1 >= 0 ? i - 1 : inset.lineMargins.length - 1];
                var isFirst = true;
                var placeLastTile = false;
                var placePreviousTile = true;

                //Only apply when specific line options have been choosen
                if (lineType.split("|")[0] != "dummy") {
                    continue;
                }
                if (nextLineType.split("|")[0] != "dummy") {
                    placeLastTile = true;
                }
                if (lastLineType.split("|")[0] == "daknok1" || lastLineType.split("|")[0] == "dakrand1" || lastLineType.split("|")[0] == "gootdetail3") {
                    placePreviousTile = false;
                }

                var dir = vn.getCopy().remove(vc).normalized();
                var targetPoints = [
                    new Vector2(vc.x, vc.y),
                    new Vector2(vc.x + (tileSize.x * (dir.x != 0 ? dir.x : 1)), vc.y),
                    new Vector2(vc.x + (tileSize.x * (dir.x != 0 ? dir.x : 1)), vc.y + (tileSize.y * (dir.y != 0 ? dir.y : 1))),
                    new Vector2(vc.x, vc.y + (tileSize.y * (dir.y != 0 ? dir.y : 1))),
                ];
                console.log('targetPoints');
                console.log(targetPoints);
                console.log(dummySize);
                for (let r = 0; r < targetPoints.length; r++) {
                    targetPoints[r].x = self.#convertToGrid(targetPoints[r].x, startX, tileSize.x, false);
                    targetPoints[r].y = self.#convertToGrid(targetPoints[r].y, startY, tileSize.y, false);
                }

                //Skip first if previous was alucobond
                if (placePreviousTile) {
                    //Starting tile is not at the correct position
                    if (!Collision.polygonPoint(targetPoints, vc.x, vc.y)) {
                        for (let r = 0; r < targetPoints.length; r++) {
                            targetPoints[r].x -= tileSize.x * (dir.x != 0 ? dir.x : 0);
                            targetPoints[r].y -= tileSize.y * (dir.y != 0 ? dir.y : 0);
                        }
                    }
                }

                var maxDist = Vector2.distance(vc, vn);
                var maxSpacing = Math.abs(tileSize.x * dir.x + tileSize.y * dir.y);
                var max = 999;
                while (Collision.polygonLine(targetPoints, vc.x, vc.y, vn.x, vn.y) && (!Collision.polygonPoint(targetPoints, vn.x, vn.y) || Vector2.distance(vc, targetPoints[2]) - (placeLastTile ? maxSpacing : 0) <= maxDist)) {
                    //Create tile
                    await syncedPlaceTile(targetPoints[0].x, targetPoints[0].y, targetPoints).then(tile => {
                        if (tile != null) {
                            tmpTiles.push(tile);

                            //Update inset
                            if (isFirst) {
                                const vp = insetPoints[i - 1 >= 0 ? i - 1 : insetPoints.length - 1];
                                const dirVCToPrev = vc.getCopy().remove(vp).normalized();
                                const newVC = self.#raycast([tile], vc, dirVCToPrev, tileSize.x, true);

                                if (newVC != null) {
                                    var dist = Vector2.distance(vc, newVC);
                                    var distPos = dirVCToPrev.getCopy().reverse().multiply(new Vector2(dist, dist));

                                    newInsetPoints[i].add(distPos);
                                    newInsetPoints[i + 1 <= newInsetPoints.length - 1 ? i + 1 : 0].add(distPos);
                                }
                            }
                            isFirst = false;
                        }
                    });

                    if (Collision.polygonPoint(targetPoints, vn.x, vn.y)) {
                        break;
                    }

                    //Update next position
                    for (let r = 0; r < targetPoints.length; r++) {
                        const tp = targetPoints[r];
                        tp.add(new Vector2(dir.x * tileSize.x, dir.y * tileSize.y));
                    }
                    await self.#sleep(delay);

                    //Security
                    max--;
                    if (max <= 0) {
                        console.error("Infinite loop detected!");
                        break;
                    }
                }
            }
            console.log("Tile Count:", tmpTiles.length);
            self.#tiles = self.#tiles.concat(tmpTiles);
            insetPoints = Vector2.copyAll(newInsetPoints);

            for (let index = 0; index < newInsetPoints.length; index++) {
                const element = newInsetPoints[index];
                this.#buffer.fill(255,0,0);
                this.#buffer.circle(element.x, element.y, 10);
            }

            //PHASE 3: Tiles inside the inset
            tmpTiles = [];
            var topLeft = null;
            for (let i = 0; i < insetPoints.length; i++) {
                const vc = insetPoints[i];

                if (topLeft == null || (vc.x <= topLeft.x && vc.y <= topLeft.y)) {
                    topLeft = vc.getCopy();
                }
            }
            // if Topleft is not the highest point of the shape or the most left
            // // set either the X or Y axis
            for (let i = 0; i < insetPoints.length; i++) {
                
                if (insetPoints[i].y < topLeft.y) {
                    topLeft.y = insetPoints[i].y;
                    // topLeft.x = insetPoints[i].x;
                }
                if (insetPoints[i].x < topLeft.x) {
                    // topLeft.y = insetPoints[i].y;
                    topLeft.x = insetPoints[i].x;
                }
            }

            // var targetPoints = [
            //     new Vector2(self.#convertToGrid(topLeft.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y, startY, tileSize.y, false)),
            //     new Vector2(self.#convertToGrid(topLeft.x + tileSize.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y, startY, tileSize.y, false)),
            //     new Vector2(self.#convertToGrid(topLeft.x + tileSize.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y, startY, tileSize.y, false)),
            //     new Vector2(self.#convertToGrid(topLeft.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y, startY, tileSize.y, false)),
            // ];
            // for (let r = 0; r < targetPoints.length; r++) {
            //     // targetPoints[r].x = self.#convertToGrid(targetPoints[r].x, startX, tileSize.x, false);
            //     // targetPoints[r].y = self.#convertToGrid(targetPoints[r].y, startY, tileSize.y, false);

            //     self.#buffer.fill(255, 0, 0);
            //     self.#buffer.circle(targetPoints[r].x, targetPoints[r].y, 10);
            // }

            console.log("Tile Count:", tmpTiles.length);
            self.#tiles = self.#tiles.concat(tmpTiles);
            insetPoints = Vector2.copyAll(newInsetPoints);

            var newBoundingBox = Vector2.getBoundingBox(newInsetPoints, topLeft);
            this.#buffer.fill(255,0,0,100);
            self.#buffer.rect(newBoundingBox.x, newBoundingBox.y, newBoundingBox.w, newBoundingBox.h);
            console.log("Bounding Box", newBoundingBox.x + newBoundingBox.w, newBoundingBox.y + newBoundingBox.h);

            var targetPoints = [
                new Vector2(self.#convertToGrid(topLeft.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y, startY, tileSize.y, false)),
                new Vector2(self.#convertToGrid(topLeft.x + tileSize.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y, startY, tileSize.y, false)),
                new Vector2(self.#convertToGrid(topLeft.x + tileSize.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y, startY, tileSize.y, false)),
                new Vector2(self.#convertToGrid(topLeft.x, startX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y, startY, tileSize.y, false)),
            ];

            console.log('startX', startX);
            console.log('startY',startY);

            var xIndex = 1;
            var yIndex = 1;
            var max = 999;
            while (true) {
                for (let r = 0; r < targetPoints.length; r++) {
                    if (count == 33 || count == 38 || count == 43 || count == 48 || count == 53 || count == 58 || count == 63) {
                        // self.#buffer.fill(255, 0, 0);
                        // self.#buffer.circle(targetPoints[r].x, targetPoints[r].y, 10);
                    }
                }

                //Create tile
                await syncedPlaceTile(targetPoints[0].x, targetPoints[0].y, targetPoints).then(tile => {
                    if (tile != null) {
                        tmpTiles.push(tile);
                    }
                });
                xIndex++;

                //Next tile
                if (targetPoints[0].x + tileSize.x < newBoundingBox.x + newBoundingBox.w) {
                    for (let r = 0; r < targetPoints.length; r++) {
                        targetPoints[r].add(new Vector2(tileSize.x, 0));
                    }
                }
                else if (targetPoints[0].y + tileSize.y < newBoundingBox.y + newBoundingBox.h) {
                    xIndex = 0;
                    yIndex++;

                    var newX = startX - (tiledMode && yIndex % 2 == 0 ? tileSize.x / 2 : 0);
                    var newY = startY;
                    targetPoints = [
                        new Vector2(self.#convertToGrid(topLeft.x, newX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y * (yIndex - 1), newY, tileSize.y, false)),
                        new Vector2(self.#convertToGrid(topLeft.x + tileSize.x, newX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y * (yIndex - 1), newY, tileSize.y, false)),
                        new Vector2(self.#convertToGrid(topLeft.x + tileSize.x, newX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y * yIndex, newY, tileSize.y, false)),
                        new Vector2(self.#convertToGrid(topLeft.x, newX, tileSize.x, false), self.#convertToGrid(topLeft.y + tileSize.y * yIndex, newY, tileSize.y, false)),
                    ];
                }
                else if (targetPoints[0].y + tileSize.y >= newBoundingBox.y + newBoundingBox.h) {
                    break;
                }
                await self.#sleep(delay);

                //Security
                max--;
                if (max <= 0) {
                    console.error("Infinite loop detected!");
                    break;
                }
            }
            self.#tiles = self.#tiles.concat(tmpTiles);
        };

        syncedLoop(boundingBox.x, boundingBox.y);
    }

    #convertToGrid(value, gridStart, gridSize, useRound = true) {
        if (useRound) {
            return Math.round((value - gridStart) / gridSize) * gridSize + gridStart;
        }
        else {
            return Math.floor((value - gridStart) / gridSize) * gridSize + gridStart;
        }
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

        // var end = from.getCopy().remove(new Vector2(dir.x, dir.y).multiply(new Vector2(dist, dist)));
        // this.#buffer.line(from.x, from.y, end.x, end.y);

        // var collisionClosest = null;
        // var collisionDist = 99999999999;

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

    #raycastAll(shapes, from, dir, dist, ignoreSelf = true) {
        var collisions = [];
        var keys = [];
        var end = from.getCopy().remove(new Vector2(dir.x, dir.y).multiply(new Vector2(dist, dist)));

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

        // if (Collision.polygonPoint(vertices, x, y)) {
        //     return true;
        // }

        // for (let i = 0; i < vertices.length; i++) {
        //     const vc = vertices[i];
        //     const vn = vertices[i + 1 < vertices.length - 1 ? i + 1 : 0];

        //     if (Collision.linePoint(vc.x, vc.y, vn.x, vn.y, x, y)) {
        //         if (y == 406.91537822811176 && x == 1907.2847231827582) {
        //             console.log("Inside");
        //         }
        //         return true;
        //     }
        // }

        // return false;
    }

    IsInsideForbiddenShapes(forbiddenShapes, x, y) {
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

    checkAndPush(arr, vector2, index, useIndex = false) {
        var found = false;
        for (var i = 0; i < arr.length; i++) {
            // if(count == 64)print(Vector2.distance(arr[i], vector2));
            if (arr[i].x === vector2.x && arr[i].y === vector2.y) {
                found = true;
                break;
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

    #calculateInsetPoint(shape, point, startPoint, endPoint, dBuffer, hideVisuals = true){
        let newPos = null;

        if (Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1) && Collision.polygonCircle(shape.getVertices(), endPoint.x, endPoint.y, 1)) {
            const directionStart = new Vector2(startPoint.x, startPoint.y).remove(point).normalized();
            const directionEnd = new Vector2(endPoint.x, endPoint.y).remove(posP).normalized();

            const raycastPSFalse = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), false);
            const raycastPSTrue = this.#raycast([shape], point, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(point, startPoint), true);
            if (raycastPSFalse == null && raycastPSTrue == null) {
                if (!hideVisuals) {
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.circle(startPoint.x, startPoint.y, 5);
                }
                newPos = startPoint;
            } else if (Vector2.distance(point, raycastPSFalse) <= dBuffer && raycastPSTrue == null) {
                newPos = startPoint;
            } else if (Vector2.distance(point, raycastPSTrue) <= dBuffer && raycastPSFalse == null) {
                newPos = startPoint;
            } else {
                if (!hideVisuals) {
                    this.#buffer.line(point.x, point.y, startPoint.x, startPoint.y, 5);
                }
                newPos = endPoint;
            }

            if (newPos == null) {
                const raycastPEFalse = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), false);
                const raycastPETrue = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
                if (raycastPEFalse == null && raycastPETrue == null) {
                    if (!hideVisuals) {
                        this.#buffer.fill(0, 255, 0);
                        this.#buffer.circle(endPoint.x, endPoint.y, 5);
                    }
                    newPos = endPoint;
                } else if (Vector2.distance(point, raycastPEFalse) <= dBuffer && raycastPETrue == null) {
                    newPos = endPoint;
                } else if (Vector2.distance(point, raycastPETrue) <= dBuffer && raycastPEFalse == null) {
                    newPos = endPoint;
                }else{
                    if (!hideVisuals) {
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
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(startPoint.x, startPoint.y, 5);
                newPos = startPoint;
            }

            var raycastEFalse = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), false);
            var raycastETrue = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
            if (raycastEFalse != null && raycastETrue != null) {
                this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(endPoint.x, endPoint.y, 5);
                newPos = endPoint;
            }
        }
        // Als start punt in shape zitten  
        else if (Collision.polygonCircle(shape.getVertices(), startPoint.x, startPoint.y, 1)) newPos = startPoint;
        // Anders pak eind punt
        else newPos = endPoint;


        return newPos;
    }

    #calculateOutsetPoint(shape, point, startPoint, endPoint, hideVisuals = true){
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
                if (!hideVisuals) {this.#buffer.fill(0, 255, 0);
                this.#buffer.circle(startPoint.x, startPoint.y, 5);}
                newPos = startPoint;
            }
        
            var raycastPEFalse = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), false);
            var raycastPETrue = this.#raycast([shape], point, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(point, endPoint), true);
            if (raycastPEFalse != null && raycastPETrue != null) {
                if (!hideVisuals) {this.#buffer.fill(0, 255, 0);
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