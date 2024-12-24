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
// collisio
//draw player health bar
//sword enemy collisonf
//enemy states and logic
import Pendulum from "../modules/pendulum.js";

import Vector from "../modules/vector.js";
import collision2Rect from "../modules/physic.js";
import controller from "../modules/touchController.js";
import collisionRectCircle from "../modules/circleRect.js";
let frameCount = 0;

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
document.body.appendChild(canvas);

let screen = 1;
const Monsters = [];
const leftAnalog = controller.add(100, 200, 30, "analog");
controller.init(canvas);
let moveCamera = { x: false, y: false };
let collidedwall = [];
canvas.width = 860;
canvas.height = 680;

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
let keyEnable = true;

const prevCamera = {
  x: null,
  y: null,
};
const camera = { x: 0, y: 0 };
let map, mapWidth, mapHeight;
const walls = [];
const Line = [];
let Enemys = [];
let Pendulums = [];

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
    this.vx = Math.random() * 2 + 1;
    this.vy = 0;
    this.a = 0.2;
    this.velMax = Math.random() * 2 + 2;
    this.visible = true;

    this.health = 50;
    this.damage = 10;
    this.damageRate = 4;
    this.blink = false;
    this.opacity = 0;
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
    this.offsetx = 25;
    this.offsety = 25;
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

  drawHealthBar(c) {
    context.fillStyle = "lightgreen";
    context.fillRect(this.x - 3, this.y, this.health, 4);
    context.rect(this.x, this.y, this.health, 4);
    context.stroke();
  }

  draw(img, camera) {
    let sx, sy, sw, sh, cx, cy, cw, ch;

    this.count++;
    if (this.count === 300) this.count = 0;

    if (this.blink) {
      this.opacity += 0.1;
      if (this.opacity >= 1) this.opacity = 0;
      context.globalAlpha = this.opacity;
    }
    if (this.count % 5 === 0) {
      this.framex++;
      if (this.framex >= 6) {
        this.framex = 0;
      }

      if (debugMode) {
        //context.fillText(`enemy colside${this.colSide['left']}`,this.x-camera.x,this.y-camera.y-10);
      }
    }

    sx = this.frameSize * this.framex;
    sy = this.frameSize * this.framey;
    sw = 100;
    sh = 100;
    cx = this.x - this.offsetx;
    cy = this.y - this.offsety;
    cw = this.cw;
    ch = this.ch;

    context.fillStyle = "red";
    if (debugMode) {
      context.rect(cx, cy, cw, ch);
      context.stroke();
      context.fillRect(this.x, this.y, this.w, this.h);
    }
    if (debugMode) {
      context.fillRect(this.x, this.y, this.w, this.h);
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
  opacity: 1,
  onLadder: false,
  playerwidth: 100,
  playerheight: 100,
  dead: false,
  health: 100,
  blinkDirection: -1,
  blink: false,
  prevState: null,
  jumpOnce: false,
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
  jumpCount: 2,
  attack: false, //make complete the attack sprite for single loop to frame 5 once reaches frame 5 stop the animation
  state: {
    attack1Right: 0,
    attack2Right1: 1,
    defenceRight: 2,
    heartRight: 3,
    dieRight: 4,
    attack1Left: 5,
    attack2Left1: 6,
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
    attack2Right: 18,
    attack2left: 19,
  },
  attackRight: [18, 5, 20], //random
  attackLeft: [19, 0, 21], //random attack
  randomLeft: 19,
  randomRight: 18,
  initialTime: Date.now(),

  maxVel: 4,
  frictionOnAir: 0.95,
  frictionOnGround: 0.8,
  reflection: -0.5,
  gravity: 0.2,
  jumpForce: -6,
  onGround: false,
  sword: {},
  jumpSignal: false,
  colSide: { left: false, right: false, top: false, bottom: false },
  //plaer attribs
  attackPower: 10,
  inventory: {
    healItems: { no: 3, healRate: 4 },
    life: 3,
  },
  heal: false,
  attack() {},
  move() {
    if (keyEnable) {
      if (keys["ArrowLeft"] && this.vx >= -this.maxVel && !this.dead)
        this.vx -= this.a;
      if (keys["ArrowRight"] && this.vx <= this.maxVel && !this.dead)
        this.vx += this.a;
      if (
        keys["ArrowUp"] &&
        this.jumpCount > 0 &&
        this.jumpSignal &&
        !this.dead &&
        !this.onLadder
      ) {
        if (this.jumpCount === 1) this.vy = this.jumpForce * 0.9;
        else this.vy = this.jumpForce;
        this.onGround = false;
        this.y += this.vy;

        this.jumpSignal = false;
        this.jumpCount--;
      } else if (!keys["ArrowUp"]) {
        this.jumpSignal = true;
      }
      if (this.onGround) this.jumpCount = 2;

      this.vy += this.gravity;
      this.vx *= this.onGround ? this.frictionOnGround : this.frictionOnAir;
    }
  },
  action(Enemys) {
    if (keys["h"] && !this.dead) {
      this.heal = true;
    }
    if (this.heal && this.health <= 96 && this.inventory.healItems.no) {
      this.inventory.healItems.no -= 1;
      this.heal = false;
    }
  },
  randomIndex(attackChoices) {
    const randomIndex = Math.floor(Math.random() * attackChoices.length);
    return attackChoices[randomIndex];
  },
  draw(img, debug = true) {
    if (!this.prevState) {
      this.prevState = this.framey;
    }
    if (this.prevState !== this.framey) {
      this.prevState = this.framey;
      this.framex = 0;
    }
    if (debug) {
      context.fillStyle = "blue";
      // context.fillRect(this.x, this.y, this.w, this.h);
    }

    let sy, sx, sw, sh, cx, cy, cw, ch;

    sx = this.framex * 150;
    sy = this.framey * 150;
    sw = 150;
    sh = 150;
    cx = this.x - this.collisionOffsetx;
    cy = this.y - this.collisionOffsety;
    ch = this.playerwidth;
    cw = this.playerheight;

    if (!this.dead) {
      if (keys["s"] && !this.dead) {
        let diff = 0,
          current = Date.now();

        diff = Math.abs(current - this.initialTime);
        if (diff > 100) {
          //console.log("hello eveyr", diff);
          this.attack = true;
          this.initialTime = current;
        }
      }

      if (keys["ArrowLeft"]) {
        this.pos = this.state.idle1Left;
      } else if (keys["ArrowRight"]) {
        this.pos = this.state.idle1Right;
      }
    }
    this.frameCount++;
    //ladder
    if (this.onLadder) {
      if (keys["ArrowUp"]) {
        this.y -= 3.2;
        if (this.frameCount % 6 === 0) {
          this.framex++;
          if (this.framex === 7) this.framex = 0;
        }
      }
      if (keys["ArrowDown"]) {
        this.y += 3;
        if (this.frameCount % 7 === 0) {
          this.framex++;
        }
      }
    }

    if (this.pos !== this.framey) this.farmex = 0;
    if (this.attack) {
      this.framey =
        this.pos === this.state.idle1Right ? this.randomLeft : this.randomRight;
      if (this.frameCount % 5 === 0) {
        this.framex++;
      }
      if (this.framex === 6) {
        this.framex = 0;
        this.attack = false;
        this.randomLeft = this.randomIndex(this.attackLeft);
        this.randomRight = this.randomIndex(this.attackRight);
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
      } else if (this.health == 0) {
        this.framey == this.state.dieLeft;
      } else {
        this.collisionOffsetx = 38;
        if (this.framey === this.state.idle1Left) this.collisionOffsetx = 30;
      }
    } else if (this.onGround) {
      if (this.dead) {
        this.framey = this.colSide["right"]
          ? this.state.dieRight
          : this.state.dieLeft;
        if (this.frameCount % 8 === 0) this.framex++;

        console.log(this.framey);
        if (this.inventory.life > 0) {
          if (this.framex === 7) {
            this.framex = 0;
            this.health = 100;
            this.dead = false;
            this.inventory.life--;
            this.x = 100;
            this.y = canvas.height - 150;
          }
        } else {
          this.inventory.life = 3;
          context.font = "33px sans-serif";

          context.fillText(`Restart Game`, 300, 300);
          this.x = 100;
          this.y = canvas.height - 150;
        }
      } else if (this.frameCount % 4 === 0) {
        if (!this.onLadder) this.framex++;
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
    } else if (this.attack) {
      if (this.frameCount % 5 === 0) this.framex++;
      if (this.framex === 6) {
        this.attack = false;
      }
    } else {
      this.framey =
        this.pos === this.state.idle1Left
          ? this.state.jumpLeft
          : this.state.jumpRight;

      if (this.frameCount % 4 === 0) {
        this.framex++;
      }
      if (this.framex === 6) {
        this.framex--;
      }
    }
    if (this.framex >= 7) this.framex = 0;
    if (debugMode) context.fillRect(this.x, this.y, this.w, this.h);

    if (this.blink) {
      this.opacity -= 0.2;
      if (this.opacity <= 0) this.opacity = 1;
      context.globalAlpha = this.opacity;
    }

    //player attack sword
    if (this.attack) {
      this.sword.x = player.x;
      this.sword.y = player.y;

      this.sword.w = player.w;
      this.sword.h = player.h;

      if (player.attackLeft.includes(this.framey)) {
        this.sword.x += 40;
      } else if (player.attackRight.includes(this.framey)) {
        this.sword.x -= 40;
      }
      let side = "none";
      //check collsiion with enemys
      Enemys.forEach((enemy) => {
        side = collision2Rect(this.sword, enemy);
        if (side !== "none") {
          if (this.frameCount % 4 === 0) enemy.health -= 10;
        }
        if (enemy.health < 1) {
          enemy.delete = true;
          enemy.health = 0;
        }
      });
      if (debugMode)
        context.fillRect(
          this.sword.x,
          this.sword.y,
          this.sword.w,
          this.sword.h
        );
    } else {
      sword: {
      }
    }
    context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch);

    if (debugMode) {
      context.rect(cx, cy, cw, ch);

      context.stroke();
    }
  },
};
const imagesrc = [
  "../images/objects.png",
  "../images/background.png",
  "../images/SPARTA1.png",
  "../images/Minotour.png",
  "../images/tools.png",
  "../images/LADDER.png",
];
//fetch
async function fetchMap(mapUrl) {
  const response = await fetch(mapUrl);
  return await response.json();
}
function loadImages(imageSources) {
  const promises = imageSources.map((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => reject(`Failed to load image: ${src}`);
    });
  });
  return Promise.all(promises);
}

