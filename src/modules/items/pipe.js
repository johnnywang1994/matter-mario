import { Bodies, Composite, Events, Constraint, Body } from 'matter-js';
import config, { ctx, loader, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';

class Pipe {
  constructor(x, y, bodyRow = 1) {
    this.bodyRow = bodyRow;
    this.body = Bodies.rectangle(x,y,32,16+16*bodyRow,{
      isStatic: true,
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      render: { fillStyle: 'transparent' },
    });
    this.drawCallback = null;

    Composite.add(engine.world, this.body);
  }

  static() {
    const { bodyRow } = this;
    const { position: pos } = this.body;
    const { min } = render.bounds;
    const offset = 8 * (bodyRow + 1);
    // pipe top
    ctx.drawImage(
      loader.assets.overworld,
      96,0,32,16,
      pos.x-16-min.x,pos.y-offset-min.y,32,16
    );
    // pipe body
    for (let i = 1; i < bodyRow + 1; i++) {
      const bodyY = pos.y + 16 * i;
      ctx.drawImage(
        loader.assets.overworld,
        96,16,32,16,
        pos.x-16-min.x,bodyY-offset-min.y,32,16
      );
    }
  }

  render() {
    Events.on(render, 'afterRender', () => {
      this.static();
    });
  }
}

export default Pipe;
