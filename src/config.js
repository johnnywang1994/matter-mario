import { Body } from 'matter-js';

const Container = '#my-mario';

export let canvas;

export let ctx;

export let loader;

export const idItems = {};

export const worldItems = new WeakMap();

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
