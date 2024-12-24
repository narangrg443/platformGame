//use ctrl+f to search the required code
//player
//fetch
//loadimages
//cameralogic
// DrawWalls wallcollision
//linecollisions
// Check for collision with the updated line coordinates
//darwline
//debug
//draw enemy= #dm
//collision between enemy and platform #cel

//#top
//adding collision to the enemy and platform #enemycollision
//sword.move
//sword and enemy collision
//player enemy collision 
import Vector from "../modules/vector.js";
import collision2Rect from "../modules/physic.js";
import CollisionBox from "../modules/CollisionBox.js";
import CollisonBox from "../modules/CollisionBox.js";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
document.body.appendChild(canvas);
let collidedwall = [];
canvas.width = 860;
canvas.height = 680;
let jumponce = true;
const debugMode = 1;
let keyEnabled = true;
const tileSize = 42;
const Scale = 100 / tileSize;
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
let adjustedEnemys=[]
const prevCamera={
  x:null,
  y:null
}
let map, mapWidth, mapHeight;
const walls = [];

const Line = [];
let Enemys = [];
class Sword {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.a=1;
    this.attackRangex=7;
    this.attackRangey=7;
    this.collison = false;
  this.visible=false;
  }
  move(p) {


    this.x = p.x + 5;
    this.y = p.y+this.h/3;
    if (p.attack) {
      this.collison = true;
      this.x +=
        player.framey === player.state.attack1Right
          ? 6 * this.attackRangex
          : 7 * -this.attackRangex;
      // this.y -=
      //   player.framey === player.state.attack1Right
      //     ? 7* this.attackRangey
      //     : 7 * this.attackRangey;
    
       } else {
      this.collison = false;
    }
  }
  draw() {
    context.fillStyle = "red";
    if (this.collison) context.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Enemy {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.adjustedEnemy = {};
    this.id = null;
    this.cw = 120;
    this.ch = 120;
    this.vx = 2;
    this.vy = 0;
    this.a = 0.2;
    this.velMax = 2;
    this.visible = true;
    this.patrolWidth = { x1: 0, x2: 0 };
    this.health=50;
    this.attack = false;
    this.jump = false;
    (this.moveDirection = { x: 1, y: 0 }), (this.onGround = false);
    this.gravity = 0.2;
    (this.collision = false), (this.frameSize = 96);
    this.platform = null;
    (this.side = "none"),
      (this.wall = null),
      (this.colSide = { top: false, bottom: false, right: false, left: false });
    this.framex = 0;
    this.framey = 5;
    this.offsetx = 39;
    this.offsety = 35;
    this.count = 0;
    this.frameMax = 5;
    this.state = {
      idleR: 0,
      runR: 1,
      angryR: 2,
      atackTopR: 3,
      attackMidR: 4,
      attackLowR: 6,
      dieR: 9,

      idleL: 10,
      runL: 11,
      angryL: 12,
      atackTopL: 13,
      attackMidL: 14,
      attackLowL: 16,
      dieL: 19,
    };
  }
  adjustxy(camera) {
    this.adjustx = this.x - camera.x;
    this.adjusty = this.y - camera.y;
  }


  
  draw(img, camera) {
    let sx, sy, sw, sh, cx, cy, cw, ch;

    this.count++;
    if (this.count % 5 === 0) {
      this.framex++;
      if (this.framex >= this.frameMax) {
        this.framex = 0;
      }

      if (debugMode) {
        //context.fillText(`enemy colside${this.colSide['left']}`,this.x-camera.x,this.y-camera.y-10);
      }
    }

    this.framey = this.state.attackLowR;

    sx = this.frameSize * this.framex;
    sy = this.frameSize * this.framey;
    sw = 100;
    sh = 100;
    cx = this.x - camera.x - this.offsetx;
    cy = this.y - camera.y - this.offsety;
    cw = this.cw;
    ch = this.ch;
    
    context.fillStyle = "red";
    if (debugMode) {
      context.rect(cx, cy, cw, ch);
      context.stroke();
      context.fillRect(
        this.adjustedEnemy.x,
        this.adjustedEnemy.y,
        this.w,
        this.h
      );
    }
    if (debugMode) {
     context.fillRect(this.x - camera.x, this.y - camera.y, this.w, this.h);
    }
    if (this.visible) context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch);
  }
  update(camera, img) {
    this.move(camera);

    this.draw(img);
  }
}



