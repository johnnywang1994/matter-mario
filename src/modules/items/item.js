import { Bodies, Body, Composite, Events } from 'matter-js';
import config, { ctx, loader, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';

const labelMap = {
  0: 'GrowMushroom',
};

class Item {
  // 0: first item
  constructor(x, y, type = 0) {
    this.itemType = type;
    this.status = 0; // -1: dead, 0: alive
    this.drawCallback = null;
    this.popping = true;

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

  drawFrame() {
    const { body, itemType, popping } = this;
    const { min } = render.bounds;
    const { position: pos } = body;
    const image = loader.assets.items;

    ctx.drawImage(
      image,
      itemType*16,0,16,16,
      pos.x-8-min.x,pos.y-8-min.y,16,16,
    );
    if (!popping) {
      Body.setVelocity(this.body, {
        x: -0.6,
        y: this.body.velocity.y,
      });
    }
  }

  popOut() {
    Body.setStatic(this.body, true);
    let count = 0;
    let f;
    const s = () => {
      count++;
      Body.translate(this.body, { x: 0, y: -1 });
      if (count >= 32) {
        this.popping = false;
        cancelAnimationFrame(f);
        Body.setStatic(this.body, false);
      } else {
        f = requestAnimationFrame(s);
      }
    };
    f = requestAnimationFrame(s);
  }

  die() {
    this.status = -1;
    worldItems.delete(this.body);
    Events.off(render, 'afterRender', this.drawCallback);
    Composite.remove(engine.world, this.body);
  }

  async render() {
    this.drawCallback = () => this.drawFrame();

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Item;
