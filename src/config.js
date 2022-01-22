import { Body } from 'matter-js';

const Container = '#my-mario';

class ClearableWeakMap {
  constructor(init) {
    this._wm = new WeakMap(init);
  }
  clear() {
    this._wm = new WeakMap();
  }
  delete(k) {
    return this._wm.delete(k);
  }
  get(k) {
    return this._wm.get(k);
  }
  has(k) {
    return this._wm.has(k);
  }
  set(k, v) {
    this._wm.set(k, v);
    return this;
  }
}

export let canvas;

export let ctx;

export let loader;

export const idItems = {};

export const worldItems = new ClearableWeakMap();

export default {
  container: Container,
  width: 260,
  mapWidth: 260*12.3,
  height: 210,
  background: '#8090e0',
  category: {
    default: 0x0001,
    bg: 0x0002,
    isolate: 0x0004,
  },
  group: {
    player: Body.nextGroup(),
    block: Body.nextGroup(true),
    enemy: Body.nextGroup(),
    fireball: Body.nextGroup(),
  },
  init(_loader) {
    canvas = document.querySelector(Container);
    ctx = canvas.getContext('2d');
    loader = _loader;
  },
};
