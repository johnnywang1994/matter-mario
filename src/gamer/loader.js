async function loadImage(id, url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ id, image });
    image.src = url;
  });
}

export class Loader {
  constructor() {
    this.pending = [];
    this.assets = {};
    this.length = 0;
    this.counter = 0;
    this.percent = 0;
  }

  add(id, url) {
    if (this.assets[id]) {
      console.error(`Assets ID: ${id} was used, please use an unique id.`);
      return false;
    }
    this.length += 1;
    const p = loadImage(id, url).then(({ id: cid, image }) => {
      this.counter += 1;
      this.percent = Math.floor((this.counter / this.length) * 100);
      this.assets[cid] = image;
    });
    this.pending.push(p);
    return true;
  }

  async load() {
    await Promise.all(this.pending);
    this.pending = [];
    console.log('load assets successful', this.assets);
  }
}
