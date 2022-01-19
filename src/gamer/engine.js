import { Composite } from './composite';

export class Engine {
  constructor(options) {
    this.options = {
      gravity: {
        x: 0,
        y: 3,
      },
      ...options,
    };
    this.renderer = null;
    this.world = new Composite();
    this.timing = {
      lastDelta: 0,
      lastElapsed: 0,
    };
    this.events = {
      beforeRender: [],
      afterRender: [],
    };
  }

  clear() {
    this.timing.lastDelta = 0;
    this.timing.lastElapsed = 0;
  }
}
