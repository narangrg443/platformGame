// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Tileset images and properties
const tilesets = [
    { image: new Image(), firstgid: 1, columns: 6, tileSize: 100 }, // Tileset 1
    { image: new Image(), firstgid: 37, columns: 6, tileSize: 100 } // Tileset 2
];
tilesets[0].image.src = "../images/background.png";  // Replace with your first tileset path
tilesets[1].image.src = "../images/objects.png"; // Replace with your second tileset path

// Map settings
const canvasTileSize = 50; // Tile size on canvas
const mapWidth = 20;
const mapHeight = 20;


// JSON data (paste JSON here or fetch from file)
fetch('./map1.json').then(data=>data.json()) /* paste your JSON here */
.then(data=>{
    const mapData =data;
 

})
// Function to get the correct tileset for a given tile index
function getTileset(tileIndex) {
    for (let i = tilesets.length - 1; i >= 0; i--) {
        if (tileIndex >= tilesets[i].firstgid) {
            return tilesets[i];
        }
    }
    return null;
}

// Function to draw a tile from the appropriate tileset
function drawTile(tileIndex, x, y) {
    const tileset = getTileset(tileIndex);
    if (tileset) {
        const localIndex = tileIndex - tileset.firstgid; // Calculate local index in the tileset
        const sx = (localIndex % tileset.columns) * tileset.tileSize;
        const sy = Math.floor(localIndex / tileset.columns) * tileset.tileSize;
        ctx.drawImage(
            tileset.image,
            sx, sy, tileset.tileSize, tileset.tileSize, // Source
            x, y, canvasTileSize, canvasTileSize         // Destination
        );
    }
}

// Draw layers
function drawLayers() {
    mapData.layers.forEach(layer => {
        if (layer.type === "tilelayer") {
            layer.data.forEach((tile, index) => {
                if (tile !== 0) {
                    const x = (index % mapWidth) * canvasTileSize;
                    const y = Math.floor(index / mapWidth) * canvasTileSize;
                    drawTile(tile, x, y); 
                }
            });
        }
    });
}

// Draw collision objects
function drawCollision() {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    mapData.layers.forEach(layer => {
        if (layer.name === "collision" && layer.objects) {
            layer.objects.forEach(obj => {
                if (obj.name === "wall" || obj.name === "platform") {
                    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
                }
            });
        }
    });
}

// Main draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLayers();
    drawCollision(); // Optional: draw collision boundaries
}

// Load tilesets and draw map once all images are ready
let loadedTilesets = 0;
tilesets.forEach(tileset => {
    tileset.image.onload = () => {
        loadedTilesets++;
        if (loadedTilesets === tilesets.length) draw();
    };
});
