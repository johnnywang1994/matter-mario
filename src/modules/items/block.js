import { Bodies, Composite, Events } from 'matter-js';
import config, { ctx } from '../../config';
import engine from '../engine';
import render from '../render';
import { loadImage } from '../utils';

let image;

class Block {
  // 0: first block
  constructor(x, y, type = 3) {
    this.blockType = type;
    this.body = Bodies.rectangle(x, y, 16, 16, {
      isStatic: true,
      collisionFilter: {
        category: config.category.default,
        mask: config.category.default,
      },
      render: {
        fillStyle: 'brown',
      },
    });

    Composite.add(engine.world, this.body);
  }

  async render() {
    const { body, blockType } = this;
    const { min } = render.bounds;
    image = image || await loadImage('/cdn/Tilesets/OverWorld.png');

    Events.on(render, 'afterRender', () => {
      const { position: pos } = body;
      ctx.drawImage(
        image,
        blockType*16,0,16,16,
        pos.x-8-min.x,pos.y-8-min.y,16,16,
      );
    })
  }
}

export default Block;