//player
const player = {
  x: 100,
  y: canvas.height - 100,
  w: 18,
  h: 60,
 
  vx: 0,
  vy: 0,
  a: 1,
  pos: 10,
  playerwidth: 100,
  playerheight: 100,
  //sprite animation
  collisionOffsetx: 38,
  collisionOffsety: 40, //it helps to place the collison rect around the sprite body for realistic collision
  frameCount: 0,
  framex: 0,
  framey: 10,
  offsetx: 10,
  offsety: 0,
  frameLeft: 6,
  framexMax: 7,
  frameLeftAttack: 6,
  jumpAnimation: true,
  spriteWidth: 100,
  fps: 4,
  attack: false, //make complete the attack sprite for single loop to frame 5 once reaches frame 5 stop the animation
  state: {
    attack1Right: 0,
    attack2Right: 1,
    defenceRight: 2,
    heartRight: 3,
    dieRight: 4,
    attack1Left: 5,
    attack2Left: 6,
    defenceLeft: 7,
    heartLeft: 8,
    dieLeft: 9,
    idle1Right: 10,
    idle2Right: 11,
    runRight: 12,
    jumpRight: 13,
    idle1Left: 14,
    idle2Left: 15,
    runLeft: 16,
    jumpLeft: 17,
  },
  initialTime: Date.now(),

  maxVel: 4,
  frictionOnAir: 0.95,
  frictionOnGround: 0.8,
  reflection: -0.5,
  gravity: 0.2,
  jumpForce: -7,
  onGround: false,

  jumpSignal: true,
  colSide: { left: false, right: false, top: false, bottom: false },
 //plaer attribs
 attackPower:10,


  move() {
    if (keys["ArrowLeft"] && this.vx >= -this.maxVel) this.vx -= this.a;
    if (keys["ArrowRight"] && this.vx <= this.maxVel) this.vx += this.a;
    if (keys["ArrowUp"] && this.onGround && this.jumpSignal) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.y += this.vy;
      this.jumpSignal = false;
    } else if (!keys["ArrowUp"]) {
      this.jumpSignal = true;
    }

    this.vy += this.gravity;
    this.vx *= this.onGround ? this.frictionOnGround : this.frictionOnAir;
  },
  draw(img, debug = true) {
    if (debug) {
      context.fillStyle = "blue";
      // context.fillRect(this.x, this.y, this.w, this.h);
    }
    /*0 leftidle,
    1 leftrun 
    2 left jump ,
    3 leftattack ,
    4right idle,
    5 right run ,
    6right jump,
    7 right attack
    */

    let sy, sx, sw, sh, cx, cy, cw, ch;

    sx = this.framex * 150;
    sy = this.framey * 150;
    sw = 150;
    sh = 150;
    cx = this.x - this.collisionOffsetx;
    cy = this.y - this.collisionOffsety;
    ch = this.playerwidth;
    cw = this.playerheight;

    if (keys["s"]) {
      
      let diff = 0,
        current = Date.now();

      diff = Math.abs(current - this.initialTime);
      if (diff > 500) {
        //console.log("hello eveyr", diff);
        this.attack = true;
        this.initialTime = current;
      }
    }
    if (keys["ArrowUp"]) this.jumpSignal = true;
    if (keys["ArrowLeft"]) {
      this.pos = this.state.idle1Left;
    } else if (keys["ArrowRight"]) {
      this.pos = this.state.idle1Right;
    }

    this.frameCount++;
    if (this.pos !== this.framey) this.farmex = 0;

    if (this.onGround) {
      if (this.frameCount % 4 === 0) {
        this.framex++;
        if (this.framex === 7) {
          this.framex = 0;
          this.frameCount = 0;
        }
        if (this.vx > 1) {
          this.framey = this.state.runRight;
        } else if (this.vx < -1) {
          this.framey = this.state.runLeft;
        } else if (this.pos === this.state.idle1Left) {
          this.framey = this.state.idle1Left;
        } else if (this.pos === this.state.idle1Right) {
          this.framey = this.state.idle1Right;
        }
      }
    }

    if (this.attack) {
      this.framey =
        this.pos === this.state.idle1Right
          ? this.state.attack1Right
          : this.state.attack1Left;
      if (this.frameCount % 8 === 0) {
        this.framex++;

        if (this.framex === 6) {
          this.farmex = 0;
          this.attack = false;
        }
      }

      if (this.framey === this.state.attack1Left) {
        this.collisionOffsetx = 38 + 8;
      } else if (this.framey === this.state.attack1Right) {
        this.collisionOffsetx = 38 - 8;
      } else if (this.framey === this.state.runLeft) {
        this.collisionOffsetx = 38 + 4;
        console.log("runleft");
      } else if (this.framey === this.state.runRight) {
        this.collisionOffsetx = 88 - 4;
      } else {
        this.collisionOffsetx = 38;
        if (this.framey === this.state.idle1Left) this.collisionOffsetx = 30;
      }
    }

    if (!this.onGround && !this.attack) {
      this.framey =
        this.pos === this.state.idle1Left
          ? this.state.jumpLeft
          : this.state.jumpRight;

      if (this.frameCount % 6 === 0) {
        this.framex++;
      }
      if (this.framex === 7) {
        this.framex--;
      }
    }
    if (this.framex === 7) this.framex = 0;
    if (debugMode) context.fillRect(this.x, this.y, this.w, this.h);

    context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch);
    if (debugMode) {
      context.rect(cx, cy, cw, ch);

      context.stroke();
    }
  },
};

