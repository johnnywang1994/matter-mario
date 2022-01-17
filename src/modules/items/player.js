import { Events, Body, Bodies, Composite, Bounds, Collision } from 'matter-js';
import engine from '../engine';
import render from '../render';
import config, { ctx, worldItems } from '../../config';
import { loadImage, checkLabel, createSpriteAnimation } from '../utils';

class Player {
  constructor() {
    this.image = '';
    this.reverse_image = '';
    this.vel = {
      x: 0,
      y: 0,
    };
    this.status = 0; // -1: dead, 0: small, 1: big
    this.movingFrame = null;
    this.moving = false;
    this.jumping = false;
    this.growing = false;
    this.body = Bodies.rectangle(50,config.height - 100,20,20,{
      label: 'Mario',
      collisionFilter: {
        category: config.category.default,
        mask: config.category.default,
      },
      inertia: Infinity,
      friction: 0.0001,
      // render: { fillStyle: 'transparent' },
    });

    this.listeners = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
    };
    this.animation = {};

    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);
  }

  move(keyCode) {
    const { vel, body } = this;
    const accX = 0.4;
    const step = () => {
      // stop when keyup
      if (!this.moving) return;
      vel.x += keyCode === 39 ? accX : -accX;
      vel.x = keyCode === 39
        ? Math.min(3, vel.x)
        : Math.max(-3, vel.x);
      Body.setVelocity(body, {
        x: vel.x,
        y: body.velocity.y,
      });
      if (this.status === 0) {
        this.animation.move.play();
      } else if (this.status === 1) {
        this.animation.moveBig.play();
      }
      requestAnimationFrame(step);
    };
    this.moving = true;
    this.movingFrame = requestAnimationFrame(step);
  }

  stopMove() {
    Body.setVelocity(this.body, {x:0,y:0});
  }

  jump(space = -6.5) {
    this.jumping = true;
    Body.setVelocity(this.body, {
      x: this.body.velocity.x,
      y: space,
    });
  }

  die() {
    this.status = -1; // dead
    this.moving = false;
    this.vel = {x:0,y:0};
    this.removeListener();
    this.body.collisionFilter.mask = config.category.isolate;
    this.jump(-6);
  }

  drawFrame() {
    const { status, animation, jumping } = this;
    // dead
    if (status === -1) {
      animation.dead.loop();
    // small
    } else if (status === 0) {
      if (jumping) {
        animation.jump.loop();
      } else {
        animation.move.loop();
      }
    // big
    } else if (status === 1) {
      if (jumping) {
        animation.jumpBig.loop();
      } else {
        animation.moveBig.loop();
      }
    }
  }

  // move view bounds follow
  checkBounds() {
    const { vel } = this;
    const { position } = this.body;
    const { min, max } = render.bounds;
    if (vel.x < 0 && min.x < 0) {
      // no move
    } else if (vel.x > 0 && max.x > config.mapWidth) {
      // no move
    } else if (position.x > min.x+config.width * 1 / 2 && vel.x > 0) {
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

  onKeyDown({ keyCode }) {
    // console.log(keyCode);
    if (keyCode === 39 || keyCode === 37) {
      if (this.moving) return;
      this.move(keyCode);
    } else if (keyCode === 38 && !this.jumping) {
      this.jump();
    }
  }

  onKeyUp({ keyCode }) {
    if (this.moving && keyCode === 39 || keyCode === 37) {
      cancelAnimationFrame(this.movingFrame);
      this.moving = false;
      this.animation.move.reset();
      this.animation.moveBig.reset();
      this.vel.x = this.vel.x > 0 ? 0.01 : -0.01;
      if (!this.jumping) {
        this.stopMove();
      }
    }
  }

  removeListener() {
    document.removeEventListener('keydown', this.listeners.keydown);
    document.removeEventListener('keyup', this.listeners.keyup);
  }

  setListener(ground) {
    document.addEventListener('keydown', this.listeners.keydown);
    document.addEventListener('keyup', this.listeners.keyup);

    // Collision
    Events.on(engine, 'collisionActive', (event) => {
      const playerBody = this.body;

      if (this.jumping && playerBody.velocity.y === 0) {
        this.jumping = false;
        this.frameId = 0;
        this.stopMove();
      }

      event.pairs.forEach(({ bodyA, bodyB }) => {
        const labelA = bodyA.label;
        const labelB = bodyB.label;
        const hitMushroom = checkLabel(labelA, labelB, 'Mario', 'Mushroom');
        const hitGrowMushroom = checkLabel(labelA, labelB, 'Mario', 'GrowMushroom');
        if (hitMushroom && this.status >= 0) {
          let mario, mushroom;
          if (labelA === 'Mario') {
            mario = bodyA;
            mushroom = bodyB;
          } else {
            mario = bodyB;
            mushroom = bodyA;
          }
          // mario ontop of mushroom
          const targetMushroom = worldItems.get(mushroom);
          if (targetMushroom.status === 0) {
            if (mario.position.y < mushroom.position.y - 10) {
              targetMushroom.die();
              Body.setStatic(mushroom, true);
              this.jump(-4);
            } else {
              this.die();
            }
          }
        }

        if (hitGrowMushroom && this.status === 0 && !this.growing) {
          let f;
          let count = 0;
          const growMushroom = worldItems.get(
            labelA === 'GrowMushroom' ? bodyA : bodyB
          );

          growMushroom.die();
          Body.setStatic(this.body, true);
          this.growing = true;

          const s = () => {
            count++;
            if (count % 8 === 0) {
              this.status = this.status === 1 ? 0 : 1;
            }
            f = requestAnimationFrame(s);
          };
          f = requestAnimationFrame(s);

          setTimeout(() => {
            cancelAnimationFrame(f);
            this.status = 1;
            Body.scale(this.body, 1, 1.7);
            Body.setInertia(this.body, Infinity);
            Body.setStatic(this.body, false);
            this.jump(-4);
          }, 1000);
        }
      });
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
    });

    self.animation.dead = createSpriteAnimation({
      ctx,
      image: self.image,
      render,
      source: { size: [32, 32] },
      target: { size: [36, 36] },
      offset: { x: -18, y: -26 },
      body: self.body,
      frames: [6],
      rate: 1,
    });

    self.animation.moveBig = createSpriteAnimation({
      ctx,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      render,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -18 },
      body: self.body,
      frames: [8, 11],
      rate: 0.25,
    });

    self.animation.jumpBig = createSpriteAnimation({
      ctx,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      render,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -18 },
      body: self.body,
      frames: [13],
      rate: 1,
    });

    Events.on(render, 'afterRender', (event) => {
      self.drawFrame();
      self.checkBounds();
    });
  }
}

export default Player;
