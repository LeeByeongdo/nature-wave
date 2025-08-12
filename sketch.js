let yoff;
let waveAmplitudes;
let targetWaveAmplitudes;
let baseWaveAmplitudes;
const waveSegmentSize = 10;
let numWaveSegments;
let surfer;

function initializeWaves() {
  numWaveSegments = floor(width / waveSegmentSize) + 1;
  waveAmplitudes = [];
  targetWaveAmplitudes = [];
  baseWaveAmplitudes = [];

  for (let i = 0; i < numWaveSegments; i++) {
    baseWaveAmplitudes[i] = 20;
    waveAmplitudes[i] = baseWaveAmplitudes[i];
    targetWaveAmplitudes[i] = baseWaveAmplitudes[i];
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  yoff = 0.0;
  initializeWaves();
  surfer = new Surfer(width / 2, height / 2 - 200);
}

function draw() {
  background(135, 206, 235); // Sky blue
  noStroke();

  // Sun and glare
  fill(255, 255, 0);
  ellipse(width - 100, 100, 100, 100);
  fill(255, 255, 0, 50);
  ellipse(width - 100, 100, 150, 150);


  fill(244, 164, 96); // Sand color
  rect(0, height - 100, width, 100);

  // Wave propagation
  const propagationFactor = 0.1; // Increased from 0.05
  // Propagate from left to right
  for (let i = 1; i < numWaveSegments; i++) {
    targetWaveAmplitudes[i] = lerp(targetWaveAmplitudes[i], targetWaveAmplitudes[i - 1], propagationFactor);
  }
  // Propagate from right to left
  for (let i = numWaveSegments - 2; i >= 0; i--) {
    targetWaveAmplitudes[i] = lerp(targetWaveAmplitudes[i], targetWaveAmplitudes[i + 1], propagationFactor);
  }

  // Damping and updating the visible wave
  for (let i = 0; i < numWaveSegments; i++) {
    // Damping: return to base amplitude
    targetWaveAmplitudes[i] = lerp(targetWaveAmplitudes[i], baseWaveAmplitudes[i], 0.01); // Reduced from 0.02
    // Update actual wave amplitude for drawing
    waveAmplitudes[i] = lerp(waveAmplitudes[i], targetWaveAmplitudes[i], 0.1);
  }


  let gravity = createVector(0, 0.4);
  surfer.applyForce(gravity);

  let waterLevel = getWaveY(surfer.position.x);
  if (surfer.position.y > waterLevel) {
    let upwardForce = createVector(0, -0.8);
    surfer.applyForce(upwardForce);

    let waveAngle = getWaveAngle(surfer.position.x);
    let wavePushForce = p5.Vector.fromAngle(waveAngle);
    wavePushForce.mult(0.5);
    surfer.applyForce(wavePushForce);

    let drag = surfer.velocity.copy();
    drag.mult(-0.03);
    surfer.applyForce(drag);

    if (surfer.velocity.mag() > 1) {
        surfer.particleSystem.addParticle();
    }
  }

  surfer.update();
  surfer.checkEdges();

  fill(0, 105, 148, 200);
  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = getWaveY(x);
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  // Foam
  noStroke();
  fill(255, 255, 255, 150);
  for (let x = 0; x <= width; x += 20) {
      let n = noise(x * 0.1, yoff * 1.5, yoff);
      if (n > 0.65) {
          let y = getWaveY(x);
          let segmentIndex = floor(x / waveSegmentSize);
          segmentIndex = constrain(segmentIndex, 0, numWaveSegments - 1);
          let currentWaveAmplitude = waveAmplitudes[segmentIndex];
          let foamSize = map(currentWaveAmplitude, 20, 100, 2, 20) * map(n, 0.65, 1, 0, 1);
          ellipse(x + random(-10, 10), y + random(-5, 5), foamSize, foamSize * 0.8);
      }
  }

  yoff += 0.01;

  surfer.display();
}

function getWaveY(x) {
    let x_index_prev = floor(x / waveSegmentSize);
    let x_index_next = x_index_prev + 1;

    x_index_prev = constrain(x_index_prev, 0, numWaveSegments - 1);
    x_index_next = constrain(x_index_next, 0, numWaveSegments - 1);

    let xoff_prev = x_index_prev * 0.05;
    let xoff_next = x_index_next * 0.05;
    let y_prev_noise = noise(xoff_prev, yoff);
    let y_next_noise = noise(xoff_next, yoff);

    let amp_prev = waveAmplitudes[x_index_prev];
    let amp_next = waveAmplitudes[x_index_next];

    let y_prev = map(y_prev_noise, 0, 1, -amp_prev, amp_prev) + height - 100;
    let y_next = map(y_next_noise, 0, 1, -amp_next, amp_next) + height - 100;

    let t = (x % waveSegmentSize) / waveSegmentSize;
    return lerp(y_prev, y_next, t);
}

function getWaveAngle(x) {
  let y1 = getWaveY(x - 1);
  let y2 = getWaveY(x + 1);
  return atan2(y2 - y1, 2);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    targetWaveAmplitudes[0] = 100;
  } else if (keyCode === RIGHT_ARROW) {
    targetWaveAmplitudes[numWaveSegments - 1] = 100;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeWaves();
}

class Surfer {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 10;
    this.maxSpeed = 10;
    this.particleSystem = new ParticleSystem(this.position);
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.particleSystem.origin.set(this.position.x, this.position.y);
  }

  checkEdges() {
    if (this.position.x > width - 16) {
      this.position.x = width - 16;
      this.velocity.x *= -0.5;
    } else if (this.position.x < 16) {
      this.position.x = 16;
      this.velocity.x *= -0.5;
    }
  }

  display() {
    this.particleSystem.run();
    push();
    translate(this.position.x, this.position.y);
    let waveAngle = getWaveAngle(this.position.x);
    rotate(waveAngle);

    stroke(0, 0, 139);
    strokeWeight(2);
    fill(255);
    beginShape();
    vertex(-20, 0);
    bezierVertex(-10, -8, 10, -8, 20, 0);
    bezierVertex(10, 8, -10, 8, -20, 0);
    endShape(CLOSE);
    pop();
  }
}

class Particle {
    constructor(position) {
        this.position = position.copy();
        this.velocity = createVector(random(-0.5, 0.5), random(-1, 0));
        this.acceleration = createVector(0, 0.05);
        this.lifespan = 255.0;
    }

    run() {
        this.update();
        this.display();
    }

    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.lifespan -= 5.0;
    }

    display() {
        noStroke();
        fill(255, this.lifespan);
        ellipse(this.position.x, this.position.y, 6, 6);
    }

    isDead() {
        return this.lifespan < 0;
    }
}

class ParticleSystem {
    constructor(position) {
        this.origin = position.copy();
        this.particles = [];
    }

    addParticle() {
        this.particles.push(new Particle(this.origin));
    }



    run() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.run();
            if (p.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
}
