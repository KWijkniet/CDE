import Vector2 from "./Vector2";

/*
    Autor: Kelvin wijkniet
    url: https://github.com/kwijkniet

    A simple script to detect collision based on the writings of Jeffrey Thompson
    (https://www.jeffreythompson.org, https://www.jeffreythompson.org/collision-detection/table_of_contents.php)
*/
export default class Collision{
    // Point to Point detection
    // Detect if 2 XY coordinates are colliding
    // x1 = X coordinates of point 1
    // y1 = Y coordinates of point 1
    // x2 = X coordinates of point 2
    // y2 = Y coordinates of point 2
    static pointPoint(x1, y1, x2, y2){
        if(x1 == x2 && y1 == y2){
            return true;
        }
        return false;
    }

    // Point to Circle detection
    // Detect if a point is colliding with a circle
    // px = point X
    // py = point Y
    // cx = circle X
    // cy = circle Y
    // cr = circle Radius
    static pointCircle(px, py, cx, cy, cr){
        var distX = px - cx;
        var distY = py - cy;
        var dist = Math.sqrt((distX * distX) + (distY * distY));

        //If distance between point and circle is smaller then given circle radius
        if(dist <= cr){
            return true;
        }
        return false;
    }

    // Circle to Circle detection
    // Detect if a circle is colliding with a circle
    // c1x = circle X of circle 1
    // c1y = circle Y of circle 1
    // c1r = circle Radius of circle 1
    // c2x = circle X of circle 2
    // c2y = circle Y of circle 2
    // c2r = circle Radius of circle 2
    static circleCircle(c1x, c1y, c1r, c2x, c2y, c2r){
        var distX = c1x - c2x;
        var distY = c1y - c2y;
        var dist = Math.sqrt((distX * distX) + (distY * distY));

        //If distance between both circles is smaller then both circle radius
        if(dist <= c1r + c2r){
            return true;
        }
        return false;
    }

