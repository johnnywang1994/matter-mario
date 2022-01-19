export const Collision = {
  detect(bodyA, bodyB) {
    const { position: posA, size: sizeA } = bodyA;
    const { position: posB, size: sizeB } = bodyB;
    if (
      posA.x < posB.x + sizeB.width &&
      posA.x + sizeA.width > posB.x &&
      posA.y < posB.y + sizeB.height &&
      posA.y + sizeA.height > posB.y
    ) {
      return true;
    }
    return false;
  },

  detectAt(vector, bodyB) {
    const { x, y } = vector;
    const { position: posB, size } = bodyB;
    if (
      x >= posB.x &&
      x <= posB.x + size.width &&
      y >= posB.y &&
      y <= posB.y + size.height
    ) {
      return true;
    }
    return false;
  },
};
