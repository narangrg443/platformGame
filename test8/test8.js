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

let screen=1;
const Monsters=[]
const leftAnalog = controller.add(100, 200, 30, "analog");
controller.init(canvas);
let moveCamera={x:false,y:false,};
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
let keyEnable=true;

const prevCamera = {
  x: null,
  y: null,
};
const camera = { x: 0, y: 0 };
let map, mapWidth, mapHeight;
const walls = [];
const Line = [];
let Enemys = [];
let Pendulums=[];



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
    this.opacity=0;
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
    if(this.count===300)this.count=0;

    if(this.blink){
      this.opacity+=0.1;
      if(this.opacity>=1)this.opacity=0;
      context.globalAlpha=this.opacity;
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
      context.fillRect(
      this.x,
      this.y,
        this.w,
        this.h
      );
    }
    if (debugMode) {
      context.fillRect(this.x , this.y, this.w, this.h);
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
  onLadder:false,
  playerwidth: 100,
  playerheight: 100,
  dead:false,
  health: 100,
  blinkDirection: -1,
  blink: false,
  prevState: null,
  jumpOnce:false,
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
  jumpCount:2,
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
    attack2Right:18,
    attack2left:19
  },
  attackRight:[18,5,20],//random
  attackLeft:[19,0,21],//random attack
  randomLeft:19,
  randomRight:18,
  initialTime: Date.now(),

  maxVel: 4,
  frictionOnAir: 0.95,
  frictionOnGround: 0.8,
  reflection: -0.5,
  gravity: 0.2,
  jumpForce: -6,
  onGround: false,
  sword:{},
  jumpSignal: false,
  colSide: { left: false, right: false, top: false, bottom: false },
  //plaer attribs
  attackPower: 10,
  inventory:{
    healItems:{no:3,healRate:4},
    life:3,
  
  },
  heal:false,
  attack(){

  },
  move() {
if(keyEnable){
    if (keys["ArrowLeft"] && this.vx >= -this.maxVel && !this.dead) this.vx -= this.a;
    if (keys["ArrowRight"] && this.vx <= this.maxVel&& !this.dead) this.vx += this.a;
    if (keys["ArrowUp"] && this.jumpCount>0&& this.jumpSignal && !this.dead && !this.onLadder) {
    if(this.jumpCount===1)  this.vy = this.jumpForce*.9;
    else this.vy=this.jumpForce
      this.onGround = false;  
      this.y += this.vy;
      
      this.jumpSignal = false;
      this.jumpCount--;
      
    
    } else if(!keys['ArrowUp'] ) {
     this.jumpSignal=true;
    }
if(this.onGround)this.jumpCount=2;


    this.vy += this.gravity;
    this.vx *= this.onGround ? this.frictionOnGround : this.frictionOnAir;
 
  }
},
  action(Enemys) {
    
    if (keys["h"]&& !this.dead) {
      this.heal=true;
   
    }
    if(this.heal && this.health<=96 && this.inventory.healItems.no){
     this.inventory.healItems.no-=1;
     this.heal=false;
    }
    
  },
  randomIndex(attackChoices){
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

    if(!this.dead){
    if (keys["s"]&& !this.dead) {
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
if(this.onLadder){
  if(keys['ArrowUp']){
    this.y-=3.2;
    if(this.frameCount%6===0){
      this.framex++; 
      if(this.framex===7)this.framex=0;
       }
  }
    if(keys['ArrowDown']){
       this.y+=3;
       if(this.frameCount%7===0){this.framex++;}
    }
}


    if (this.pos !== this.framey) this.farmex = 0;
    if (this.attack) {
      
      this.framey =
        this.pos === this.state.idle1Right
          ?this.randomLeft
          : this.randomRight;
      if (this.frameCount % 5 === 0) {
        this.framex++;
      }
      if (this.framex === 6) {
        this.framex = 0;
        this.attack = false;
        this.randomLeft=this.randomIndex(this.attackLeft)
        this.randomRight=this.randomIndex(this.attackRight);
       
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
    }
   else if (this.onGround) {
    if(this.dead)
        {
    
          this.framey=this.colSide['right']?this.state.dieRight:this.state.dieLeft;
          if(this.frameCount%8===0)this.framex++;
        
          console.log(this.framey)
          if(this.inventory.life>0){
          if(this.framex===7){
            this.framex=0;
            this.health=100;
            this.dead=false;
            this.inventory.life--;
            this.x=100;
            this.y=canvas.height-150;
          }
          }else{
            this.inventory.life=3;
            context.font='33px sans-serif';
            
           context.fillText(`Restart Game`,300,300)
           this.x=100;
           this.y=canvas.height-150;
          }
        }
     else if (this.frameCount % 4 === 0) {
       if(!this.onLadder) this.framex++;
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
   else if (this.attack) {
      if (this.frameCount % 5=== 0) this.framex++;
      if (this.framex === 6) {
        this.attack = false;
      }
    }

   else
    {
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
    if (this.framex >=7) this.framex = 0;
    if (debugMode) context.fillRect(this.x, this.y, this.w, this.h);

    if (this.blink) {
    
      this.opacity -= 0.2;
      if (this.opacity <= 0) this.opacity = 1;
      context.globalAlpha = this.opacity;
    }

    //player attack sword
    if(this.attack){

      this.sword.x=player.x;
      this.sword.y=player.y;

      this.sword.w=player.w;
      this.sword.h=player.h
   

      if(player.attackLeft.includes(this.framey)){
        this.sword.x+=40;
        
      }else if(player.attackRight.includes(this.framey)){
        this.sword.x-=40;
      }
let side="none"
//check collsiion with enemys
Enemys.forEach(enemy=>{
  side=collision2Rect(this.sword,enemy);
  if(side!=='none'){
       if(this.frameCount%4===0)enemy.health-=10;

  }
  if(enemy.health<1){
    enemy.delete=true;
   enemy.health=0;
  }
  
})
      if(debugMode)context.fillRect(this.sword.x,this.sword.y,this.sword.w,this.sword.h)
    }else{
      sword:{};
    }
    context.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch);

    if (debugMode) {
      context.rect(cx, cy, cw, ch);

      context.stroke();
    }
  },
};

//fetch
fetch("./map3.json")
  .then((response) => response.json())
  .then((data) => {
    map = data;
 
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
      "../images/tools.png",
      "../images/LADDER.png",
    ];
    const images= {
        tools:4,
    }
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
              type:obj.name,
            });
            
          }
          if (obj.name === "slope" || obj.name==="ladder") {
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
              type:obj.name,
            });
          }
          if (obj.name === "enemy") {
            let x, y;
            x = obj.x / Scale;
            y = obj.y / Scale;
            Enemys.push(new Enemy(x, y, 130 / Scale, 120 / Scale));
            
          }
       if(obj.name==='pendulum'){
        let x, y,length,radius;
        x = obj.x / Scale;
        y = obj.y / Scale;
        
      obj.properties.forEach(e=>{
        if(e.name==="length"){
          length=e.value;
          
        }
        if(e.name==='radius'){
          radius=e.value;
        }
      })
        length=length/scale;
        radius=radius/scale;
 
 
        Pendulums.push(new Pendulum(x,y,radius,length))
    
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
 
    const deviceType = detectDevice();

    function animate() {
      context.clearRect(0, 0, canvas.width, canvas.height);      
      frameCount++; //used for skipping frames for delay max 5 sec
      if (frameCount >= 600) frameCount = 0; //max to 5 sec delay


switch(screen){
  case 1:screen1();
    break;
    case 2:home();
    break;
}

      requestAnimationFrame(animate);
    }




    function screen1(){
  
      context.globalAlpha = 1;
    
      // Draw Map Layers
    
     drawMap(layers,camera,tilesets);
    player.move();
    
      //cameralogic Enemys Walls
      if (
        (player.vx > 0 &&
          player.x > canvas.width / 2 &&
          camera.x <= camera.width) ||
        (player.vx < 0 && player.x < canvas.width / 2 && camera.x >= 0)
      ) {
        moveCamera.x=true;
        camera.x += player.vx;
        Enemys.forEach(e=>{
          e.x-=player.vx;
        })
        walls.forEach(w=>{
          w.x-=player.vx;
        })
        Pendulums.forEach(p=>{
          p.origin.x-=player.vx;
    
        })
      } else {
        moveCamera.x=false;
        player.x += player.vx;
      }
    
      if (
        (player.vy > 0 &&
          player.y > canvas.height / 2 &&
          camera.y <= camera.height) ||
        (player.vy < 0 && player.y < canvas.height / 2 && camera.y >= -tileSize)
      ) {
        camera.y += player.vy;
        moveCamera.y=true;
        Enemys.forEach(e=>{
          e.y-=player.vy;
        })
        walls.forEach(w=>{
          w.y-=player.vy;
        })
        Pendulums.forEach(p=>{
          p.origin.y-=player.vy;
          
        })
      } else {
        player.y += player.vy;
        moveCamera.y=false;
      }
    
    
    
      //Collisions
      player.colSide = { left: false, right: false, top: false, bottom: false };
    
      // DrawWalls wallcollision and Check Collisions
    
      walls.forEach((wall) => {
     
      
         let col='none';
    
         //player wall collision
       context.fillStyle='green'
         context.globalAlpha=.7;    
        if(player.y<wall.y-player.h+30 && wall.type==='platform'&& wall.y<player.y-player.h+200){
          col = collision2Rect(player, wall);
      
        player.colSide[col] = true;
      if(debugMode)  context.fillRect(wall.x,wall.y,wall.w,wall.h)
        }else if( wall.type==="wall"){
         
         col = collision2Rect(player, wall);
      
        player.colSide[col] = true;
      if(debugMode)  context.fillRect(wall.x,wall.y,wall.w,wall.h)
      }else if(player.x>wall.x-100 
      && player.x<wall.x+100
      && player.y>wall.y-150
      && player.y<wall.y+150
      && wall.type==="barrel"){
               col=collision2Rect(player,wall);
               player.colSide[col]=true;
               if(debugMode)  context.fillRect(wall.x,wall.y,wall.w,wall.h)
      
      }
      context.globalAlpha=1; 
     // player.collision(wall);
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
          type:line.type,
        };
     
        // Check for collision with the updated line coordinates
        if (lineCollision(temp, player)) {
        if(line.type==="slope"){
          onSlope = true;
          player.onGround = true;
          player.vy = 0;

        }else{
          onSlope = true;
         player.onLadder=true;
          player.onGround = true;
          player.vy = 0;
player.framey=22;
        }
          
        }else{
          player.onLadder=false;
        }
      });
    
      // Update player status based on slope detection
      if (!onSlope) {
        player.a = 1;
    player.onLadder=false;
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
    
      //player heal
      player.action(Enemys);
    
      Enemys.forEach((enemy,i) => {
       
    
        ////enemy states and logic enemy states attack player when enemy is close to 70 and 100 in y axis
        if (
          Math.abs(enemy.x  - player.x) < 200 &&
          Math.abs(enemy.y  - player.y) < 10
        ) {
          const randomAttackL = [
            enemy.state.attackLowL,
            enemy.state.attackMidL,
            enemy.state.atackTopL,
          ];
          const randomAttackR = [
            enemy.state.attackLowR,
            enemy.state.attackMidR,
            enemy.state.atackTopR,
          ];
          if (enemy.x - player.x > 0) {
            //enemy is in right positon to player attack left
       enemy.vx=-2.5
            if (frameCount % 10 === 0)
              enemy.framey =
                randomAttackL[Math.floor(Math.random() * randomAttackL.length)];
          } else if(enemy.x-player.x<0){
            enemy.vx=2.5;
            if (frameCount % 10 === 0)
              enemy.framey =
                randomAttackR[Math.floor(Math.random() * randomAttackR.length)];
          }
          enemy.attack = true;
        } else if (enemy.visible) {
          enemy.attack = false;
          if (enemy.vx > 0) {
            enemy.framey = enemy.state.runR;
          } else if (enemy.vx < 0) {
            enemy.framey = enemy.state.runL;
          }
        } else {
          enemy.attack = false;
        }
    
        //enemy player collision
        let playerEnemyCol;
        if (enemy.visible && !player.dead) {
          playerEnemyCol = collision2Rect(player, enemy);
          if (playerEnemyCol !== "none") {
            //if(player is collided with enemy reduce the health by -10 of player)
            if (playerEnemyCol === "left" || playerEnemyCol === "right") {
              enemy.damageRate = 5;
              player.blink = true;
    
              if (frameCount % 10 === 0 && enemy.attack) {
                player.health -= enemy.damage;
              }
            } else if (playerEnemyCol === "bottom") {
              let friction=.99
              player.vy *= -0.5;
             
              player.x+=enemy.vx*friction;
              player.onGround=true;
             if(enemy.health>0) {enemy.health-=10;}
              else{enemy.dead=true;}
            }
    
            //if player is below health 100 reset the player
          }
        }
    
      
        //draw player health bar
        if (player.health) {
          context.fillStyle = "red";
         if(player.blink) context.fillRect(player.x - 50, player.y - 25, player.health, 4);
         if(player.blink) context.fillText(`${player.health}`,player.x - player.w/2, player.y - 28)
          if(player.blink)context.rect(player.x - 51, player.y-25, 103, 5);
          context.stroke();
        } else if(player.health<=0){
          // player.health = 100;
          // player.x = 100;
          player.dead=true;
        }
    
        if(player.frameCount%60===0 || frameCount%60===0){
          enemy.blink=false;
        }
        if(enemy.health<0)enemy.dead=true;
      });
    
      //blink the player for 1 sec
      if (frameCount % 60 === 0) {
        player.blink = false; 
      }
      if(player.frameCount%60===0){player.blink=false}
    
    
      if (debugMode)
    
        Line.forEach((l) => {
    
          context.strokeStyle = "white";
         context.lineWidth = 2; // Line thickness
         context.strokeStyle = 'blue'; // Line color
    
         
         
          context.beginPath();
          context.moveTo(l.startx - camera.x, l.starty - camera.y);
          context.lineTo(l.endx - camera.x, l.endy - camera.y);
          context.stroke();
        });
      context.beginPath();
      context.moveTo(0, 0);
    
      Enemys.forEach((e) => {
    
        e.colSide = { top: false, bottom: false, left: false, right: false };
      });
    
      Enemys.forEach((e, i) => {
        e.id = i;
        context.fillStyle = "black";
    
        context.font = "16px sans-serif";
    //enemy wall collision
        if (debugMode)
          context.fillText(`${e.id}`, e.x - 10 - camera.x, e.y - 10 - camera.y);
        let side="none"
        walls.forEach((w) => {
    
          if(e.y<w.y+200 && e.y<w.y+200 && w.type==="platform")side = collision2Rect(e, w);
      else if(w.type==="barrel")side=collision2Rect(e,w);
    
          if (side !== "none") {
    
            e.colSide[side] = true;
            if (e.colSide.bottom) {
              //get wall in enemy if collision is bottom
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
        } else {
          if (
            (e.wall && e.x > e.wall.x + e.wall.w - e.w) ||
            (e.wall && e.x < e.wall.x)
          ) {
            e.x=e.wall && e.x < e.wall.x?e.wall.x:e.wall.x+e.wall.w-e.w
            e.vx = -e.vx;
          }
        }
        e.x += e.vx;
      });
    
      Enemys = Enemys.filter((e) => e.delete !== true);
    //render
    
    
    
    
      Enemys.forEach((e, i) => {
        e.draw(tilesets[3].img, camera);
        e.drawHealthBar();
      });
    //   Monsters.forEach(monster=>{
    //      if(moveCamera.x){
    //       monster.x-=player.vx
    //      }
    //      if(moveCamera.y){
    //       monster.y-=player.vy;
    //      }
    //      monster.vy+=.2;
    //      monster.y+=vy;
    //  let side='none'
    //      walls.forEach(wall=>{
    //      monsside= collision2Rect(wall,monster)
    //      })
        
    
    //   context.fillRect(monster.x,monster.y,monster.w,monster.h)
    
    
    // })
      player.draw(tilesets[2].img);
      context.globalAlpha = 1; // Reset global alpha to avoid affecting subsequent drawings
    
      //collision between enemy and platform cel
      // debug(camera);
      // context.globalAlpha=.01;
      // context.fillStyle='blue'
      // context.fillRect(0,0,canvas.width,canvas.height)
      if (deviceType !== "Desktop") {
        console.log(controller.leftAnalog.dx);
        controller.draw();
      }
      context.fillStyle = "black";
     if(debugMode) context.fillText(`${player.inventory.life}`, 33, 33);
    
    //pendulum
    
    Pendulums.forEach(pendulum=>{
    
    let col=0;
    if(pendulum.origin.x<=canvas.width && pendulum.origin.x>=0){
    pendulum.update();
    col= pendulum.isCollidingWithRect(player)
    pendulum.draw(context,tilesets[images.tools].img);
  
    if(col){
    if(frameCount%4===0){player.health-=10}
    player.blink=true;
    if (player.health) {
    context.fillStyle = "red";
    if(player.blink) context.fillRect(player.x - 50, player.y - 25, player.health, 4);
    if(player.blink) context.fillText(`${player.health}`,player.x - player.w/2, player.y - 28)
    if(player.blink)context.rect(player.x - 51, player.y-25, 103, 5);
    context.stroke();
    } else if(player.health<=0){
    // player.health = 100;
    // player.x = 100;
    player.dead=true;
    }
    }else{
    player.blink=false;
    }
  }
    })
    }
    




    // Controller setup
    if (deviceType === "Desktop") {
      addEventListener("keydown", (e) => {
        if (keyEnabled) keys[e.key] = true;
      });
      addEventListener("keyup", (e) => {
        if (keyEnabled) keys[e.key] = false;
      });
    }
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
  if (debugMode)
    context.fillText(
      `e.colSide['bottom]:${Enemys[i].colSide.bottom}e.vy:${Enemys[i].y}`,
      Enemys[i].x,
      200
    );
}
function debugWall(walls) {
  context.font = "16px sans-serif";

  context.fillStyle = `rgba(0,222,0,.3)`;
 walls.forEach((w) => {
    context.fillRect(w.x, w.y, w.w, w.h);
  });
}
function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for mobile devices
  if (/android/i.test(userAgent)) {
    return "Android";
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  } else if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  } else if (/mobile/i.test(userAgent)) {
    return "Generic Mobile";
  }

  // If no mobile device is detected, assume desktop
  return "Desktop";
}
function drawMap(layers,camera,tilesets){
  layers.forEach((layer) => {
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

              if (layer.name === "background1" || layer.name === "objects")
                context.globalAlpha = 0.9;
              if (layer.name === "background") context.globalAlpha = 0.7;

              if (canvasX < canvas.width && canvasY < canvas.height)
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
              context.globalAlpha = 1;
            }
          });
        }
      });
    }
  });
}



async function fetchMap(mapUrl) {
  const response = await fetch(mapUrl);
  return await response.json();
}