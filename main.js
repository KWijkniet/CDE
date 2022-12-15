import Vector2 from './classes/Vector2';
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
import HistoryTool from './classes/HistoryTool';
import Action from './classes/Action';
import ContextMenu from './classes/ContextMenu';
import ContextMenuOption from './classes/ContextMenuOption';
import Tile from './classes/Tile';
import Shape from './classes/Shape';
import LineSelectorTool from './classes/LineSelectorTool';

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

export { Vector2, Settings, Collision, EventSystem, Cursor, Color, Grid, Renderer, DrawingTool, SelectorTool, GeneratorTool, HistoryTool, Action, ContextMenu, ContextMenuOption, Tile, Shape, LineSelectorTool }