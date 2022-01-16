import { Events, Body, Bodies, Composite, Bounds, Collision } from 'matter-js';
import engine from '../engine';
import render from '../render';
import config, { ctx } from '../../config';
import { loadImage, createSpriteAnimation } from '../utils';

class Player {
  constructor() {
    this.image = '';
    this.reverse_image = '';
    this.vel = {
      x: 0,
      y: 0,
    };
    this.movingFrame = null;
    this.moving = false;
    this.jumping = false;
    this.body = Bodies.circle(50,config.height - 100,10,{
      collisionFilter: {
        category: config.category.default,
        mask: config.category.default,
      },
      friction: 0.001,
      render: { fillStyle: 'transparent' },
    });

    this.animation = {};

    Composite.add(engine.world, this.body);
  }

  drawFrame() {
    if (this.jumping) {
      this.animation.jump.loop();
    } else {
      this.animation.move.loop();
    }
  }

  checkBounds() {
    const { vel } = this;
    const { position } = this.body;
    const { min } = render.bounds;
    if (position.x > min.x+config.width * 1 / 2 && vel.x > 0) {
      Bounds.translate(render.bounds, {
        x: vel.x,
        y: 0,
      });
    } else if (position.x < min.x+config.width * 1 / 2 && vel.x < 0) {
      Bounds.translate(render.bounds, {
        x: vel.x,
        y: 0,
      });
    }
  }

  listener(ground) {
    const { vel, body } = this;
    let accX = 0.4;

    document.addEventListener('keydown', ({ keyCode }) => {
      console.log(keyCode);
      if (keyCode === 39 || keyCode === 37) {
        if (this.moving) return;
        // move animation
        const step = () => {
          vel.x += keyCode === 39 ? accX : -accX;
          vel.x = keyCode === 39
            ? Math.min(3, vel.x)
            : Math.max(-3, vel.x);
          Body.setVelocity(body, {
            x: vel.x,
            y: body.velocity.y,
          });
          this.animation.move.next();
          // stop when keyup
          if (!this.moving) return;
          requestAnimationFrame(step);
        };
        this.moving = true;
        this.movingFrame = requestAnimationFrame(step);
      } else if (keyCode === 38 && !this.jumping) {
        this.jumping = true;
        Body.setVelocity(this.body, {
          x: this.body.velocity.x,
          y: -6,
        });
      }
    });

    document.addEventListener('keyup', ({ keyCode }) => {
      if (this.moving && keyCode === 39 || keyCode === 37) {
        cancelAnimationFrame(this.movingFrame);
        this.moving = false;
      }
      vel.x = 0;
    })

    Events.on(engine, 'collisionActive', (event) => {
      const targetBody = ground.body;
      const playerBody = this.body;
      if (this.jumping && Collision.collides(targetBody, playerBody)) {
        this.jumping = false;
        this.frameId = 0;
      }
    });
  }

  async render() {
    const self = this;
    self.image = await loadImage('/cdn/Characters/Mario.png');
    self.reverse_image = await loadImage('/cdn/Characters/Mario_reverse.png');

    self.animation.move = createSpriteAnimation({
      ctx,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      render,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -26 },
      body: self.body,
      frames: [0, 3],
      rate: 0.25,
    });

    self.animation.jump = createSpriteAnimation({
      ctx,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      render,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -26 },
      body: self.body,
      frames: [5],
      rate: 1,
    })

    Events.on(render, 'afterRender', (event) => {
      self.drawFrame();
      self.checkBounds();
    });
  }
}

export default Player;
