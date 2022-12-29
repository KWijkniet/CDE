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

    #sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
    #generateTiles(inset, outsets) {
        var self = this;
        var tileSize = new Vector2(820 / 10, 600 / 10);
        var firstTileSize = new Vector2(410 / 10, 600 / 10);
        var insetPoints = inset.getVertices();

        var isFirstTile = true;

        var boundingBox = inset.getBoundingBox();
        //Metsel patroon

        var syncedPlaceTile = async (x, y, targetPoints) => new Promise((resolve) => {
            var pos = new Vector2(x, y);
            var delay = 1;
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
            //                 var verticalLeft = self.#raycast([inset], verticalRight, Vector2.up(), tileSize.x);
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
                self.#buffer.stroke(0, 0, 255);
                var result = [];

                for (let i = 0; i < targetPoints.length; i++) {
                    const vp = targetPoints[i - 1 >= 0 ? i - 1 : targetPoints.length - 1];
                    const vc = targetPoints[i];
                    const vn = targetPoints[i + 1 <= targetPoints.length - 1 ? i + 1 : 0];

                    self.#buffer.circle(vc.x, vc.y, 2);
                    
                    //Point outside of shape
                    if (!self.IsInside(insetPoints, vc.x, vc.y) || self.IsInsideForbiddenShapes(outsets, vc.x, vc.y)) {
                        isDummy = true;
                        //Find a collision between current vertice and the previous vertice
                        var dirP = vp.getCopy().remove(vc).normalized();
                        var toPrev = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirP.x, -dirP.y), Vector2.distance(vp, vc));

                        //Find a collision between current vertice and the next vertice
                        var dirN = vn.getCopy().remove(vc).normalized();
                        var toNext = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc));

                        //Push collision point into the result array
                        if (toPrev != null) {
                            self.#buffer.text('x', toPrev.x - 3, toPrev.y + 3);
                            result.push(toPrev);
                        }

                        //Include all inset points that are inside the tile
                        for (let r = 0; r < insetPoints.length; r++) {
                            const inset = insetPoints[r];

                            if (self.IsInside(targetPoints, inset.x, inset.y)) {
                                result.push(inset);
                            }
                        }

                        //Include all outside points that are inside the tile
                        for (let r = 0; r < outsets.length; r++) {
                            const outset = outsets[r];
                            const outsetPoints = outset.getVertices();

                            for (let r = 0; r < outsetPoints.length; r++) {
                                const outsetPoint = outsetPoints[r];

                                if (self.IsInside(targetPoints, outsetPoint.x, outsetPoint.y)) {
                                    result.push(outsetPoint);
                                }
                            }
                        }
                        
                        //Push collision point into the result array
                        if (toNext != null) {
                            self.#buffer.text('x', toNext.x - 3, toNext.y + 3);
                            result.push(toNext);
                        }
                    }
                    else{
                        result.push(vc);
                    }
                }

                // var hitTop = self.#raycast([inset], points[0], Vector2.left(), isFirstTile ? firstTileSize.x : tileSize.x);
                // if (hitTop) {
                //     isDummy = true;
                //     self.#buffer.text('x', hitTop.x + 1, hitTop.y + 3);
                //     if (this.IsInside(insetPoints, points[0].x, points[0].y)) {
                //         points[1] = hitTop;
                //     }
                //     else{
                //         points[0] = hitTop;
                //     }
                // }

                // var hitRight = self.#raycast([inset], points[1], Vector2.down(), tileSize.y);
                // if (hitRight) {
                //     isDummy = true;
                //     self.#buffer.text('x', hitRight.x + 1, hitRight.y + 3);
                //     if (self.IsInside(insetPoints, points[1].x, points[1].y)) {
                //         points[2] = hitRight;
                //     } else {
                //         points[1] = hitRight;
                //     }
                // }

                // var hitBottom = self.#raycast([inset], points[2], Vector2.right(), isFirstTile ? firstTileSize.x : tileSize.x);
                // if (hitBottom) {
                //     isDummy = true;
                //     self.#buffer.text('x', hitBottom.x + 1, hitBottom.y + 3);
                //     if (self.IsInside(insetPoints, points[2].x, points[2].y)) {
                //         points[3] = hitBottom;
                //     } else {
                //         points[2] = hitBottom;
                //     }
                // }

                // var hitLeft = self.#raycast([inset], points[3], Vector2.up(), tileSize.y);
                // if (hitLeft) {
                //     isDummy = true;
                //     self.#buffer.text('x', hitLeft.x + 1, hitLeft.y + 3);
                //     if (self.IsInside(insetPoints, points[3].x, points[3].y)) {
                //         points[0] = hitLeft;
                //     } else {
                //         points[3] = hitLeft;
                //     }
                // }

                // for (let i = 0; i < points.length; i++) {
                //     const vc = points[i];
                //     if(!self.IsInside(insetPoints, vc.x, vc.y)){
                //         resolve(null);
                //         return;
                //     }
                // }

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
                    // isValid = true;
                    if(outsets.length <= 0){
                        isValid = true;
                    }
                    else{
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
            return null;
        }

        var syncedLoop = async (x, y) => {
            var targetPoints = [
                new Vector2(x, y),
                new Vector2(x + (isFirstTile ? firstTileSize.x : tileSize.x), y),
                new Vector2(x + (isFirstTile ? firstTileSize.x : tileSize.x), y + tileSize.y),
                new Vector2(x - (isFirstTile ? tileSize.x - firstTileSize.x : 0), y + tileSize.y),
            ];
            x += (isFirstTile ? firstTileSize.x : tileSize.x);
            // x += tileSize.x;

            var delay = 100;
            var resultPos = validateLocation(x, y, targetPoints);
            if(resultPos){
                var tmp = null;
                await syncedPlaceTile(resultPos.x, resultPos.y, targetPoints).then((tile) => {
                    tmp = tile;
                    isFirstTile = false;
                });
                await this.#sleep(delay);
            }

            if (x < boundingBox.x + boundingBox.w) {
                syncedLoop(x, y);
            } else if (y + tileSize.y < boundingBox.y + boundingBox.h) {
                isFirstTile = true;
                syncedLoop(boundingBox.x, y + tileSize.y);
            }

            // if(resultPos){
            //     console.log(resultPos.toJSON());
            //     //attempt place tile
            //     var tmp = null;
            //     await syncedPlaceTile(resultPos.x, resultPos.y, targetPoints).then((tile) => {
            //         tmp = tile;
            //     });

            //     if (tmp != null) {
            //         await self.#sleep(delay);
            //         placedATile = true;
            //         isFirstTile = false;
                    
            //         var bb = tmp.getBoundingBox();
            //         if (x < boundingBox.x + boundingBox.w) {
            //             console.log("Same row");
            //             syncedLoop(tmp.pos.x + bb.w, tmp.pos.y);
            //         } else {
            //             console.log("Next row");
            //             if (y < boundingBox.y + boundingBox.h) {
            //                 isFirstTile = true;
            //                 syncedLoop(boundingBox.x, tmp.pos.y + bb.h);
            //             }
            //         }
            //     }
            //     else {
            //         console.warn("WARNING: A tile went out of bounds without detecting a collision at", resultPos.x, resultPos.y);
            //         if (y < boundingBox.y + boundingBox.h) {
            //             isFirstTile = true;
            //             syncedLoop(boundingBox.x, resultPos.y + tileSize.y);
            //         }
            //     }
            // }
            // else if (y < boundingBox.y + boundingBox.h) {
            //     await self.#sleep(delay);
            //     console.log("Searching...");
            //     syncedLoop(x, y + 1);
            // }
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
        // this.#buffer.stroke(255, 0, 0);
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
}