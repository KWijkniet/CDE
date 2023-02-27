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
        var hideVisuals = false;

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
            this.#generateTiles(inset, outsets);
        }
    }

    #createInset(shape) {
        //calculate inset
        var insets = [];
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

            if ((vp.x == vc.x && vc.x == vn.x) || (vp.y == vc.y && vc.y == vn.y)) {
                continue;
            }

            var dirN = vn.getCopy().remove(vc).normalized();
            dirN.multiply(new Vector2(mp, mp));

            var dirP = vp.getCopy().remove(vc).normalized();
            dirP.multiply(new Vector2(mn, mn));

            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);
            // Old
            var pos = dirN.getCopy().add(vc).add(dirP);

            // Stap 2
            var slopeP = (vp.y - vc.y) / (vp.x - vc.x);
            var slopeN = (vn.y - vc.y) / (vn.x - vc.x);

            if (slopeP == 0) {
                // The perpendicular line will have a slope of undefined (vertical line) and pass through the set point
                var perpendicularStartPointP = {x: posP.x, y: posP.y - mp};
                var perpendicularEndPointP = {x: posP.x, y: posP.y + mp};
            } else if (slopeP == Infinity || slopeP == -Infinity) {
                var perpendicularStartPointP = {x: posP.x - mp, y: posP.y};
                var perpendicularEndPointP = {x: posP.x + mp, y: posP.y};
            } else { 
                var perpendicularSlopeP = -1 / slopeP;
                var yInterceptP = posP.y - (perpendicularSlopeP * posP.x);
                var perpendicularStartPointP = {x: posP.x - mp, y: (perpendicularSlopeP * (posP.x - mp)) + yInterceptP};
                var perpendicularEndPointP = {x: posP.x + mp, y: (perpendicularSlopeP * (posP.x + mp)) + yInterceptP};
            }

            if (slopeN == 0) {
                // The perpendicular line will have a slope of undefined (vertical line) and pass through the set point
                var perpendicularStartPointN = {x: posN.x, y: posN.y - mn};
                var perpendicularEndPointN = {x: posN.x, y: posN.y + mn};
            } else if (slopeN == Infinity || slopeN == -Infinity) {
                var perpendicularStartPointN = {x: posN.x - mn, y: posN.y};
                var perpendicularEndPointN = {x: posN.x + mn, y: posN.y};
            } else { 
                var perpendicularSlopeN = -1 / slopeN;
                var yInterceptN = posN.y - (perpendicularSlopeN * posN.x);

                var perpendicularStartPointN = {x: posN.x - mn, y: (perpendicularSlopeN * (posN.x - mn)) + yInterceptN};
                var perpendicularEndPointN = {x: posN.x + mn, y: (perpendicularSlopeN * (posN.x + mn)) + yInterceptN};
            }

            if (!hideVisuals) {
                this.#buffer.fill(0, 0,255); // BLAUW
                this.#buffer.stroke(0, 0,0); 
                this.#buffer.text("SPP", perpendicularStartPointP.x - 20, perpendicularStartPointP.y);
                this.#buffer.text("SPN",perpendicularStartPointN.x - 10, perpendicularStartPointN.y);
                this.#buffer.text("EPP",perpendicularEndPointP.x + 20, perpendicularEndPointP.y);
                this.#buffer.text("EPN",perpendicularEndPointN.x + 10, perpendicularEndPointN.y);
            }

            // Stap 3
            // Check welk punt we moeten gebruiken
            var newPosP, newPosN;
            var dBuffer = 5
            // Als beide punten in shape zitten
            if(Collision.polygonCircle(shape.getVertices(), perpendicularStartPointP.x, perpendicularStartPointP.y, 1) && Collision.polygonCircle(shape.getVertices(), perpendicularEndPointP.x, perpendicularEndPointP.y, 1)){
                print(i + '- Beide perpendicularPoints van P zitten binnen');
                var directionStart = new Vector2(perpendicularStartPointP.x, perpendicularStartPointP.y).remove(posP).normalized();
                var directionEnd = new Vector2(perpendicularEndPointP.x, perpendicularEndPointP.y).remove(posP).normalized();
                
                
                var raycastPSFalse = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), false);
                var raycastPSTrue = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), true);
                if(raycastPSFalse == null && raycastPSTrue == null){
                    if (!hideVisuals) {
                        this.#buffer.fill(0, 255, 0);
                        this.#buffer.circle(perpendicularStartPointP.x, perpendicularStartPointP.y, 5);
                        print(i + '- GEEN COLLISION RICHTING perpendicularStartPointP');
                    }
                    newPosP = perpendicularStartPointP;
                } else if(Vector2.distance(posP, raycastPSFalse) <= dBuffer && raycastPSTrue == null) {
                    print('N prnis 1');
                    newPosP = perpendicularStartPointP;
                } else if(Vector2.distance(posP, raycastPSTrue) <= dBuffer && raycastPSFalse == null) {
                    print('N prnis 2');
                    newPosP = perpendicularStartPointP;
                } else {
                    if (!hideVisuals) {
                        print(i + '- WEL COLLISION RICHTING perpendicularStartPointP');
                        this.#buffer.line(posP.x, posP.y, perpendicularStartPointP.x, perpendicularStartPointP.y, 5);
                    }
                    newPosP = perpendicularEndPointP;
                }

                if(newPosP == null){
                    var raycastPEFalse = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), false);
                    var raycastPETrue = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), true);
                    if(raycastPEFalse == null && raycastPETrue == null){
                        if (!hideVisuals) {
                            this.#buffer.fill(0, 255, 0);
                            this.#buffer.circle(perpendicularEndPointP.x, perpendicularEndPointP.y, 5);
                            print(i + '- GEEN COLLISION RICHTING perpendicularEndPointP');
                        }
                        newPosP = perpendicularEndPointP;
                    }  else if(Vector2.distance(posP, raycastPEFalse) <= dBuffer && raycastPETrue == null) {
                        print('N prnis 3');
                        newPosN = perpendicularEndPointN;
                    } else if(Vector2.distance(posP, raycastPETrue) <= dBuffer && raycastPEFalse == null) {
                        print('N prnis 4');
                        newPosN = perpendicularEndPointN;
                    } else {
                        if (!hideVisuals) {
                            print(i + '- WEL COLLISION RICHTING perpendicularEndPointP');
                            this.#buffer.line(posP.x, posP.y, perpendicularEndPointP.x, perpendicularEndPointP.y, 5);
                        }
                        newPosP = perpendicularStartPointP;
                    }
                }

            }
            // Als beide punten NIET in shape zitten 
            else if(!Collision.polygonCircle(shape.getVertices(), perpendicularStartPointP.x, perpendicularStartPointP.y, 1) && !Collision.polygonCircle(shape.getVertices(), perpendicularEndPointP.x, perpendicularEndPointP.y, 1)){
                print(i + '- Beide perpendicularStartPoints van P zitten NIET binnen');
                var directionStart = new Vector2(perpendicularStartPointP.x, perpendicularStartPointP.y).remove(posP).normalized();
                var directionEnd = new Vector2(perpendicularEndPointP.x, perpendicularEndPointP.y).remove(posP).normalized();
                
                var raycastPSFalse = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), false);
                var raycastPSTrue = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), true);
                if(raycastPSFalse != null && raycastPSTrue != null){
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.circle(perpendicularStartPointP.x, perpendicularStartPointP.y, 5);
                    print(i + '- WEL COLLISION RICHTING perpendicularStartPointP');
                    newPosP = perpendicularStartPointP;
                }

                var raycastPEFalse = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), false);
                var raycastPETrue = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), true);
                if(raycastPEFalse != null && raycastPETrue != null){
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.circle(perpendicularEndPointP.x, perpendicularEndPointP.y, 5);
                    print(i + '- WEL COLLISION RICHTING perpendicularEndPointP');
                    newPosP = perpendicularEndPointP;
                } 
            }
            // Als start punt in shape zitten  
            else if (Collision.polygonCircle(shape.getVertices(), perpendicularStartPointP.x, perpendicularStartPointP.y, 1))
            newPosP = perpendicularStartPointP;
            // Anders pak eind punt
            else newPosP = perpendicularEndPointP;

            if(Collision.polygonCircle(shape.getVertices(), perpendicularStartPointN.x, perpendicularStartPointN.y, 1) && Collision.polygonCircle(shape.getVertices(), perpendicularEndPointN.x, perpendicularEndPointN.y, 1)){
                print(i + '- Beide perpendicularPoints van N zitten binnen');
                var directionStart = new Vector2(perpendicularStartPointN.x, perpendicularStartPointN.y).remove(posN).normalized();
                var directionEnd = new Vector2(perpendicularEndPointN.x, perpendicularEndPointN.y).remove(posN).normalized();
                
                var raycastNSFalse = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), false);
                var raycastNSTrue = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), true);
                if(raycastNSFalse == null && raycastNSTrue == null){
                    if (!hideVisuals) {
                        this.#buffer.fill(0, 255, 0);
                        print(i + '- GEEN COLLISION RICHTING perpendicularStartPointN');
                        this.#buffer.circle(perpendicularStartPointN.x, perpendicularStartPointN.y, 5);
                    }
                    newPosN = perpendicularStartPointN;
                } else if(Vector2.distance(posN, raycastNSFalse) <= dBuffer && raycastNSTrue == null) {
                    print('N prnis 1');
                    newPosN = perpendicularStartPointN;
                } else if(Vector2.distance(posN, raycastNSTrue) <= dBuffer && raycastNSFalse == null) {
                    print('N prnis 2');
                    newPosN = perpendicularStartPointN;
                } else {
                    if (!hideVisuals) {
                        print(i + '- WEL COLLISION RICHTING perpendicularStartPointN');
                        this.#buffer.line(posN.x, posN.y, perpendicularStartPointN.x, perpendicularStartPointN.y, 5);
                    }
                    newPosN = perpendicularEndPointN;
                }

                if(newPosN == null){
                    var raycastNEFalse = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), false);
                    var raycastNETrue = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), true);
                    if(raycastNEFalse == null || raycastNETrue == null){      
                        if (!hideVisuals) {
                            print(i + '- GEEN COLLISION RICHTING perpendicularEndPointN');
                            this.#buffer.fill(0, 255, 0);
                            this.#buffer.circle(perpendicularEndPointN.x, perpendicularEndPointN.y, 5);
                        }
                        newPosN = perpendicularEndPointN;
                    } else if(Vector2.distance(posN, raycastNEFalse) <= dBuffer && raycastNETrue == null) {
                        print('N prnis 3');
                        newPosN = perpendicularEndPointN;
                    } else if(Vector2.distance(posN, raycastNETrue) <= dBuffer && raycastNEFalse == null) {
                        print('N prnis 4');
                        newPosN = perpendicularEndPointN;
                    } else {
                        if (!hideVisuals) {
                            print(i + '- WEL COLLISION RICHTING perpendicularEndPointN');
                            this.#buffer.line(posN.x, posN.y, perpendicularEndPointN.x, perpendicularEndPointN.y, 5);
                        }
                        newPosN = perpendicularStartPointN;
                    }
                }
                
            } else  if(!Collision.polygonCircle(shape.getVertices(), perpendicularStartPointN.x, perpendicularStartPointN.y, 1) && !Collision.polygonCircle(shape.getVertices(), perpendicularEndPointN.x, perpendicularEndPointN.y, 1)){
                print(i + '- Beide perpendicularStartPoints van N zitten NIET binnen');

                var directionStart = new Vector2(perpendicularStartPointN.x, perpendicularStartPointN.y).remove(posN).normalized();
                var directionEnd = new Vector2(perpendicularEndPointN.x, perpendicularEndPointN.y).remove(posN).normalized();
                
                var raycastNSFalse = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), false);
                var raycastNSTrue = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), true);
                if(raycastNSFalse != null && raycastNSTrue != null){
                    // this.#buffer.fill(0, 255, 0);
                    // print(i + '- WEL COLLISION RICHTING perpendicularStartPointN');
                    // this.#buffer.circle(perpendicularStartPointN.x, perpendicularStartPointN.y, 5);
                    newPosN = perpendicularStartPointN;
                }

                var raycastNEFalse = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), false);
                var raycastNETrue = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), true);
                if(raycastNEFalse != null && raycastNETrue != null){      
                    if (!hideVisuals) {
                        // this.#buffer.fill(0, 255, 0);
                        // print(i + '- WEL COLLISION RICHTING perpendicularEndPointN');
                        // this.#buffer.circle(perpendicularEndPointN.x, perpendicularEndPointN.y, 5);
                    }
                    newPosN = perpendicularEndPointN;
                }
            } else if (Collision.polygonCircle(shape.getVertices(), perpendicularStartPointN.x, perpendicularStartPointN.y, 1))
            newPosN = perpendicularStartPointN;
            else newPosN = perpendicularEndPointN;
            

            // Check if points are on the same coordinates
            if (Collision.pointPoint(newPosP.x, newPosP.y, newPosN.x, newPosN.y)){ 
                insets.push(new Vector2(newPosN.x, newPosN.y));
                // insets.push(pos);
                // print(i + 'BENIS');
            }else {
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
                    this.#buffer.text("Collision Point",collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 15);
                }
                insets.push(collisionPoint);
            }

            if (!hideVisuals) {
                this.#buffer.text(i ,vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                // this.#buffer.circle(pos.x, pos.y, 10);
                this.#buffer.circle(posP.x, posP.y, 5);
                this.#buffer.circle(posN.x, posN.y, 5);
                this.#buffer.fill(255, 0, 0);
                this.#buffer.circle(newPosP.x, newPosP.y, 10);
                this.#buffer.circle(newPosN.x, newPosN.y, 10);
            }
            // insets.push(pos);
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

            // var dirP = vp.getCopy().remove(vc).normalized().multiply(new Vector2(mn, mn));
            // var dirN = vn.getCopy().remove(vc).normalized().multiply(new Vector2(mp, mp));

            // var posP = vc.getCopy().remove(dirP);
            // var posN = vc.getCopy().remove(dirN);

            var dirN = vn.getCopy().remove(vc).normalized();
            dirN.multiply(new Vector2(mp, mp));

            var dirP = vp.getCopy().remove(vc).normalized();
            dirP.multiply(new Vector2(mn, mn));

            var posN = dirN.getCopy().add(vc);
            var posP = dirP.getCopy().add(vc);
            // Old
            var pos = vc.getCopy().remove(dirN).remove(dirP);

             // Stap 2
            var slopeP = (vp.y - vc.y) / (vp.x - vc.x);
            var slopeN = (vn.y - vc.y) / (vn.x - vc.x);

            var tolerance = .1;

            var perpendicularPointN = this.#getPerpendicularPoint(posP.x,posP.y, vp.x,vp.y, mp, 'up');
            var perpendicularPointE = this.#getPerpendicularPoint(posN.x,posN.y, vn.x,vn.y, mn, 'left');

            // this.#buffer.circle(testPoint.x, testPoint.y, 20);
            // this.#buffer.circle(testPoint2.x, testPoint2.y, 20);


            // if (Math.abs(slopeP) < tolerance) {
            //     // The perpendicular line will have a slope of undefined (vertical line) and pass through the set point
            //     var perpendicularStartPointP = {x: posP.x, y: posP.y - mp};
            //     var perpendicularEndPointP = {x: posP.x, y: posP.y + mp};
            // } else if (slopeP == Infinity || slopeP == -Infinity) {
            //     var perpendicularStartPointP = {x: posP.x - mp, y: posP.y};
            //     var perpendicularEndPointP = {x: posP.x + mp, y: posP.y};
            // } else { 
            //     var perpendicularSlopeP = -1 / slopeP;
            //     var yInterceptP = posP.y - (perpendicularSlopeP * posP.x);
            //     var perpendicularStartPointP = {x: posP.x - mp, y: (perpendicularSlopeP * (posP.x - mp)) + yInterceptP};
            //     var perpendicularEndPointP = {x: posP.x + mp, y: (perpendicularSlopeP * (posP.x + mp)) + yInterceptP};
            // }

            // if (Math.abs(slopeN) < tolerance) {
            //     // The perpendicular line will have a slope of undefined (vertical line) and pass through the set point
            //     var perpendicularStartPointN = {x: posN.x, y: posN.y - mn};
            //     var perpendicularEndPointN = {x: posN.x, y: posN.y + mn};
            // } else if (slopeN == Infinity || slopeN == -Infinity) {
            //     var perpendicularStartPointN = {x: posN.x - mn, y: posN.y};
            //     var perpendicularEndPointN = {x: posN.x + mn, y: posN.y};
            // } else { 
            //     var perpendicularSlopeN = -1 / slopeN;
            //     var yInterceptN = posN.y - (perpendicularSlopeN * posN.x);

            //     var perpendicularStartPointN = {x: posN.x - mn, y: (perpendicularSlopeN * (posN.x - mn)) + yInterceptN};
            //     var perpendicularEndPointN = {x: posN.x + mn, y: (perpendicularSlopeN * (posN.x + mn)) + yInterceptN};
            // }
            

            if (!hideVisuals) {
                this.#buffer.fill(0, 0,255); // BLAUW
                this.#buffer.stroke(0, 0,0); 
                // this.#buffer.text("SPP", perpendicularStartPointP.x - 20, perpendicularStartPointP.y);
                // this.#buffer.text("SPN",perpendicularStartPointN.x - 10, perpendicularStartPointN.y);
                // this.#buffer.text("EPP",perpendicularEndPointP.x + 20, perpendicularEndPointP.y);
                // this.#buffer.text("EPN",perpendicularEndPointN.x + 10, perpendicularEndPointN.y);

                // this.#buffer.circle(perpendicularStartPointP.x, perpendicularStartPointP.y, 10);
                // this.#buffer.circle(perpendicularStartPointN.x, perpendicularStartPointN.y, 10);
                // this.#buffer.circle(perpendicularEndPointP.x, perpendicularEndPointP.y, 10);
                // this.#buffer.circle(perpendicularEndPointN.x, perpendicularEndPointN.y, 10);
            }

            // Stap 3
            // Check welk punt we moeten gebruiken
            var newPosP, newPosN;
            var dBuffer = 5
            // !Als beide punten in shape zitten
            if(!Collision.polygonCircle(shape.getVertices(), perpendicularStartPointP.x, perpendicularStartPointP.y, 1) && !Collision.polygonCircle(shape.getVertices(), perpendicularEndPointP.x, perpendicularEndPointP.y, 1)){
                print(i + '- Beide perpendicularPoints van P zitten binnen');
                var directionStart = new Vector2(perpendicularStartPointP.x, perpendicularStartPointP.y).remove(posP).normalized();
                var directionEnd = new Vector2(perpendicularEndPointP.x, perpendicularEndPointP.y).remove(posP).normalized();
                
                
                var raycastPSFalse = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), false);
                var raycastPSTrue = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), true);
                if(raycastPSFalse == null && raycastPSTrue == null){
                    if (!hideVisuals) {
                        this.#buffer.fill(0, 255, 0);
                        this.#buffer.circle(perpendicularStartPointP.x, perpendicularStartPointP.y, 5);
                        print(i + '- GEEN COLLISION RICHTING perpendicularStartPointP');
                    }
                    newPosP = perpendicularStartPointP;
                } else if(Vector2.distance(posP, raycastPSFalse) <= dBuffer && raycastPSTrue == null) {
                    print('N prnis 1');
                    newPosN = perpendicularStartPointP;
                } else if(Vector2.distance(posP, raycastPSTrue) <= dBuffer && raycastPSFalse == null) {
                    print('N prnis 2');
                    newPosN = perpendicularStartPointP;
                } else {
                    if (!hideVisuals) {
                        print(i + '- WEL COLLISION RICHTING perpendicularStartPointP');
                        this.#buffer.line(posP.x, posP.y, perpendicularStartPointP.x, perpendicularStartPointP.y, 5);
                    }
                    newPosP = perpendicularEndPointP;
                }

                if(newPosP == null){
                    var raycastPEFalse = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), false);
                    var raycastPETrue = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), true);
                    if(raycastPEFalse == null && raycastPETrue == null){
                        if (!hideVisuals) {
                            this.#buffer.fill(0, 255, 0);
                            this.#buffer.circle(perpendicularEndPointP.x, perpendicularEndPointP.y, 5);
                            print(i + '- GEEN COLLISION RICHTING perpendicularEndPointP');
                        }
                        newPosP = perpendicularEndPointP;
                    }  else if(Vector2.distance(posP, raycastPEFalse) <= dBuffer && raycastPETrue == null) {
                        print('N prnis 3');
                        newPosP = perpendicularEndPointN;
                    } else if(Vector2.distance(posP, raycastPETrue) <= dBuffer && raycastPEFalse == null) {
                        print('N prnis 4');
                        newPosP = perpendicularEndPointN;
                    } else {
                        if (!hideVisuals) {
                            print(i + '- WEL COLLISION RICHTING perpendicularEndPointP');
                            this.#buffer.line(posP.x, posP.y, perpendicularEndPointP.x, perpendicularEndPointP.y, 5);
                        }
                        newPosP = perpendicularStartPointP;
                    }
                }

            }
            // !Als beide punten NIET in shape zitten 
            else if(Collision.polygonCircle(shape.getVertices(), perpendicularStartPointP.x, perpendicularStartPointP.y, 1) && Collision.polygonCircle(shape.getVertices(), perpendicularEndPointP.x, perpendicularEndPointP.y, 1)){
                print(i + '- Beide perpendicularStartPoints van P zitten NIET binnen');
                var directionStart = new Vector2(perpendicularStartPointP.x, perpendicularStartPointP.y).remove(posP).normalized();
                var directionEnd = new Vector2(perpendicularEndPointP.x, perpendicularEndPointP.y).remove(posP).normalized();
                
                var raycastPSFalse = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), false);
                var raycastPSTrue = this.#raycast([shape], posP, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posP, perpendicularStartPointP), true);
                if(raycastPSFalse != null && raycastPSTrue != null){
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.circle(perpendicularStartPointP.x, perpendicularStartPointP.y, 5);
                    print(i + '- WEL COLLISION RICHTING perpendicularStartPointP');
                    newPosP = perpendicularStartPointP;
                }

                var raycastPEFalse = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), false);
                var raycastPETrue = this.#raycast([shape], posP, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posP, perpendicularEndPointP), true);
                if(raycastPEFalse != null && raycastPETrue != null){
                    this.#buffer.fill(0, 255, 0);
                    this.#buffer.circle(perpendicularEndPointP.x, perpendicularEndPointP.y, 5);
                    print(i + '- WEL COLLISION RICHTING perpendicularEndPointP');
                    newPosP = perpendicularEndPointP;
                } 
            }
            // Als start punt in shape zitten  
            else if (!Collision.polygonCircle(shape.getVertices(), perpendicularStartPointP.x, perpendicularStartPointP.y, 1))
            newPosP = perpendicularStartPointP;
            // Anders pak eind punt
            else newPosP = perpendicularEndPointP;

            if(!Collision.polygonCircle(shape.getVertices(), perpendicularStartPointN.x, perpendicularStartPointN.y, 1) && !Collision.polygonCircle(shape.getVertices(), perpendicularEndPointN.x, perpendicularEndPointN.y, 1)){
                print(i + '- Beide perpendicularPoints van N zitten binnen');
                var directionStart = new Vector2(perpendicularStartPointN.x, perpendicularStartPointN.y).remove(posN).normalized();
                var directionEnd = new Vector2(perpendicularEndPointN.x, perpendicularEndPointN.y).remove(posN).normalized();
                
                var raycastNSFalse = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), false);
                var raycastNSTrue = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), true);
                if(raycastNSFalse == null && raycastNSTrue == null){
                    if (!hideVisuals) {
                        this.#buffer.fill(0, 255, 0);
                        print(i + '- GEEN COLLISION RICHTING perpendicularStartPointN');
                        this.#buffer.circle(perpendicularStartPointN.x, perpendicularStartPointN.y, 5);
                    }
                    newPosN = perpendicularStartPointN;
                } else if(Vector2.distance(posN, raycastNSFalse) <= dBuffer && raycastNSTrue == null) {
                    print('N prnis 1');
                    newPosN = perpendicularStartPointN;
                } else if(Vector2.distance(posN, raycastNSTrue) <= dBuffer && raycastNSFalse == null) {
                    print('N prnis 2');
                    newPosN = perpendicularStartPointN;
                } else {
                    if (!hideVisuals) {
                        print(i + '- WEL COLLISION RICHTING perpendicularStartPointN');
                        this.#buffer.line(posN.x, posN.y, perpendicularStartPointN.x, perpendicularStartPointN.y, 5);
                    }
                    newPosN = perpendicularEndPointN;
                }

                if(newPosN == null){
                    var raycastNEFalse = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), false);
                    var raycastNETrue = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), true);
                    if(raycastNEFalse == null || raycastNETrue == null){      
                        if (!hideVisuals) {
                            print(i + '- GEEN COLLISION RICHTING perpendicularEndPointN');
                            this.#buffer.fill(0, 255, 0);
                            this.#buffer.circle(perpendicularEndPointN.x, perpendicularEndPointN.y, 5);
                        }
                        newPosN = perpendicularEndPointN;
                    } else if(Vector2.distance(posN, raycastNEFalse) <= dBuffer && raycastNETrue == null) {
                        print('N prnis 3');
                        newPosN = perpendicularEndPointN;
                    } else if(Vector2.distance(posN, raycastNETrue) <= dBuffer && raycastNEFalse == null) {
                        print('N prnis 4');
                        newPosN = perpendicularEndPointN;
                    } else {
                        if (!hideVisuals) {
                            print(i + '- WEL COLLISION RICHTING perpendicularEndPointN');
                            this.#buffer.line(posN.x, posN.y, perpendicularEndPointN.x, perpendicularEndPointN.y, 5);
                        }
                        newPosN = perpendicularStartPointN;
                    }
                }
                
            } else  if(Collision.polygonCircle(shape.getVertices(), perpendicularStartPointN.x, perpendicularStartPointN.y, 1) && Collision.polygonCircle(shape.getVertices(), perpendicularEndPointN.x, perpendicularEndPointN.y, 1)){
                print(i + '- Beide perpendicularStartPoints van N zitten NIET binnen');

                var directionStart = new Vector2(perpendicularStartPointN.x, perpendicularStartPointN.y).remove(posN).normalized();
                var directionEnd = new Vector2(perpendicularEndPointN.x, perpendicularEndPointN.y).remove(posN).normalized();
                
                var raycastNSFalse = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), false);
                var raycastNSTrue = this.#raycast([shape], posN, new Vector2(-directionStart.x, -directionStart.y), Vector2.distance(posN, perpendicularStartPointN), true);
                if(raycastNSFalse != null && raycastNSTrue != null){
                    // this.#buffer.fill(0, 255, 0);
                    // print(i + '- WEL COLLISION RICHTING perpendicularStartPointN');
                    // this.#buffer.circle(perpendicularStartPointN.x, perpendicularStartPointN.y, 5);
                    newPosN = perpendicularStartPointN;
                }

                var raycastNEFalse = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), false);
                var raycastNETrue = this.#raycast([shape], posN, new Vector2(-directionEnd.x, -directionEnd.y), Vector2.distance(posN, perpendicularEndPointN), true);
                if(raycastNEFalse != null && raycastNETrue != null){      
                    if (!hideVisuals) {
                        // this.#buffer.fill(0, 255, 0);
                        // print(i + '- WEL COLLISION RICHTING perpendicularEndPointN');
                        // this.#buffer.circle(perpendicularEndPointN.x, perpendicularEndPointN.y, 5);
                    }
                    newPosN = perpendicularEndPointN;
                }
            } else if (!Collision.polygonCircle(shape.getVertices(), perpendicularStartPointN.x, perpendicularStartPointN.y, 1))
            newPosN = perpendicularStartPointN;
            else newPosN = perpendicularEndPointN;
            

            // Check if points are on the same coordinates
            if (Collision.pointPoint(newPosP.x, newPosP.y, newPosN.x, newPosN.y)){ 
                outsets.push(new Vector2(newPosN.x, newPosN.y));
                // insets.push(pos);
                // print(i + 'BENIS');
            }else {
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
                    this.#buffer.text("Collision Point",collisionPoint.x - 30, collisionPoint.y - 10);
                    this.#buffer.circle(collisionPoint.x, collisionPoint.y, 15);
                }
                outsets.push(collisionPoint);
            }

            if (!hideVisuals) {
                this.#buffer.text(i ,vc.x, vc.y + 10);
                this.#buffer.fill(0, 255, 0);
                // this.#buffer.circle(pos.x, pos.y, 10);
                this.#buffer.circle(posP.x, posP.y, 10);
                this.#buffer.circle(posN.x, posN.y, 10);
                this.#buffer.fill(255, 0, 0);
                // this.#buffer.circle(newPosP.x, newPosP.y, 10);
                // this.#buffer.circle(newPosN.x, newPosN.y, 10);
            }

            // if (Collision.polygonCircle(shape.getVertices(), pos.x, pos.y, 5)) {
            //     var posP = vc.getCopy().add(dirP);
            //     var posN = vc.getCopy().add(dirN);
            //     var pos = vc.getCopy().add(dirN).add(dirP);
            //     if (!hideVisuals) {
            //         this.#buffer.fill(0, 0, 255);
            //         this.#buffer.circle(posP.x, posP.y, 10);
            //         this.#buffer.circle(posN.x, posN.y, 10);
            //         this.#buffer.circle(pos.x, pos.y, 10);
            //     }
            // }

            // outsets.push(pos);
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
        var isFirstTile = true;
        var rowIndex = 0;
        var count= 0;

        this.#tiles = { 'X-Roof': 0, 'Alucobond': 0 };
        this.#totalWidth = 0;
        this.#totalHeight = 0;
        this.#dummyWidth = 0;
        this.#dummyHeight = 0;
        this.#tileWidth = 0;
        this.#tileHeight = 0;

        var syncedPlaceTile = async (x, y, targetPoints) => new Promise((resolve) => {
            var delay = 10;
            var isDummy = false;
            count++;

            setTimeout(() => {
                var result = [];
                var needToSplit = false;
                var startIndex, endIndex;
                var amount = 0;
                
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
                //TODO: raycast up a tiny bit to detect if this is the first tile on the Y axis. (wont work)
                var tmp = [];
                for (let i = 0; i < result.length; i++) {
                    const vc = result[i];
                    const vn = result[i + 1 <= result.length - 1 ? i + 1 : 0];

                    //Find a collision between current vertice and the next vertice
                    var dirN = vn.getCopy().remove(vc).normalized();
                    var toNext = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc), true);
                    var toCurr = self.#raycast([inset].concat(outsets), vn, new Vector2(dirN.x, dirN.y), Vector2.distance(vn, vc), true);
                    if(count == 49){
                        if (toNext !=null ) {
                            this.#buffer.fill(0,255,255); // BLAUW
                            this.#buffer.circle(toNext.x, toNext.y, 10);
                        }
                        if (toCurr !=null ) {
                            
                            this.#buffer.fill(255,255,0); // GEEEL
                            this.#buffer.circle(toCurr.x, toCurr.y, 10);
                        }

                    }
                    
                    // tmp.push(vc);
                    self.checkAndPush(tmp, vc, i,count);
                    
                    //Validate found collisions
                    // if ((toNext != null && (Vector2.distance(toNext, vc) <= 2 || Vector2.distance(toNext, vn) <= 2)) || (toCurr != null && (Vector2.distance(toCurr, vn) <= 2 || Vector2.distance(toCurr, vc) <= 2))) {
                    //     continue;
                    // }
                    
                    if (toNext != null) {
                        isDummy = true;
                        // tmp.push(toNext);
                        self.checkAndPush(tmp, toNext, i,count);
                    }

                    if(toNext != null && toCurr != null){
                        if(!toCurr.equals(toNext) && Vector2.distance(toNext, toCurr) >= 2){
                            if(count == 64){

                            }
                            if(startIndex == null)  {
                                startIndex = tmp.length-1;
                            }
                            // // If StartIndex is set, set End Index
                            else if(startIndex != null && endIndex == null) {
                                endIndex = tmp.length-1;
                                needToSplit= true;
                            }
                            
                        }

                        //Include all inset points that are inside the tile
                        for (let r = 0; r < insetPoints.length; r++) {
                            const inset = insetPoints[r];

                            if (self.IsInside(result, inset.x, inset.y)) {
                                // tmp.push(inset);
                                self.checkAndPush(tmp, inset, i,count);
                            }
                        }

                        //Include all outset points that are inside the tile
                        for (let r = 0; r < outsets.length; r++) {
                            const outset = outsets[r];
                            const outsetPoints = outset.getVertices();

                            for (let b = 0; b < outsetPoints.length; b++) {
                                const outsetPoint = outsetPoints[b];

                                if (self.IsInside(result, outsetPoint.x, outsetPoint.y)) {
                                    // tmp.push(outsetPoint);
                                    self.checkAndPush(tmp, outsetPoint, i,count);
                                }
                            }
                        }

                        
                    }

                    if (toCurr != null) {
                        isDummy = true;
                        // tmp.push(toCurr);
                        self.checkAndPush(tmp, toCurr, i,count);
                    }
                    if(toNext != null && toCurr != null){
                        
                    }
                }
                

                // Detect which tiles need to be split + missing vector2 fix
                // for (let i = result.length - 1; i >= 0; i--) {
                // for (let i = 0; i < result.length; i++) {
                //     const vc = result[i];
                //     // const vn = result[i + 1 <= result.length - 1 ? i + 1 : 0];
                //     const vn = result[i - 1 >= 0 ? i - 1 : result.length - 1];

                //     var center = new Vector2((vc.x + vn.x) / 2, (vc.y + vn.y) / 2);
                //     var centerToVc = new Vector2((vc.x + center.x) / 2, (vc.y + center.y) / 2);
                //     var centerToVn = new Vector2((center.x + vn.x) / 2, (center.y + vn.y) / 2);

                //     var dirN = vn.getCopy().remove(vc).normalized();
                //     var toNext = self.#raycast([inset].concat(outsets), vc, new Vector2(-dirN.x, -dirN.y), Vector2.distance(vn, vc), true);
                //     var toCurr = self.#raycast([inset].concat(outsets), vn, new Vector2(dirN.x, dirN.y), Vector2.distance(vn, vc), true);

                //     if(count == 29 || count == 39 || count == 49 || count == 34 || count == 44 || count == 54 || count == 64 || count == 72){
                //     //     this.#buffer.circle(vc.x, vc.y, 10);
                     
                        
                //     // }
                    
                //     if (!self.IsInside(insetPoints, center.x, center.y) || !self.IsInside(insetPoints, centerToVc.x, centerToVc.y) || !self.IsInside(insetPoints, centerToVn.x, centerToVn.y)){
                //         this.#buffer.fill(255, 255, 85);
                //         // if (!self.IsInside(insetPoints, center.x, center.y)) this.#buffer.text('1', center.x, center.y);
                //         // if (!self.IsInside(insetPoints, centerToVc.x, centerToVc.y))this.#buffer.text('2', centerToVc.x, centerToVc.y);
                //         // if (!self.IsInside(insetPoints, centerToVn.x, centerToVn.y))this.#buffer.text('3', centerToVn.x, centerToVn.y);

                //         if(toNext != null){
                //             // this.#buffer.circle(toNext.x, toNext.y, 10);
                //             // check if exists already, if not add to result
                //             self.checkAndPush(result,toNext,i);
                //         }

                //         if(toCurr != null){
                //             // this.#buffer.circle(toCurr.x, toCurr.y, 10);
                //             // check if exists already, if not add to result
                //             self.checkAndPush(result,toCurr,i);
                //         }

                //         // Set Start Index, if StartIndex is null
                //         if(startIndex == null)  {
                //             startIndex = i;
                //         }
                //         // // If StartIndex is set, set End Index
                //         else if(startIndex != null && endIndex == null) {
                //             endIndex = i;
                //         }
                        
                //         if(startIndex != null && endIndex != null) needToSplit = true;
                //     } else {
                //         if(startIndex != null && endIndex == null) amount++;
                //     }

                //     // for (let r = 0; r < outsets.length; r++) {
                //     //     const outset = outsets[r];
                //     //     const outsetPoints = outset.getVertices();

                //     //     if (self.IsInside(outsetPoints, center.x, center.y) || self.IsInside(outsetPoints, centerToVc.x, centerToVc.y) || self.IsInside(outsetPoints, centerToVn.x, centerToVn.y)) {
                //     //          this.#buffer.fill(255, 255, 85);
                //     //         if (self.IsInside(outsetPoints, center.x, center.y)) this.#buffer.text('1', center.x, center.y);
                //     //         if (self.IsInside(outsetPoints, centerToVc.x, centerToVc.y))this.#buffer.text('2', centerToVc.x, centerToVc.y);
                //     //         if (self.IsInside(outsetPoints, centerToVn.x, centerToVn.y))this.#buffer.text('3', centerToVn.x, centerToVn.y);

                //     //         if(toNext != null){
                //     //             // this.#buffer.circle(toNext.x, toNext.y, 10);
                //     //             // check if exists already, if not add to result
                //     //             self.checkAndPush(result,toNext,i);
                //     //         }

                //     //         if(toCurr != null){
                //     //             // this.#buffer.circle(toCurr.x, toCurr.y, 10);
                //     //             // check if exists already, if not add to result
                //     //             self.checkAndPush(result,toCurr,i);
                //     //         }
                //     //         //  Set Start Index, if StartIndex is null
                //     //         if(startIndex == null)  {
                //     //             startIndex = i;
                //     //         }
                //     //         // // If StartIndex is set, set End Index
                //     //         else if(startIndex != null && endIndex == null) {
                //     //             endIndex = amount + 1;
                //     //         }
                            
                //     //         if(startIndex != null && endIndex != null) needToSplit = true;
                //     //     } else {
                //     //         if(startIndex != null && endIndex == null) amount++;
                //     //     }
                //     }
                // }
                
                
                 if(count == 29 || count == 39 || count == 49 || count == 34 || count == 44 || count == 54 || count == 64 || count == 72){
                //     //     this.#buffer.circle(vc.x, vc.y, 10);
                    // print(count);
                    // print('tmp');
                    // print(tmp);
                    // print('result');
                    // print(result);
                    for (let i = 0; i < result.length; i++) {
                        // print(Vector2.distance(result[i], result[i + 1 <= result.length - 1 ? i + 1 : 0]));
                        // this.#buffer.circle(result[i].x, result[i].y, 5);
                    }
                        
                }
                result = tmp;

                // Actual splitting of a tile
                if(needToSplit){
                    print(count);
                    // print("Before Split");
                    // print(result);
                    // for (let i = 0; i < result.length; i++) {
                    //     // this.#buffer.circle(result[i].x, result[i].y, 10);
                    // }
                    // print("startIndex : "+startIndex);
                    // print("endIndex : "+endIndex);
                    // print("Amount : "+ (endIndex - startIndex));
                    var tempArray = Vector2.copyAll(result);
                    // Actual splitting of tiles
                    // let tile1;
                    let tile1 = tempArray.splice(startIndex + 1 , (endIndex - startIndex));
                    let tile2 = tempArray;
                    // print("After Split");
                    // print(tile1);
                    // print(tile2);
                    // print('__________________________');
                    // Place Tiles
                    self.#createTile(tile1, isFirstTile ? true : isDummy);
                    result = tile2;
                }

                // Tile count
                this.#buffer.fill(255, 255, 85);
                // this.#buffer.text(count, result[0].x, result[0].y);
                
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
            
            // var horizontal = self.#raycast([inset], new Vector2(x, y), Vector2.left(), Vector2.distance(targetPoints[0], targetPoints[1]));
            // if(horizontal != null){
            //     return horizontal;
            // }
            return null;
        }

        var syncedLoop = async (x, y) => {
            var targetPoints = [
                new Vector2(x, y),
                new Vector2(x + (isFirstTile ? firstTileSize.x : tileSize.x), y),
                new Vector2(x + (isFirstTile ? firstTileSize.x : tileSize.x), y + (rowIndex <= 0 ? tileSize.y : tileSize.y - 10)),
                new Vector2(x - (isFirstTile ? tileSize.x - firstTileSize.x : 0), y + (rowIndex <= 0 ? tileSize.y : tileSize.y - 10)),
            ];
            x += (isFirstTile ? firstTileSize.x : tileSize.x);

            var delay = 10;
            var resultPos = validateLocation(x, y, targetPoints);
            if(resultPos){
                var tmp = null;
                await syncedPlaceTile(resultPos.x, resultPos.y, targetPoints).then((tile) => {
                    tmp = tile;
                    isFirstTile = false;

                    if(tile != null){
                        if(tile.isDummy){
                            self.#tiles['Alucobond']++;
                            self.#totalWidth += tile.width;
                            self.#totalHeight += tile.height;
                            self.#dummyWidth += tile.width;
                            self.#dummyHeight += tile.height;
                        }
                        else{
                            self.#tiles['X-Roof']++;
                            self.#totalWidth += tile.width;
                            self.#totalHeight += tile.height;
                            self.#tileWidth += tile.width;
                            self.#tileHeight += tile.height;
                        }
                    }
                });
                await this.#sleep(delay);
            }

            if (x < boundingBox.x + boundingBox.w) {
                //Same row
                syncedLoop(x, y);
            } else if (y + tileSize.y < boundingBox.y + boundingBox.h) {
                //New row
                rowIndex++;
                isFirstTile = true;
                syncedLoop(boundingBox.x, y + (rowIndex <= 1 ? tileSize.y : tileSize.y - 10));
            }
        };

        syncedLoop(boundingBox.x, boundingBox.y);
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

    checkAndPush(arr, vector2, index, count) {

        var found = false;
        for (var i = 0; i < arr.length; i++) {
            // if(count == 64)print(Vector2.distance(arr[i], vector2));
            if (arr[i].x === vector2.x && arr[i].y === vector2.y) {
                found = true;
                break;
            }
        }
        if (!found) {
            // arr.splice(index, 0, vector2);
            arr.push(vector2);
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

        // if (xCoor < Math.min(pointA.x, pointB.x) || xCoor > Math.max(pointA.x, pointB.x) ||
        //     xCoor < Math.min(pointC.x, pointD.x) || xCoor > Math.max(pointC.x, pointD.x)) {
        //     print("eerste Null");
        //     return null;
        // }
        // if (yCoor < Math.min(pointA.y, pointB.y) || yCoor > Math.max(pointA.y, pointB.y) ||
        //     yCoor < Math.min(pointC.y, pointD.y) || yCoor > Math.max(pointC.y, pointD.y)) {
        //     print("Tweede Null");
        //     return null;
        // }

        return new Vector2(xCoor, yCoor);
    }

    #getPerpendicularPoint(x1, y1, x2, y2, distance, direction) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
        if (direction === 'left') {
            return new Vector2(x1 + dy * distance, y1 - dx * distance );
        } else {
            return new Vector2(x1 - dy * distance, y1 + dx * distance );
        }
    }
}