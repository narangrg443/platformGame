export default function collision2Rect(rect1, rect2, overlap = true) {
    // Calculate distances and half sizes
    const dx = rect1.x + rect1.w / 2 - (rect2.x + rect2.w / 2);
    const dy = rect1.y + rect1.h / 2 - (rect2.y + rect2.h / 2);
    const combinedHalfWidths = (rect1.w + rect2.w) / 2;
    const combinedHalfHeights = (rect1.h + rect2.h) / 2;
    
    // Calculate overlaps
    const overlapX = combinedHalfWidths - Math.abs(dx);
    const overlapY = combinedHalfHeights - Math.abs(dy);
    
    // Check if there’s a collision
    if (overlapX > 0 && overlapY > 0) {
        if (overlapX < overlapY) {
            if (dx > 0) { // Collision on the left
                if (overlap) rect1.x += overlapX;
                return "left";
            } else {      // Collision on the right
                if (overlap) rect1.x -= overlapX;
                return "right";
            }
        } else {
            if (dy > 0) { // Collision on the top
                if (overlap) rect1.y += overlapY;
                return "top";
            } else {      // Collision on the bottom
                if (overlap) rect1.y -= overlapY;
                return "bottom";
            }
        }
    }
    return "none"; // No collision
}
