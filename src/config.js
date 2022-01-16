const Container = '#my-mario';

export let canvas;

export let ctx;

export default {
  container: Container,
  width: 500,
  mapWidth: 500*2,
  height: 300,
  background: '#8090e0',
  category: {
    default: 0x0001,
    hide: 0x0002
  },
  init() {
    canvas = document.querySelector(Container);
    ctx = canvas.getContext('2d');
  },
};
