
function drawMap() {

    //DRAW TILE   map
      ImageObj.forEach(data => {
    
        const imageTiles = JsonData.tilesets; // Assuming you have the correct columns in JsonData
      
        let rows = 0; //grid rows and cols
        let cols = 0;
         
          if (data.name === 'imageLayer') {
              const map1 = data.data;
              map1.forEach((num, i) => {
                  cols++;
                  if (cols === data.width) {
                      rows++;
                      cols = 0;
                  }
    
                  if (num) {
                      // tile x and y in the source image
                      const { x, y } = getXY(num,imageTiles[0].columns);
                      const posX = cols * TILE_WIDTH;
                      const posY = rows * TILE_HEIGHT;
                 
                      // Draw each tile at (posX, posY) with size (50x50) on the canvas
                      context.drawImage(
                        LoadedImages[imageDir + "customtile.png"],                   // Source image
                          x * IMAGE_TILE_SIZE,    // Source X (in the tile image)
                          y * IMAGE_TILE_SIZE,    // Source Y (in the tile image)
                          IMAGE_TILE_SIZE,        // Source width (100)
                          IMAGE_TILE_SIZE,        // Source height (100)
                          posX+camera.x,                   // Canvas X position
                          posY+camera.y,                   // Canvas Y position
                          TILE_WIDTH,             // Canvas width (50)
                          TILE_HEIGHT             // Canvas height (50)
                      );
                  }
              });
          }
      });

       
       
         
    }
