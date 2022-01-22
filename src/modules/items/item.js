import { Bodies, Body, Composite, Events } from 'matter-js';
import config, { ctx, loader, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';

const labelMap = {
  0: 'GrowMushroom',
  1: 'LifeMushroom',
  2: 'Flower',
  3: 'Star',
};

class Item {
  // 0: first item
  constructor(x, y, type = 0) {
    this.itemType = type;
    this.status = 'alive'; // -1: dead, 0: alive
    this.direction = 'back'; // front, back
    this.drawCallback = null;
    this.popping = false;
    this.labelType = labelMap[type];

    this.body = Bodies.circle(x, y, 8, {
      label: labelMap[type],
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      density: 1,
      render: { fillStyle: 'transparent' },
    });

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  popOut() {
    this.popping = true;
    window.transport.audio.powerup_spawn.play();
    Body.setStatic(this.body, true);
    let count = 0;
    let f;
    const s = () => {
      count++;
      Body.translate(this.body, { x: 0, y: -1 });
      if (count >= 32) {
        this.popping = false;
        cancelAnimationFrame(f);
        this.body.collisionFilter.group = 0;
        Body.setStatic(this.body, false);
      } else {
        f = requestAnimationFrame(s);
      }
    };
    f = requestAnimationFrame(s);
  }

  die() {
    this.status = 'dead';
    worldItems.delete(this.body);
    Events.off(render, 'afterRender', this.drawCallback);
    Composite.remove(engine.world, this.body);
  }

  changeDirection() {
    this.direction = this.direction === 'front' ? 'back' : 'front';
  }

  alive() {
    const { body, itemType } = this;
    const { min } = render.bounds;
    const { position: pos } = body;
    const image = loader.assets.items;

    if (Math.abs(this.body.velocity.x) < 0.2) {
      this.changeDirection();
    }

    ctx.drawImage(
      image,
      itemType*16,0,16,16,
      pos.x-8-min.x,pos.y-8-min.y,16,16,
    );

    if (typeof this[`draw${this.labelType}`] === 'function') {
      this[`draw${this.labelType}`]();
    }
  }

  drawGrowMushroom() {
    const { direction, popping } = this;
    if (!popping) {
      Body.setVelocity(this.body, {
        x: direction === 'front' ? 1 : -1,
        y: this.body.velocity.y,
      });
    }
  }

  drawLifeMushroom() {
    const { direction, popping } = this;
    if (!popping) {
      Body.setVelocity(this.body, {
        x: direction === 'front' ? 1 : -1,
        y: this.body.velocity.y,
      });
    }
  }

  drawFlower() {}

  drawStar() {
    const { direction, popping } = this;
    if (!popping) {
      Body.setVelocity(this.body, {
        x: direction === 'front' ? 1 : -1,
        y: this.body.velocity.y,
      });
      if (this.body.position.y >= config.height - 40) {
        Body.setVelocity(this.body, {
          x: this.body.velocity.x,
          y: -6,
        });
      }
    }
  }

  async render() {
    this.drawCallback = () => {
      if (typeof this[this.status] === 'function') {
        this[this.status]();
      }
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Item;
