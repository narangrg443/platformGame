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
          .filter((o) => o.name === "platform" || o.name === "wall")
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

  // Move the camera based on its velocity
  //if(player.keys['ArrowLeft'])player.vx=2
  camera.x += player.vx;
  camera.y += player.vy;

  // Bounce camera when it hits the boundaries
  if (camera.x <= 0 || camera.x >= camera.width) {
    if (camera.x <= 0) camera.x = 0;
    if (camera.x >= camera.width) camera.x = camera.width;
    camera.vx = -camera.vx;
  }
  if (camera.y <= 0 || camera.y >= camera.height) {
    if (camera.y <= 0) camera.y = 0;
    if (camera.y >= camera.width) camera.y = camera.width;
    camera.vy = -camera.vy;
  }

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

  player.move(camera, mapWidth, mapHeight);
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

    // Clamp the camera within map boundaries
    camera.x = Math.max(0, Math.min(camera.x, camera.width));
    camera.y = Math.max(0, Math.min(camera.y, camera.height));

    // Player movement logic for horizontal axis
    if (this.keys["ArrowRight"]) {
      if (Math.abs(this.vx) < this.maxVelocity) this.vx += this.accleration;
    } else if (this.keys["ArrowLeft"]) {
      if (Math.abs(this.vx) < this.maxVelocity) this.vx -= this.accleration;
    }else{
      this.vx *=this.onGround?this.groundFriction: this.airFriction;
    }
    //Camera movement in the right direction
        if(this.vx>0 && this.x>canvas.width/2 && camera.x<camera.width){
          camera.x+=this.vx;
        }else if(this.vx<0 && this.x<canvas.width/2 && camera.x<0){
          camera.x+=this.vx;
        }else{
          this.x+=this.vx;
        }
    // Player movement logic for vertical axis
    if (this.keys["ArrowUp"]) {
         if(this.onGround){
          this.onGround=false;
          this.vy = this.jumpForce;
         } 
    }
    if(player.vy<0 && player.y<canvas.height/2  &&  camera.y<-tileSize){
          camera.y+=this.vy;
          console.log('move up')
    }else if(player.vy >0 && player.x>canvas.height/2 && camera.y<camera.height && !this.onGround){
      camera.y+=this.vy;
      console.log('movedown')
    }
    else{
      this.y+=this.vy;
    }
  if(this.cSide['bottom']){
    this.onGround=true;
   
  }
  
   if( this.cSide['bottom']){}else{this.vy+=this.gravity;}
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
      `camera.x ${camera.y} vy: ${this.vy.toFixed(2)} `,
      200,
      116
    );
    context.fillText(
      `player.vx: ${this.vx} player.vy: ${this.vy.toFixed(2)} `,
      200,
      125
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