    // Point to Rectangle detection
    // Detect if a point is colliding with a rectangle
    // px = point X
    // py = point Y
    // rx = rectangle X
    // ry = rectangle Y
    // rw = rectangle Width
    // rh = rectangle Height
    static pointRectangle(px, py, rx, ry, rw, rh){
        // px >= rx = right of the left edge AND
        // px <= rx + rw = left of the right edge AND
        // py >= ry = below the top AND
        // py <= ry + rh = above the bottom
        if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) {   
            return true;
        }
        return false;
    }

    // Rectangle to Rectangle detection
    // Detect if a rectangle is colliding with a rectangle
    // r1x = rectangle X of rectangle 1
    // r1y = rectangle Y of rectangle 1
    // r1w = rectangle Width of rectangle 1
    // r1h = rectangle Height of rectangle 1
    // r2x = rectangle X of rectangle 2
    // r2y = rectangle Y of rectangle 2
    // r2w = rectangle Width of rectangle 2
    // r2h = rectangle Height of rectangle 2
    static RectangleRectangle(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h){
        // r1x + r1w >= r2x = r1 right edge past r2 left
        // r1x <= r2x + r2w = r1 left edge past r2 right
        // r1y + r1h >= r2y = r1 top edge past r2 bottom
        // r1y <= r2y + r2h = r1 bottom edge past r2 top
        if (r1x + r1w >= r2x && r1x <= r2x + r2w && r1y + r1h >= r2y && r1y <= r2y + r2h) {   
            return true;
        }
        return false;
    }

    // Circle to Rectangle detection
    // Detect if a circle is colliding with a rectangle
    // cx = circle X
    // cy = circle Y
    // cr = circle Radius
    // rx = rectangle X
    // ry = rectangle Y
    // rw = rectangle Width
    // rh = rectangle Height
    static circleRectangle(cx, cy, cr, rx, ry, rw, rh){
        var testX = cx;
        var testY = cy;

        // which edge is closest?
        if(cx < rx){ testX = rx; }                  // left edge
        else if(cx > rx + rw){ testX = rx + rw; }   // right edge
        if(cy < ry){ testY = ry; }                  // top edge
        else if(cy > ry + rh){ testY = ry + rh; }   // bottom edge

        // get distance from closest edges
        var distX = cx - testX;
        var distY = cy - testY;
        var dist = sqrt( (distX * distX) + (distY * distY) );

        // if the distance is less than the radius, collision!
        if (dist <= cr) {
            return true;
        }
        return false;
    }

    // Line to Point detection
    // Detect if a line is colliding with a point
    // x1 = line X of the starting point
    // y1 = line Y of the starting point
    // x2 = line X of the ending point
    // y2 = line Y of the ending point
    // px = point X
    // py = point Y
    static linePoint(x1, y1, x2, y2, px, py){
        //get distance between point and line starting point
        var dist1 = Math.sqrt(Math.pow((px - x1), 2) + Math.pow((py - y1), 2));
        //get distance between point and line ending point
        var dist2 = Math.sqrt(Math.pow((px - x2), 2) + Math.pow((py - y2), 2));
        
        //get length of the line
        var lineLength = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));

        //since floats are so minutely accurate, add a little buffer zone that will give collision
        var buffer = 0;    // higher # = less accurate

        //if the two distances are equal to the line's length, the point is on the line!
        //note we use the buffer here to give a range
        if (dist1 + dist2 >= lineLength - buffer && dist1 + dist2 <= lineLength + buffer) {
            return true;
        }
        return false;
    }

    // Line to Circle detection
    // Detect if a line is colliding with a circle
    // x1 = line X of the starting point
    // y1 = line Y of the starting point
    // x2 = line X of the ending point
    // y2 = line Y of the ending point
    // cx = circle X
    // cy = circle Y
    // cr = circle Radius
    static lineCircle(x1, y1, x2, y2, cx, cy, cr){
        //if start or end point of the line is in the circle
        var isInsideP1 = this.pointCircle(x1, y1, cx, cy, cr);
        var isInsideP2 = this.pointCircle(x2, y2, cx, cy, cr);
        if(isInsideP1 || isInsideP2){
            return true;
        }

        //get length of line
        var distX = x1 - x2;
        var distY = y1 - y2;
        var length = Math.sqrt((distX * distX) + (distY * distY));

        //get dot product of the line and circle
        var dot = ( ((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1)) ) / Math.pow(length, 2);

        //find closest point on the line
        var closestX = x1 + (dot * (x2 - x1));
        var closestY = y1 + (dot * (y2 - y1));

        //is it actually on the line segment?
        var onSegment = this.linePoint(x1, y1, x2, y2, closestX, closestY);
        if(!onSegment){
            return false;
        }

        //get distance to closest point
        distX = closestX - cx;
        distY = closestY - cy;
        var dist = Math.sqrt((distX * distX) + (distY * distY));

        if(dist <= cr){
            return true;
        }
        return false;
    }

    // Line to Line detection
    // Detect if a line is colliding with a line
    // x1 = line X of the starting point of line 1
    // y1 = line Y of the starting point of line 1
    // x2 = line X of the ending point of line 1
    // y2 = line Y of the ending point of line 1
    // x3 = line X of the starting point of line 2
    // y3 = line Y of the starting point of line 2
    // x4 = line X of the ending point of line 2
    // y4 = line Y of the ending point of line 2
    static lineLine(x1, y1, x2, y2, x3, y3, x4, y4){
        //calculate the distance to intersection point
        var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        //if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            return true;
        }
        return false;
    }

    // Line to Rectangle detection
    // Detect if a line is colliding with a rectangle
    // x1 = line X of the starting point
    // y1 = line Y of the starting point
    // x2 = line X of the ending point
    // y2 = line Y of the ending point
    // rx = rectangle X
    // ry = rectangle Y
    // rw = rectangle Width
    // rh = rectangle Height
    static lineRectangle(x1, y1, x2, y2, rx, ry, rw, rh){
        //check if the line has hit any of the rectangle's sides uses the Line/Line function
        var left =   this.lineLine(x1,y1,x2,y2, rx,ry,rx, ry+rh);
        var right =  this.lineLine(x1,y1,x2,y2, rx+rw,ry, rx+rw,ry+rh);
        var top =    this.lineLine(x1,y1,x2,y2, rx,ry, rx+rw,ry);
        var bottom = this.lineLine(x1,y1,x2,y2, rx,ry+rh, rx+rw,ry+rh);
        
        //if ANY of the above are true, the line has hit the rectangle
        if (left || right || top || bottom) {
            return true;
        }
        return false;
    }

    // Polygon to Point detection
    // Detect if a polygon is colliding with a point
    // vertices = array of XY coordinates (example: vertices = [ {x:0, y:0}, {x:1, y:5} ]; )
    // px = point X
    // py = point Y
    static polygonPoint(vertices, px, py){
        var collision = false;
        
        //loop over all vertices
        var next = 0;
        for (let current = 0; current < vertices.length; current++) {

            //get next vertice in list (wrap around to 0 if we exceed the vertices array length)
            next = current + 1;
            if(next == vertices.length){
                next = 0;
            }

            //reference the current and next vertices
            const vc = vertices[current];
            const vn = vertices[next];
            
            //compare position, flip 'collision' variable back and forth
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) && (px < (vn.x-vc.x)*(py-vc.y) / (vn.y-vc.y)+vc.x)) {
                collision = !collision;
            }
        }

        return collision;
    }

    // Polygon to Circle detection
    // Detect if a polygon is colliding with a circle
    // vertices = array of XY coordinates (example: vertices = [ {x:0, y:0}, {x:1, y:5} ]; )
    // cx = circle X
    // cy = circle Y
    // cr = circle Radius
    static polygonCircle(vertices, cx, cy, cr){
        //loop over all vertices
        var next = 0;
        for (let current = 0; current < vertices.length; current++) {

            //get next vertice in list (wrap around to 0 if we exceed the vertices array length)
            next = current + 1;
            if(next == vertices.length){
                next = 0;
            }

            //reference the current and next vertices
            const vc = vertices[current];
            const vn = vertices[next];
            
            //check for collision between the circle and a line formed between the two vertices
            var collision = this.lineCircle(vc.x, vc.y, vn.x, vn.y, cx, cy, cr);
            if(collision){
                return true;
            }
        }

        //the above algorithm only checks if the circle is touching the edges of the polygon
        //in most cases this is enough
        //the following code tests if the center of the circle is inside the polygon
        var centerInside = this.polygonPoint(vertices, cx,cy);
        if (centerInside) {
            return true;
        }

        // otherwise, after all that, return false
        return false;
    }

    // Polygon to Rectangle detection
    // Detect if a polygon is colliding with a rectangle
    // vertices = array of XY coordinates (example: vertices = [ {x:0, y:0}, {x:1, y:5} ]; )
    // rx = rectangle X
    // ry = rectangle Y
    // rw = rectangle Width
    // rh = rectangle Height
    static polygonRectangle(vertices, rx, ry, rw, rh){
        //loop over all vertices
        var next = 0;
        for (let current = 0; current < vertices.length; current++) {

            //get next vertice in list (wrap around to 0 if we exceed the vertices array length)
            next = current + 1;
            if(next == vertices.length){
                next = 0;
            }

            //reference the current and next vertices
            const vc = vertices[current];
            const vn = vertices[next];
            
            //check for collision between the circle and a line formed between the two vertices
            var collision = this.lineRectangle(vc.x, vc.y, vn.x, vn.y, rx, ry, rw, rh);
            if(collision){
                return true;
            }
        }

        return false;
    }

    // Polygon to Line detection
    // Detect if a polygon is colliding with a line
    // vertices = array of XY coordinates (example: vertices = [ {x:0, y:0}, {x:1, y:5} ]; )
    // x1 = line X of the starting point
    // y1 = line Y of the starting point
    // x2 = line X of the ending point
    // y2 = line Y of the ending point
    static polygonLine(vertices, x1, y1, x2, y2){
        //loop over all vertices
        var next = 0;
        for (let current = 0; current < vertices.length; current++) {

            //get next vertice in list (wrap around to 0 if we exceed the vertices array length)
            next = current + 1;
            if(next == vertices.length){
                next = 0;
            }

            //convert 2 vertices into a line
            const x3 = vertices[current].x;
            const y3 = vertices[current].y;
            const x4 = vertices[next].x;
            const y4 = vertices[next].y;
            
            //detect if the vertices lines intersect with the given line
            var hit = this.lineLine(x1, y1, x2, y2, x3, y3, x4, y4);
            if(hit){
                return true;
            }
        }

        return false;
    }

    // Polygon to Polygon detection
    // Detect if a polygon is colliding with a polygon
    // v1 = array of XY coordinates (example: vertices = [ {x:0, y:0}, {x:1, y:5} ]; )
    // v2 = array of XY coordinates (example: vertices = [ {x:0, y:0}, {x:1, y:5} ]; )
    static polygonPolygon(v1, v2){
        //loop over all vertices
        var next = 0;
        for (let current = 0; current < v1.length; current++) {

            //get next vertice in list (wrap around to 0 if we exceed the vertices array length)
            next = current + 1;
            if(next == v1.length){
                next = 0;
            }

            //reference the current and next vertices
            const vc = v1[current];
            const vn = v1[next];
            
            // now we can use these two points (a line) to compare
            // to the other polygon's vertices using polyLine()
            var collision = this.polygonLine(v2, vc.x, vc.y, vn.x, vn.y);
            if (collision) {
                return true;
            }

            // optional: check if the 2nd polygon is INSIDE the first
            collision = this.polygonPoint(v1, v2[0].x, v2[0].y);
            if (collision) {
                return true;
            }
        }

        return false;
    }

    // Triangle to Point detection
    // Detect if a triangle is colliding with a point
    // x1 = line X of the starting point of the triangle
    // y1 = line Y of the starting point of the triangle
    // x2 = line X of the second point of the triangle
    // y2 = line Y of the second point of the triangle
    // x3 = line X of the ending point of the triangle
    // y3 = line Y of the ending point of the triangle
    // px = point X
    // py = point Y
    static trianglePoint(x1, y1, x2, y2, x3, y3, px, py){
        //get the area of the triangle
        var areaOrig = Math.abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1));

        //get the area of 3 triangles made between the point and the corners
        var area1 = Mathf.abs((x1 - px) * (y2 - py) - (x2 - px) * (y1 - py));
        var area2 = Mathf.abs((x2 - px) * (y3 - py) - (x3 - px) * (y2 - py));
        var area3 = Mathf.abs((x3 - px) * (y1 - py) - (x1 - px) * (y3 - py));

        //if the sum of the 3 areas equals the original the point is inside of the triangle
        if(area1 + area2 + area3 == areaOrig){
            return true;
        }
        return false;
    }

    // Line to Line detection (Returns point of collision)
    // Detect if a line is colliding with a line but returns a point of collision instead of a boolean
    // x1 = line X of the starting point of line 1
    // y1 = line Y of the starting point of line 1
    // x2 = line X of the ending point of line 1
    // y2 = line Y of the ending point of line 1
    // x3 = line X of the starting point of line 2
    // y3 = line Y of the starting point of line 2
    // x4 = line X of the ending point of line 2
    // y4 = line Y of the ending point of line 2
    static lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
        //calculate the distance to intersection point
        var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        //if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            var x = x1 + uA * (x2 - x1);
            var y = y1 + uA * (y2 - y1);
            return new Vector2(x, y);
        }
        return null;
    }
}