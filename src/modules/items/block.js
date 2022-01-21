import { Bodies, Composite, Events, Constraint, Body } from 'matter-js';
import config, { ctx, loader, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import Item from './item';
import Coin from './coin';

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
    this.status = 'alive'; // -1: used, 0: alive

    // for mario stand on
    this.roof = Bodies.rectangle(x, y-6, 16, 5, {
      label: labelMap[2],
      isStatic: true,
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      render: { fillStyle: 'transparent' },
    });

    this.body = Bodies.rectangle(x, y, 16, 16, {
      label: labelMap[type],
      isStatic: type === 1,
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
      stiffness: 0.1,
    });

    worldItems.set(this.body, this);
    Composite.add(engine.world, [this.roof, this.body, this.sling]);
  }

  hit() {
    const { blockType, itemType, body } = this;
    const { position: pos } = body;
    // mark used
    this.status = 'used';
    // create item
    if (typeof itemType !== 'undefined') {
      let item = itemType === 'coin'
        ? new Coin(pos.x, pos.y - 16)
        : new Item(pos.x, pos.y, itemType);
      this.blockType = 2;
      item.render();
      item.popOut();
      setTimeout(() => {
        Body.setStatic(body, true);
      }, 500);
    }
  }

  async render() {
    const { body } = this;
    const { min } = render.bounds;
    const { assets } = loader;
    const image = assets.overworld;

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
