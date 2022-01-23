import { Events, Body, Bodies, Composite, Bounds, Common } from 'matter-js';
import engine from '../engine';
import { render } from '../render';
import config, { ctx, loader, idItems, worldItems } from '../../config';
import { checkLabel, createSpriteAnimation, isMobile } from '../utils';
import Fireball from './fireball';

const dom = (s) => document.querySelector(s);

class Player {
  constructor() {
    this.image = '';
    this.reverse_image = '';
    // use this vel for moving speed & frame front or back
    // since real velocity will become 0 when stop
    // which makes it hard to judge facing side
    this.vel = {
      x: 0,
      y: 0,
    };
    this.status = 'static'; // dead, down, moving, static
    this.playerSize = 'small'; // small, big, fire
    this.direction = 'front'; // front, back
    this.moveSpeed = 3;
    this.jumping = false;
    this.growing = false;
    this.ending = false; // touch end animate
    this.injuryMode = false; // injuried mode
    this.starMode = false; // eat star mode
    this.body = Bodies.rectangle(50,config.height - 100,20,20,{
      label: 'Mario',
      collisionFilter: {
        group: config.group.player,
        category: config.category.default,
        mask: config.category.default,
      },
      inertia: Infinity,
      density: 1,
      friction: 0.0001,
      render: { fillStyle: 'transparent' },
    });

    this.listeners = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
      touchjump: this.onTouchJump.bind(this),
      touchshoot: this.onTouchShoot.bind(this),
      touchleft: this.onTouchLeft.bind(this),
      touchleftend: this.onTouchLeftEnd.bind(this),
      touchright: this.onTouchRight.bind(this),
      touchrightend: this.onTouchRightEnd.bind(this),
    };
    this.animation = {};

    idItems.player = this;
    worldItems.set(this.body, this);
    Composite.add(engine.world, this.body);

