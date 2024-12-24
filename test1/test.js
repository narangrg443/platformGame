const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = 620;
canvas.height = 480;
const tileSize = 40;
this.width
// Cameeightra object
const camera = {
  x: 100,
  y: 0,
  speed: 4,
  move:function(player,mapWidth,mapHeight){

    if(player.y>canvas.height/2 && camera.y<mapHeight-canvas.height&&!keys['ArrowUp']){
      camera.y+=camera.speed;
    }
    
    if(keys['ArrowLeft'] &&player.x>canvas.width/2 &&camera.x>0 ||player.x<canvas.width/2 && camera.x>0){
      this.x-=this.speed;
      this.x=Math.max(this.x,0)
    
    }else if(keys["ArrowLeft"]){
      player.x-=player.speed;
    }
    if(keys['ArrowRight'] && player.x>canvas.width/2 && camera.x<mapWidth-canvas.width){
      this.x += this.speed;
      this.x=Math.min(this.x,mapWidth-canvas.width);
    }else if(keys['ArrowRight']){
      player.x+=player.speed;
    }
    if(keys['ArrowUp']  && player.y<canvas.height/2 && camera.y>-tileSize){
      this.y-=this.speed;
      this.y=Math.max(this.y,-tileSize)
    
    }else if(keys['ArrowUp']){
      player.y-=player.speed;
    }
    if(keys['ArrowDown']&& player.y>canvas.height/2 && camera.y<mapHeight-canvas.height){
      this.y += this.speed;
      this.y=Math.min(this.y,mapHeight-canvas.height);
    }else if(keys['ArrowDown']){
      player.y+=player.speed;
    }

  },
 
};

let Map = {};
const obj1 = [];
const ememys=[];
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// Player object
const player = {
  x: 44,
  y: 100 ,
  width: tileSize,
  height: tileSize,
  speed: 4,
  gravity:0.2,
  vy:0,
  vx:0,
  jumpForce:-6,
  collisionSide:" ",
  onGround:false,
  gravity:function(){
          
  },
  jump:function(){
   
 
   
  },

  draw: function (mapWidth,mapHeight) {
    context.fillStyle = "blue";
    context.fillRect(this.x, this.y, this.width, this.height);
  },
  move: function (camera,mapWidth,mapHeight) {
       if(this.collisionSide!=='bottom'){this.vy=0;this.onGround=true;}this.gravity();
       if(keys["ArrowUp"] && this.onGround){
        this.onGround=false;
        this.vy=this.jumpForce;
        this.y+=this.vy;
  
      }
      if(this.collisionSide==='botton'){
        this.onGround=true;
        this.vy=0;
        this.gravity=0;
      }else{
        this.gravity=.2;
        this.vy+=this.gravity;
       this.y+=this.vy;    
      }
  },
  debug:function(){
    context.fillStyle='blue';
    context.fillText(`${this.collisionSide}`,this.x,this.y-30)
  },
  collisionRect(rect) {
    // Calculate the differences in both axes
    let dx = (this.x + this.width / 2) - (rect.x + rect.width / 2);
    let dy = (this.y + this.height / 2) - (rect.y + rect.height / 2);

    // Calculate combined half-widths and half-heights
    let combinedHalfWidths = (this.width + rect.width) / 2;
    let combinedHalfHeights = (this.height + rect.height) / 2;

    // Reset collision side
    this.collisionSide = null;

    // Check for collision
    if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
        // There's a collision
        let overlapX = combinedHalfWidths - Math.abs(dx);
        let overlapY = combinedHalfHeights - Math.abs(dy);

        // Resolve the collision on the side of least overlap
        if (overlapX < overlapY) {
            // Collision on the left or right
            if (dx > 0) {
                this.x += overlapX; // Move player to the right
                this.collisionSide = 'left';
            } else {
                this.x -= overlapX; // Move player to the left
                this.collisionSide = 'right';
            }
        } else {
            // Collision on the top or bottom
            if (dy > 0) {
                this.y += overlapY; // Move player down
                this.collisionSide = 'top';
            } else {
                this.y -= overlapY; // Move player up
                this.collisionSide = 'bottom';
            }
        }
    }
}

};

// Main animation loop
function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const mapWidth = Map.width * tileSize;
  const mapHeight = Map.height * tileSize;


let temp=[];

 

//player.move(camera,mapWidth,mapHeight);
camera.move(player,mapWidth,mapHeight);
temp=obj1.map(e=>{
  const adjustedX = e.x - camera.x;
  const adjustedY = e.y - camera.y;
  return  { ...e, x: adjustedX, y: adjustedY }
})
temp.forEach((e) => {
 
  player.collisionRect(e);


});
temp.forEach(e => {
  const playerAdjusted = { ...player, x: player.x - camera.x, y: player.y - camera.y };

  // Check collision between player and object
  playerAdjusted.collisionRect(e);

  // Draw each object
  context.fillStyle = "brown";
  context.fillRect(e.x, e.y, e.width, e.height);
});



player.draw();

player.debug();
  requestAnimationFrame(animate);
}

// Fetch the map data
fetch("./map1.json")
  .then((response) => response.json())
  .then((data) => {
    const _Scale = data.tileheight / tileSize;

    const MapWidth = tileSize * data.width;
    const MapHeight = tileSize * data.height;

    camera.y = MapHeight - canvas.height;
    
    data.layers.forEach((e) => {
      if (e.name == "collision") {
        e.objects.forEach((obj) => {
       if(obj.name==="platform" ||obj.name==='wall'||obj.name==='startDoor'|| obj.name==='finishDoor')   obj1.push({
            ...obj,
            x: obj.x / _Scale,
            y: obj.y / _Scale,
            width: obj.width / _Scale,
            height: obj.height / _Scale,
          });
        });
      }
      if (e.name === 'Tile Layer 1') {
        Map = e;
      }
    });

    animate();
  });

// Handle keyboard input
addEventListener("keydown", (e) => {
  keys[e.key] = true;

},{passive:false});
addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
