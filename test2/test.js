const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = 480;
canvas.height = 480;
const tileSize = 32;
let Walls = [];
let mapWidth = null;
let mapHeight = null;
let camera = { x: 0, y: 0, speed: null, width: null, height: null };

fetch("./map1.json")
  .then((response) => response.json())
  .then((data) => {
    const scale = data.tileheight / tileSize;
    camera.width = mapWidth = data.width * tileSize;
    camera.height = mapHeight = data.height * tileSize;

    data.layers
      .filter((layer) => layer.name === "collision")
      .forEach((layer) => {
        layer.objects
          .filter((o) => o.name === "platform" || o.name === "wall")
          .forEach((o) => {
            // Scale the object to the tile size and position
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

  camera.width = mapWidth - canvas.width;
  camera.height = mapHeight - canvas.height;

  // Reset player collision sides
  player.cSide = { left: false, right: false, top: false, bottom: false };

  // Check collision with each wall
  Walls.forEach((wall) => {
    const tempx = wall.x - camera.x;
    const tempy = wall.y - camera.y;
    const temp = { ...wall, x: tempx, y: tempy };

    if ((col = player.collision(temp))) player.cSide[col] = true; // Detect collision side for each wall

    context.fillStyle = "brown"; 
    context.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
  });

  player.move();
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
  acclerationX: 1,
  keyDelayFactor: 1.5,
  reflectionFactor: -0.6,
  cSide: { top: false, bottom: false, left: false, right: false },
  cPrevSide: { top: false, bottom: false, left: false, right: false }, // Track previous collisions
  jumpForce: -7,
  onGround: false,
  gravity: 0.2,
  maxVelocity: 4,
  vy: 0,
  vx: 0,
  airFriction: 0.97,
  groundFriction: 0.92,
  draw() {
    context.fillStyle = "blue";
    context.fillRect(this.x, this.y, this.width, this.height);
  }, 
 move() {
  // Apply acceleration to reach maxVelocity smoothly
  if (this.keys["ArrowLeft"] && this.vx > -this.maxVelocity) {
    this.vx -= this.acclerationX; 
  } else if (this.keys["ArrowRight"] && this.vx < this.maxVelocity) {
    this.vx += this.acclerationX;
  } else {
    this.vx *= this.onGround ? this.groundFriction : this.airFriction;
  }

  // Ensure vx does not exceed maxVelocity
  this.vx = Math.max(Math.min(this.vx, this.maxVelocity), -this.maxVelocity);

  // Jumping logic
  if (this.keys["ArrowUp"] && this.onGround) {
    this.vy = this.jumpForce;
    this.onGround = false;
  }

  // Apply gravity only when not grounded
  if (!this.cSide['bottom']) {
    this.vy += this.gravity;
    
  } else {
     // Stop vertical movement if on the ground
  }

  // Vertical camera movement
  if (this.y < canvas.height / 2 && camera.y > 0 && this.vy < 0) {
    camera.y += this.vy;
  } else if (this.y > canvas.height / 2 && camera.y < camera.height && this.vy > 0) {
    camera.y += this.vy;
  } else {
    this.y += this.vy;
  }

  // Collision handling for ground and ceilings
  if (this.cSide["bottom"] && !this.cPrevSide["bottom"]) {
    this.vy *= this.reflectionFactor;
    this.onGround = true;
 
  }
  if (this.cSide["top"] && !this.cPrevSide["top"]) {
    this.vy *= this.reflectionFactor;
  }

  // Horizontal wall collisions
  if ((this.cSide["left"] && !this.cPrevSide["left"]) || (this.cSide["right"] && !this.cPrevSide["right"])) {
    this.vx *= this.reflectionFactor;
  }

  // Move horizontally
  if (this.keys["ArrowRight"] && this.x > canvas.width / 2 && camera.x < camera.width) {
    camera.x += this.vx;
  } else if (this.keys["ArrowLeft"] && this.x < canvas.width / 2 && camera.x > 0) {
    camera.x += this.vx;
  } else {
    this.x += this.vx;
  }

  // Ensure camera stays within bounds
  camera.x = Math.max(0, Math.min(camera.x, camera.width));
  camera.y = Math.max(0, Math.min(camera.y, camera.height));

  // Update previous collision sides to current
  this.cPrevSide = { ...this.cSide };
}

  ,

  collision(rect) {
    // Calculate the differences in both axes
    let dx = this.x + this.width / 2 - (rect.x + rect.width / 2);
    let dy = this.y + this.height / 2 - (rect.y + rect.height / 2);

    // Calculate combined half-widths and half-heights
    let combinedHalfWidths = (this.width + rect.width) / 2;
    let combinedHalfHeights = (this.height + rect.height) / 2;

    // Check for collision
    if (Math.abs(dx) <= combinedHalfWidths && Math.abs(dy) <= combinedHalfHeights) {
      let overlapX = combinedHalfWidths - Math.abs(dx);
      let overlapY = combinedHalfHeights - Math.abs(dy);

      // Resolve the collision on the side of least overlap
      if (overlapX < overlapY) {
        if (dx > 0) {
          this.x += overlapX; // Move player to the right
          return "left";
        } else {
          this.x -= overlapX; // Move player to the left
          return "right";
        }
      } else {
        if (dy > 0) {
          this.y += overlapY; // Move player down
          return "top";
        } else {
          this.y -= overlapY; // Move player up
          return "bottom";
        }
      }
    }
    return null;
  },

  debugger() {
    context.font = "16px sans-serif";
    context.fillStyle = "black";
    Object.keys(this.cSide)
      .filter((e) => this.cSide[e])
      .forEach((e, i) => {
        context.fillText(
          `${e}:${this.cSide[e]}`,
          this.x + i * 80,
          this.y - tileSize / 2
        );
      });
    context.fillText(`X:${this.x} Y:${this.y.toFixed(3)} `, 200, 100);
    context.fillText(`vx:${this.vx.toFixed(2)} vy:${this.vy.toFixed(2)} `, 200, 116);
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