const sword = new Sword(player.x, player.y, 20, 40);

//fetch
fetch("./map3.json")
  .then((response) => response.json())
  .then((data) => {
    map = data;
    const camera = { x: 0, y: 0 };
    const tilesets = map.tilesets;
    const layers = map.layers;
    const scale = map.tileheight / tileSize;
    mapHeight = Math.round((map.height * map.tileheight) / scale);
    mapWidth = Math.round((map.width * map.tilewidth) / scale);
    camera.width = mapWidth - canvas.width;
    camera.height = mapHeight - canvas.height;

    const imagesrc = [
      "../images/objects.png",
      "../images/background.png",
      "../images/SPARTA1.png",
      "../images/Minotour.png",
    ];
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
          if (obj.name === "slope") {
            const basex = obj.x / scale;
            const basey = obj.y / scale;

            const startx = basex + obj.polyline[0].x / scale;
            const starty = basey + obj.polyline[0].y / scale;

            const endx = startx + obj.polyline[1].x / scale;
            const endy = starty + obj.polyline[1].y / scale;

            Line.push({
              startx: startx - camera.x,
              starty: starty - camera.y,
              endx: endx - camera.x,
              endy: endy - camera.y,
            });
          }
          if (obj.name === "enemy") {
            let x, y;
            x = obj.x / Scale;
            y = obj.y / Scale;
            Enemys.push(new Enemy(x, y, 80 / Scale, 100 / Scale));
          }
        });
      }
    });
   
    //loadimages loadimages loadimage
    tilesets.forEach((tileset, i) => {
      tileset.img = new Image();
      //console.log(imagesrc[i]);
      tileset.img.src = imagesrc[i];
      tileset.img.onload = () => {
        imagesLoaded++;

        if (imagesLoaded === tilesets.length) {
          animate();
        }
      };
    });
    //animate

    function animate() {
      context.clearRect(0, 0, canvas.width, canvas.height);

  
      // Draw Map Layers
      layers.forEach((layer) => {
        if (layer.type === "tilelayer") {
          layer.data.forEach((idNumber, index) => {
            if (idNumber) {
              const canvasX = (index % map.width) * tileSize - camera.x;
              const canvasY =
                Math.floor(index / map.width) * tileSize - camera.y;
              tilesets.forEach((tileset) => {
                if (
                  idNumber >= tileset.firstgid &&
                  idNumber < tileset.firstgid + tileset.tilecount
                ) {
                  const localIndex = idNumber - tileset.firstgid;
                  const sx = (localIndex % tileset.columns) * tileset.tilewidth;
                  const sy =
                    Math.floor(localIndex / tileset.columns) *
                    tileset.tileheight;

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

      //cameralogic
      if (
        (player.vx > 0 &&
          player.x > canvas.width / 2 &&
          camera.x <= camera.width) ||
        (player.vx < 0 && player.x < canvas.width / 2 && camera.x >= 0)
      ) {
        camera.x += player.vx;
      } else {
        player.x += player.vx;
      }

      if (
        (player.vy > 0 &&
          player.y > canvas.height / 2 &&
          camera.y <= camera.height) ||
        (player.vy < 0 && player.y < canvas.height / 2 && camera.y >= -tileSize)
      ) {
        camera.y += player.vy;
      } else {
        player.y += player.vy;
      }

      //Collisions
      player.colSide = { left: false, right: false, top: false, bottom: false };

      // DrawWalls wallcollision and Check Collisions

      walls.forEach((wall) => {
        const wallAdjusted = {
          x: wall.x - camera.x,
          y: wall.y - camera.y,
          w: wall.w,
          h: wall.h,
        };
        const col = collision2Rect(player, wallAdjusted);
        player.colSide[col] = true;
        // player.collision(wallAdjusted);
      });

      // player refleton while colliding with the objects groups
      if (player.colSide["left"] || player.colSide["right"])
        player.vx *= player.reflection;
      if (player.colSide["top"]) player.vy *= player.reflection;

      //line collisons

      //make player.vx=0 is its moving small vx
      if (!keys["left"] && !keys["right"]) {
        if (Math.abs(player.vx) < 0.0001) {
          player.vx = 0;
        }
      }

      //line collisions
      //linecollisions

      let onSlope = false;
      Line.forEach((line) => {
        // Update line coordinates relative to camera position
        const temp = {
          startx: line.startx - camera.x,
          starty: line.starty - camera.y,
          endx: line.endx - camera.x,
          endy: line.endy - camera.y,
        };

        // Check for collision with the updated line coordinates
        if (lineCollision(temp, player)) {
          onSlope = true;
          player.onGround = true;
          player.vy = 0;
        }
      });

      // Update player status based on slope detection
      if (!onSlope) {
        player.a = 1;

        player.onGround = false;
      }
      player.onGround = onSlope || player.colSide.bottom;

      if (onSlope) {
        player.a = 0.71; //if player walking on slope then in upward direction
        player.colSide["bottom"] = true;
      }

      if (player.colSide["bottom"]) {
        player.vy = 0;
        player.onGround = true;
      }

      if (player.framey === 14) {
        player.collisionOffsetx = 38 - 6;
      } else if (player.framey === player.state.jumpLeft) {
        player.collisionOffsetx = 38 + 6;
      } else if (player.framey === player.state.jumpRight) {
        player.collisionOffsetx = 38;
      } else if (player.framey === player.state.runLeft) {
        player.collisionOffsetx = 38 + 6;
      } else if (player.framey === player.state.runRight) {
        player.collisionOffsetx = 38;
      } else {
        // player.h=60
      }

      // draw player dp

      //drawline dl sword.move

     
      sword.move(player);
      if (debugMode) sword.draw();
      if (debugMode)
        Line.forEach((l) => {
          context.strokeStyle = "white";

          context.beginPath();
          context.moveTo(l.startx - camera.x, l.starty - camera.y);
          context.lineTo(l.endx - camera.x, l.endy - camera.y);
          context.stroke();
        });
      context.beginPath();
      context.moveTo(0, 0);

      Enemys.forEach((e) => {
    
      });

      Enemys.forEach((e, i) => {
        e.adjustxy(camera);
        e.colSide = { top: false, bottom: false, left: false, right: false };
        e.id=i;
     if(debugMode) context.fillText(`${e.id}`,e.x-10-camera.x,e.y-10-camera.y)
        walls.forEach((w) => {
          let side = collision2Rect(e, w);
          if (side !== "none") {
            e.colSide[side] = true;
            if (e.colSide.bottom) {//get wall in enemy if collision is bottom
              e.wall = w;
            }
          }
          
      
       
         
        });
   

        //bottom collsion enemy wall
        if (e.colSide.bottom) {
          e.vy = 0;

      
        } else {
          e.vy += e.gravity;
          e.y += e.vy;
        }

        if (e.colSide.left || e.colSide.right) {
          
          e.vx = -e.vx;
          
         
        } else{
          if (
            (e.wall && e.x > e.wall.x + e.wall.w - e.w) ||
            (e.wall && e.x < e.wall.x)
          ) {
            e.vx = -e.vx;
          }
        }
     e.x += e.vx;
        
      });

      Enemys.forEach((e) => {
        e.draw(tilesets[3].img, camera);
      });

      player.draw(tilesets[2].img);
      //collision between enemy and platform cel
      // debug(camera);
     

      requestAnimationFrame(animate);
    }

    // Controller setup

    addEventListener("keydown", (e) => {
      if (keyEnabled) keys[e.key] = true;
    });
    addEventListener("keyup", (e) => {
      if (keyEnabled) keys[e.key] = false;
    });

    function pointLineDistance(px, py, x1, y1, x2, y2) {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      const param = lenSq !== 0 ? dot / lenSq : -1;

      let xx, yy;

      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      const dx = px - xx;
      const dy = py - yy;
      return {
        distance: Math.sqrt(dx * dx + dy * dy),
        closestX: xx,
        closestY: yy,
      };
    }
    //lineCollision
    function lineCollision(line, player) {
      const { distance, closestX, closestY } = pointLineDistance(
        player.x + player.w / 2, //point where the player and line will snap should be always w/2
        player.y + player.h,
        line.startx,
        line.starty,
        line.endx,
        line.endy
      );

      const threshold = 10; // lesser it will make player jump Adjust threshold for detection
      if (distance < threshold) {
        player.y = closestY - player.h; // 2 measn it will be 2 pxel above line Adjust player position to the line
        player.vy = 0;
        player.onGround = true;
        player.jumpSignal = true;

        return true;
      }
      return false;
    }
  });

function debug(camera) {
  //debug mode
  if (debugMode) {
    context.fillStyle = "black";

    context.font = "16px sans-serif";

    context.fillText(
      `bottom:${player.colSide["bottom"]} top:${player.colSide["top"]}`,
      100,
      140
    );
    context.fillText(
      `camera.y:[ ${camera.height} ]top:${player.colSide["top"]}`,
      100,
      160
    );
    context.fillText(
      `player.jumpSignal[${player.jumpSignal}] player.vx:${player.vx.toFixed(
        2
      )}`,
      100,
      180
    );
    context.fillText(
      `player.vy[${player.vy.toFixed(2)}] player.framey${
        player.framey
      } framex:${player.framex}`,
      100,
      200
    );
  }
}
function debugEnemy() {
  let i = 2;
if(debugMode)
  context.fillText(
    `e.colSide['bottom]:${Enemys[i].colSide.bottom}e.vy:${Enemys[i].y}`,
    Enemys[i].x,
    200
  );
}
function debugWall(awalls) {
  context.font = "16px sans-serif";

  context.fillStyle = `rgba(0,222,0,.3)`;
  awalls.forEach((w) => {
    context.fillRect(w.x, w.y, w.w, w.h);
  });
}
