import { Body } from '../index';

export class Rectangle extends Body {
  constructor(x, y, width, height) {
    super(x, y);
    this.size = {
      width,
      height,
    };
  }

  draw(ctx) {
    const { position: pos, size, render } = this;
    ctx.fillStyle = render.fillStyle;
    ctx.fillRect(pos.x, pos.y, size.width, size.height);
  }
}
