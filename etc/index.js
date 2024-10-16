const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;

let map, player, enemies, tileSize, tileImage;
let imageSize = 50; // Resize tile images to 50x50 pixels for a better fit in the canvas
let cameraOffsetX = 0, cameraOffsetY = 0;

// Load the tile image
tileImage = new Image();
tileImage.src = './images/customtile.png';

tileSize = 100; // The original size of each tile in the image (100x100 pixels)

tileImage.onload = () => {
  gameLoop(); // Start the game loop after the image is loaded
};

tileImage.onerror = () => {
  console.error("Failed to load tile image. Please check the path.");
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Tile image failed to load.", 20, 20);
};

// Load map.json from the root folder
fetch('./map.json')
  .then(response => response.json())
  .then(data => {
    map = data;
    initializeGame();
  })
  .catch(error => console.error('Error loading map:', error));

// Initialize the game
function initializeGame() {
  const playerLayer = map.layers.find(layer => layer.name === 'player');
  if (playerLayer && playerLayer.objects.length > 0) {
    player = {
      x: playerLayer.objects[0].x,
      y: playerLayer.objects[0].y,
      width: 40,  // Player size
      height: 40,
      color: 'blue',
      speed: 5
    };
  } else {
    console.error('Player layer not found or empty.');
  }

  const collisionLayer = map.layers.find(layer => layer.name === 'collision');
  if (collisionLayer) {
    enemies = collisionLayer.objects.filter(obj => obj.name === 'enemy').map(enemy => ({
      x: enemy.x,
      y: enemy.y,
      width: 40,
      height: 40,
      color: 'red'
    }));
  } else {
    console.error('Collision layer not found or empty.');
  }
}

// Draw the tile map relative to the camera offset
function drawTileMap() {
  const layer = map.layers.find(layer => layer.type === 'tilelayer');
  const data = layer.data;

  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const tileIndex = data[row * map.width + col];

      if (tileIndex !== 0) {
        // Calculate which part of the image to draw
        const tileX = (tileIndex - 1) % 6 * tileSize; // Calculate the x position in the tile image
        const tileY = Math.floor((tileIndex - 1) / 6) * tileSize; // Calculate the y position in the tile image

        // Draw the correct tile from the tileImage to the canvas relative to the camera offset
        ctx.drawImage(
          tileImage,
          tileX, tileY, tileSize, tileSize,
          col * imageSize - cameraOffsetX, row * imageSize - cameraOffsetY,
          imageSize, imageSize
        );
      }
    }
  }
}

// Draw player and enemies relative to the camera
function drawEntities() {
  // Draw the player
  if (player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(
      player.x - cameraOffsetX, player.y - cameraOffsetY, 
      player.width, player.height
    );
  }

  // Draw enemies
  if (enemies) {
    enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(
        enemy.x - cameraOffsetX, enemy.y - cameraOffsetY, 
        enemy.width, enemy.height
      );
    });
  }
}

// Update camera to follow the player
function updateCamera() {
  cameraOffsetX = player.x - canvas.width / 2 + player.width / 2;
  cameraOffsetY = player.y - canvas.height / 2 + player.height / 2;

  // Clamp the camera offset to the map boundaries
  cameraOffsetX = Math.max(0, Math.min(cameraOffsetX, map.width * imageSize - canvas.width));
  cameraOffsetY = Math.max(0, Math.min(cameraOffsetY, map.height * imageSize - canvas.height));
}

// Handle player movement
document.addEventListener('keydown', (e) => {
  if (player) {
    switch (e.code) {
      case 'ArrowUp':
        player.y = Math.max(player.y - player.speed, 0);
        break;
      case 'ArrowDown':
        player.y = Math.min(player.y + player.speed, map.height * imageSize - player.height);
        break;
      case 'ArrowLeft':
        player.x = Math.max(player.x - player.speed, 0);
        break;
      case 'ArrowRight':
        player.x = Math.min(player.x + player.speed, map.width * imageSize - player.width);
        break;
    }
  }
});

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  if (map) {
    updateCamera();    // Update camera based on player position
    drawTileMap();     // Draw the map with the tile image
    drawEntities();    // Draw player and enemies
  }
  requestAnimationFrame(gameLoop); // Loop
}