    this.setListener();
  }

  stopMove() {
    Body.setVelocity(this.body, {x:0,y:0});
  }

  touchEnd() {
    console.log('ending!!!!');
    this.ending = true;
    this.removeListener();
    Body.setStatic(this.body, true);
    window.transport.audio.bgm.stop();
    window.transport.audio.level_complete.play();
    idItems.scene.stopCountDown();

    let frameTimer = null;
    const moveDown = () => {
      if (this.body.position.y >= config.height - 60) {
        cancelAnimationFrame(frameTimer);
        Body.setPosition(this.body, {
          x: this.body.position.x + 24,
          y: this.body.position.y,
        });
        this.direction = 'front';
        this.moveSpeed = 1;
        this.status = 'moving';
        Body.setStatic(this.body, false);
        setTimeout(() => {
          Events.off(render, 'afterRender', this.drawCallback);
          Composite.remove(engine.world, this.body);
          setTimeout(() => {
            window.transport.gameOver();
          }, 3000);
        }, 1200);
        return;
      }
      Body.translate(this.body, { x: 0, y: 2 });
      frameTimer = requestAnimationFrame(moveDown);
    };
    setTimeout(() => {
      frameTimer = requestAnimationFrame(moveDown);
    }, 1000);
  }

  jump(space = -6.5) {
    this.jumping = true;
    Body.setVelocity(this.body, {
      x: this.body.velocity.x,
      y: space,
    });
  }

  die() {
    this.status = 'dead'; // dead
    this.vel = {x:0,y:0};
    this.removeListener();
    this.body.collisionFilter.mask = config.category.isolate;
    Body.setStatic(this.body, true);
    window.transport.audio.bgm.stop();
    window.transport.audio.mario_death.play();
    setTimeout(() => {
      Body.setStatic(this.body, false);
      this.jump(-6);
      setTimeout(() => {
        const { transport } = window;
        transport.life--;
        transport.stopGame();
        if (transport.life > 0) {
          transport.initFrontPage();
        } else {
          transport.gameOver();
        }
      }, 2500);
    }, 600);
  }

  transform(playerSize = 'big') {
    let f;
    let count = 0;
    const currentSize = this.playerSize;

    Body.setStatic(this.body, true);
    this.injuryMode = true;
    this.growing = true;

    const s = () => {
      count++;
      if (count % 8 === 0) {
        this.playerSize = this.playerSize === playerSize
          ? currentSize
          : playerSize;
      }
      f = requestAnimationFrame(s);
    };
    f = requestAnimationFrame(s);

    setTimeout(() => {
      cancelAnimationFrame(f);
      this.growing = false;
      this.playerSize = playerSize;
      if (currentSize === 'small') {
        if (['big', 'fire'].includes(playerSize)) {
          Body.scale(this.body, 1, 1.7);
        }
      } else if (playerSize === 'small') {
        Body.scale(this.body, 1, 1/1.7);
      }
      // scale will brake inertia setting
      Body.setInertia(this.body, Infinity);
      Body.setStatic(this.body, false);
      this.jump(-4);
      setTimeout(() => {
        this.injuryMode = false;
      }, 1000);
    }, 1000);
  }

  fire() {
    const { direction } = this;
    const { position: pos } = this.body;
    const offset = direction === 'front' ? 16 : -16;
    new Fireball(pos.x + offset, pos.y, direction).render();
  }

  starFilter() {
    const filterList = ['hue-rotate(90deg)', 'contrast(1.5)', 'grayscale(70%)'];
    ctx.filter = filterList[Math.floor(Common.random(0, 3))];
  }

  transformSmaller() {
    if (this.playerSize === 'fire') {
      this.transform('big');
      window.transport.audio.powerdown.play();
    } else if (this.playerSize === 'big') {
      this.transform('small');
      window.transport.audio.powerdown.play();
    } else {
      this.die();
    }
  }

  dead() {
    this.animation.dead.loop();
  }

  down() {
    if (this.playerSize === 'small') {
      this.animation.move.loop();
    } else {
      this.animation.downBig.loop();
    }
  }

  moving() {
    const { vel, body, direction, animation, moveSpeed } = this;
    const accX = 0.4;
    vel.x += direction === 'front' ? accX : -accX;
    vel.x = direction === 'front'
      ? Math.min(moveSpeed, vel.x)
      : Math.max(-moveSpeed, vel.x);
    Body.setVelocity(body, {
      x: vel.x,
      y: body.velocity.y,
    });
    switch (this.playerSize) {
      case 'small':
        animation.move.play();
        break;
      case 'big':
        animation.moveBig.play();
        break;
      case 'fire':
        animation.moveFire.play();
        break;
    }
    // loop
    this.static();
  }

  static() {
    const { animation, jumping, playerSize } = this;
    ctx.save();
    if (this.starMode) {
      this.starFilter();
    }
    if (jumping) {
      switch (playerSize) {
        case 'small':
          animation.jump.loop();
          break;
        case 'big':
          animation.jumpBig.loop();
          break;
        case 'fire':
          animation.jumpFire.loop();
          break;
      }
    } else {
      switch (playerSize) {
        case 'small':
          animation.move.loop();
          break;
        case 'big':
          animation.moveBig.loop();
          break;
        case 'fire':
          animation.moveFire.loop();
          break;
      }
    }
    ctx.restore();
  }

  // move view bounds follow
  // here use real velocity to judge render bounds
  checkBounds() {
    const { position, velocity: vel } = this.body;
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

  onTouchJump(e) {
    e.preventDefault();
    this.onKeyDown.call(this, { keyCode: 38 });
  }

  onTouchShoot(e) {
    e.preventDefault();
    this.onKeyDown.call(this, { keyCode: 32 });
  }

  onTouchLeft(e) {
    e.preventDefault();
    this.onKeyDown.call(this, { keyCode: 37 });
  }

  onTouchLeftEnd(e) {
    e.preventDefault();
    this.onKeyUp.call(this, { keyCode: 37 });
  }

  onTouchRight(e) {
    e.preventDefault();
    this.onKeyDown.call(this, { keyCode: 39 });
  }

  onTouchRightEnd(e) {
    e.preventDefault();
    this.onKeyUp.call(this, { keyCode: 39 });
  }

  onKeyDown({ keyCode }) {
    // console.log(keyCode);
    // move
    if (keyCode === 39 || keyCode === 37) {
      if (this.status === 'moving') return;
      this.direction = keyCode === 39 ? 'front' : 'back';
      this.status = 'moving';
    // down
    } else if (keyCode === 40) {
      this.status = 'down';
    // jump
    } else if (keyCode === 38 && !this.jumping) {
      if (this.body.velocity.y > 0) return; // falling
      window.transport.audio.jump.play();
      this.jump();
    // fireball
    } else if (keyCode === 32 && this.playerSize === 'fire') {
      this.fire();
    }
  }

  onKeyUp({ keyCode }) {
    if (this.status === 'moving' && keyCode === 39 || keyCode === 37) {
      this.status = 'static';
      this.animation.move.reset();
      this.animation.moveBig.reset();
      this.animation.moveFire.reset();
      this.vel.x = this.vel.x > 0 ? 0.01 : -0.01;
      if (!this.jumping) {
        this.stopMove();
      }
    } else if (keyCode === 40) {
      this.status = 'static';
    }
  }

  removeListener() {
    document.removeEventListener('keydown', this.listeners.keydown);
    document.removeEventListener('keyup', this.listeners.keyup);
    dom('.btn-jump').removeEventListener('touchstart', this.listeners.touchjump);
    dom('.btn-shoot').removeEventListener('touchstart', this.listeners.touchshoot);
    dom('.btn-left').removeEventListener('touchstart', this.listeners.touchleft);
    dom('.btn-right').removeEventListener('touchstart', this.listeners.touchright);
    dom('.btn-left').removeEventListener('touchend', this.listeners.touchleftend);
    dom('.btn-right').removeEventListener('touchend', this.listeners.touchrightend);
  }

  setListener() {
    document.addEventListener('keydown', this.listeners.keydown);
    document.addEventListener('keyup', this.listeners.keyup);
    dom('.btn-jump').addEventListener('touchstart', this.listeners.touchjump, true);
    dom('.btn-shoot').addEventListener('touchstart', this.listeners.touchshoot, true);
    dom('.btn-left').addEventListener('touchstart', this.listeners.touchleft, true);
    dom('.btn-right').addEventListener('touchstart', this.listeners.touchright, true);
    dom('.btn-left').addEventListener('touchend', this.listeners.touchleftend, true);
    dom('.btn-right').addEventListener('touchend', this.listeners.touchrightend, true);

    // Collision
    Events.on(engine, 'collisionActive', (event) => {
      const playerBody = this.body;

      // jump falled
      if (this.jumping && playerBody.velocity.y === 0) {
        this.jumping = false;
        this.frameId = 0;
        this.stopMove();
      }

      event.pairs.forEach(({ bodyA, bodyB }) => {
        const groupA = bodyA.collisionFilter.group;
        const groupB = bodyB.collisionFilter.group;
        const labelA = bodyA.label;
        const labelB = bodyB.label;
        const hitEnemy = checkLabel(groupA, groupB, config.group.player, config.group.enemy);
        const hitPipeFlower = checkLabel(labelA, labelB, 'Mario', 'PipeFlower');
        const hitBlock = checkLabel(groupA, groupB, config.group.player, config.group.block);
        const hitGrowMushroom = checkLabel(labelA, labelB, 'Mario', 'GrowMushroom');
        const hitLifeMushroom = checkLabel(labelA, labelB, 'Mario', 'LifeMushroom')
        const hitFlower = checkLabel(labelA, labelB, 'Mario', 'Flower');
        const hitStar = checkLabel(labelA, labelB, 'Mario', 'Star');
        const hitCoin = checkLabel(labelA, labelB, 'Mario', 'Coin');
        const hitEndFlag = checkLabel(labelA, labelB, 'Mario', 'EndFlag');
        const fireballBeat = checkLabel(groupA, groupB, config.group.fireball, config.group.enemy);
        const turtleBeatMushroom = checkLabel(labelA, labelB, 'Mushroom', 'Turtle');

        // touch enemy
        if (hitEnemy && this.status !== 'dead') {
          let mario, enemy;
          if (groupA === config.group.player) {
            mario = bodyA;
            enemy = bodyB;
          } else {
            mario = bodyB;
            enemy = bodyA;
          }
          // mario ontop of mushroom
          const targetEnemy = worldItems.get(enemy);
          if (!this.injuryMode && targetEnemy.status === 'alive') {
            // star mode
            if (this.starMode) {
              targetEnemy.starBeat();
            } else if (mario.position.y < enemy.position.y - 10) {
              targetEnemy.die();
              this.jump(-3);
            } else {
              this.transformSmaller();
            }
          } else if (enemy.label === 'Turtle') {
            if (mario.position.y < enemy.position.y - 10) {
              if (targetEnemy.status === 'awake') {
                targetEnemy.die();
                this.jump(-3);
              } else if (targetEnemy.status === 'dead') {
                targetEnemy.fly();
                this.jump(-3);
              }
            } else if (targetEnemy.status === 'flow') {
              this.transformSmaller();
            }
          }
        }

        // touch pipe flower
        if (hitPipeFlower && this.status !== 'dead') {
          const pipe = worldItems.get(
            labelA === 'PipeFlower' ? bodyA : bodyB
          );
          if (pipe.flowerStatus !== 'dead') {
            if (this.starMode) {
              pipe.flowerDie();
            } else {
              this.transformSmaller();
            }
          }
        }

        // fireball hit enemy
        if (fireballBeat) {
          const fireball = worldItems.get(
            groupA === config.group.fireball ? bodyA : bodyB
          );
          const enemy = worldItems.get(
            groupA === config.group.enemy ? bodyA : bodyB
          );
          fireball.die();
          enemy.starBeat();
        }

        // turtle beat mushroom
        if (turtleBeatMushroom) {
          const mushroom = worldItems.get(
            labelA === 'Mushroom' ? bodyA : bodyB
          );
          mushroom.starBeat();
        }

        // touch block from bottom
        if (hitBlock) {
          const block = groupA === config.group.block ? bodyA : bodyB
          const playerPos = this.body.position;
          // right below block
          if (playerPos.y > block.position.y + 16 && playerPos.x > block.position.x-8 && playerPos.x < block.position.x+8) {
            const targetBlock = worldItems.get(block);
            if (targetBlock && targetBlock.status === 'alive') {
              if (typeof targetBlock.itemType !== 'undefined') {
                !targetBlock.onHit && targetBlock.hit();
              } else if (this.playerSize !== 'small' && this.jumping) {
                targetBlock.break();
              }
            }
          }
        }

        // touch grow mushroom
        if (hitGrowMushroom && this.playerSize === 'small' && !this.growing) {
          const growMushroom = worldItems.get(
            labelA === 'GrowMushroom' ? bodyA : bodyB
          );
          // skip when popping
          if (growMushroom.popping) return;
          window.transport.audio.powerup.play();
          growMushroom.die();
          this.transform('big');
        }

        // touch life mushroom
        if (hitLifeMushroom) {
          const lifeMushroom = worldItems.get(
            labelA === 'LifeMushroom' ? bodyA : bodyB
          );
          // skip when popping
          if (lifeMushroom.popping) return;
          window.transport.audio.extra_life.play();
          lifeMushroom.die();
          window.transport.life++;
        }

        // touch flower
        if (hitFlower && !this.growing) {
          const flower = worldItems.get(
            labelA === 'Flower' ? bodyA : bodyB
          );
          // skip when popping
          if (flower.popping) return;
          window.transport.audio.powerup.play();
          flower.die();
          this.transform('fire');
        }

        // touch star
        if (hitStar) {
          const star = worldItems.get(
            labelA === 'Star' ? bodyA : bodyB
          );
          // skip when popping
          if (star.popping) return;
          window.transport.audio.bgm.stop();
          window.transport.audio.superstar.play();
          star.die();
          this.starMode = true;
          setTimeout(() => {
            this.starMode = false;
            if (!this.ending) {
              window.transport.audio.bgm.play();
            }
          }, 12000);
        }

        // touch coin
        if (hitCoin) {
          const coin = worldItems.get(
            labelA === 'Coin' ? bodyA : bodyB
          );
          idItems.scene.addCoin();
          coin.die();
        }

        // touch endflag
        if (hitEndFlag && !this.ending) {
          this.touchEnd();
        }
      });
    });
  }

  render() {
    const self = this;
    const { assets } = loader;
    self.image = assets.mario;
    self.reverse_image = assets.mario_reverse;

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

    self.animation.downBig = createSpriteAnimation({
      ctx,
      render,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -18 },
      body: self.body,
      frames: [14],
      rate: 1,
    });

    self.animation.moveFire = createSpriteAnimation({
      ctx,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      render,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -18 },
      body: self.body,
      frames: [17, 20],
      rate: 0.25,
    });

    self.animation.jumpFire = createSpriteAnimation({
      ctx,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      render,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -18 },
      body: self.body,
      frames: [22],
      rate: 1,
    });

    self.animation.downFire = createSpriteAnimation({
      ctx,
      render,
      image: self.image,
      reverse_image: self.reverse_image,
      reverse: () => self.vel.x < 0,
      source: { size: [32,32] },
      target: { size: [36,36] },
      offset: { x: -18, y: -18 },
      body: self.body,
      frames: [24],
      rate: 1,
    });

    let isDead = false;

    this.drawCallback = () => {
      if (typeof this[this.status] === 'function') {
        this[this.status]();
      }
      if (!isDead && this.status !== 'dead' && this.body.position.y > config.height) {
        isDead = true;
        setTimeout(() => {
          this.die();
        }, 1000);
      }
      self.checkBounds();
    };

    Events.on(render, 'afterRender', this.drawCallback);
  }
}

export default Player;
