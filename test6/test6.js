const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = 480;
canvas.height = 480;

const tileSize = 32;
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

let map, mapWidth, mapHeight;
const walls = [];

const player = {
  x: 0,
  y: 0,
  w: tileSize,
  h: tileSize,
  vx: 0,
  vy: 0,
  a: 1,
  maxVel: 4,
  frictionOnAir: 0.98,
  frictionOnGround: 0.8,
  reflection:-.5,
  gravity: 0.2,
  jumpForce: -7,
  onGround: false,
  colSide: { left: false, right: false, top: false, bottom: false },

  move() {
    if (keys["ArrowLeft"] && this.vx >= -this.maxVel) this.vx -= this.a;
    if (keys["ArrowRight"] && this.vx <= this.maxVel) this.vx += this.a;
    if(keys['ArrowUp'] && this.onGround){
      this.vy=this.jumpForce;
      this.onGround=false;
      this.y+=this.vy;
    }
    
    
    
    
    this.vy += this.gravity;
    this.vx *= this.onGround ? this.frictionOnGround : this.frictionOnAir;
   
   
   
 
  },

  collision(rect) {
    let dx = this.x + this.w / 2 - (rect.x + rect.w / 2);
    let dy = this.y + this.h / 2 - (rect.y + rect.h / 2);
    let combinedHalfWidths = (this.w + rect.w) / 2;
    let combinedHalfHeights = (this.h + rect.h) / 2;
    let overlapX = combinedHalfWidths - Math.abs(dx);
    let overlapY = combinedHalfHeights - Math.abs(dy);

    if (Math.abs(dx) <= combinedHalfWidths && Math.abs(dy) <= combinedHalfHeights) {
      if (overlapX < overlapY) {
        if (dx > 0) {
          this.x += overlapX;
          this.colSide.left = true;
        } else {
          this.x -= overlapX;
          this.colSide.right = true;
        }
      } else {
        if (dy > 0) {
          this.y += overlapY;
          this.colSide.top = true;
        } else {
          this.y -= overlapY;
          this.colSide.bottom = true;
          this.onGround = true;
        }
      }
    } else {
      this.onGround = false;
    }
  },

  draw() {
    context.fillStyle = "blue";
    context.fillRect(this.x, this.y, this.w, this.h);
  },
};

fetch("./map1.json")
  .then((response) => response.json())
  .then((data) => {
    map = data;
    const camera = { x: 0, y: 0 };
    const tilesets = map.tilesets;
    const layers = map.layers;
    const scale = map.tileheight / tileSize;
    mapHeight = Math.round((map.height * map.tileheight) / scale);
    mapWidth = Math.round((map.width * map.tilewidth) / scale);
    camera.width=mapWidth-canvas.width;
    camera.height=mapHeight-canvas.height;

    const imagesrc = ["../images/objects.png", "../images/background.png"];
    let imagesLoaded = 0;

    layers.forEach((layer) => {
      if (layer.type === "objectgroup") {
        layer.objects.forEach((obj) => {
          if (["platform", "wall", "barrel"].includes(obj.name)) {
            walls.push({
              x: obj.x / scale,
              y: obj.y / scale,
              w: obj.width / scale,
              h: obj.height / scale,
            });
          }
        });
      }
    });

    tilesets.forEach((tileset, i) => {
      tileset.img = new Image();
      tileset.img.src = imagesrc[i];
      tileset.img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === tilesets.length) animate();
      };
    });

    function animate() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // if (keys["ArrowDown"]) camera.y += 4;
      // if (keys["ArrowUp"]) camera.y -= 4;
      // if (keys["ArrowLeft"]) camera.x -= 4;
      // if (keys["ArrowRight"]) camera.x += 4;

      // Draw Map Layers
      layers.forEach((layer) => {
        if (layer.type === "tilelayer") {
          layer.data.forEach((idNumber, index) => {
            if (idNumber) {
              const canvasX = (index % map.width) * tileSize - camera.x;
              const canvasY = Math.floor(index / map.width) * tileSize - camera.y;
              tilesets.forEach((tileset) => {
                if (idNumber >= tileset.firstgid && idNumber < tileset.firstgid + tileset.tilecount) {
                  const localIndex = idNumber - tileset.firstgid;
                  const sx = (localIndex % tileset.columns) * tileset.tilewidth;
                  const sy = Math.floor(localIndex / tileset.columns) * tileset.tileheight;

                  context.drawImage(
                    tileset.img,
                    sx,
                    sy,
                    tileset.tilewidth,
                    tileset.tileheight,
                    canvasX,
                    canvasY,
                    tileSize,
                    tileSize
                  );
                }
              });
            }
          });
        }
      });

      player.move();
      
if(player.vx>0 && player.x>canvas.width/2 && camera.x<=camera.width  ||
  player.vx<0 && player.x<canvas.width/2 && camera.x>=0
){
  camera.x+=(player.vx);
}else{
  player.x+=(player.vx);
}

if(player.vy>0 && player.y>canvas.height/2 && camera.y<=camera.height  ||
  player.vy<0 && player.y<canvas.height/2 && camera.y>=-tileSize
){
  camera.y+=player.vy;
}else{
  player.y+=player.vy;
}
  player.colSide = { left: false, right: false, top: false, bottom: false };
        
      // Draw Walls and Check Collisions
      walls.forEach((wall) => {
        const wallAdjusted = { x: wall.x - camera.x, y: wall.y - camera.y, w: wall.w, h: wall.h };
        player.collision(wallAdjusted);
        context.fillStyle = `rgba(225,0,0,.3)`;
        context.fillRect(wallAdjusted.x, wallAdjusted.y, wallAdjusted.w, wallAdjusted.h);
      });
       if(player.colSide['bottom']){
         player.vy=0;
        player.onGround=true;
       }
    
   // player refleton while colliding with the objects groups
   if(player.colSide['left'] || player.colSide['right'])player.vx*=player.reflection;
   if(player.colSide['top'] )player.vy*=player.reflection; 


      player.draw();
      context.fillStyle='black';
      
      context.font='16px sans-serif';
      
 context.fillText(`bottom:${player.colSide['bottom']} top:${player.colSide['top']}`,100,140)
 context.fillText(`camera.y:[ ${camera.height} ]top:${player.colSide['top']}`,100,160)
 context.fillText(`player.vy${player.vy} player.vx:${player.vx}`,100,180)
                 
 requestAnimationFrame(animate);
    }

    // Controller setup
    addEventListener("keydown", (e) => (keys[e.key] = true));
    addEventListener("keyup", (e) => (keys[e.key] = false));
  });
