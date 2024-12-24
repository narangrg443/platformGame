/**
 * Checks for collision between a rectangle and a circle.
 * @param {Object} rect - The rectangle object with x, y, w, and height.
 * @param {Object} circle - The circle object with x, y (center coordinates), and r.
 * @returns {boolean} - Returns true if the circle and rectangle overlap, false otherwise.
 */

export default function collisionRectCircle(rect, circle) {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));

    // Calculate the distance between the circle's center and this closest point
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    // Check if there is an overlap
    const distance = Math.sqrt(distanceSquared);

    // Check if there is an overlap
    if (distance < circle.radius) {
        // Calculate the overlap distance
        const overlap = circle.radius - distance;

        // Normalize the displacement vector
        const displacementX = (dx / distance) * overlap;
        const displacementY = (dy / distance) * overlap;

        // Adjust rectangle position to resolve the collision
        rect.x -= displacementX;
        rect.y -= displacementY;
    }
    // If the distance is less than the circle's r, the rectangle and circle overlap
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}
