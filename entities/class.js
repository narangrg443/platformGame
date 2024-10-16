class Box {
  constructor(rect) {
    this.x = mathRound(rect.x);

    this.y = mathRound(rect.y);
    if (rect.width && rect.height) {
      this.w = mathRound(rect.width);
      this.h = mathRound(rect.height);
    } else {
      this.w = 100;
      this.h = 100;
    }
    this.visible = true;
  }
}
//PLAYER

class Player extends Box {
  constructor(rect) {
    super(rect);

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      fire: false,
    };
    this.jumpForce = -10;
    this.gravity = 0.2;
    this.speed = 5;
    this.fireRate = 10;
  }
  draw() {
    context.fillStyle = "blue";
    context.fillRect(this.x, this.y, this.w, this.h);
  }
  jump() {
    //jump
    if (this.keys.up && this.onGround) {
      this.onGround = false;
      this.vy = this.jumpForce;
    } else if (!this.onGround) {
      this.vy += this.gravity;
      this.y += this.vy;
    }
  }
  move() {

  if(this.keys.up){this.y-=this.speed;}
  if(this.keys.left)this.x-=this.speed;
  if(this.keys.right)this.x+=this.speed;
  if(this.keys.down)this.y+=this.speed;
  }

  update() {
    this.move();
    if (this.visible) this.draw();
  }

  controllerEvent() {
  
    document.addEventListener("keydown", (e) => {

      e.preventDefault();
      switch (e.key) {
        case "ArrowUp":
          this.keys.up = true;
          break;
        case "ArrowDown":
          this.keys.down = true;
          break;
        case "ArrowLeft":
          this.keys.left = true;
          break;
        case "ArrowRight":
          this.keys.right = true;
          break;
        case " ":
          this.keys.fire = true;
          break;
      }
    },{passive:false});

    document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowUp":
          this.keys.up = false;
          break;
        case "ArrowDown":
          this.keys.down = false;
          break;
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "ArrowRight":
          this.keys.right = false;
          break;
        case " ":
          this.keys.fire = false;
          break;
      }
    },{passive:false});
  }
}
//EMEMY
class Enemy extends Box {
  constructor(x, y, w, h) {
    super(x, y, w, h);
  }
  draw() {
    context.fillStyle = "red";
    context.fillRect(this.x, this.y, this.w, this.h);
  }
  move() {
    this.x += this.vx;
  }
  update() {
    this.move();
    if (this.visible) this.draw();
  }
}
//WALL
class Wall extends Box {
  constructor(rect) {
    super(rect);
  }
  draw() {
    context.save();
    context.fillStyle = "black";
    context.globalAlpha = 0.5;
    context.restore();
  }
  update() {
    if (this.visible) this.draw();
  }
}
//PLATFORM
class Platform extends Box {
  constructor(rect) {
    super(rect);
    this.color = "green";
  }
  draw() {
    context.save();
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.h, this.w);
    context.restore();
    
  }
  update() {
    if (this.visible) this.draw();
  }
}
//POLYGON

class Polygon {
  constructor(poly) {
    this.x = mathRound(poly.x); // The polygon's origin point (x, y)
    this.y = mathRound(poly.y); // Usually where the polygon's base or reference point is
    this.points = poly.polygon.map((point) => ({
      x: mathRound(point.x) + this.x, // Translate points relative to the polygon's position
      y: mathRound(point.y) + this.y,
    }));
  }

  // Method to draw the polygon on a canvas
  draw(context) {
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.closePath();
    context.stroke();
  }

  // Get edges of the polygon for collision detection
  getEdges() {
    let edges = [];
    for (let i = 0; i < this.points.length; i++) {
      let p1 = this.points[i];
      let p2 = this.points[(i + 1) % this.points.length]; // Wrap around to the first point
      edges.push({ x: p2.x - p1.x, y: p2.y - p1.y });
    }
    return edges;
  }

  // Get the normal vectors (perpendicular to edges) for SAT
  getNormals() {
    return this.getEdges().map((edge) => ({ x: -edge.y, y: edge.x }));
  }

  // Project the polygon on an axis (for SAT)
  project(axis) {
    let min = this.points[0].x * axis.x + this.points[0].y * axis.y;
    let max = min;
    for (let i = 1; i < this.points.length; i++) {
      let projection = this.points[i].x * axis.x + this.points[i].y * axis.y;
      if (projection < min) min = projection;
      if (projection > max) max = projection;
    }
    return { min, max };
  }

  // Check for overlap between two projected polygons
  static isOverlapping(proj1, proj2) {
    return proj1.max >= proj2.min && proj2.max >= proj1.min;
  }

  // Check collision between a rectangle and the polygon using SAT
  collidesWithRect(rect) {
    // Get rectangle corners
    let rectPoints = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w, y: rect.y },
      { x: rect.x + rect.w, y: rect.y + rect.h },
      { x: rect.x, y: rect.y + rect.h },
    ];

    // Get rectangle edges
    let rectEdges = [
      {
        x: rectPoints[1].x - rectPoints[0].x,
        y: rectPoints[1].y - rectPoints[0].y,
      },
      {
        x: rectPoints[2].x - rectPoints[1].x,
        y: rectPoints[2].y - rectPoints[1].y,
      },
    ];

    // Get rectangle normals
    let rectNormals = rectEdges.map((edge) => ({ x: -edge.y, y: edge.x }));

    // Combine polygon and rectangle normals for SAT
    let axes = [...this.getNormals(), ...rectNormals];

    // Check for overlap on each axis
    for (let axis of axes) {
      let proj1 = this.project(axis); // Project polygon onto the axis
      let proj2 = Polygon.projectRectOnAxis(rectPoints, axis); // Project rectangle onto the axis

      if (!Polygon.isOverlapping(proj1, proj2)) {
        // No overlap means no collision
        return false;
      }
    }
    // If we didn't find a separating axis, there's a collision
    return true;
  }

  // Project a rectangle on an axis
  static projectRectOnAxis(rectPoints, axis) {
    let min = rectPoints[0].x * axis.x + rectPoints[0].y * axis.y;
    let max = min;
    for (let i = 1; i < rectPoints.length; i++) {
      let projection = rectPoints[i].x * axis.x + rectPoints[i].y * axis.y;
      if (projection < min) min = projection;
      if (projection > max) max = projection;
    }
    return { min, max };
  }
}

//  IMAGE LAYER

class ImageLayer extends Box {
  constructor(image, x, y, width, height, sx, sy, sw, sh) {
    super(x, y, width, height);
    this.image = image;
    this.sx = sx;
    this.sy = sy;
    this.sw = sw;
    this.sh = sh;
  }
  draw() {
    context.draw(
      this.image,
      this.x,
      this.y,
      this.w,
      this.h,
      this.sx,
      this.sy,
      this.sw,
      this.sh
    );
  }
}
