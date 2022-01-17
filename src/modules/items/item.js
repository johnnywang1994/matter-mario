import { Bodies, Composite, Events } from 'matter-js';
import config, { ctx, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import { loadImage } from '../utils';

let image;

const labelMap = {
  0: 'GrowMushroom',
};

class Item {
  // 0: first item
  constructor(x, y, type = 0) {
    this.itemType = type;
    this.status = 0; // -1: dead, 0: alive
    this.drawCallback = null;
    this.body = Bodies.circle(x, y, 8, {
      label: labelMap[type],
      collisionFilter: {
        category: config.category.default,
        mask: config.category.default,
      },
      render: { fillStyle: 'transparent' },
    });

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  die() {
    this.status = -1;
    worldItems.delete(this.body);
    Events.off(render, 'afterRender', this.drawCallback);
    Composite.remove(engine.world, this.body);
  }

  async render() {
    const { body, itemType } = this;
    const { min } = render.bounds;
    image = image || await loadImage('/cdn/Misc/Items.png');

    this.drawCallback = () => {
      const { position: pos } = body;
      ctx.drawImage(
        image,
        itemType*16,0,16,16,
        pos.x-8-min.x,pos.y-8-min.y,16,16,
      );
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Item;
