import { Bodies, Composite, Events, Constraint, Body, Vector } from 'matter-js';
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
  constructor(x, y, type = 3, itemType, coinNum = 1) {
    this.blockType = type;
    this.itemType = itemType;
    this.coinNum = coinNum;
    this.onHit = false;
    this.status = 'alive'; // used, alive, break

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

  break() {
    if (typeof this.itemType === 'undefined') {
      const tempPos1 = Vector.clone(this.body.position);
      const tempPos2 = Vector.clone(this.body.position);
      const tempPos3 = Vector.clone(this.body.position);
      const tempPos4 = Vector.clone(this.body.position);

      this.status = 'dead';
      window.transport.audio.break_block.play();
      worldItems.delete(this.body);
      Events.off(render, 'afterRender', this.drawCallback);
      Composite.remove(engine.world, [this.roof, this.body, this.sling]);

      const { min } = render.bounds;
      const drawParts = () => {
        ctx.drawImage(
          loader.assets.overworld,
          16,17,16,16,
          tempPos1.x-8-min.x,tempPos1.y-8-min.y,16,16,
        );
        ctx.drawImage(
          loader.assets.overworld,
          0,17,16,16,
          tempPos2.x-8-min.x,tempPos2.y-8-min.y,16,16,
        );
        ctx.drawImage(
          loader.assets.overworld,
          0,17,16,16,
          tempPos3.x-8-min.x,tempPos3.y-8-min.y,16,16,
        );
        ctx.drawImage(
          loader.assets.overworld,
          16,17,16,16,
          tempPos4.x-8-min.x,tempPos4.y-8-min.y,16,16,
        );
        tempPos1.x += 0.8;
        tempPos1.y += -0.8;
        tempPos2.x -= 0.8;
        tempPos2.y += -0.8;
        tempPos3.x += 0.8;
        tempPos3.y += 0.8;
        tempPos4.x += -0.8;
        tempPos4.y += 0.8;
      };
      Events.on(render, 'afterRender', drawParts);

      setTimeout(() => {
        Events.off(render, 'afterRender', drawParts);
      }, 350);
    }
  }

  hit() {
    let { blockType, itemType, coinNum, body } = this;
    const { position: pos } = body;
    this.onHit = true;
    setTimeout(() => {
      this.onHit = false;
    }, 300);
    // mark used
    if (itemType !== 'coin' || coinNum === 0) {
      this.status = 'used';
    } else {
      this.coinNum -= 1;
    }
    window.transport.audio.bump.play();
    // create item
    if (typeof itemType !== 'undefined') {
      let item = itemType === 'coin'
        ? new Coin(pos.x, pos.y - 16)
        : new Item(pos.x, pos.y, itemType);
      item.render();
      item.popOut();
      if (itemType !== 'coin' || this.coinNum === 0) {
        this.blockType = 2;
        setTimeout(() => {
          Body.setStatic(body, true);
        }, 800);
      }
    }
  }

  async render() {
    const { body } = this;
    const { min } = render.bounds;
    const { assets } = loader;
    const image = assets.overworld;

    this.drawCallback = () => {
      const { blockType } = this;
      const { position: pos } = body;
      ctx.drawImage(
        image,
        blockType*16,0,16,16,
        pos.x-8-min.x,pos.y-8-min.y,16,16,
      );
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Block;
