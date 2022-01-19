import { Events, Body, Bodies, Composite } from 'matter-js';
import engine from '../engine';
import render from '../render';
import { createSpriteAnimation } from '../utils';
import config, { ctx, loader, worldItems } from '../../config';

class Mushroom {
  constructor(x, y) {
    this.image = '';
    this.vel = {
      x: 0,
      y: 0,
    };
    this.status = 0; // -1: dead, 0: alive
    this.drawCallback = null;

    this.body = Bodies.circle(x, y, 10, {
      label: 'Mushroom',
      collisionFilter: {
        group: config.group.enemy,
        category: config.category.default,
        mask: config.category.default,
      },
      friction: 0.001,
      render: { fillStyle: 'transparent' },
    });

    this.animation = {};

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  die() {
    this.status = -1;
    setTimeout(() => {
      worldItems.delete(this.body);
      Events.off(render, 'afterRender', this.drawCallback);
      Composite.remove(engine.world, this.body);
    }, 500);
  }

  drawFrame() {
    if (this.status === -1) {
      this.animation.dead.loop();
    } else {
      this.animation.move.loop();
      this.animation.move.play();
      Body.setVelocity(this.body, {
        x: -0.3,
        y: this.body.velocity.y,
      });
    }
  }

  async render() {
    const self = this;
    self.image = loader.assets.enemy;

    self.animation.move = createSpriteAnimation({
      ctx,
      image: self.image,
      render,
      source: { size: [32,32] },
      target: { size: [32,32] },
      offset: { x: -18, y: -23 },
      body: self.body,
      frames: [0, 1],
      rate: 0.05,
    });

    self.animation.dead = createSpriteAnimation({
      ctx,
      image: self.image,
      render,
      source: { size: [32,32] },
      target: { size: [32,32] },
      offset: { x: -18, y: -23 },
      body: self.body,
      frames: [2],
      rate: 1,
    });

    this.drawCallback = () => self.drawFrame();

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Mushroom;
