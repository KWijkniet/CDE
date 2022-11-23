import Collision from './classes/Collision';
import Settings from './classes/Settings';
import EventSystem from './classes/EventSystem';
import Cursor from './classes/Cursor';
import Color from './classes/Color';
import Grid from './classes/Grid';
import Renderer from './classes/Renderer';
import DrawingTool from './classes/DrawingTool';
import SelectorTool from './classes/SelectorTool';
import GeneratorTool from './classes/GeneratorTool';
import History from './classes/History';
import Action from './classes/Action';
import ContextMenu from './classes/ContextMenu';
import ContextMenuOption from './classes/ContextMenuOption';

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

export { Settings, Collision, EventSystem, Cursor, Color, Grid, Renderer, DrawingTool, SelectorTool, GeneratorTool, History, Action, ContextMenu, ContextMenuOption }