// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
import { Events } from './events';

export class Render {
  constructor(options) {
    this.options = {
      fps: 60,
      checkFps: false,
      width: 500,
      height: 400,
      background: 'black',
      ...options,
    };
    this.engine = null;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.pixelRatio = {
      x: 1,
      y: 1,
    };

    this.fps = this.options.fps;
    this.fpsInterval = 1000 / this.fps;
    this.fpsLast = null;
    this.frameId = null;

    this.active = false;

    this.events = {
      beforeRender: [],
      afterRender: [],
    };

    this.init();
  }

  init() {
    const { canvas, options } = this;
    canvas.width = options.width;
    canvas.height = options.height;

    this.resizeCallback = () => {
      const { width, height } = canvas.getBoundingClientRect();
      this.pixelRatio = {
        x: width / canvas.width,
        y: height / canvas.height,
      };
    };

    this.resizeCallback();
    document.addEventListener('resize', this.resizeCallback);
  }

  stop() {
    window.cancelAnimationFrame(this.frameId);
    document.removeEventListener('resize', this.resizeCallback);
    this.fpsLast = null;
    this.active = false;
  }

  run(engine) {
    // bind engine
    engine.renderer = this;
    this.engine = engine;
    // run
    this.step();
  }

  step() {
    this.frameId = window.requestAnimationFrame(this.step.bind(this));
    if (!this.fpsLast) {
      this.active = true;
      this.fpsLast = performance.now();
      return;
    }
    const now = performance.now();
    const elapsed = now - this.fpsLast;
    const { fpsInterval } = this;
    if (elapsed > fpsInterval) {
      if (this.options.checkFps) {
        console.log(1000 / elapsed); // check fps
      }
      // update engine timing
      const { engine } = this;
      engine.timing.lastDelta = this.fpsInterval;
      engine.timing.lastElapsed = elapsed;
      // update fpsLast
      this.fpsLast = now - (elapsed % fpsInterval);
      // main draw
      this.draw();
    }
  }

  draw() {
    const { ctx, engine, options } = this;
    // before render
    Events.trigger(this, 'beforeRender');
    // clear
    ctx.clearRect(0, 0, options.width, options.height);
    // background
    ctx.save();
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.restore();
    // draw engine root
    engine.world.draw(ctx);
    // after render
    Events.trigger(this, 'afterRender');
  }
}
