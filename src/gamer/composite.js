export class Composite {
  constructor() {
    this.id = Math.random()
      .toString()
      .slice(2);
    this.label = 'Composite';
    this.cidMap = {};
    this.allBodies = [];
    this.allComposites = [];
    this.parent = null;
  }

  get bodies() {
    function flat(nodes) {
      const len = nodes.length;
      const ret = [];
      for (let i = 0; i < len; i++) {
        const t = nodes[i];
        if (Array.isArray(t)) {
          ret.push(...flat(t));
        } else {
          ret.push(t);
        }
      }
      return ret;
    }

    return flat([...this.allBodies, ...this.allComposites]);
  }

  add(childs) {
    const { allComposites, allBodies } = this;

    const append = (c) => {
      c.parent = this;
      // add to list for rendering
      if (c.label === 'Composite') {
        allComposites.push(c);
      } else {
        allBodies.push(c);
      }
      // add to cidMap for accessing
      if (c.cid) {
        this.cidMap[c.cid] = c;
      }
    };

    if (Array.isArray(childs)) {
      childs.forEach((child) => append(child));
    } else if (childs) {
      append(childs);
    }
  }

  remove(target) {
    let list;
    let idx;
    if (target.label === 'Composite') {
      list = this.allComposites;
    } else {
      list = this.allBodies;
    }
    if (list) {
      idx = list.indexOf(target);
      if (idx) {
        list.splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  get(id) {
    const t = this.cidMap[id];
    return t || false;
  }

  clear() {
    this.allBodies = [];
    this.allComposites = [];
  }

  draw(ctx) {
    const { bodies } = this;
    const len = bodies.length;
    for (let i = 0; i < len; i++) {
      bodies[i].draw(ctx);
    }
  }
}
