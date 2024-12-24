const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = 400;
canvas.height = 400;
const tileSize = 32;
let Walls = [];
let mapWidth = null;
let mapHeight = null;
let camera = { x: 0, y: 0, vx: 1, vy: 2, width: null, height: null };

fetch("./map1.json")
  .then((response) => response.json())
  .then((data) => {
    const scale = data.tileheight / tileSize;
    mapWidth = data.width * tileSize;
    mapHeight = data.height * tileSize;

    data.layers
      .filter((layer) => layer.name === "collision")
      .forEach((layer) => {
        layer.objects
          .filter((o) => o.name === "platform" || o.name === "wall" || o.name=== "barrel")
          .forEach((o) => {
            Walls.push({
              ...o,
              x: Math.floor(o.x / scale),
              y: Math.floor(o.y / scale),
              width: Math.floor(o.width / scale),
              height: Math.floor(o.height / scale),
              collisionSide: null,
            });
          });
      });

    animate();
  });

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Reset player collision sides
  player.cSide = { left: false, right: false, top: false, bottom: false };

  // Define camera boundaries
  camera.width = mapWidth - canvas.width;
  camera.height = mapHeight - canvas.height;
//  camera.x = Math.max(0, Math.min(camera.x, camera.width));
// //     camera.y = Math.max(-tileSize, Math.min(camera.y, camera.height));

// if(player.cSide['bottom']){
//   player.onGround=true;
//   player.vy=0;
//   player.gravity=0;
//   this.jumpTimes=0;
// }else{


if(!player.cSide['bottom']){

  player.gravity=.2;
  player.vy+=player.gravity

}

player.move(camera, mapWidth, mapHeight);
  // Check collision with each wall
  Walls.forEach((wall) => {
    const wallX = wall.x - camera.x;
    const wallY = wall.y - camera.y;

    if ((col = player.collision({ ...wall, x: wallX, y: wallY }))) {
      player.cSide[col] = true; // Detect collision side for each wall
    }
    context.fillStyle = "brown";
    context.fillRect(wallX, wallY, wall.width, wall.height);
  });
if(player.cSide['bottom']){
 
  player.onGround=true;
  player.vy*=-.4;
  player.jumpTimes=0;

  player.gravity=.2;
}
if(player.cSide['left'] || player.cSide['right']){
  player.vx*=-.7;
}
if(player.cSide["top"]){
  player.vy*=-.5;
}
  player.draw();
  player.debugger(); // Show player collision side debug info

  requestAnimationFrame(animate);
}

const player = {
  x: 100,
  y: canvas.height - 200,
  jumpOnce: true,
  width: tileSize,
  height: tileSize,
  keys: {},
  collisionSide: null,
  accleration: 1,
  keyDelayFactor: 1.5,
  reflectionFactor: -0.4,
  cSide: { top: false, bottom: false, left: false, right: false },
   jumpTimes:0,
  jumpForce: -4,
  onGround: false,
  gravity: 0.2,
  maxVelocity: 4,
  vy: 0,
  vx: 0,
  airFriction: 0.9,
  groundFriction: 0.8,

  draw() {
    context.fillStyle = "blue";
    context.fillRect(this.x, this.y, this.width, this.height);
  },

  move(camera, mapWidth, mapHeight) {
    // Define camera boundaries
    camera.width = mapWidth - canvas.width;
    camera.height = mapHeight - canvas.height;

    if(this.keys['ArrowLeft'] ){
        this.vx=-4;
    }
    if(this.keys['ArrowRight']){
       this.vx=4;
    }
    if(this.keys["ArrowUp"] && this.onGround || this.jumpTimes<2 && this.keys['ArrowUp']){
      this.onGround=false;
      this.jumpTimes++;
      
    this.vy=-6;
    }
    
    if(this.keys['ArrowDown']){
this.vy=4;
    }
if(!this.keys["ArrowLeft"] && !this.keys['ArrowRight']){
  this.vx*=.9;
}



if(!this.keys['ArrowUp'] && !this.keys['ArrowDown']){
  
}




if(this.x>canvas.width/2 && this.vx>0 && camera.x<camera.width 
  ||this.x<canvas.width/2 && this.vx<0 && camera.x>0
){
  camera.x+=this.vx;
}else{
  this.x+=this.vx;
}

if(this.y>canvas.height/2 && this.vy>0 && camera.y<camera.height 
  ||this.y<canvas.height/2 && this.vy<0 && camera.y>-tileSize
){
  camera.y+=this.vy;
}else{
  this.y+=this.vy;
} 
    
    
    
     },

  collision(rect) {
    // Calculate the differences in both axes
    let dx = this.x + this.width / 2 - (rect.x + rect.width / 2);
    let dy = this.y + this.height / 2 - (rect.y + rect.height / 2);

    // Calculate combined half-widths and half-heights
    let combinedHalfWidths = (this.width + rect.width) / 2;
    let combinedHalfHeights = (this.height + rect.height) / 2;

    // Reset collision side
    this.collisionSide = null;

    // Check for collision
    if (
      Math.abs(dx) <= combinedHalfWidths &&
      Math.abs(dy) <= combinedHalfHeights
    ) {
      let overlapX = combinedHalfWidths - Math.abs(dx);
      let overlapY = combinedHalfHeights - Math.abs(dy);

      // Resolve the collision on the side of least overlap
      if (overlapX < overlapY) {
        // Collision on the left or right
        if (dx > 0) {
          this.x += overlapX; // Move player to the right
          this.collisionSide = "left";
        } else {
          this.x -= overlapX; // Move player to the left
          this.collisionSide = "right";
        }
      } else {
        // Collision on the top or bottom
        if (dy > 0) {
          this.y += overlapY; // Move player down
          this.collisionSide = "top";
        } else {
          this.y -= overlapY; // Move player up
          this.collisionSide = "bottom";
        }
      }
    }
    return this.collisionSide;
  },

  debugger() {
    context.font = "16px sans-serif";
    context.fillStyle = "black";
    Object.keys(this.cSide)
      .filter((e) => this.cSide[e])
      .forEach((e, i) => {
        context.fillText(
          `${e}: ${this.cSide[e]}`,
          this.x + i * 80,
          this.y - tileSize / 2
        );
      });
    context.fillText(`X: ${this.x.toFixed(2)} Y: ${this.y.toFixed(3)} `, 200, 100);
    context.fillText(
      `jumpTimes ${this.jumpTimes.toFixed(3)} vx: ${this.vx.toFixed(2)} `,
      200,
      116
    );
    context.fillText(
      `player.gravity: ${this.gravity.toFixed(2)} player.vy: ${this.vy.toFixed(2)} `,
      100,
      130
    );
  },

  addEvent() {
    document.addEventListener("keydown", (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.keys[event.key] = false;
    });
  },
};

// Initialize player controls
player.addEvent();

function p(p) {
  console.log(p);
}
