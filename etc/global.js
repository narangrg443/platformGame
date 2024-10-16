const canvas = document.getElementById("gameCanvas");

const context = canvas.getContext("2d");

const CANVAS_WIDTH = (canvas.width = 620);
const CANVAS_HEIGHT = (canvas.height = 480);
const TILE_WIDTH = 40;
const TILE_HEIGHT = 40;
const camera={x:-30,y:-(20*TILE_HEIGHT-CANVAS_HEIGHT)};


let JsonData=null; //object data type 
let ImageObj = [];//array data type
let player = null;
let Enemys = [];
let Walls = [];
let Platforms = [];
let Doors = [];
let Polygons = [];

const LoadedImages = {};
const imageDir = "./images/";
const ImagesSrc = [imageDir+"customtile.png"];

const IMAGE_TILE_SIZE=100;
