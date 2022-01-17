const Container = '#my-mario';

export let canvas;

export let ctx;

export const worldItems = new WeakMap();

export default {
  container: Container,
  width: 500,
  mapWidth: 500*2,
  height: 300,
  background: '#8090e0',
  category: {
    default: 0x0001,
    bg: 0x0002,
    isolate: 0x0004,
  },
  init() {
    canvas = document.querySelector(Container);
    ctx = canvas.getContext('2d');
  },
};
