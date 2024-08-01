import Matter from 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm'

const { Engine, Render, World, Bodies, Body, Composite, Events, Runner } = Matter;

const ballOverlap = 10;
const wallThickness = 20;
const jarWidth = 400;
const jarHeight = 500;
const jarBottomThickness = 20;
const cornerRadius = 30;

class GumballEngine {
  constructor(debugMode) {
    this.debugMode = debugMode;

    this.engine = Engine.create();
    let render = Render.create({
      engine: this.engine,
      options: {
        width: 500,
        height: 725,
        wireframes: false
      }
    });

    // Create jar-like structure with flat bottom and curved corners

    const sandbox = document.getElementById("sandbox");
    function createBodyRect(id, x, y, width, height, angle = 0) {
      let elem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      elem.id = id;
      elem.role = "presentation";
      elem.classList.add('jar');
      elem.setAttribute("x", x - width / 2);
      elem.setAttribute("y", y - height / 2);
      elem.setAttribute("width", width);
      elem.setAttribute("height", height);
      elem.classList.add("jar");
      sandbox.appendChild(elem);
      return Bodies.rectangle(x, y, width, height, {
        elem,
        width,
        height,
        isStatic: true,
        scaleFactor: 1,
        angle,
      });
    }

    const bottom = createBodyRect("jar-bottom", 250, 735, jarWidth, jarBottomThickness + ballOverlap);
    const leftWall = createBodyRect("jar-leftWall", 50, 475, wallThickness + ballOverlap, jarHeight);
    const rightWall = createBodyRect("jar-rightWall", 450, 475, wallThickness + ballOverlap, jarHeight);
    const bottomLeftCorner = createBodyRect("jar-bottomLeftCorner", 75, 724, 20, 75, -0.14);
    const bottomRightCorner = createBodyRect("jar-bottomRightCorner", 430, 700, 20, 75, 0.1);
    World.add(this.engine.world, [bottom, leftWall, rightWall, bottomLeftCorner, bottomRightCorner]);

    this.first = true;

    this.marquee = document.getElementById('current-ball-marquee');
  }

  createGumball(x, y, quizCard, radius) {
    let elem = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    elem.setAttribute("x", -radius);
    elem.setAttribute("y", -radius);
    elem.setAttribute("width", radius * 2);
    elem.setAttribute("height", radius * 2);
    elem.style.transform = `translate(${x}, ${y})`;
    elem.classList.add("current");

    let circle = document.createElement("div");
    circle.role = "listitem";
    circle.ariaLabel = `${quizCard.fgColorName} on ${quizCard.bgColorName}`;
    if (this.first) {
      setTimeout(() => {
        this.marquee.textContent = circle.ariaLabel;
      }, 1000);
    } else {
      this.marquee.textContent = circle.ariaLabel;
    }
    circle.classList.add("gumball");
    circle.style.setProperty('--gumball-bg', quizCard.cssBgColor);

    elem.appendChild(circle);

    let fg = document.createElement("div");
    fg.ariaHidden = "true";
    fg.textContent = quizCard.fgColorName;
    fg.style.color = quizCard.cssFgColor;
    circle.appendChild(fg);
    let bg = document.createElement("div");
    bg.ariaHidden = "true";
    bg.textContent = quizCard.bgColorName;
    bg.style.color = quizCard.cssFgColor;;
    circle.appendChild(bg);

    document.getElementById("put-gumballs-here").appendChild(elem);
    const gumball = Bodies.circle(x, y, radius - ballOverlap, {
      quizCard,
      elem,
      restitution: 0.5,
      friction: 0.005,
      scaleFactor: 1.0
    });

    return gumball;
  }

  createNewGumball(quizCard) {
    this.current = this.createGumball(250, 100, quizCard, 80); // Lowered initial position and doubled size
    Body.setStatic(this.current, true);
    World.add(this.engine.world, this.current);
    if (this.debugMode) {
      document.getElementById('debug-info').textContent = `Contrast Ratio: ${this.current.quizCard.contrast.toFixed(2)}`;
    }
  }

  dropCurrent() {
    return new Promise(resolve => {
      if (this.current) {
        let scale = 1;
        const scaleStep = 2 / 15;
        this.current.elem.classList.remove("current");
        const interval = setInterval(() => {
          scale -= scaleStep;
          if (scale <= 0.15) {
            scale = 0.15;
            clearInterval(interval);
            Body.setStatic(this.current, false);
            Body.applyForce(this.current, { x: this.current.position.x, y: this.current.position.y }, { x: (Math.random() - 0.5) * 0.3, y: -.2 });
            Body.setAngularVelocity(this.current, (Math.random() - 0.5) * 0.1); // Apply an angular speed for spinning
            this.current = null;
            resolve();
          } else {
            Body.scale(this.current, 1 - scaleStep, 1 - scaleStep);
            this.current.scaleFactor *= 1 - scaleStep;
          }
        }, 16); // Approx. 60fps
      }
    });
  }

  _render() {
    Engine.update(this.engine);
    for (let body of this.engine.world.bodies) {
      let elem = body.elem;
      if (!elem) {
        continue;
      }
      let bounds = body.bounds;
      if (elem instanceof SVGRectElement) {
        elem.setAttribute("x", bounds.min.x);
        elem.setAttribute("y", bounds.min.y);
        elem.setAttribute("width", body.width);
        elem.setAttribute("height", body.height);
        elem.setAttribute("transform", `rotate(${body.angle * 360})`);
      } else if (elem instanceof SVGForeignObjectElement) {
        // Gumballs
        elem.setAttribute("transform", `translate(${body.position.x}, ${body.position.y}) rotate(${body.angle * 360}) scale(${body.scaleFactor})`);
      }

    }

    requestAnimationFrame(this._render.bind(this));
  }

  render() {
    this._render();
  }
}

export { GumballEngine };