import { Bodies, Composite, Events, Constraint, Body } from 'matter-js';
import config, { ctx, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import { loadImage } from '../utils';
import Item from './item';

let image;

const labelMap = {
  1: 'SolidBlock',
  2: 'EarnedBlock',
  3: 'NormalBlock',
  4: 'QuestionBlock',
};

class Block {
  // 0: first block
  constructor(x, y, type = 3, itemType) {
    this.blockType = type;
    this.itemType = itemType;
    this.status = 0; // -1: used, 0: alive
    this.body = Bodies.rectangle(x, y, 16, 16, {
      label: labelMap[type],
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      render: { fillStyle: 'transparent' },
    });
    this.sling = Constraint.create({
      pointA: { x, y },
      bodyB: this.body,
      stiffness: 0.06,
    });

    worldItems.set(this.body, this);
    Composite.add(engine.world, [this.body, this.sling]);
  }

  hit() {
    const { blockType, itemType, body } = this;
    const { position: pos } = body;
    // mark used
    this.status = -1;
    // create item
    if (blockType === 4 && typeof itemType !== 'undefined') {
      const item = new Item(pos.x, pos.y, itemType);
      item.render();
      item.popOut();
      this.blockType = 2;
      Body.setStatic(body, true);
    }
  }

  async render() {
    const { body } = this;
    const { min } = render.bounds;
    image = image || await loadImage('/cdn/Tilesets/OverWorld.png');

    Events.on(render, 'afterRender', () => {
      const { blockType } = this;
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
