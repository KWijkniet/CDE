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

    constructor() {
        this.#renderer = Renderer.instance;
        this.#buffer = createGraphics(Settings.mapSizeX, Settings.mapSizeY);
        this.#tiles = { 'X-Roof': 0, 'Alucobond': 0 };
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
        var hideVisuals = true;

        this.#buffer.clear();
        var shapes = this.#renderer.getAll();
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.isAllowed && !shape.isGenerated) {
                var inset = this.#createInset(shape);
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

    #sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    #generateTiles(inset, outsets) {
        var self = this;
        var tileSize = new Vector2(820 / 10, 600 / 10);
        var firstTileSize = new Vector2(410 / 10, 600 / 10);

        var isFirstTile = true;

        var boundingBox = inset.getBoundingBox();
        //Metsel patroon

        var syncedPlaceTile = async (x, y) =>  new Promise((resolve) => {
            console.log('Placing tile...');
            var pos = new Vector2(x, y);
            var delay = 1;
            var insetPoints = inset.getVertices();
            var isDummy = false;

            // setTimeout(() => {
            //     var horizontalTop = self.#raycast([inset], pos, Vector2.left(), isFirstTile ? firstTileSize.x : tileSize.x);
            //     if (!horizontalTop) {
            //         horizontalTop = new Vector2(pos.x + (isFirstTile ? firstTileSize.x : tileSize.x), pos.y);
            //         if (!self.IsInside(insetPoints, horizontalTop.x, horizontalTop.y)) {
            //             return resolve(null);
            //         }
            //     } else {
            //         isDummy = true;
            //     }
            //     self.#buffer.line(pos.x, pos.y, horizontalTop.x, horizontalTop.y);

            //     setTimeout(() => {
            //         var verticalRight = self.#raycast([inset], horizontalTop, Vector2.down(), tileSize.y);
            //         if (!verticalRight) {
            //             verticalRight = new Vector2(horizontalTop.x, horizontalTop.y + tileSize.y);
            //             if (!self.IsInside(insetPoints, verticalRight.x, verticalRight.y)) {
            //                 return resolve(null);
            //             }
            //         } else {
            //             isDummy = true;
            //         }
            //         self.#buffer.line(horizontalTop.x, horizontalTop.y, verticalRight.x, verticalRight.y);

            //         setTimeout(() => {
            //             var maxDist = (isFirstTile ? tileSize.x : Vector2.distance(pos, horizontalTop));
            //             var horizontalBottom = self.#raycast([inset], verticalRight, Vector2.right(), maxDist);
            //             if (!horizontalBottom) {
            //                 horizontalBottom = new Vector2(verticalRight.x - maxDist, verticalRight.y);
            //                 if (!self.IsInside(insetPoints, horizontalBottom.x, horizontalBottom.y)) {
            //                     return resolve(null);
            //                 }
            //             } else {
            //                 isDummy = true;
            //             }
            //             self.#buffer.line(verticalRight.x, verticalRight.y, horizontalBottom.x, horizontalBottom.y);

            //             setTimeout(() => {
            //                 var verticalLeft = self.#raycast([inset], verticalRight, Vector2.right(), tileSize.x);
            //                 if (!verticalLeft) {
            //                     verticalLeft = new Vector2(horizontalBottom.x, horizontalBottom.y);
            //                     if (!self.IsInside(insetPoints, verticalLeft.x, verticalLeft.y)) {
            //                         return resolve(null);
            //                     }
            //                 } else {
            //                     isDummy = true;
            //                     //Exception Case Found:
            //                     //One of the inset vertices is inside this tile. 
            //                 }
            //                 self.#buffer.line(verticalLeft.x, verticalLeft.y, pos.x, pos.y);

            //                 resolve(self.#createTile([pos, horizontalTop, verticalRight, horizontalBottom, verticalLeft], isDummy));
            //             }, delay);
            //         }, delay);
            //     }, delay);
            // }, delay);


            setTimeout(() => {
                var horizontalTop = self.#raycast([inset], pos, Vector2.left(), isFirstTile ? firstTileSize.x : tileSize.x);
                if (!horizontalTop) {
                    horizontalTop = new Vector2(pos.x + (isFirstTile ? firstTileSize.x : tileSize.x), pos.y);
                    if (!self.IsInside(insetPoints, horizontalTop.x, horizontalTop.y)){
                        return resolve(null);
                    }
                }
                else{
                    isDummy = true;
                }
                self.#buffer.line(pos.x, pos.y, horizontalTop.x, horizontalTop.y);

                setTimeout(() => {
                    var verticalRight = self.#raycast([inset], horizontalTop, Vector2.down(), tileSize.y);
                    if (!verticalRight) {
                        verticalRight = new Vector2(horizontalTop.x, horizontalTop.y + tileSize.y);
                        if (!self.IsInside(insetPoints, verticalRight.x, verticalRight.y)) {
                            return resolve(null);
                        }
                    } else {
                        isDummy = true;
                    }
                    self.#buffer.line(horizontalTop.x, horizontalTop.y, verticalRight.x, verticalRight.y);

                    setTimeout(() => {
                        var maxDist = (isFirstTile ? tileSize.x : Vector2.distance(pos, horizontalTop));
                        var horizontalBottom = self.#raycast([inset], verticalRight, Vector2.right(), maxDist);
                        if (!horizontalBottom) {
                            horizontalBottom = new Vector2(verticalRight.x - maxDist, verticalRight.y);
                            if (!self.IsInside(insetPoints, horizontalBottom.x, horizontalBottom.y)) {
                                return resolve(null);
                            }
                        } else {
                            isDummy = true;
                        }
                        self.#buffer.line(verticalRight.x, verticalRight.y, horizontalBottom.x, horizontalBottom.y);

                        setTimeout(() => {
                            var verticalLeft = self.#raycast([inset], verticalRight, Vector2.right(), tileSize.x);
                            if (!verticalLeft) {
                                verticalLeft = new Vector2(horizontalBottom.x, horizontalBottom.y);
                                if (!self.IsInside(insetPoints, verticalLeft.x, verticalLeft.y)) {
                                    return resolve(null);
                                }
                            } else {
                                isDummy = true;
                                //Exception Case Found:
                                //One of the inset vertices is inside this tile. 
                            }
                            self.#buffer.line(verticalLeft.x, verticalLeft.y, pos.x, pos.y);

                            resolve(self.#createTile([pos, horizontalTop, verticalRight, horizontalBottom, verticalLeft], isDummy));
                        }, delay);
                    }, delay);
                }, delay);
            }, delay);
        });

        var syncedLoop = async (x, y) => {
            console.log('Searching for next tile location...', x, y);
            var resultPos = null;
            var insetPoints = inset.getVertices();
            if (!this.IsInside(insetPoints, x, y)) {
                var pos = new Vector2(x, y).add(Vector2.left().multiply(new Vector2(10, 10)));
                var horizontal = self.#raycast([inset], pos, Vector2.left(), boundingBox.w);

                // self.#buffer.fill(0);
                // self.#buffer.circle(pos.x, pos.y, 5);
                if (horizontal) {
                    // horizontal.add(Vector2.right());
                    // self.#buffer.fill(255, 0, 0);
                    // self.#buffer.circle(horizontal.x, horizontal.y, 5);
                    if (!this.IsInside(insetPoints, horizontal.x, horizontal.y)){
                        
                        pos = horizontal.getCopy().add(Vector2.down().multiply(new Vector2(10, 10)));
                        var vertical = self.#raycast([inset], pos, Vector2.down(), boundingBox.h);

                        // self.#buffer.fill(0);
                        // self.#buffer.circle(pos.x, pos.y, 5);
                        if (vertical) {
                            // vertical.add(Vector2.up());
                            // self.#buffer.fill(255, 0, 0);
                            // self.#buffer.circle(vertical.x, vertical.y, 5);
                            // console.log("Is inside shape (Vertical)");
                            resultPos = vertical.getCopy();
                        } else {
                            // console.log("Could not collide");
                        }
                    }
                    else {
                        resultPos = horizontal.getCopy();
                        // console.log("Is inside shape (Horizontal)");
                    }
                } else {
                    // console.log("Could not collide");
                }
            }
            else{
                // console.log("Is inside shape");
                resultPos = new Vector2(x, y);
            }
            
            if(resultPos){
                //attempt place tile
                var tmp = null;
                await syncedPlaceTile(resultPos.x, resultPos.y).then((tile) => {
                    tmp = tile;
                });

                if (tmp != null) {
                    await self.#sleep(500);

                    isFirstTile = false;
                    if (x < boundingBox.x + boundingBox.w) {
                        syncedLoop(tmp.pos.x + tmp.getWidth(), tmp.pos.y);
                    } else {
                        if (y < boundingBox.y + boundingBox.h) {
                            isFirstTile = true;
                            // syncedLoop(boundingBox.x, tmp.pos.y + tmp.getHeight());
                        }
                    }
                }
                else {
                    console.warn("WARNING: A tile went out of bounds without detecting a collision at", resultPos.x, resultPos.y);
                    if (y < boundingBox.y + boundingBox.h) {
                        isFirstTile = true;
                        // syncedLoop(boundingBox.x, resultPos.y + tileSize.y);
                    }
                }
            }

            else if (y < boundingBox.y + boundingBox.h) {
                await self.#sleep(100);
                syncedLoop(x, y + 1);
            }
        };

        syncedLoop(boundingBox.x, boundingBox.y);
    }

    #createTile(vertices, isDummy){
        return new Tile(vertices, this.#buffer, isDummy);
    }

    #raycast(shapes, from, dir, dist, ignoreSelf = true) {
        var collisionClosest = null;
        var collisionDist = 99999999999;

        var end = from.getCopy().remove(new Vector2(dir.x, dir.y).multiply(new Vector2(dist, dist)));
        // this.#buffer.line(from.x, from.y, end.x, end.y);

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const vertices = shape.getVertices();

            for (let r = 0; r < vertices.length; r++) {
                const vn = vertices[r + 1 < vertices.length ? r + 1 : 0];
                const vc = vertices[r];

                // if (Collision.pointCircle(vc.x, vc.y, end.x, end.y, 10)) {
                //     circle(vc.x, vc.y, 10);
                //     circle(vn.x, vn.y, 10);
                // }

                // if (Collision.lineLine(vc.x, vc.y, vn.x, vn.y, from.x, from.y, end.x, end.y)) {
                //     strokeWeight(5);
                //     stroke(255, 255, 0);
                //     line(vn.x, vn.y, vc.x, vc.y);
                // }

                if (Collision.linePoint(vn.x, vn.y, vc.x, vc.y, from.x, from.y) && ignoreSelf) {
                    continue;
                }


                var collision = Collision.lineLineCollision(from.x, from.y, end.x, end.y, vc.x, vc.y, vn.x, vn.y);
                if (collision != null) {
                    var dist = Vector2.distance(from, collision);
                    if (collisionClosest == null || dist < collisionDist) {
                        collisionClosest = collision;
                        collisionDist = dist;
                    }
                }
            }
        }

        return collisionClosest;
    }

    toJSON() {
        return { 'tiles': this.#tiles, 'width': this.#totalWidth, 'height': this.#totalHeight, 'tile_width': this.#tileWidth, 'tile_height': this.#tileHeight, 'dummy_width': this.#dummyWidth, 'dummy_height': this.#dummyHeight };
    }

    fromJSON(json) {
        this.#tiles = json.tiles;
        this.#totalWidth = json.width;
        this.#totalHeight = json.height;
        this.#dummyWidth += tile.width;
        this.#dummyHeight += tile.height;
        this.#tileWidth += tile.width;
        this.#tileHeight += tile.height;
    }

    IsInside(vertices, x, y){
        if (Collision.polygonPoint(vertices, x, y)) {
            return true;
        }

        for (let i = 0; i < vertices.length; i++) {
            const vc = vertices[i];
            const vn = vertices[i + 1 < vertices.length - 1 ? i + 1 : 0];

            if(Collision.linePoint(vc.x, vc.y, vn.x, vn.y, x, y)){
                return true;
            }
        }

        return false;
    }
}