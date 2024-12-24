  


  function animate() {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); 
   
    //player.collisionWithArrayOfRect(Platforms)
    //player.update();
    drawMap();
    debugMode();

    requestAnimationFrame(animate);
  }
  function debugMode() {
    context.font = "22px sans-serif";
  
  
  
    if (player) {
      context.fillStyle = "blue";
      context.fillText(`Player X: ${Walls[0].x}Y:${player.y}`, 100, 90); // Example of player coordinates
      context.fillText(`left ${player.keys.left} right:${player.keys.right}`, 100, 120); // Example of player coordinates
     
    }
  }