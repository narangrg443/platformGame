import Vector from '../modules/vector.js';
import collisionRectCircle  from '../modules/circleRect.js'
export default class Pendulum {
    constructor(x, y, r, l) {
        this.origin = new Vector(x, y); // Origin point of the pendulum
        this.radius = r;               // Radius of the pendulum bob
        this.length = l;               // Length of the pendulum string
        this.angle = Math.PI /3;      // Initial angle (45 degrees)
        this.angularVelocity = Math.random()*.1;      // Angular velocity
        this.angularAcceleration =0; // Angular acceleration
        this.damping = 1;              // Damping factor to simulate air resistance
        this.gravity = 0.5;   
      this.cx=0;
      this.cy=0;      // Gravity affecting the pendulum
    }
  
    update() {
   
      
        // Calculate angular acceleration based on gravity
        this.angularAcceleration = (-this.gravity / this.length) * Math.sin(this.angle);
  
        // Update angular velocity and angle
        this.angularVelocity += this.angularAcceleration;
        this.angularVelocity *= this.damping; // Apply damping
        this.angle += this.angularVelocity;
        this.cx = this.origin.x + this.length * Math.sin(this.angle);
        this.cy= this.origin.y + this.length * Math.cos(this.angle);
    }
  
    draw(ctx,img) {
        // Calculate the position of the pendulum bob
        const bobPosition = new Vector(
            this.origin.x + this.length * Math.sin(this.angle),
            this.origin.y + this.length * Math.cos(this.angle)
        );
  
        // Draw the string
        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);
        ctx.lineTo(bobPosition.x, bobPosition.y);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
  ctx.closePath();
  
        // Draw the pendulum bob
        // ctx.beginPath();
        // ctx.arc(bobPosition.x, bobPosition.y, this.radius, 0, Math.PI * 2);
        // ctx.fillStyle = "#3498db";
        // ctx.fill();
        // ctx.strokeStyle = "#000";
        // ctx.stroke();
      
  
        ctx.drawImage(img,0,0,100,100,bobPosition.x-this.radius,bobPosition.y-this.radius,this.radius*2,this.radius*2)
    }
  
    isCollidingWithRect(rect) {
        // Calculate the current position of the pendulum bob
        const bobX = this.origin.x + this.length * Math.sin(this.angle);
        const bobY = this.origin.y + this.length * Math.cos(this.angle);
     
        // Use the circle-rectangle collision detection function
        return collisionRectCircle(rect, { x: bobX, y: bobY, radius: this.radius });
    }
  }