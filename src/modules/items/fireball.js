import { Events, Body, Bodies, Composite, Bounds, Common } from 'matter-js';
import engine from '../engine';
import render from '../render';
import config, { ctx, loader, idItems, worldItems } from '../../config';

let fireballCount = 0;

class Fireball {
  constructor(x, y, direction = 'front') {
    if (fireballCount > 2) return;
    this.status = 'moving'; // dead, moving
    this.direction = direction;
    this.body = Bodies.circle(x,y,3,{
      label: 'Fireball',
      collisionFilter: {
        group: config.group.fireball,
        category: config.category.default,
        mask: config.category.default,
      },
      density: 0.01,
      render: { fillStyle: 'red' },
    });

    fireballCount++;

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  changeDirection() {
    this.direction = this.direction === 'front' ? 'back' : 'front';
  }

  die() {
    fireballCount--;
    this.status = 'dead';
    worldItems.delete(this.body);
    Events.off(render, 'afterRender', this.drawCallback);
    Composite.remove(engine.world, this.body);
  }

  moving() {
    if (Math.abs(this.body.velocity.x) < 0.2) {
      this.changeDirection();
    }

    Body.setVelocity(this.body, {
      x: this.direction === 'front' ? -3.5 : 3.5,
      y: this.body.velocity.y,
    });
    if (this.body.velocity.y >= 0 && this.body.velocity.y < 0.05) {
      Body.setVelocity(this.body, {
        x: this.body.velocity.x,
        y: -2.4,
      });
    }
    const { position: pos } = this.body;
    const { min } = render.bounds;
    if (pos.x-min.x > config.width || pos.x-min.x < 0 || pos.y-min.y > config.height) {
      this.die();
    }
  }

  render() {
    this.drawCallback = () => {
      if (typeof this[this.status] === 'function') {
        this[this.status]();
      }
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Fireball;
