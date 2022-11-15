export default class SelectorTool {
    constructor(){
        cursor.events.subscribe('click', (e) => {
            var cursor = Cursor.get();
            var pos = cursor.global().remove(cursor.offset);
            pos.x /= Settings.zoom;
            pos.y /= Settings.zoom;
            pos = Cursor.toGrid(pos);

            if (e.detail.target.nodeName != "CANVAS" || e.detail.which == 3) { return; }
            if (this.isEnabled) {
                var shapes = Renderer.instance.getAll();
                for (let i = 0; i < shapes.length; i++) {
                    const shape = shapes[i];
                    
                    var vertices = shape.getVertices();
                    if (Collision.polygonPoint(vertices, pos.x, pos.y)){
                        //found
                        console.log("yay");
                    }
                }
            }
        });
    }
}