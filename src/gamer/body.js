export class Body {
  constructor(x, y, options = {}) {
    this.options = {
      render: {},
      ...options,
    };
    this.size = null;
    this.render = {
      fillStyle: 'yellow',
      ...options.render,
    };
    this.position = {
      x,
      y,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
  }

  setPosition(vector) {
    this.position = vector;
  }

  setVelocity(vector) {
    this.velocity = vector;
  }

  // predefined
  // eslint-disable-next-line
  draw(ctx) {}
}
