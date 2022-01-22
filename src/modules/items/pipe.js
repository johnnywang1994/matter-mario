import { Bodies, Composite, Events, Body } from 'matter-js';
import config, { ctx, loader, idItems, worldItems } from '../../config';
import engine from '../engine';
import render from '../render';
import { createSpriteAnimation } from '../utils';

class Pipe {
  constructor(x, y, bodyRow = 1, hasFlower = false) {
    this.bodyRow = bodyRow;

    this.flowerDirection = 'up';
    this.flowerStatus = hasFlower ? 'alive' : ''; // alive, dead
    this.flower = hasFlower ? Bodies.rectangle(x,y,20,32,{
      label: 'PipeFlower',
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      isStatic: true,
      isSensor: true,
      render: { fillStyle: 'transparent' },
    }) : null;
    if (hasFlower) {
      worldItems.set(this.flower, this); // flower point to pipe
      Composite.add(engine.world, this.flower);
    }

    this.body = Bodies.rectangle(x,y,32,16+16*bodyRow,{
      isStatic: true,
      collisionFilter: {
        group: config.group.block,
        category: config.category.default,
        mask: config.category.default,
      },
      render: { fillStyle: 'transparent' },
    });
    Composite.add(engine.world, this.body);

    this.drawCallback = null;
    this.animation = {};
  }

  die() {
    window.transport.audio.stomp.play();
    this.flowerStatus = 'dead';
    Body.setStatic(this.flower, true);
    this.body.isSensor = true;
    setTimeout(() => {
      worldItems.delete(this.flower);
      Composite.remove(engine.world, this.flower);
    }, 500);
  }

  alive() {
    const { position: pos } = this.flower;
    const { position: playerPos } = idItems.player.body;
    if (pos.y <= config.height - 90) {
      this.flowerDirection = 'down';
    } else if (pos.y > config.height - 44) {
      this.flowerDirection = 'up';
    }
    if (playerPos.y < pos.y && playerPos.x > pos.x-16 && playerPos.x < pos.x+16) {
    } else {
      Body.translate(this.flower, {
        x: 0,
        y: this.flowerDirection === 'up' ? -0.5 : 0.5,
      });
    }
    this.animation.flowerAlive.play();
    this.animation.flowerAlive.loop();
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
    this.image = loader.assets.enemy;

    if (this.flower) {
      this.animation.flowerAlive = createSpriteAnimation({
        ctx,
        image: this.image,
        render,
        source: { size: [32,32] },
        target: { size: [32,32] },
        offset: { x: -18, y: -23 },
        body: this.flower,
        frames: [7, 8],
        rate: 0.25,
      });
    }

    this.drawCallback = () => {
      if (typeof this[this.flowerStatus] === 'function') {
        this[this.flowerStatus]();
      }
      this.static();
    }
    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Pipe;
