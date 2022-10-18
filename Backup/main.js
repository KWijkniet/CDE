import Settings from './classes/Settings.js';
import Vector2 from "./Classes/Vector2.js";
import Color from "./Classes/Color.js";
import Ruler from"./Classes/Ruler.js";
import Grid from "./Classes/Grid.js";
import Cursor from "./Classes/Cursor.js";
import Input from "./Classes/Input.js";
import DrawingTool from "./Classes/DrawingTool.js";
import EditingTool from "./Classes/EditingTool.js";
import Shape from "./Classes/Shape.js";
import Renderer from "./Classes/Renderer.js";

export { Settings, Vector2, Color, Ruler, Grid, Cursor, Input, DrawingTool, EditingTool, Shape, Renderer }

window.onload = () => {
    if(typeof createCanvas !== 'function'){
        alert("Please install p5js! (https://p5js.org)");
        var scripts = document.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            script.type = "application/json";
        }
    }
};
