<template>
  <div class="view-basic">
    <div id="basic"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

const { Engine, Runner, Render, Body, Bodies, Composite, Composites, Mouse, MouseConstraint, Constraint, Common, Events } = Matter;

const canvasConfig = {
  container: 'basic',
  width: 800,
  height: 500,
};

const engine = Engine.create();
const runner = Runner.create();

class MouseAction {
  constructor(el) {
    const mouse = this.mouse = Mouse.create(el);
    this.body = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        // allow bodies on mouse to rotate
        angularStiffness: 0,
        // https://brm.io/matter-js/docs/classes/Constraint.html#property_render.type
        render: {
          visible: false,
        },
      },
    });
    Composite.add(engine.world, this.body);
  }

  onMouseDown(callback) {
    Events.on(this.body, 'mousedown', function(event) {
      var mousePosition = event.mouse.position;
      console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
      callback(event);
    });
  }
}

class Box {
  constructor(x, y, w, h, options) {
    this.size = { w, h };
    this.body = Bodies.rectangle(x, y, w, h, options);
    Composite.add(engine.world, this.body);
  }
}

class Ground extends Box {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.body.isStatic = true;
    this.body.render.fillStyle = 'brown';
  }
}

const ground = new Ground(
  canvasConfig.width / 2,
  canvasConfig.height - 10,
  canvasConfig.width,
  20,
);
new Ground(canvasConfig.width / 2, -10, canvasConfig.height, 20);
new Ground(canvasConfig.width+10, canvasConfig.height/2, 20, canvasConfig.height);
new Ground(-10, canvasConfig.height/2, 20, canvasConfig.height);

function onPageMounted() {
  const render = Render.create({
    element: document.getElementById(canvasConfig.container),
    engine,
    options: {
      width: canvasConfig.width,
      height: canvasConfig.height,
      showVelocity: true, // speed indicator
      showAngleIndicator: true, // angle indicator
      showCollisions: true, // collision indicator
      showConvexHulls: true,
      wireframes: false,
    },
  });

  // fit the render viewport to the scene
  // Render.lookAt(render, Composite.allBodies(engine.world));
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: canvasConfig.width, y: canvasConfig.height }
  });

  new MouseAction(render.canvas);

  Runner.run(runner, engine);
  Render.run(render);
}

onMounted(() => {
  onPageMounted();
});
</script>

<style lang="scss">
.view-basic {
  position: relative;
}
</style>
