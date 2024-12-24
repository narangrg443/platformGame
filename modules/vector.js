export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Method to calculate magnitude
    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    // In-place normalization to avoid creating a new object
    normalize() {
        const mag = this.magnitude();
        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }
        return this;  // Returning this allows chaining if needed
    }

    // Static method to get the unit vector as a new object
    static unitVector(x, y) {
        const mag = Math.sqrt(x ** 2 + y ** 2);
        if (mag === 0) return new Vector(0, 0);
        return new Vector(x / mag, y / mag);
    }

    // Dot product with another vector
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    // Method to get a string representation of the vector
    toString() {
        return `Vector(${this.x}, ${this.y})`;
    }

    // Draw method to render the vector on an HTML canvas
    draw(context, originX = 0, originY = 0, color = 'black') {
        context.beginPath();
        context.moveTo(originX, originY);         // Starting point (origin)
        context.lineTo(originX + this.x, originY + this.y); // Endpoint based on vector
        context.strokeStyle = color;              // Set color
        context.lineWidth = 2;                    // Set line width
        context.stroke();                         // Draw the line
        context.closePath();
    }
}