async function initializeGame() {
  try {
    const map1 = await fetchMap("./map3.json");

    const images = await loadImages(imagesrc);
    const [objects, background, sparta, minotour, tools, ladder] = images;
    // Pass map and images to the game engine

    startGame(map1, images);
  } catch (error) {
    console.error("Error initializing game:", error);
  }
}

function drawScreen1(context) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000"; // Background color
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#FFF";
  context.font = "20px Arial";
  context.fillText("Press Arrow Keys:", 20 + 290, 50);
  context.fillText("Arrow Up: Jump", 20 + 290, 80);
  context.fillText("Arrow Left: Move Left", 20 + 290, 110);
  context.fillText("Arrow Right: Move Right", 20 + 290, 140);
  context.fillText("Key S: Attack", 20 + 290, 170);
  context.fillText(
    "Press any key to continue....",
    canvas.width / 2 - 100,
    canvas.height / 2 + 210
  );
}

function drawScreen2(map,camera,tilesets) {
context.fillStyle='blue'
context.fillRect(0,0,55,55);
drawMap(map,camera,tilesets);
}
function startGame(initialMap, loadedImages) {
  let map1 = initialMap;
  let newMapLoaded = false;
  const images=loadedImages;
  let mapNo = 3;
  let prevMapNo = 0;
  let screenNo = 2;
const tilesets=map1.tilesets
  const layers = map1.layers;
  const scale = map1.tileheight / tileSize;
  mapHeight = Math.round((map1.height * map1.tileheight) / scale);
  mapWidth = Math.round((map1.width * map1.tilewidth) / scale);
  camera.width = mapWidth - canvas.width;
  camera.height = mapHeight - canvas.height;

  // assign the images to the tilesets
  tilesets.forEach((tileset,i)=>{
    tileset.img=images[i];
    })

console.log(tilesets)
  //console.log(currentMap,loadedImages)
  function update() {
    
    // Update game objects based on the current map
    // Example: Check for conditions to switch maps
    if (prevMapNo !== mapNo) {
      loadNextMap(`./map${mapNo}.json`).then((data) => {
        map1 = data;
        newMapLoaded = false;
        prevMapNo = mapNo;
        
        tilesets.forEach((tileset,i)=>{
          tileset.img=images[i];
          })

      });
 
    }
    switch (screenNo) {
      case 1:
        drawScreen1(context);
        break;
      case 2:
        drawScreen2(map1,camera,tilesets);
      
        break;
    }
  }
  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    update();
    requestAnimationFrame(animate);
  }
 

  window.addEventListener("keydown", (e) => {
    if (screenNo === 1) {
      screenNo = 2;
    }
  });
  animate();
}

initializeGame();

async function loadNextMap(mapUrl) {
  return await fetchMap(mapUrl);
}

function drawMap(map,camera,tilesets){
 


  map.layers.forEach((layer) => {
    if (layer.type === "tilelayer") {
      layer.data.forEach((idNumber, index) => {
        if (idNumber) {
          const canvasX = (index % map.width) * tileSize - camera.x; //x and y cordinate in image tile
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

          
           
          
              if (canvasX < canvas.width && canvasY < canvas.height){
        
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
              context.globalAlpha = 1;
            }
          });
        }
      });
    }
  });
}